/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::artifact_map::ArtifactMap;
use crate::config::Config;
use crate::errors::{Error, Result};
use crate::file_source::{
    categorize_files, extract_graphql_strings_from_file, read_file_to_string, Clock, File,
    FileGroup, FileSourceResult, SourceControlUpdateStatus,
};
use common::{PerfLogEvent, PerfLogger, SourceLocationKey};
use dashmap::DashSet;
use fnv::{FnvBuildHasher, FnvHashMap, FnvHashSet};
use graphql_syntax::GraphQLSource;
use intern::string_key::StringKey;
use rayon::prelude::*;
use relay_transforms::DependencyMap;
use schema::SDLSchema;
use schema_diff::{definitions::SchemaChange, detect_changes};
use serde::{Deserialize, Serialize};
use std::{
    fmt,
    fs::File as FsFile,
    hash::Hash,
    io::{BufReader, BufWriter},
    mem,
    path::PathBuf,
    sync::{Arc, RwLock},
};
use zstd::stream::{read::Decoder as ZstdDecoder, write::Encoder as ZstdEncoder};

/// Name of a compiler project.
pub type ProjectName = StringKey;

/// Name of a source set; a source set corresponds to a set fo files
/// that can be shared by multiple compiler projects
pub type SourceSetName = StringKey;

/// Set of project names.
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum ProjectSet {
    ProjectName(ProjectName),
    ProjectNames(Vec<ProjectName>),
}
impl ProjectSet {
    /// Inserts a new project name into this set.
    pub fn insert(&mut self, project_name: ProjectName) {
        match self {
            ProjectSet::ProjectName(existing_name) => {
                assert!(*existing_name != project_name);
                *self = ProjectSet::ProjectNames(vec![*existing_name, project_name]);
            }
            ProjectSet::ProjectNames(existing_names) => {
                assert!(!existing_names.contains(&project_name));
                existing_names.push(project_name);
            }
        }
    }
}

/// Represents the name of the source set, or list of source sets
#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq, Hash)]
#[serde(untagged)]
pub enum SourceSet {
    SourceSetName(SourceSetName),
    SourceSetNames(Vec<SourceSetName>),
}

impl fmt::Display for SourceSet {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            SourceSet::SourceSetName(name) => write!(f, "{}", name),
            SourceSet::SourceSetNames(names) => write!(
                f,
                "{}",
                names
                    .iter()
                    .map(|name| name.to_string())
                    .collect::<Vec<String>>()
                    .join(",")
            ),
        }
    }
}

pub trait Source {
    fn is_empty(&self) -> bool;
}

impl Source for Vec<GraphQLSource> {
    fn is_empty(&self) -> bool {
        self.is_empty()
    }
}

type IncrementalSourceSet<K, V> = FnvHashMap<K, V>;
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct IncrementalSources<K: Eq + Hash, V: Source> {
    pub pending: IncrementalSourceSet<K, V>,
    pub processed: IncrementalSourceSet<K, V>,
}

impl<K: Eq + Hash, V: Source> IncrementalSources<K, V> {
    /// Merges additional pending sources into this states pending sources.
    fn merge_pending_sources(&mut self, additional_pending_sources: IncrementalSourceSet<K, V>) {
        self.pending.extend(additional_pending_sources.into_iter());
    }

    /// Remove deleted sources from both pending sources and processed sources.
    fn remove_sources(&mut self, removed_sources: &[K]) {
        for source in removed_sources {
            self.pending.remove(source);
            self.processed.remove(source);
        }
    }

    fn commit_pending_sources(&mut self) {
        for (file_name, pending_graphql_sources) in self.pending.drain() {
            if pending_graphql_sources.is_empty() {
                self.processed.remove(&file_name);
            } else {
                self.processed.insert(file_name, pending_graphql_sources);
            }
        }
    }
}

impl<K: Eq + Hash, V: Source> Default for IncrementalSources<K, V> {
    fn default() -> Self {
        IncrementalSources {
            pending: FnvHashMap::default(),
            processed: FnvHashMap::default(),
        }
    }
}

type GraphQLSourceSet = IncrementalSourceSet<PathBuf, Vec<GraphQLSource>>;
pub type GraphQLSources = IncrementalSources<PathBuf, Vec<GraphQLSource>>;
pub type SchemaSources = IncrementalSources<PathBuf, String>;

impl Source for String {
    fn is_empty(&self) -> bool {
        self.is_empty()
    }
}

