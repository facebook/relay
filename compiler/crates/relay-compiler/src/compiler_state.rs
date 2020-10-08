/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::artifact_map::ArtifactMap;
use crate::config::Config;
use crate::errors::{Error, Result};
use crate::watchman::{
    categorize_files, extract_graphql_strings_from_file, read_to_string, Clock, FileGroup,
    FileSourceResult, WatchmanFile,
};
use common::{PerfLogEvent, PerfLogger};
use fnv::{FnvHashMap, FnvHashSet};
use graphql_syntax::GraphQLSource;
use interner::StringKey;
use io::BufReader;
use rayon::prelude::*;
use serde::{Deserialize, Serialize};
use std::{fmt, fs::File, hash::Hash, io, path::PathBuf, sync::Arc};

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
#[derive(Deserialize, Debug, Clone, PartialEq, Eq, Hash)]
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
    pub fn get_sources(&self) -> Vec<&String> {
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
    pub clock: Clock,
    pub saved_state_version: String,
    pub dirty_artifact_paths: FnvHashMap<ProjectName, FnvHashSet<PathBuf>>,
}

impl CompilerState {
    pub fn from_file_source_changes(
        config: &Config,
        file_source_changes: &FileSourceResult,
        setup_event: &impl PerfLogEvent,
        perf_logger: &impl PerfLogger,
    ) -> Result<Self> {
        let categorized = setup_event.time("categorize_files_time", || {
            categorize_files(config, &file_source_changes.files)
        });

        let mut result = Self {
            graphql_sources: Default::default(),
            artifacts: Default::default(),
            extensions: Default::default(),
            schemas: Default::default(),
            clock: file_source_changes.clock.clone(),
            saved_state_version: config.saved_state_version.clone(),
            dirty_artifact_paths: Default::default(),
        };

        for (category, files) in categorized {
            match category {
                FileGroup::Source { source_set } => {
                    let log_event = perf_logger.create_event("categorize");
                    log_event.string("source_set_name", source_set.to_string());
                    let extract_timer = log_event.start("extract_graphql_strings_from_file_time");
                    let sources = files
                        .par_iter()
                        .filter(|file| *file.exists)
                        .filter_map(|file| {
                            match extract_graphql_strings_from_file(
                                &file_source_changes.resolved_root,
                                &file,
                            ) {
                                Ok(graphql_strings) if graphql_strings.is_empty() => None,
                                Ok(graphql_strings) => {
                                    Some(Ok(((*file.name).to_owned(), graphql_strings)))
                                }
                                Err(err) => Some(Err(err)),
                            }
                        })
                        .collect::<Result<_>>()?;
                    log_event.stop(extract_timer);
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
                            files
                                .into_iter()
                                .map(|file| file.name.into_inner())
                                .collect(),
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
            || self
                .schemas
                .get(&project_name)
                .map_or(false, |sources| !sources.pending.is_empty())
            || self
                .extensions
                .get(&project_name)
                .map_or(false, |sources| !sources.pending.is_empty())
            || self.dirty_artifact_paths.contains_key(&project_name)
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

    pub fn has_breaking_schema_change(&self) -> bool {
        self.extensions
            .values()
            .any(|sources| !sources.pending.is_empty())
            || self
                .schemas
                .values()
                .any(|sources| !sources.pending.is_empty())
    }

    /// Merges the provided pending changes from the file source into the compiler state.
    /// Returns a boolean indicating if any new changes were merged.
    pub fn merge_file_source_changes(
        &mut self,
        config: &Config,
        file_source_changes: &FileSourceResult,
        setup_event: &impl PerfLogEvent,
        perf_logger: &impl PerfLogger,
        // When loading from saved state, collect dirty artifacts for recompiling their source definitions
        should_collect_changed_artifacts: bool,
    ) -> Result<bool> {
        let mut has_changed = false;

        let categorized = setup_event.time("categorize_files_time", || {
            categorize_files(config, &file_source_changes.files)
        });

        for (category, files) in categorized {
            match category {
                FileGroup::Source { source_set } => {
                    // TODO: possible optimization to only set this if the
                    // extracted sources actually differ.
                    has_changed = true;

                    let log_event = perf_logger.create_event("categorize");
                    log_event.string("source_set_name", source_set.to_string());
                    let extract_timer = log_event.start("extract_graphql_strings_from_file_time");
                    let sources = files
                        .par_iter()
                        .map(|file| {
                            let graphql_strings = if *file.exists {
                                extract_graphql_strings_from_file(
                                    &file_source_changes.resolved_root,
                                    &file,
                                )?
                            } else {
                                Vec::new()
                            };
                            Ok(((*file.name).to_owned(), graphql_strings))
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
                        file_source_changes,
                        files,
                        project_set,
                        &mut self.schemas,
                    )?;
                }
                FileGroup::Extension { project_set } => {
                    has_changed = true;
                    Self::process_schema_change(
                        file_source_changes,
                        files,
                        project_set,
                        &mut self.extensions,
                    )?;
                }
                FileGroup::Generated { project_name } => {
                    if !should_collect_changed_artifacts {
                        break;
                    }
                    self.dirty_artifact_paths.insert(
                        project_name,
                        files.iter().map(|f| (*f.name).clone()).collect(),
                    );
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
        self.dirty_artifact_paths.clear();
    }

    /// Calculate dirty definitions from dirty artifacts
    pub fn get_dirty_defintions(&self, config: &Config) -> FnvHashMap<ProjectName, Vec<StringKey>> {
        if self.dirty_artifact_paths.is_empty() {
            return Default::default();
        }
        let mut result = FnvHashMap::default();
        for config in config.enabled_projects() {
            let project_name = config.name;
            let paths = self.dirty_artifact_paths.get(&project_name);
            let mut dirty_definitions = vec![];
            match paths {
                None => break,
                Some(paths) => {
                    let mut paths = paths.clone();
                    let artifacts = self
                        .artifacts
                        .get(&project_name)
                        .expect("Expected the artifacts map to exist.");
                    if let ArtifactMapKind::Mapping(artifacts) = &**artifacts {
                        'outer: for (definition_name, artifact_tuples) in artifacts.0.iter() {
                            let mut added = false;
                            for artifact_tuple in artifact_tuples {
                                if paths.remove(&artifact_tuple.0) && !added {
                                    dirty_definitions.push(*definition_name);
                                    if paths.is_empty() {
                                        break 'outer;
                                    }
                                    added = true;
                                }
                            }
                        }
                        if !dirty_definitions.is_empty() {
                            result.insert(project_name, dirty_definitions);
                        }
                    } else {
                        panic!("Expected the artifacts map to be populated.")
                    }
                }
            }
        }
        result
    }

    pub fn serialize_to_file(&self, path: &PathBuf) -> Result<()> {
        let writer = File::create(path).map_err(|err| Error::WriteFileError {
            file: path.clone(),
            source: err,
        })?;
        serde_json::to_writer(writer, self).map_err(|err| Error::SerializationError {
            file: path.clone(),
            source: err,
        })?;
        Ok(())
    }

    pub fn deserialize_from_file(path: &PathBuf) -> Result<Self> {
        let file = File::open(path).map_err(|err| Error::ReadFileError {
            file: path.clone(),
            source: err,
        })?;
        let reader = BufReader::new(file);
        let state = serde_json::from_reader(reader).map_err(|err| Error::DeserializationError {
            file: path.clone(),
            source: err,
        })?;
        Ok(state)
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
        files: Vec<WatchmanFile>,
        project_set: ProjectSet,
        source_map: &mut FnvHashMap<ProjectName, SchemaSources>,
    ) -> Result<()> {
        let mut removed_sources = vec![];
        let mut added_sources = FnvHashMap::default();
        for file in files {
            let file_name = (*file.name).to_owned();
            if *file.exists {
                added_sources.insert(
                    file_name,
                    read_to_string(&file_source_changes.resolved_root, &file)?,
                );
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
}
