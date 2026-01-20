/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::collections::HashSet;
use std::collections::hash_map::Entry;
use std::path::Path;
use std::path::PathBuf;
use std::sync::Arc;

use common::Diagnostic;
use common::SourceLocationKey;
use common::sync::ParallelIterator;
use dependency_analyzer::ExecutableDefinitionNameSet;
use fnv::FnvHashMap;
use graphql_ir::ExecutableDefinitionName;
use graphql_ir::FragmentDefinitionName;
use graphql_ir::OperationDefinitionName;
use graphql_syntax::ExecutableDefinition;
use graphql_syntax::ParserFeatures;
use rayon::iter::IntoParallelRefIterator;
use relay_config::ProjectConfig;
use relay_config::ProjectName;

use crate::artifact_map::ArtifactSourceKey;
use crate::compiler_state::GraphQLSources;
use crate::config::Config;
use crate::errors::Error;
use crate::errors::Result;
use crate::file_source::LocatedGraphQLSource;
use crate::utils::get_parser_features;

/// A collection of GraphQL abstract syntax trees (ASTs) for a set of files.
///
/// This struct contains a map of file paths to their corresponding GraphQL ASTs,
/// as well as sets of pending and removed definition names.
#[derive(Debug)]
pub struct GraphQLAsts {
    /// A map of file paths to their corresponding GraphQL ASTs.
    asts: FnvHashMap<PathBuf, Vec<ExecutableDefinition>>,
    /// Names of fragments and operations that are updated or created.
    pub pending_definition_names: ExecutableDefinitionNameSet,
    /// Names of fragments and operations that are deleted.
    pub removed_definition_names: Vec<ArtifactSourceKey>,
}

impl GraphQLAsts {
    pub fn get_executable_definitions_for_file(
        &self,
        file_path: &Path,
    ) -> Option<&Vec<ExecutableDefinition>> {
        self.asts.get(file_path)
    }

    pub fn get_all_executable_definitions(&self) -> Vec<ExecutableDefinition> {
        self.asts.values().flatten().cloned().collect()
    }

    pub fn from_graphql_sources_map(
        graphql_sources_map: &FnvHashMap<ProjectName, GraphQLSources>,
        dirty_artifact_sources: &FnvHashMap<ProjectName, Vec<ArtifactSourceKey>>,
        config: &Arc<Config>,
    ) -> Result<FnvHashMap<ProjectName, GraphQLAsts>> {
        graphql_sources_map
            .par_iter()
            .map(|(&project_name, sources)| {
                let project_config = &config.projects[&project_name];

                let asts = GraphQLAsts::from_graphql_sources(
                    sources,
                    dirty_artifact_sources
                        .get(&project_name)
                        .map(|dirty_artifacts| {
                            dirty_artifacts
                                .iter()
                                .filter_map(|artifact_source_key| match artifact_source_key {
                                    ArtifactSourceKey::ExecutableDefinition(def_name) => {
                                        Some(def_name)
                                    }
                                    ArtifactSourceKey::Schema()
                                    | ArtifactSourceKey::ResolverHash(_) => {
                                        // We're only concerned with collecting ExecutableDefinitionNames
                                        None
                                    }
                                })
                                .collect()
                        }),
                    project_config,
                )?;
                Ok((project_name, asts))
            })
            .collect::<Result<_>>()
    }

    /// Parses all source files for all projects into ASTs and builds up a Sources map that can
    /// be used to print errors with source code listing.
    /// Additionally collects the set of definition names that updated, given the compiler state
    pub fn from_graphql_sources(
        graphql_sources: &GraphQLSources,
        dirty_definitions: Option<Vec<&ExecutableDefinitionName>>,
        project_config: &ProjectConfig,
    ) -> Result<Self> {
        let parser_features = get_parser_features(project_config);

        let mut syntax_errors = Vec::new();

        let mut asts: FnvHashMap<PathBuf, Vec<ExecutableDefinition>> = Default::default();
        let mut pending_definition_names: ExecutableDefinitionNameSet = HashSet::default();
        let mut removed_definition_names = Vec::new();

        if let Some(dirty_definitions) = dirty_definitions {
            pending_definition_names.extend(dirty_definitions);
        }

        let (pending_results, processed_results) = rayon::join(
            // Iterate over all pending sources, and parse each graphql string.
            // Prefer the entry from the pending source set, which contains the
            // latest values for the graphql strings in the file.
            || {
                graphql_sources
                    .pending
                    .par_iter()
                    .map(|(file_name, pending_graphql_sources)| {
                        parse_pending_graphql_source_and_collect_removed_definitions(
                            graphql_sources,
                            parser_features,
                            file_name,
                            pending_graphql_sources,
                        )
                    })
                    .collect::<Vec<_>>()
            },
            // Iterate over processed sources that aren't in the pending source set,
            // and parse each graphql string.
            || {
                graphql_sources
                    .processed
                    .par_iter()
                    .filter(
                        // Only parse the file if it isn't in the pending sources
                        |(file_name, _)| !graphql_sources.pending.contains_key(*file_name),
                    )
                    .map(|(file_name, processed_graphql_sources)| {
                        let mut definitions_for_file = Vec::new();
                        let mut local_syntax_errors = vec![];
                        for LocatedGraphQLSource {
                            index,
                            graphql_source,
                        } in processed_graphql_sources.iter()
                        {
                            let source_location =
                                SourceLocationKey::embedded(&file_name.to_string_lossy(), *index);
                            match graphql_syntax::parse_executable_with_features(
                                &graphql_source.text_source().text,
                                source_location,
                                parser_features,
                            ) {
                                Ok(document) => {
                                    definitions_for_file.extend(document.definitions);
                                }
                                Err(errors) => local_syntax_errors.extend(errors),
                            }
                        }
                        (file_name, definitions_for_file, local_syntax_errors)
                    })
                    .collect::<Vec<_>>()
            },
        );

        for PendingSourceResult {
            file_name,
            definitions_for_file,
            local_pending_definition_names,
            local_syntax_errors,
            local_removed_definition_names,
        } in pending_results
        {
            pending_definition_names.extend(local_pending_definition_names);
            syntax_errors.extend(local_syntax_errors);
            removed_definition_names.extend(local_removed_definition_names);
            asts.insert(file_name.clone(), definitions_for_file);
        }

        for (file_name, definitions_for_file, local_syntax_errors) in processed_results {
            syntax_errors.extend(local_syntax_errors);
            match asts.entry(file_name.clone()) {
                Entry::Vacant(entry) => {
                    entry.insert(definitions_for_file);
                }
                Entry::Occupied(mut entry) => {
                    let definitions = entry.get_mut();
                    definitions.extend(definitions_for_file)
                }
            }
        }

        if syntax_errors.is_empty() {
            Ok(Self {
                asts,
                pending_definition_names,
                removed_definition_names,
            })
        } else {
            Err(Error::DiagnosticsError {
                errors: syntax_errors,
            })
        }
    }
}

