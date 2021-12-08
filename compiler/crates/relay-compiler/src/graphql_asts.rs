/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::compiler_state::{GraphQLSources, SourceSetName};
use crate::errors::{Error, Result};
use common::{Diagnostic, SourceLocationKey};
use fnv::{FnvHashMap, FnvHashSet};
use graphql_syntax::ExecutableDefinition;
use intern::string_key::StringKey;

#[derive(Debug)]
pub struct GraphQLAsts {
    pub asts: Vec<ExecutableDefinition>,
    /// Names of fragments and operations that are updated or created
    pub pending_definition_names: FnvHashSet<StringKey>,
    /// Names of fragments and operations that are deleted
    pub removed_definition_names: Vec<StringKey>,
}

impl GraphQLAsts {
    pub fn from_graphql_sources_map(
        graphql_sources_map: &FnvHashMap<SourceSetName, GraphQLSources>,
        dirty_definitions_map: &FnvHashMap<SourceSetName, Vec<StringKey>>,
    ) -> Result<FnvHashMap<SourceSetName, GraphQLAsts>> {
        graphql_sources_map
            .iter()
            .map(|(&source_set_name, sources)| {
                let asts = GraphQLAsts::from_graphql_sources(
                    sources,
                    dirty_definitions_map.get(&source_set_name),
                )?;
                Ok((source_set_name, asts))
            })
            .collect::<Result<_>>()
    }

    /// Parses all source files for all projects into ASTs and builds up a Sources map that can
    /// be used to print errors with source code listing.
    /// Additionally collects the set of definition names that updated, given the compiler state
    pub fn from_graphql_sources(
        graphql_sources: &GraphQLSources,
        dirty_definitions: Option<&Vec<StringKey>>,
    ) -> Result<Self> {
        let mut syntax_errors = Vec::new();

        let mut asts = Vec::new();
        let mut pending_definition_names = FnvHashSet::default();
        let mut removed_definition_names = Vec::new();

        if let Some(dirty_definitions) = dirty_definitions {
            pending_definition_names.extend(dirty_definitions);
        }

        // Iterate over all pending sources, and parse each graphql string.
        // Prefer the entry from the pending source set, which contains the
        // latest values for the graphql strings in the file.
        for (file_name, pending_graphql_sources) in graphql_sources.pending.iter() {
            let mut definitions_for_file = Vec::new();
            for (index, graphql_source) in pending_graphql_sources.iter().enumerate() {
                let source_location =
                    SourceLocationKey::embedded(&file_name.to_string_lossy(), index);
                match graphql_syntax::parse_executable(&graphql_source.text, source_location) {
                    Ok(document) => {
                        for def in &document.definitions {
                            if let Some(name) = def.name() {
                                pending_definition_names.insert(name);
                            } else {
                                syntax_errors.push(Diagnostic::error(
                                    "Expected operation to have a name (e.g. 'query <Name>')",
                                    def.location(),
                                ))
                            }
                        }
                        definitions_for_file.extend(document.definitions);
                    }
                    Err(errors) => syntax_errors.extend(errors),
                }
            }
            // Parse the processed source to get all processed definition names
            // and collect definition names that are removed from that file.
            // (A definition moved to another file is considered as a deletion and a new source)
            if let Some(processed_graphql_sources) = graphql_sources.processed.get(file_name) {
                for (index, graphql_source) in processed_graphql_sources.iter().enumerate() {
                    // TODO: parse name instead of the whole graphql text
                    let source_location =
                        SourceLocationKey::embedded(&file_name.to_string_lossy(), index);
                    if let Ok(document) =
                        graphql_syntax::parse_executable(&graphql_source.text, source_location)
                    {
                        for def in document.definitions {
                            let name = def.name();
                            if let Some(def_name) = name {
                                if !definitions_for_file.iter().any(|def| def.name() == name) {
                                    removed_definition_names.push(def_name);
                                }
                            }
                        }
                    }
                }
            }
            asts.extend(definitions_for_file);
        }

        // Iterate over processed sources that aren't in the pending source set,
        // and parse each graphql string.
        for (file_name, processed_graphql_sources) in &graphql_sources.processed {
            // Only parse the file if it isn't in the pending sources
            if graphql_sources.pending.contains_key(file_name) {
                continue;
            }

            let mut definitions_for_file = Vec::new();
            for (index, graphql_source) in processed_graphql_sources.iter().enumerate() {
                let source_location =
                    SourceLocationKey::embedded(&file_name.to_string_lossy(), index);
                match graphql_syntax::parse_executable(&graphql_source.text, source_location) {
                    Ok(document) => {
                        definitions_for_file.extend(document.definitions);
                    }
                    Err(errors) => syntax_errors.extend(errors),
                }
            }
            asts.extend(definitions_for_file);
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
