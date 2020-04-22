/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::artifact_map::ArtifactMap;
use crate::build_project::WrittenArtifacts;
use crate::config::Config;
use crate::errors::{Error, Result};
use crate::watchman::{
    categorize_files, errors::Result as WatchmanResult, extract_graphql_strings_from_file,
    read_to_string, Clock, FileGroup, FileSourceResult,
};
use common::Timer;
use graphql_syntax::GraphQLSource;
use interner::StringKey;
use io::BufReader;
use rayon::prelude::*;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;
use std::{fs::File, io};

/// Name of a compiler project.
pub type ProjectName = StringKey;

/// Name of a source set; a source set corresponds to a set fo files
/// that can be shared by multiple compiler projects
pub type SourceSetName = StringKey;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct FileState {
    pub graphql_sources: Vec<GraphQLSource>,
    pub exists: bool,
}

type GraphQLSourceSet = HashMap<PathBuf, FileState>;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct GraphQLSources {
    grouped_pending_sources: HashMap<SourceSetName, GraphQLSourceSet>,
    grouped_processed_sources: HashMap<SourceSetName, GraphQLSourceSet>,
}

impl Default for GraphQLSources {
    fn default() -> Self {
        Self {
            grouped_pending_sources: Default::default(),
            grouped_processed_sources: Default::default(),
        }
    }
}

