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

type FilePath = PathBuf;

#[derive(Clone, Debug)]
pub struct FileState {
    pub graphql_strings: Vec<String>,
    pub exists: bool,
}

type GraphQLSourceSet = HashMap<FilePath, FileState>;

#[derive(Clone, Debug)]
pub struct GraphQLSources {
    grouped_sources: HashMap<SourceSetName, GraphQLSourceSet>,
}

impl Default for GraphQLSources {
    fn default() -> Self {
        Self {
            grouped_sources: Default::default(),
        }
    }
}

impl GraphQLSources {
    pub(crate) fn all_sources(&self) -> impl Iterator<Item = (&SourceSetName, &GraphQLSourceSet)> {
        self.grouped_sources.iter()
    }

    fn set_sources(&mut self, source_set_name: SourceSetName, sources: GraphQLSourceSet) {
        self.grouped_sources.insert(source_set_name, sources);
    }
}

/// A map from DefinitionName to output artifacts and their hashes
pub struct ArtifactMap(HashMap<DefinitionName, Vec<(PathBuf, Sha1Hash)>>);

pub struct Sha1Hash(String);

pub struct CompilerState {
    pub graphql_sources: GraphQLSources,

    pub schemas: HashMap<ProjectName, Vec<String>>,
    pub extensions: HashMap<ProjectName, Vec<String>>,
    pub artifacts: HashMap<ProjectName, ArtifactMap>,
}

impl CompilerState {
    pub fn from_file_source_changes(
        config: &Config,
        file_source_result: &FileSourceResult,
    ) -> Result<Self> {
        let categorized = categorize_files(config, &file_source_result.files);

        let pending_artifacts = HashMap::new();
        let mut pending_schemas = HashMap::new();
        let mut pending_extensions = HashMap::new();
        let mut pending_graphql_sources = GraphQLSources::default();

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
                                &file_source_result.resolved_root,
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
                        .collect::<Result<HashMap<FilePath, FileState>>>()?;
                    extract_timer.stop();
                    pending_graphql_sources.set_sources(source_set_name, sources);
                }
                FileGroup::Schema { project_name } => {
                    let schema_sources = files
                        .iter()
                        .map(|file| read_to_string(&file_source_result.resolved_root, file))
                        .collect::<Result<Vec<String>>>()?;
                    pending_schemas.insert(project_name, schema_sources);
                }
                FileGroup::Extension { project_name } => {
                    let extension_sources: Vec<String> = files
                        .iter()
                        .map(|file| read_to_string(&file_source_result.resolved_root, file))
                        .collect::<Result<Vec<String>>>()?;
                    pending_extensions.insert(project_name, extension_sources);
                }
                FileGroup::Generated => {
                    // TODO
                }
            }
        }

        Ok(Self {
            graphql_sources: pending_graphql_sources,

            artifacts: pending_artifacts,
            extensions: pending_extensions,
            schemas: pending_schemas,
        })
    }
}
