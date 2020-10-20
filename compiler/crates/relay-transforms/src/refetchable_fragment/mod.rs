/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

mod fetchable_query_generator;
mod node_query_generator;
mod query_query_generator;
mod utils;
mod viewer_query_generator;

use crate::connections::{extract_connection_metadata_from_directive, ConnectionConstants};
use crate::root_variables::{InferVariablesVisitor, VariableMap};

use common::{Diagnostic, DiagnosticsResult, NamedItem, WithLocation};
use errors::validate_map;
use fetchable_query_generator::FETCHABLE_QUERY_GENERATOR;
use fnv::{FnvHashMap, FnvHashSet};
use graphql_ir::{FragmentDefinition, OperationDefinition, Program, ValidationMessage};
use graphql_text_printer::print_value;
use interner::StringKey;
use node_query_generator::NODE_QUERY_GENERATOR;
use query_query_generator::QUERY_QUERY_GENERATOR;
use schema::Schema;
use std::fmt::Write;
use std::sync::Arc;
use utils::*;
pub use utils::{
    extract_refetch_metadata_from_directive, RefetchableDerivedFromMetadata, CONSTANTS,
};
use viewer_query_generator::VIEWER_QUERY_GENERATOR;

/// This transform synthesizes "refetch" queries for fragments that
/// are trivially refetchable. This is comprised of three main stages:
///
/// 1. Validating that fragments marked with @refetchable qualify for
///    refetch query generation; mainly this means that the fragment
///    type is able to be refetched in some canonical way.
/// 2. Determining the variable definitions to use for each generated
///    query. GraphQL does not have a notion of fragment-local variables
///    at all, and although Relay adds this concept developers are still
///    allowed to reference global variables. This necessitates a
///    visiting all reachable fragments for each @refetchable fragment,
///    and finding the union of all global variables expceted to be defined.
/// 3. Building the refetch queries, a straightforward copying transform from
///    Fragment to Root IR nodes.
pub fn transform_refetchable_fragment(
    program: &Program,
    base_fragment_names: &'_ FnvHashSet<StringKey>,
    for_typegen: bool,
) -> DiagnosticsResult<Program> {
    let mut next_program = Program::new(Arc::clone(&program.schema));

    let mut transformer = RefetchableFragment {
        connection_constants: Default::default(),
        existing_refetch_operations: Default::default(),
        for_typegen,
        program,
        visitor: InferVariablesVisitor::new(program),
    };

    for operation in program.operations() {
        next_program.insert_operation(Arc::clone(operation));
    }

    validate_map(program.fragments(), |fragment| {
        let operation_result = transformer.transform_refetch_fragment(fragment)?;
        if let Some(operation_result) = operation_result {
            next_program.insert_fragment(operation_result.fragment);
            if !base_fragment_names.contains(&fragment.name.item) {
                next_program.insert_operation(operation_result.operation);
            }
        } else {
            next_program.insert_fragment(Arc::clone(fragment));
        }
        Ok(())
    })?;

    Ok(next_program)
}

type ExistingRefetchOperations = FnvHashMap<StringKey, WithLocation<StringKey>>;

struct RefetchableFragment<'program> {
    connection_constants: ConnectionConstants,
    existing_refetch_operations: ExistingRefetchOperations,
    for_typegen: bool,
    program: &'program Program,
    visitor: InferVariablesVisitor<'program>,
}