struct PendingSourceResult<'a> {
    file_name: &'a PathBuf,
    definitions_for_file: Vec<ExecutableDefinition>,
    local_pending_definition_names: Vec<ExecutableDefinitionName>,
    local_syntax_errors: Vec<Diagnostic>,
    local_removed_definition_names: Vec<ArtifactSourceKey>,
}

fn parse_pending_graphql_source_and_collect_removed_definitions<'a>(
    graphql_sources: &GraphQLSources,
    parser_features: ParserFeatures,
    file_name: &'a PathBuf,
    pending_graphql_sources: &[LocatedGraphQLSource],
) -> PendingSourceResult<'a> {
    let mut definitions_for_file = Vec::new();
    let mut local_pending_definition_names: Vec<ExecutableDefinitionName> = vec![];
    let mut local_syntax_errors = vec![];
    let mut local_removed_definition_names = vec![];
    for LocatedGraphQLSource {
        index,
        graphql_source,
    } in pending_graphql_sources.iter()
    {
        let source_location = SourceLocationKey::embedded(&file_name.to_string_lossy(), *index);
        match graphql_syntax::parse_executable_with_features(
            &graphql_source.text_source().text,
            source_location,
            parser_features,
        ) {
            Ok(document) => {
                for def in &document.definitions {
                    if let Some(name) = def.name() {
                        match def {
                            ExecutableDefinition::Operation(_) => local_pending_definition_names
                                .push(OperationDefinitionName(name).into()),
                            ExecutableDefinition::Fragment(_) => local_pending_definition_names
                                .push(FragmentDefinitionName(name).into()),
                        };
                    } else {
                        local_syntax_errors.push(Diagnostic::error(
                            "Expected operation to have a name (e.g. 'query <Name>')",
                            def.location(),
                        ))
                    }
                }
                definitions_for_file.extend(document.definitions);
            }
            Err(errors) => local_syntax_errors.extend(errors),
        }
    }
    // Parse the processed source to get all processed definition names
    // and collect definition names that are removed from that file.
    // (A definition moved to another file is considered as a deletion and a new source)
    if let Some(processed_graphql_sources) = graphql_sources.processed.get(file_name) {
        for LocatedGraphQLSource {
            index,
            graphql_source,
        } in processed_graphql_sources.iter()
        {
            // TODO: parse name instead of the whole graphql text
            let source_location = SourceLocationKey::embedded(&file_name.to_string_lossy(), *index);
            if let Ok(document) = graphql_syntax::parse_executable_with_features(
                &graphql_source.text_source().text,
                source_location,
                parser_features,
            ) {
                for def in document.definitions {
                    match def {
                        ExecutableDefinition::Operation(operation) => {
                            if !(definitions_for_file.iter().any(|def| {
                                if let ExecutableDefinition::Operation(op) = def {
                                    op.name == operation.name
                                } else {
                                    false
                                }
                            })) && let Some(operation_name) = operation.name
                            {
                                local_removed_definition_names.push(
                                    ArtifactSourceKey::ExecutableDefinition(
                                        ExecutableDefinitionName::OperationDefinitionName(
                                            OperationDefinitionName(operation_name.value),
                                        ),
                                    ),
                                );
                            }
                        }
                        ExecutableDefinition::Fragment(fragment) => {
                            if !(definitions_for_file.iter().any(|def| {
                                if let ExecutableDefinition::Fragment(frag) = def {
                                    frag.name == fragment.name
                                } else {
                                    false
                                }
                            })) {
                                local_removed_definition_names.push(
                                    ArtifactSourceKey::ExecutableDefinition(
                                        ExecutableDefinitionName::FragmentDefinitionName(
                                            FragmentDefinitionName(fragment.name.value),
                                        ),
                                    ),
                                );
                            }
                        }
                    }
                }
            }
        }
    }
    PendingSourceResult {
        file_name,
        definitions_for_file,
        local_pending_definition_names,
        local_syntax_errors,
        local_removed_definition_names,
    }
}