impl SchemaSources {
    fn get_all(&self) -> Vec<(&PathBuf, &String)> {
        let mut sources: Vec<_>;
        if self.pending.is_empty() {
            sources = self.processed.iter().collect();
        } else {
            sources = self.pending.iter().collect();
            for (key, value) in self.processed.iter() {
                if !self.pending.contains_key(key) {
                    sources.push((key, value));
                }
            }
        }
        sources.sort_by_key(|file_content| file_content.0);
        sources
    }
    pub fn get_sources(&self) -> Vec<&String> {
        let sources = self.get_all();
        sources.iter().map(|file_content| file_content.1).collect()
    }

    pub fn get_sources_with_location(&self) -> Vec<(&String, SourceLocationKey)> {
        let sources = self.get_all();
        sources
            .iter()
            .map(|file_content| {
                (
                    file_content.1,
                    SourceLocationKey::standalone(file_content.0.to_str().unwrap()),
                )
            })
            .collect()
    }

    pub fn get_old_sources(&self) -> Vec<&String> {
        let mut sources: Vec<_> = self.processed.iter().collect();
        sources.sort_by_key(|file_content| file_content.0);
        sources.iter().map(|file_content| file_content.1).collect()
    }
}
#[derive(Serialize, Deserialize, Debug)]
pub enum ArtifactMapKind {
    /// A simple set of paths of generated files. This kind is used when the
    /// compiler starts without a saved state and doesn't know the connection
    /// between generated files and the artifacts that produced them.
    Unconnected(FnvHashSet<PathBuf>),
    /// A known mapping from input documents to generated outputs.
    Mapping(ArtifactMap),
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CompilerState {
    pub graphql_sources: FnvHashMap<SourceSetName, GraphQLSources>,
    pub schemas: FnvHashMap<ProjectName, SchemaSources>,
    pub extensions: FnvHashMap<ProjectName, SchemaSources>,
    pub artifacts: FnvHashMap<ProjectName, Arc<ArtifactMapKind>>,
    // TODO: How can I can I make this just an ImplicitDependencyMap? Currently I can't move the hashmap out of the Arc wrapper around the dirty version.
    pub implicit_dependencies: Arc<RwLock<DependencyMap>>,
    #[serde(with = "clock_json_string")]
    pub clock: Option<Clock>,
    pub saved_state_version: String,
    #[serde(skip)]
    pub dirty_artifact_paths: FnvHashMap<ProjectName, DashSet<PathBuf, FnvBuildHasher>>,
    #[serde(skip)]
    pub pending_implicit_dependencies: Arc<RwLock<DependencyMap>>,
    #[serde(skip)]
    pub pending_file_source_changes: Arc<RwLock<Vec<FileSourceResult>>>,
    #[serde(skip)]
    pub schema_cache: FnvHashMap<ProjectName, Arc<SDLSchema>>,
    #[serde(skip)]
    pub source_control_update_status: Arc<SourceControlUpdateStatus>,
}

impl CompilerState {
    pub fn from_file_source_changes(
        config: &Config,
        file_source_changes: &FileSourceResult,
        setup_event: &impl PerfLogEvent,
        perf_logger: &impl PerfLogger,
    ) -> Result<Self> {
        let categorized = setup_event.time("categorize_files_time", || {
            categorize_files(config, file_source_changes)
        });

        let mut result = Self {
            graphql_sources: Default::default(),
            artifacts: Default::default(),
            implicit_dependencies: Default::default(),
            extensions: Default::default(),
            schemas: Default::default(),
            clock: file_source_changes.clock(),
            saved_state_version: config.saved_state_version.clone(),
            dirty_artifact_paths: Default::default(),
            pending_implicit_dependencies: Default::default(),
            pending_file_source_changes: Default::default(),
            schema_cache: Default::default(),
            source_control_update_status: Default::default(),
        };

        for (category, files) in categorized {
            match category {
                FileGroup::Source { source_set } => {
                    let log_event = perf_logger.create_event("categorize");
                    log_event.string("source_set_name", source_set.to_string());
                    let extract_timer = log_event.start("extract_graphql_strings_from_file_time");
                    let sources = files
                        .par_iter()
                        .filter(|file| file.exists)
                        .filter_map(|file| {
                            match extract_graphql_strings_from_file(file_source_changes, file) {
                                Ok(graphql_strings) if graphql_strings.is_empty() => None,
                                Ok(graphql_strings) => {
                                    Some(Ok((file.name.clone(), graphql_strings)))
                                }
                                Err(err) => Some(Err(err)),
                            }
                        })
                        .collect::<Result<_>>()?;
                    log_event.stop(extract_timer);
                    log_event.complete();
                    match source_set {
                        SourceSet::SourceSetName(source_set_name) => {
                            result.set_pending_source_set(source_set_name, sources);
                        }
                        SourceSet::SourceSetNames(names) => {
                            for source_set_name in names {
                                result.set_pending_source_set(source_set_name, sources.clone());
                            }
                        }
                    }
                }
                FileGroup::Schema { project_set } => {
                    Self::process_schema_change(
                        file_source_changes,
                        files,
                        project_set,
                        &mut result.schemas,
                    )?;
                }
                FileGroup::Extension { project_set } => {
                    Self::process_schema_change(
                        file_source_changes,
                        files,
                        project_set,
                        &mut result.extensions,
                    )?;
                }
                FileGroup::Generated { project_name } => {
                    result.artifacts.insert(
                        project_name,
                        Arc::new(ArtifactMapKind::Unconnected(
                            files.into_iter().map(|file| file.name).collect(),
                        )),
                    );
                }
            }
        }

        Ok(result)
    }