impl RefetchableFragment<'_> {
    fn transform_refetch_fragment(
        &mut self,
        fragment: &Arc<FragmentDefinition>,
    ) -> DiagnosticsResult<Option<RefetchRoot>> {
        let refetch_name = self.get_refetch_query_name(fragment)?;
        if let Some(refetch_name) = refetch_name {
            let variables_map = self.visitor.infer_fragment_variables(fragment);
            for generator in GENERATORS.iter() {
                if let Some(refetch_root) = (generator.build_refetch_operation)(
                    &self.program.schema,
                    fragment,
                    refetch_name,
                    &variables_map,
                )? {
                    if !self.for_typegen {
                        self.validate_connection_metadata(refetch_root.fragment.as_ref())?;
                    }
                    return Ok(Some(refetch_root));
                }
            }
            let mut descriptions = String::new();
            for generator in GENERATORS.iter() {
                writeln!(descriptions, " - {}", generator.description).unwrap();
            }
            descriptions.pop();
            Err(vec![Diagnostic::error(
                ValidationMessage::UnsupportedRefetchableFragment {
                    fragment_name: fragment.name.item,
                    descriptions,
                },
                fragment.name.location,
            )])
        } else {
            Ok(None)
        }
    }

    fn get_refetch_query_name(
        &mut self,
        fragment: &FragmentDefinition,
    ) -> DiagnosticsResult<Option<StringKey>> {
        if let Some(directive) = fragment.directives.named(CONSTANTS.refetchable_name) {
            if let Some(query_name_arg) = directive.arguments.named(CONSTANTS.query_name_arg) {
                if let Some(query_name) = query_name_arg.value.item.get_string_literal() {
                    if let Some(previous_fragment) = self
                        .existing_refetch_operations
                        .insert(query_name, fragment.name)
                    {
                        Err(vec![
                            Diagnostic::error(
                                ValidationMessage::DuplicateRefetchableOperation {
                                    query_name,
                                    fragment_name: fragment.name.item,
                                    previous_fragment_name: previous_fragment.item,
                                },
                                fragment.name.location,
                            )
                            .annotate("previously defined here", previous_fragment.location),
                        ])
                    } else {
                        Ok(Some(query_name))
                    }
                } else {
                    Err(vec![Diagnostic::error(
                        ValidationMessage::ExpectQueryNameToBeString {
                            query_name_value: print_value(
                                &self.program.schema,
                                &query_name_arg.value.item,
                            ),
                        },
                        query_name_arg.name.location,
                    )])
                }
            } else {
                Err(vec![Diagnostic::error(
                    ValidationMessage::QueryNameRequired,
                    directive.name.location,
                )])
            }
        } else {
            Ok(None)
        }
    }

    /// Validate that any @connection usage is valid for refetching:
    /// - Variables are used for both the "count" and "cursor" arguments
    ///   (after/first or before/last)
    /// - Exactly one connection
    /// - Has a stable path to the connection data
    ///
    /// Connection metadata is extracted in `transform_connection`
    fn validate_connection_metadata(&self, fragment: &FragmentDefinition) -> DiagnosticsResult<()> {
        if let Some(metadatas) = extract_connection_metadata_from_directive(
            &fragment.directives,
            self.connection_constants,
        ) {
            // TODO: path or connection field locations in the error messages
            if metadatas.len() > 1 {
                return Err(vec![Diagnostic::error(
                    ValidationMessage::RefetchableWithMultipleConnections {
                        fragment_name: fragment.name.item,
                    },
                    fragment.name.location,
                )]);
            } else if metadatas.len() == 1 {
                let metadata = &metadatas[0];
                if metadata.path.is_none() {
                    return Err(vec![Diagnostic::error(
                        ValidationMessage::RefetchableWithConnectionInPlural {
                            fragment_name: fragment.name.item,
                        },
                        fragment.name.location,
                    )]);
                }
                if (metadata.after.is_none() || metadata.first.is_none())
                    && metadata.direction != self.connection_constants.direction_backward
                {
                    return Err(vec![Diagnostic::error(
                        ValidationMessage::RefetchableWithConstConnectionArguments {
                            fragment_name: fragment.name.item,
                            arguments: "after and first",
                        },
                        fragment.name.location,
                    )]);
                } else if (metadata.before.is_none() || metadata.last.is_none())
                    && metadata.direction != self.connection_constants.direction_forward
                {
                    return Err(vec![Diagnostic::error(
                        ValidationMessage::RefetchableWithConstConnectionArguments {
                            fragment_name: fragment.name.item,
                            arguments: "before and last",
                        },
                        fragment.name.location,
                    )]);
                }
            }
        }
        Ok(())
    }
}

type BuildRefetchOperationFn = fn(
    schema: &Schema,
    fragment: &Arc<FragmentDefinition>,
    query_name: StringKey,
    variables_map: &VariableMap,
) -> DiagnosticsResult<Option<RefetchRoot>>;
/// A strategy to generate queries for a given fragment. Multiple stategies
/// can be tried, such as generating a `node(id: ID)` query or a query directly
/// on the root query type.
pub struct QueryGenerator {
    /// Used to describe what fragments this QueryGenerator applies to, used in
    /// error messages.
    pub description: &'static str,

    /// Returns RefetchRoot or null if not applicable. Might throw a user error
    /// for an invalid schema or other problems.
    pub build_refetch_operation: BuildRefetchOperationFn,
}

const GENERATORS: [QueryGenerator; 4] = [
    VIEWER_QUERY_GENERATOR,
    QUERY_QUERY_GENERATOR,
    NODE_QUERY_GENERATOR,
    FETCHABLE_QUERY_GENERATOR,
];

#[allow(dead_code)]
pub struct RefetchRoot {
    operation: Arc<OperationDefinition>,
    fragment: Arc<FragmentDefinition>,
}
