/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

mod fetchable_query_generator;
mod node_query_generator;
mod query_query_generator;
mod refetchable_directive;
mod utils;
mod viewer_query_generator;

use crate::{
    connections::{extract_connection_metadata_from_directive, ConnectionConstants},
    relay_directive::{PLURAL_ARG_NAME, RELAY_DIRECTIVE_NAME},
    root_variables::{InferVariablesVisitor, VariableMap},
};

use common::{Diagnostic, DiagnosticsResult, NamedItem, WithLocation};
use errors::validate_map;
use fetchable_query_generator::FETCHABLE_QUERY_GENERATOR;
use fnv::{FnvHashMap, FnvHashSet};
use graphql_ir::{
    Directive, FragmentDefinition, OperationDefinition, Program, Selection, ValidationMessage,
    VariableDefinition,
};
use graphql_syntax::OperationKind;
use intern::string_key::StringKey;
use node_query_generator::NODE_QUERY_GENERATOR;
use query_query_generator::QUERY_QUERY_GENERATOR;
use schema::{SDLSchema, Schema};
use std::{fmt::Write, sync::Arc};
use utils::*;
pub use utils::{RefetchableDerivedFromMetadata, RefetchableMetadata, CONSTANTS};
use viewer_query_generator::VIEWER_QUERY_GENERATOR;

use self::refetchable_directive::RefetchableDirective;
pub use self::refetchable_directive::REFETCHABLE_NAME;

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
    let query_type = program.schema.query_type().unwrap();

    let mut transformer = RefetchableFragment::new(program, for_typegen);

    for operation in program.operations() {
        next_program.insert_operation(Arc::clone(operation));
    }

    validate_map(program.fragments(), |fragment| {
        let operation_result = transformer.transform_refetch_fragment(fragment)?;
        if let Some((refetchable_directive, operation_result)) = operation_result {
            next_program.insert_fragment(operation_result.fragment);
            if !base_fragment_names.contains(&fragment.name.item) {
                let mut directives = refetchable_directive.directives;
                directives.push(RefetchableDerivedFromMetadata(fragment.name.item).into());

                next_program.insert_operation(Arc::new(OperationDefinition {
                    kind: OperationKind::Query,
                    name: WithLocation::new(
                        fragment.name.location,
                        refetchable_directive.query_name.item,
                    ),
                    type_: query_type,
                    variable_definitions: operation_result.variable_definitions,
                    directives,
                    selections: operation_result.selections,
                }));
            }
        } else {
            next_program.insert_fragment(Arc::clone(fragment));
        }
        Ok(())
    })?;

    Ok(next_program)
}

type ExistingRefetchOperations = FnvHashMap<StringKey, WithLocation<StringKey>>;

pub struct RefetchableFragment<'program> {
    connection_constants: ConnectionConstants,
    existing_refetch_operations: ExistingRefetchOperations,
    for_typegen: bool,
    program: &'program Program,
    visitor: InferVariablesVisitor<'program>,
}

impl<'program> RefetchableFragment<'program> {
    pub fn new(program: &'program Program, for_typegen: bool) -> Self {
        RefetchableFragment {
            connection_constants: Default::default(),
            existing_refetch_operations: Default::default(),
            for_typegen,
            program,
            visitor: InferVariablesVisitor::new(program),
        }
    }

    fn transform_refetch_fragment(
        &mut self,
        fragment: &Arc<FragmentDefinition>,
    ) -> DiagnosticsResult<Option<(RefetchableDirective, RefetchRoot)>> {
        fragment
            .directives
            .named(*REFETCHABLE_NAME)
            .map(|refetchable_directive| {
                self.transform_refetch_fragment_with_refetchable_directive(
                    fragment,
                    refetchable_directive,
                )
            })
            .transpose()
    }

    pub fn transform_refetch_fragment_with_refetchable_directive(
        &mut self,
        fragment: &Arc<FragmentDefinition>,
        directive: &Directive,
    ) -> DiagnosticsResult<(RefetchableDirective, RefetchRoot)> {
        let refetchable_directive =
            RefetchableDirective::from_directive(&self.program.schema, directive)?;
        self.validate_sibling_directives(fragment)?;
        self.validate_refetch_name(fragment, &refetchable_directive)?;

        let variables_map = self.visitor.infer_fragment_variables(fragment);
        for generator in GENERATORS.iter() {
            if let Some(refetch_root) = (generator.build_refetch_operation)(
                &self.program.schema,
                fragment,
                refetchable_directive.query_name.item,
                &variables_map,
            )? {
                if !self.for_typegen {
                    self.validate_connection_metadata(refetch_root.fragment.as_ref())?;
                }
                return Ok((refetchable_directive, refetch_root));
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
    }

    fn validate_sibling_directives(
        &mut self,
        fragment: &FragmentDefinition,
    ) -> DiagnosticsResult<()> {
        let relay_directive = fragment.directives.named(*RELAY_DIRECTIVE_NAME);
        let plural_directive = relay_directive
            .filter(|directive| directive.arguments.named(*PLURAL_ARG_NAME).is_some());
        if let Some(directive) = plural_directive {
            Err(vec![Diagnostic::error(
                ValidationMessage::InvalidRefetchableFragmentWithRelayPlural {
                    fragment_name: fragment.name.item,
                },
                directive.name.location,
            )])
        } else {
            Ok(())
        }
    }

    fn validate_refetch_name(
        &mut self,
        fragment: &FragmentDefinition,
        refetchable_directive: &RefetchableDirective,
    ) -> DiagnosticsResult<()> {
        // check for conflict with other @refetchable names
        if let Some(previous_fragment) = self
            .existing_refetch_operations
            .insert(refetchable_directive.query_name.item, fragment.name)
        {
            let (first_fragment, second_fragment) = if fragment.name.item > previous_fragment.item {
                (previous_fragment, fragment.name)
            } else {
                (fragment.name, previous_fragment)
            };
            return Err(vec![
                Diagnostic::error(
                    ValidationMessage::DuplicateRefetchableOperation {
                        query_name: refetchable_directive.query_name.item,
                        first_fragment_name: first_fragment.item,
                        second_fragment_name: second_fragment.item,
                    },
                    first_fragment.location,
                )
                .annotate("also defined here", second_fragment.location),
            ]);
        }

        // check for conflict with operations
        if let Some(existing_query) = self
            .program
            .operation(refetchable_directive.query_name.item)
        {
            return Err(vec![
                Diagnostic::error(
                    ValidationMessage::RefetchableQueryConflictWithQuery {
                        query_name: refetchable_directive.query_name.item,
                    },
                    refetchable_directive.query_name.location,
                )
                .annotate(
                    "an operation with that name is already defined here",
                    existing_query.name.location,
                ),
            ]);
        }

        Ok(())
    }

    /// Validate that any @connection usage is valid for refetching:
    /// - Variables are used for both the "count" and "cursor" arguments
    ///   (after/first or before/last)
    /// - Exactly one connection
    /// - Has a stable path to the connection data
    ///
    /// Connection metadata is extracted in `transform_connection`
    fn validate_connection_metadata(&self, fragment: &FragmentDefinition) -> DiagnosticsResult<()> {
        if let Some(metadatas) = extract_connection_metadata_from_directive(&fragment.directives) {
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
    schema: &SDLSchema,
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

pub struct RefetchRoot {
    pub fragment: Arc<FragmentDefinition>,
    pub selections: Vec<Selection>,
    pub variable_definitions: Vec<VariableDefinition>,
}
