/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::compiler_state::{GraphQLSources, SourceSetName};
use crate::errors::{Error, Result};
use common::SourceLocationKey;
use fnv::{FnvHashMap, FnvHashSet};
use graphql_syntax::ExecutableDefinition;
use interner::StringKey;

#[derive(Debug)]
pub struct GraphQLAsts {
    pub asts: Vec<ExecutableDefinition>,
    pub changed_definition_names: FnvHashSet<StringKey>,
    pub removed_definition_names: Vec<StringKey>,
}

impl GraphQLAsts {
    pub fn from_graphql_sources_map(
        graphql_sources_map: &FnvHashMap<SourceSetName, GraphQLSources>,
    ) -> Result<FnvHashMap<SourceSetName, GraphQLAsts>> {
        graphql_sources_map
            .iter()
            .map(|(&source_set_name, sources)| {
                let asts = GraphQLAsts::from_graphql_sources(sources)?;
                Ok((source_set_name, asts))
            })
            .collect::<Result<_>>()
    }

    /// Parses all source files for all projects into ASTs and builds up a Sources map that can
    /// be used to print errors with source code listing.
    /// Additionally collects the set of definition names that changed,given the compiler state
    pub fn from_graphql_sources(graphql_sources: &GraphQLSources) -> Result<Self> {
        let mut parsed_files = FnvHashSet::default();
        let mut syntax_errors = Vec::new();

        let mut asts = Vec::new();
        let mut changed_definition_names = FnvHashSet::default();
        let mut processed_definition_names = FnvHashSet::default();

        // Iterate over all processed sources and parse each graphql string.
        // If any of the processed sources also exist in the pending source set,
        // prefer the entry from the pending source set, which contains the
        // latest values for the graphql strings in the file.
        for (file_name, graphql_sources_for_file) in &graphql_sources.processed {
            let mut definitions_for_file = Vec::new();

            // Check for graphql strings in the pending sources for
            // this file, and prefer those for parsing if they're
            // available
            let mut used_pending_sources = false;
            let graphql_sources =
                if let Some(pending_graphql_sources) = graphql_sources.pending.get(file_name) {
                    used_pending_sources = true;
                    pending_graphql_sources
                } else {
                    &graphql_sources_for_file
                };

            for (index, graphql_source) in graphql_sources.iter().enumerate() {
                let source_location =
                    SourceLocationKey::embedded(&file_name.to_string_lossy(), index);
                match graphql_syntax::parse_executable(&graphql_source.text, source_location) {
                    Ok(document) => {
                        definitions_for_file.extend(document.definitions);
                    }
                    Err(errors) => syntax_errors.extend(
                        errors
                            .into_iter()
                            .map(|error| error.with_source(graphql_source.clone())),
                    ),
                }
            }

            // If we used any pending sources for the current file, collect the
            // parsed definition names as part of the set of definition names
            // that have changed.
            // Then parse the original source to get all processed definition names
            // that could potentially be deleted
            if used_pending_sources {
                changed_definition_names.extend(
                    definitions_for_file
                        .iter()
                        .flat_map(|definition| definition.name()),
                );
                for (index, graphql_source) in graphql_sources_for_file.iter().enumerate() {
                    // TODO: parse name instead of the whole graphql text
                    let source_location =
                        SourceLocationKey::embedded(&file_name.to_string_lossy(), index);
                    if let Ok(document) =
                        graphql_syntax::parse_executable(&graphql_source.text, source_location)
                    {
                        for def in document.definitions {
                            let name = def.name().expect("Expected operation name to exist.");
                            processed_definition_names.insert(name);
                        }
                    }
                }
            }
            parsed_files.insert(file_name);
            asts.extend(definitions_for_file);
        }

        let removed_definition_names = processed_definition_names
            .difference(&changed_definition_names)
            .cloned()
            .collect();

        // Iterate over all pending sources, and parse any graphql strings that
        // weren't already parsed in the previous pass over the processed sources.
        // We do this in order to account for any pending sources that correspond
        // to new files, and which wouldn't be present the processed sources.
        for (file_name, graphql_sources) in graphql_sources.pending.iter() {
            // Only parse the file if it isn't already been parsed.
            if !parsed_files.contains(file_name) {
                let mut definitions_for_file = Vec::new();
                for (index, graphql_source) in graphql_sources.iter().enumerate() {
                    let source_location =
                        SourceLocationKey::embedded(&file_name.to_string_lossy(), index);
                    match graphql_syntax::parse_executable(&graphql_source.text, source_location) {
                        Ok(document) => {
                            // Those definitions appear again in other paths. Generate artifacts for
                            // those definitions again so we can write to the new paths
                            for def in &document.definitions {
                                let name = def.name().expect("Expected operation name to exist.");
                                if processed_definition_names.contains(&name) {
                                    changed_definition_names.insert(name);
                                }
                            }
                            definitions_for_file.extend(document.definitions);
                        }
                        Err(errors) => syntax_errors.extend(
                            errors
                                .into_iter()
                                .map(|error| error.with_source(graphql_source.clone())),
                        ),
                    }
                }
                asts.extend(definitions_for_file);
            }
        }

        if syntax_errors.is_empty() {
            Ok(Self {
                asts,
                changed_definition_names,
                removed_definition_names,
            })
        } else {
            Err(Error::SyntaxErrors {
                errors: syntax_errors,
            })
        }
    }
}