    pub fn project_has_pending_changes(&self, project_name: ProjectName) -> bool {
        self.graphql_sources
            .get(&project_name)
            .map_or(false, |sources| !sources.pending.is_empty())
            || self.project_has_pending_schema_changes(project_name)
            || self.dirty_artifact_paths.contains_key(&project_name)
    }

    pub fn project_has_pending_schema_changes(&self, project_name: ProjectName) -> bool {
        self.schemas
            .get(&project_name)
            .map_or(false, |sources| !sources.pending.is_empty())
            || self
                .extensions
                .get(&project_name)
                .map_or(false, |sources| !sources.pending.is_empty())
    }

    pub fn has_processed_changes(&self) -> bool {
        self.graphql_sources
            .values()
            .any(|sources| !sources.processed.is_empty())
            || self
                .schemas
                .values()
                .any(|sources| !sources.processed.is_empty())
            || self
                .extensions
                .values()
                .any(|sources| !sources.processed.is_empty())
    }

    fn is_change_safe(&self, sources: &SchemaSources) -> bool {
        let previous = sources
            .get_old_sources()
            .into_iter()
            .map(String::as_str)
            .collect::<Vec<_>>();

        let current = sources
            .get_sources()
            .into_iter()
            .map(String::as_str)
            .collect::<Vec<_>>();

        let schema_change = detect_changes(&current, &previous);

        if schema_change == SchemaChange::None {
            true
        } else {
            match relay_schema::build_schema_with_extensions(
                &current,
                &Vec::<(&str, SourceLocationKey)>::new(),
            ) {
                Ok(schema) => schema_change.is_safe(&schema),
                Err(_) => false,
            }
        }
    }

    /// This method will detect any schema changes in the pending sources (for LSP Server, to invalidate schema cache)
    pub fn has_schema_changes(&self) -> bool {
        self.extensions
            .values()
            .any(|sources| !sources.pending.is_empty())
            || self
                .schemas
                .iter()
                .any(|(_, sources)| !sources.pending.is_empty())
    }

    /// This method is looking at the pending schema changes to see if they may be breaking (removed types, renamed field, etc)
    pub fn has_breaking_schema_change(&self, project_name: StringKey) -> bool {
        if let Some(extension) = self.extensions.get(&project_name) {
            if !extension.pending.is_empty() {
                return true;
            }
        }
        if let Some(schema) = self.schemas.get(&project_name) {
            if !(schema.pending.is_empty() || self.is_change_safe(schema)) {
                return true;
            }
        }
        false
    }

