/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::compiler_state::{CompilerState, GraphQLSources, SourceSetName};
use crate::errors::{Error, Result};
use common::FileKey;
use common::Timer;
use fnv::{FnvHashMap, FnvHashSet};
use graphql_ir::Sources;
use graphql_syntax::ExecutableDefinition;
use interner::StringKey;

/// Parses all source files for all projects into ASTs and builds up a Sources map that can
/// be used to print errors with source code listing.
/// Additionally collects the set of definition names that changed,given the compiler state
pub fn parse_sources<'state>(compiler_state: &'state CompilerState) -> Result<GraphQLAsts<'state>> {
    Timer::time("parse sources", || {
        GraphQLAsts::from_graphql_sources(&compiler_state.graphql_sources)
    })
}
#[derive(Debug)]
pub struct GraphQLAsts<'state> {
    grouped_asts: FnvHashMap<SourceSetName, Vec<ExecutableDefinition>>,
    grouped_changed_definition_names: FnvHashMap<SourceSetName, FnvHashSet<StringKey>>,
    graphql_source_strings: Sources<'state>,
}

impl<'state> GraphQLAsts<'state> {
    fn from_graphql_sources(graphql_sources: &'state GraphQLSources) -> Result<Self> {
        let mut grouped_asts = FnvHashMap::default();
        let mut graphql_source_strings: Sources<'state> = FnvHashMap::default();
        let mut grouped_changed_definition_names = FnvHashMap::default();

        let mut parsed_files = FnvHashSet::default();
        let mut syntax_errors = Vec::new();

        // Iterate over all processed sources and parse each graphql string.
        // If any of the processed sources also exist in the pending source set,
        // prefer the entry from the pending source set, which contains the
        // latest values for the graphql strings in the file.
        for (source_set_name, source_set) in graphql_sources.processed_sources() {
            let asts = grouped_asts
                .entry(*source_set_name)
                .or_insert_with(Vec::new);
            let changed_definition_names = grouped_changed_definition_names
                .entry(*source_set_name)
                .or_insert_with(FnvHashSet::default);
            let pending_source_set =
                graphql_sources.pending_sources_for_source_set(*source_set_name);

            for (file_name, file_state) in source_set.iter() {
                let mut definitions_for_file = Vec::new();

                // Check for graphql strings in the pending sources for
                // this file, and prefer those for parsing if they're
                // available
                let mut used_pending_sources = false;
                let graphql_strings = if let Some(pending_source_set) = pending_source_set {
                    if let Some(pending_file_state) = pending_source_set.get(file_name) {
                        used_pending_sources = true;
                        &pending_file_state.graphql_strings
                    } else {
                        &file_state.graphql_strings
                    }
                } else {
                    &file_state.graphql_strings
                };

                for (index, graphql_string) in graphql_strings.iter().enumerate() {
                    let file_key =
                        FileKey::new(&format!("{}:{}", file_name.to_string_lossy(), index));
                    match graphql_syntax::parse(&graphql_string, file_key) {
                        Ok(document) => {
                            definitions_for_file.extend(document.definitions);
                        }
                        Err(errors) => syntax_errors.extend(
                            errors
                                .into_iter()
                                .map(|error| error.with_source(graphql_string.into())),
                        ),
                    }
                    graphql_source_strings.insert(file_key, &graphql_string);
                }

                // If we used any pending sources for the current file, collect the
                // parsed definition names as part of the set of definition names
                // that have changed.
                if used_pending_sources {
                    for definition in &definitions_for_file {
                        let definition_name = match definition {
                            ExecutableDefinition::Operation(operation) => operation.name.clone(),
                            ExecutableDefinition::Fragment(fragment) => Some(fragment.name.clone()),
                        };
                        if let Some(definition_name) = definition_name {
                            changed_definition_names.insert(definition_name.value);
                        }
                    }
                }
                parsed_files.insert(file_name.to_owned());
                asts.extend(definitions_for_file);
            }
        }

        // Iterate over all pending sources, and parse any graphql strings that
        // weren't already parsed in the previous pass over the processed sources.
        // We do this in order to account for any pending sources that correspond
        // to new files, and which wouldn't be present the processed sources.
        for (source_set_name, source_set) in graphql_sources.pending_sources() {
            let asts = grouped_asts
                .entry(*source_set_name)
                .or_insert_with(Vec::new);

            for (file_name, file_state) in source_set.iter() {
                // Only parse the file if it isn't already been parsed.
                if !parsed_files.contains(file_name) {
                    let mut definitions_for_file = Vec::new();
                    for (index, graphql_string) in file_state.graphql_strings.iter().enumerate() {
                        let file_key =
                            FileKey::new(&format!("{}:{}", file_name.to_string_lossy(), index));
                        match graphql_syntax::parse(&graphql_string, file_key) {
                            Ok(document) => {
                                definitions_for_file.extend(document.definitions);
                            }
                            Err(errors) => syntax_errors.extend(
                                errors
                                    .into_iter()
                                    .map(|error| error.with_source(graphql_string.into())),
                            ),
                        }
                        graphql_source_strings.insert(file_key, &graphql_string);
                    }
                    asts.extend(definitions_for_file);
                }
            }
        }

        if syntax_errors.is_empty() {
            Ok(Self {
                grouped_asts,
                grouped_changed_definition_names,
                graphql_source_strings,
            })
        } else {
            Err(Error::SyntaxErrors {
                errors: syntax_errors,
            })
        }
    }

    pub fn sources(&self) -> &Sources<'state> {
        &self.graphql_source_strings
    }

    pub fn asts_for_source_set(&self, source_set_name: SourceSetName) -> Vec<ExecutableDefinition> {
        self.grouped_asts[&source_set_name].clone()
    }

    pub fn changed_names_for_source_set(
        &self,
        source_set_name: SourceSetName,
    ) -> FnvHashSet<StringKey> {
        self.grouped_changed_definition_names[&source_set_name].clone()
    }
}