impl Default for CompilerState {
    fn default() -> Self {
        Self {
            schemas: Default::default(),
            graphql_sources: Default::default(),
            extensions: Default::default(),
            artifacts: Default::default(),
            metadata: None,
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
        self.grouped_pending_sources
            .insert(source_set_name, source_set);
    }

    fn add_pending_sources(&mut self, pending_graphql_sources: &GraphQLSources) {
        for (source_set_name, pending_source_set) in pending_graphql_sources.pending_sources() {
            let base_source_set = self
                .grouped_pending_sources
                .entry(*source_set_name)
                .or_insert_with(HashMap::new);

            for (file_name, pending_file_state) in pending_source_set.iter() {
                base_source_set.insert(file_name.to_owned(), pending_file_state.to_owned());
            }
        }
    }

    fn commit_pending_sources(&mut self) {
        for (source_set_name, pending_source_set) in self.grouped_pending_sources.drain() {
            let base_source_set = self
                .grouped_processed_sources
                .entry(source_set_name)
                .or_insert_with(HashMap::new);

            for (file_name, pending_file_state) in pending_source_set.iter() {
                base_source_set.insert(file_name.to_owned(), pending_file_state.to_owned());
            }
        }
    }
}
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct CompilerStateMetadata {
    pub clock: Clock,
}

pub type SchemaSources = HashMap<ProjectName, Vec<String>>;

#[derive(Serialize, Deserialize, Debug)]
pub struct CompilerState {
    pub graphql_sources: GraphQLSources,
    pub schemas: SchemaSources,
    pub extensions: SchemaSources,
    pub artifacts: HashMap<ProjectName, ArtifactMap>,
    pub metadata: Option<CompilerStateMetadata>,
}

fn merge_schema_sources(
    current_schemas: SchemaSources,
    new_schemas: SchemaSources,
) -> SchemaSources {
    let mut next_schemas: SchemaSources = current_schemas;
    for (project_name, schema_sources) in new_schemas {
        next_schemas.insert(project_name, schema_sources.to_owned());
    }
    next_schemas
}

impl CompilerState {
    pub fn from_file_source_changes(
        config: &Config,
        file_source_changes: &FileSourceResult,
    ) -> Result<Self> {
        let categorized = categorize_files(config, &file_source_changes.files);
        let artifacts = HashMap::new();
        let mut schemas = HashMap::new();
        let mut extensions = HashMap::new();
        let mut graphql_sources = GraphQLSources::default();

        for (category, files) in categorized {
            match category {
                FileGroup::Source { source_set_name } => {
                    let extract_timer = Timer::start(format!("extract {}", source_set_name));
                    let sources = files
                        .par_iter()
                        .filter_map(|file| {
                            let exists = *file.exists;
                            if !exists {
                                return Some(Ok((
                                    (*file.name).to_owned(),
                                    FileState {
                                        graphql_sources: Vec::new(),
                                        exists,
                                    },
                                )));
                            }

                            match extract_graphql_strings_from_file(
                                &file_source_changes.resolved_root,
                                &file,
                            ) {
                                // NOTE: Some of the JS files might not contain any graphql, so we
                                // ignore them here by returning None.
                                // Note that we explicitly track deleted files during watch mode
                                // by checking the `exists` flag from watchman
                                Ok(graphql_strings) if graphql_strings.is_empty() => None,
                                Ok(graphql_strings) => Some(Ok((
                                    (*file.name).to_owned(),
                                    FileState {
                                        graphql_sources: graphql_strings,
                                        exists,
                                    },
                                ))),
                                Err(err) => Some(Err(err)),
                            }
                        })
                        .collect::<WatchmanResult<HashMap<PathBuf, FileState>>>()?;
                    extract_timer.stop();
                    graphql_sources.set_pending_source_set(source_set_name, sources);
                }
                FileGroup::Schema { project_name } => {
                    let schema_sources = files
                        .iter()
                        .map(|file| read_to_string(&file_source_changes.resolved_root, file))
                        .collect::<WatchmanResult<Vec<String>>>()?;
                    schemas.insert(project_name, schema_sources);
                }
                FileGroup::Extension { project_name } => {
                    let extension_sources: Vec<String> = files
                        .iter()
                        .map(|file| read_to_string(&file_source_changes.resolved_root, file))
                        .collect::<WatchmanResult<Vec<String>>>()?;
                    extensions.insert(project_name, extension_sources);
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
            metadata: Some(CompilerStateMetadata {
                clock: file_source_changes.clock.clone(),
            }),
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
    pub fn add_pending_file_source_changes(
        &mut self,
        config: &Config,
        file_source_changes: &FileSourceResult,
    ) -> Result<bool> {
        let pending_compiler_state =
            CompilerState::from_file_source_changes(config, file_source_changes)?;

        if !pending_compiler_state.schemas.is_empty() {
            // TODO support watching schema changes
            self.schemas =
                merge_schema_sources(self.schemas.to_owned(), pending_compiler_state.schemas);
        }
        if !pending_compiler_state.extensions.is_empty() {
            // TODO support watching extension changes
            self.extensions = merge_schema_sources(
                self.extensions.to_owned(),
                pending_compiler_state.extensions,
            );
        }

        let pending_graphql_sources = pending_compiler_state.graphql_sources;
        if !pending_graphql_sources.has_pending_sources() {
            // If there are no source changes, don't notify the subscriber of changes,
            // otherwise we'll enter an infinite loop if we don't handle artifact
            // changes
            // TODO support watching artifact changes
            return Ok(false);
        }

        self.graphql_sources
            .add_pending_sources(&pending_graphql_sources);
        Ok(true)
    }

    pub fn commit_pending_file_source_changes(&mut self) {
        self.graphql_sources.commit_pending_sources();
    }

    /// The initial implementation of the `update_artifacts_map` do not handle incremental updates
    /// of the artifacts map
    /// This will be added in the next iterations
    fn update_artifacts_map(&mut self, written_artifacts: HashMap<ProjectName, WrittenArtifacts>) {
        for (project_name, project_written_artifacts) in written_artifacts.iter() {
            self.artifacts.insert(
                project_name.to_owned(),
                ArtifactMap::new(project_written_artifacts.to_owned()),
            );
        }
    }

    pub fn complete_compilation(
        &mut self,
        written_artifacts: HashMap<ProjectName, WrittenArtifacts>,
    ) {
        self.update_artifacts_map(written_artifacts);
        self.commit_pending_file_source_changes();
    }

    pub fn serialize_to_file(&self, path: &PathBuf) -> Result<()> {
        let write_to_file_timer = Timer::start(format!("write state to {:?}", path));
        let writer = File::create(path).map_err(|err| Error::WriteFileError {
            file: path.clone(),
            source: err,
        })?;
        serde_json::to_writer(writer, self).map_err(|err| Error::SerializationError {
            file: path.clone(),
            source: err,
        })?;
        write_to_file_timer.stop();
        Ok(())
    }

    pub fn deserialize_from_file(path: &PathBuf) -> Result<Self> {
        let restoring_timer = Timer::start(format!("restoring state from {:?}", path));
        let file = File::open(path).map_err(|err| Error::ReadFileError {
            file: path.clone(),
            source: err,
        })?;
        let reader = BufReader::new(file);
        let state = serde_json::from_reader(reader).map_err(|err| Error::DeserializationError {
            file: path.clone(),
            source: err,
        })?;
        restoring_timer.stop();
        Ok(state)
    }
}
