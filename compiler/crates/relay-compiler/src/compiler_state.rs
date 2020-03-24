/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::config::Config;
use crate::watchman::{
    categorize_files, errors::Result, extract_graphql_strings_from_file, read_to_string, FileGroup,
    FileSourceResult,
};
use common::Timer;
use interner::StringKey;
use rayon::prelude::*;
use std::collections::HashMap;
use std::path::PathBuf;

/// Name of a fragment or operation.
pub type DefinitionName = StringKey;

/// Name of a compiler project.
pub type ProjectName = StringKey;

/// Name of a source set; a source set corresponds to a set fo files
/// that can be shared by multiple compiler projects
pub type SourceSetName = StringKey;

/// A map from DefinitionName to output artifacts and their hashes
pub struct ArtifactMap(HashMap<DefinitionName, Vec<(PathBuf, Sha1Hash)>>);

pub struct Sha1Hash(String);

#[derive(Clone, Debug)]
pub struct FileState {
    pub graphql_strings: Vec<String>,
    pub exists: bool,
}

type GraphQLSourceSet = HashMap<PathBuf, FileState>;

#[derive(Clone, Debug)]
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

pub struct CompilerState {
    pub graphql_sources: GraphQLSources,

    pub schemas: HashMap<ProjectName, Vec<String>>,
    pub extensions: HashMap<ProjectName, Vec<String>>,
    pub artifacts: HashMap<ProjectName, ArtifactMap>,
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
                                        graphql_strings: Vec::new(),
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
                                        graphql_strings,
                                        exists,
                                    },
                                ))),
                                Err(err) => Some(Err(err)),
                            }
                        })
                        .collect::<Result<HashMap<PathBuf, FileState>>>()?;
                    extract_timer.stop();
                    graphql_sources.set_pending_source_set(source_set_name, sources);
                }
                FileGroup::Schema { project_name } => {
                    let schema_sources = files
                        .iter()
                        .map(|file| read_to_string(&file_source_changes.resolved_root, file))
                        .collect::<Result<Vec<String>>>()?;
                    schemas.insert(project_name, schema_sources);
                }
                FileGroup::Extension { project_name } => {
                    let extension_sources: Vec<String> = files
                        .iter()
                        .map(|file| read_to_string(&file_source_changes.resolved_root, file))
                        .collect::<Result<Vec<String>>>()?;
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
            panic!("Watching for changes in schema files in unsupported");
        }
        if !pending_compiler_state.extensions.is_empty() {
            // TODO support watching extension changes
            panic!("Watching for changes in extensions files in unsupported");
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
}