    /// Merges pending changes from the file source into the compiler state.
    /// Returns a boolean indicating if any new changes were merged.
    pub fn merge_file_source_changes(
        &mut self,
        config: &Config,
        perf_logger: &impl PerfLogger,
        // When loading from saved state, collect dirty artifacts for recompiling their source definitions
        should_collect_changed_artifacts: bool,
    ) -> Result<bool> {
        let mut has_changed = false;
        for file_source_changes in self.pending_file_source_changes.write().unwrap().drain(..) {
            let log_event = perf_logger.create_event("merge_file_source_changes");
            log_event.number("number_of_changes", file_source_changes.size());
            let categorized = log_event.time("categorize_files_time", || {
                categorize_files(config, &file_source_changes)
            });

            for (category, files) in categorized {
                match category {
                    FileGroup::Source { source_set } => {
                        // TODO: possible optimization to only set this if the
                        // extracted sources actually differ.
                        has_changed = true;

                        let log_event = perf_logger.create_event("categorize");
                        log_event.string("source_set_name", source_set.to_string());
                        let extract_timer =
                            log_event.start("extract_graphql_strings_from_file_time");
                        let sources: FnvHashMap<PathBuf, Vec<GraphQLSource>> = files
                            .par_iter()
                            .map(|file| {
                                let graphql_strings = if file.exists {
                                    extract_graphql_strings_from_file(&file_source_changes, file)?
                                } else {
                                    Vec::new()
                                };
                                Ok((file.name.clone(), graphql_strings))
                            })
                            .collect::<Result<_>>()?;
                        log_event.stop(extract_timer);
                        match source_set {
                            SourceSet::SourceSetName(source_set_name) => {
                                self.graphql_sources
                                    .entry(source_set_name)
                                    .or_default()
                                    .merge_pending_sources(sources);
                            }
                            SourceSet::SourceSetNames(names) => {
                                for source_set_name in names {
                                    self.graphql_sources
                                        .entry(source_set_name)
                                        .or_default()
                                        .merge_pending_sources(sources.clone());
                                }
                            }
                        }
                    }
                    FileGroup::Schema { project_set } => {
                        has_changed = true;
                        Self::process_schema_change(
                            &file_source_changes,
                            files,
                            project_set,
                            &mut self.schemas,
                        )?;
                    }
                    FileGroup::Extension { project_set } => {
                        has_changed = true;
                        Self::process_schema_change(
                            &file_source_changes,
                            files,
                            project_set,
                            &mut self.extensions,
                        )?;
                    }
                    FileGroup::Generated { project_name } => {
                        if should_collect_changed_artifacts {
                            let mut dashset =
                                DashSet::with_capacity_and_hasher(files.len(), Default::default());
                            dashset.extend(files.into_iter().map(|f| f.name));
                            self.dirty_artifact_paths.insert(project_name, dashset);
                        }
                    }
                }
            }
        }

        Ok(has_changed)
    }

    pub fn complete_compilation(&mut self) {
        for sources in self.graphql_sources.values_mut() {
            sources.commit_pending_sources();
        }
        for sources in self.schemas.values_mut() {
            sources.commit_pending_sources();
        }
        for sources in self.extensions.values_mut() {
            sources.commit_pending_sources();
        }
        self.implicit_dependencies = mem::take(&mut self.pending_implicit_dependencies);
        self.dirty_artifact_paths.clear();
    }

    pub fn complete_project_compilation(&mut self, project_name: &ProjectName) {
        if let Some(sources) = self.graphql_sources.get_mut(project_name) {
            sources.commit_pending_sources();
        }
        if let Some(sources) = self.schemas.get_mut(project_name) {
            sources.commit_pending_sources();
        }
        if let Some(sources) = self.extensions.get_mut(project_name) {
            sources.commit_pending_sources();
        }
    }

    /// Calculate dirty definitions from dirty artifacts
    pub fn get_dirty_definitions(
        &self,
        config: &Config,
    ) -> FnvHashMap<ProjectName, Vec<StringKey>> {
        if self.dirty_artifact_paths.is_empty() {
            return Default::default();
        }
        let mut result = FnvHashMap::default();
        for (project_name, paths) in self.dirty_artifact_paths.iter() {
            if config.projects[project_name].enabled {
                let paths = paths.clone();
                let artifacts = self
                    .artifacts
                    .get(project_name)
                    .expect("Expected the artifacts map to exist.");
                if let ArtifactMapKind::Mapping(artifacts) = &**artifacts {
                    let mut dirty_definitions = vec![];
                    'outer: for entry in artifacts.0.iter() {
                        let (definition_name, artifact_records) = entry.pair();
                        let mut added = false;
                        for artifact_record in artifact_records {
                            if paths.remove(&artifact_record.path).is_some() && !added {
                                dirty_definitions.push(*definition_name);
                                if paths.is_empty() {
                                    break 'outer;
                                }
                                added = true;
                            }
                        }
                    }
                    if !dirty_definitions.is_empty() {
                        result.insert(*project_name, dirty_definitions);
                    }
                } else {
                    panic!("Expected the artifacts map to be populated.")
                }
            }
        }
        result
    }

