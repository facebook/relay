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
    FileSourceResult,
};
use common::{PerfLogEvent, PerfLogger};
use fnv::FnvHashMap;
use graphql_syntax::GraphQLSource;
use indexmap::map::IndexMap;
use interner::StringKey;
use io::BufReader;
use rayon::prelude::*;
use serde::{Deserialize, Serialize};
use std::collections::hash_map::Entry;
use std::fmt;
use std::path::PathBuf;
use std::{fs::File, io};

/// Name of a compiler project.
pub type ProjectName = StringKey;

/// Name of a source set; a source set corresponds to a set fo files
/// that can be shared by multiple compiler projects
pub type SourceSetName = StringKey;

/// Set of the projects
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum ProjectSet {
    ProjectName(ProjectName),
    ProjectNames(Vec<ProjectName>),
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

type GraphQLSourceSet = IndexMap<PathBuf, Vec<GraphQLSource>>;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct GraphQLSources {
    grouped_pending_sources: FnvHashMap<SourceSetName, GraphQLSourceSet>,
    grouped_processed_sources: FnvHashMap<SourceSetName, GraphQLSourceSet>,
}

impl Default for GraphQLSources {
    fn default() -> Self {
        Self {
            grouped_pending_sources: Default::default(),
            grouped_processed_sources: Default::default(),
        }
    }
}

impl GraphQLSources {
    pub fn pending_sources(&self) -> impl Iterator<Item = (&SourceSetName, &GraphQLSourceSet)> {
        self.grouped_pending_sources.iter()
    }

    pub fn processed_sources(&self) -> impl Iterator<Item = (&SourceSetName, &GraphQLSourceSet)> {
        self.grouped_processed_sources.iter()
    }

    pub fn pending_sources_for_source_set(
        &self,
        source_set_name: SourceSetName,
    ) -> Option<&GraphQLSourceSet> {
        self.grouped_pending_sources.get(&source_set_name)
    }

    fn has_pending_sources(&self) -> bool {
        !self.grouped_pending_sources.is_empty()
    }

    fn source_set_has_pending_sources(&self, source_set_name: SourceSetName) -> bool {
        match self.pending_sources_for_source_set(source_set_name) {
            Some(pending_source_set) => !pending_source_set.is_empty(),
            None => false,
        }
    }

    fn has_processed_sources(&self) -> bool {
        !self.grouped_processed_sources.is_empty()
    }

    fn set_pending_source_set(
        &mut self,
        source_set_name: SourceSetName,
        source_set: GraphQLSourceSet,
    ) {
        match self.grouped_pending_sources.entry(source_set_name) {
            Entry::Occupied(mut entry) => {
                for (path, file_state) in source_set {
                    entry.get_mut().insert(path, file_state);
                }
            }
            Entry::Vacant(entry) => {
                entry.insert(source_set);
            }
        }
    }

    /// Merges additional pending sources into this states pending sources.
    fn merge_pending_sources(
        &mut self,
        source_set_name: SourceSetName,
        additional_pending_sources: GraphQLSourceSet,
    ) {
        self.grouped_pending_sources
            .entry(source_set_name)
            .or_insert_with(Default::default)
            .extend(additional_pending_sources.into_iter());
    }

    fn commit_pending_sources(&mut self) {
        for (source_set_name, pending_source_set) in self.grouped_pending_sources.drain() {
            let base_source_set = self
                .grouped_processed_sources
                .entry(source_set_name)
                .or_insert_with(Default::default);

            for (file_name, pending_graphql_sources) in pending_source_set {
                if pending_graphql_sources.is_empty() {
                    base_source_set.remove(&file_name);
                } else {
                    base_source_set.insert(file_name, pending_graphql_sources);
                }
            }
        }
    }
}

pub type SchemaSources = FnvHashMap<ProjectName, Vec<String>>;

#[derive(Serialize, Deserialize, Debug)]
pub struct CompilerState {
    pub graphql_sources: GraphQLSources,
    pub schemas: SchemaSources,
    pub extensions: SchemaSources,
    pub artifacts: FnvHashMap<ProjectName, ArtifactMap>,
    pub clock: Clock,
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

        let artifacts = FnvHashMap::default();
        let mut schemas = FnvHashMap::default();
        let mut extensions = FnvHashMap::default();
        let mut graphql_sources = GraphQLSources::default();

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
                        .collect::<Result<IndexMap<_, _>>>()?;
                    log_event.stop(extract_timer);
                    match source_set {
                        SourceSet::SourceSetName(source_set_name) => {
                            graphql_sources.set_pending_source_set(source_set_name, sources);
                        }
                        SourceSet::SourceSetNames(names) => {
                            for source_set_name in names {
                                graphql_sources
                                    .set_pending_source_set(source_set_name, sources.clone());
                            }
                        }
                    }
                }
                FileGroup::Schema { project_set } => {
                    let schema_sources = files
                        .iter()
                        .map(|file| read_to_string(&file_source_changes.resolved_root, file))
                        .collect::<Result<Vec<String>>>()?;
                    match project_set {
                        ProjectSet::ProjectName(project_name) => {
                            schemas.insert(project_name, schema_sources);
                        }
                        ProjectSet::ProjectNames(project_names) => {
                            for project_name in project_names {
                                schemas.insert(project_name, schema_sources.clone());
                            }
                        }
                    };
                }
                FileGroup::Extension { project_set } => {
                    let extension_sources: Vec<String> = files
                        .iter()
                        .map(|file| read_to_string(&file_source_changes.resolved_root, file))
                        .collect::<Result<Vec<String>>>()?;

                    match project_set {
                        ProjectSet::ProjectName(project_name) => {
                            extensions.insert(project_name, extension_sources);
                        }
                        ProjectSet::ProjectNames(project_names) => {
                            for project_name in project_names {
                                extensions.insert(project_name, extension_sources.clone());
                            }
                        }
                    };
                }
                FileGroup::Generated => {
                    // TODO
                }
            }
        }

        Ok(Self {
            graphql_sources,
            artifacts,
            extensions,
            schemas,
            clock: file_source_changes.clock.clone(),
        })
    }

    pub fn has_pending_changes(&self) -> bool {
        self.graphql_sources.has_pending_sources()
    }

    pub fn project_has_pending_changes(&self, project_name: ProjectName) -> bool {
        self.graphql_sources
            .source_set_has_pending_sources(project_name)
    }

    pub fn has_processed_changes(&self) -> bool {
        self.graphql_sources.has_processed_sources()
    }

    /// Merges the provided pending changes from the file source into the compiler state.
    /// Returns a boolean indicating if any new changes were merged.
    pub fn merge_file_source_changes(
        &mut self,
        config: &Config,
        file_source_changes: &FileSourceResult,
        setup_event: &impl PerfLogEvent,
        perf_logger: &impl PerfLogger,
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
                        .collect::<Result<IndexMap<_, _>>>()?;
                    log_event.stop(extract_timer);
                    match source_set {
                        SourceSet::SourceSetName(source_set_name) => {
                            self.graphql_sources
                                .merge_pending_sources(source_set_name, sources);
                        }
                        SourceSet::SourceSetNames(names) => {
                            for source_set_name in names {
                                self.graphql_sources
                                    .merge_pending_sources(source_set_name, sources.clone());
                            }
                        }
                    }
                }
                FileGroup::Schema { project_set } => {
                    has_changed = true;

                    let schema_sources = files
                        .iter()
                        .map(|file| read_to_string(&file_source_changes.resolved_root, file))
                        .collect::<Result<Vec<String>>>()?;
                    match project_set {
                        ProjectSet::ProjectName(project_name) => {
                            self.schemas.insert(project_name, schema_sources);
                        }
                        ProjectSet::ProjectNames(project_names) => {
                            for project_name in project_names {
                                self.schemas.insert(project_name, schema_sources.clone());
                            }
                        }
                    };
                }
                FileGroup::Extension { project_set } => {
                    has_changed = true;

                    let extension_sources: Vec<String> = files
                        .iter()
                        .map(|file| read_to_string(&file_source_changes.resolved_root, file))
                        .collect::<Result<Vec<String>>>()?;

                    match project_set {
                        ProjectSet::ProjectName(project_name) => {
                            self.extensions.insert(project_name, extension_sources);
                        }
                        ProjectSet::ProjectNames(project_names) => {
                            for project_name in project_names {
                                self.extensions
                                    .insert(project_name, extension_sources.clone());
                            }
                        }
                    };
                }
                FileGroup::Generated => {
                    // TODO
                }
            }
        }

        Ok(has_changed)
    }

    pub fn commit_pending_file_source_changes(&mut self) {
        self.graphql_sources.commit_pending_sources();
    }

    /// The initial implementation of the `update_artifacts_map` do not handle incremental updates
    /// of the artifacts map
    /// This will be added in the next iterations
    fn update_artifacts_map(&mut self, _written_artifacts: ArtifactMap) {
        // for (project_name, project_written_artifacts) in written_artifacts.iter() {
        //     self.artifacts.insert(
        //         project_name.to_owned(),
        //         ArtifactMap::new(project_written_artifacts.to_owned()),
        //     );
        // }
    }

    pub fn complete_compilation(&mut self, written_artifacts: ArtifactMap) {
        self.update_artifacts_map(written_artifacts);
        self.commit_pending_file_source_changes();
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
}