    pub fn serialize_to_file(&self, path: &PathBuf) -> Result<()> {
        let writer = FsFile::create(path)
            .and_then(|writer| ZstdEncoder::new(writer, 12))
            .map_err(|err| Error::WriteFileError {
                file: path.clone(),
                source: err,
            })?
            .auto_finish();
        let writer =
            BufWriter::with_capacity(ZstdEncoder::<FsFile>::recommended_input_size(), writer);
        bincode::serialize_into(writer, self).map_err(|err| Error::SerializationError {
            file: path.clone(),
            source: err,
        })
    }

    pub fn deserialize_from_file(path: &PathBuf) -> Result<Self> {
        let reader = FsFile::open(path)
            .and_then(ZstdDecoder::new)
            .map_err(|err| Error::ReadFileError {
                file: path.clone(),
                source: err,
            })?;
        let reader = BufReader::with_capacity(
            ZstdDecoder::<BufReader<FsFile>>::recommended_output_size(),
            reader,
        );
        bincode::deserialize_from(reader).map_err(|err| Error::DeserializationError {
            file: path.clone(),
            source: err,
        })
    }

    pub fn has_pending_file_source_changes(&self) -> bool {
        !self.pending_file_source_changes.read().unwrap().is_empty()
    }

    fn set_pending_source_set(
        &mut self,
        source_set_name: SourceSetName,
        source_set: GraphQLSourceSet,
    ) {
        let pending_entry = &mut self
            .graphql_sources
            .entry(source_set_name)
            .or_default()
            .pending;
        if pending_entry.is_empty() {
            *pending_entry = source_set;
        } else {
            pending_entry.extend(source_set);
        }
    }

    fn process_schema_change(
        file_source_changes: &FileSourceResult,
        files: Vec<File>,
        project_set: ProjectSet,
        source_map: &mut FnvHashMap<ProjectName, SchemaSources>,
    ) -> Result<()> {
        let mut removed_sources = vec![];
        let mut added_sources = FnvHashMap::default();
        for file in files {
            let file_name = file.name.clone();
            if file.exists {
                added_sources.insert(file_name, read_file_to_string(file_source_changes, &file)?);
            } else {
                removed_sources.push(file_name);
            }
        }
        match project_set {
            ProjectSet::ProjectName(project_name) => {
                let entry = source_map.entry(project_name).or_default();
                entry.remove_sources(&removed_sources);
                entry.merge_pending_sources(added_sources);
            }
            ProjectSet::ProjectNames(project_names) => {
                for project_name in project_names {
                    let entry = source_map.entry(project_name).or_default();
                    entry.remove_sources(&removed_sources);
                    entry.merge_pending_sources(added_sources.clone());
                }
            }
        };
        Ok(())
    }

    pub fn is_source_control_update_in_progress(&self) -> bool {
        self.source_control_update_status.is_started()
    }

    /// Over the course of the build, we may need to stop current progress
    /// as there maybe incoming file change or source control update in progress
    pub fn should_cancel_current_build(&self) -> bool {
        self.is_source_control_update_in_progress() || self.has_pending_file_source_changes()
    }
}

/// A module to serialize a watchman Clock value via JSON.
/// The reason is that `Clock` internally uses an untagged enum value
/// which requires "self descriptive" serialization formats and `bincode` does not
/// support those enums.
mod clock_json_string {
    use crate::file_source::Clock;
    use serde::{
        de::{Error, Visitor},
        Deserializer, Serializer,
    };

    pub fn serialize<S>(clock: &Option<Clock>, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let json_string = serde_json::to_string(clock).unwrap();
        serializer.serialize_str(&json_string)
    }

    pub fn deserialize<'de, D>(deserializer: D) -> Result<Option<Clock>, D::Error>
    where
        D: Deserializer<'de>,
    {
        deserializer.deserialize_str(JSONStringVisitor)
    }

    struct JSONStringVisitor;
    impl<'de> Visitor<'de> for JSONStringVisitor {
        type Value = Option<Clock>;

        fn expecting(&self, formatter: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
            formatter.write_str("a JSON encoded watchman::Clock value")
        }

        fn visit_str<E: Error>(self, v: &str) -> Result<Option<Clock>, E> {
            Ok(serde_json::from_str(v).unwrap())
        }
    }
}
