/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

mod node_query_generator;
mod query_query_generator;
mod utils;

use crate::root_variables::{InferVariablesVisitor, VariableMap};
use common::WithLocation;
use errors::validate_map;
use fnv::FnvHashMap;
use graphql_ir::{
    FragmentDefinition, NamedItem, OperationDefinition, Program, ValidationError,
    ValidationMessage, ValidationResult,
};
use graphql_text_printer::print_value;
use interner::StringKey;
use node_query_generator::NODE_QUERY_GENERATOR;
use query_query_generator::QUERY_QUERY_GENERATOR;
use schema::Schema;
use std::fmt::Write;
use std::sync::Arc;
use utils::*;

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
pub fn transform_refetchable_fragment<'schema>(
    program: &Program<'schema>,
) -> ValidationResult<Program<'schema>> {
    let mut next_program = Program::new(program.schema());

    let mut transformer = RefetchableFragment {
        program,
        visitor: InferVariablesVisitor::new(program),
        existing_refetch_operations: Default::default(),
    };

    for operation in program.operations() {
        next_program.insert_operation(Arc::clone(operation));
    }

    validate_map(program.fragments(), |fragment| {
        let operation_result = transformer.transform_refetch_fragment(fragment)?;
        if let Some(operation_result) = operation_result {
            next_program.insert_fragment(operation_result.fragment);
            next_program.insert_operation(operation_result.operation);
        } else {
            next_program.insert_fragment(Arc::clone(fragment));
        }
        Ok(())
    })?;

    Ok(next_program)
}

type ExistingRefetchOperations = FnvHashMap<StringKey, WithLocation<StringKey>>;

struct RefetchableFragment<'schema> {
    program: &'schema Program<'schema>,
    visitor: InferVariablesVisitor<'schema>,
    existing_refetch_operations: ExistingRefetchOperations,
}

// Constant query generators
impl<'schema> RefetchableFragment<'schema> {
    fn transform_refetch_fragment(
        &mut self,
        fragment: &Arc<FragmentDefinition>,
    ) -> ValidationResult<Option<RefetchRoot>> {
        let refetch_name = self.get_refetch_query_name(fragment)?;
        if let Some(refetch_name) = refetch_name {
            let variables_map = self.visitor.infer_fragment_variables(fragment);
            for generator in GENERATORS.iter() {
                if let Some(refetch_root) = (generator.build_refetch_operation)(
                    self.program.schema(),
                    fragment,
                    refetch_name,
                    &variables_map,
                )? {
                    return Ok(Some(self.attach_metadata(refetch_root)?));
                }
            }
            let mut descriptions = String::new();
            for generator in GENERATORS.iter() {
                writeln!(descriptions, " - {}", generator.description).unwrap();
            }
            descriptions.pop();
            Err(vec![ValidationError::new(
                ValidationMessage::UnsupportedRefetchableFragment {
                    fragment_name: fragment.name.item,
                    descriptions,
                },
                vec![fragment.name.location],
            )])
        } else {
            Ok(None)
        }
    }

    fn get_refetch_query_name(
        &mut self,
        fragment: &FragmentDefinition,
    ) -> ValidationResult<Option<StringKey>> {
        if let Some(directive) = fragment.directives.named(CONSTANTS.refetchable_name) {
            if let Some(query_name_arg) = directive.arguments.named(CONSTANTS.query_name_arg) {
                if let Some(query_name) = query_name_arg.value.item.get_string_literal() {
                    if let Some(previous_fragment) = self
                        .existing_refetch_operations
                        .insert(query_name, fragment.name)
                    {
                        Err(vec![ValidationError::new(
                            ValidationMessage::DuplicateRefetchableOperation {
                                query_name,
                                fragment_name: fragment.name.item,
                                previous_fragment_name: previous_fragment.item,
                            },
                            vec![fragment.name.location, previous_fragment.location],
                        )])
                    } else {
                        Ok(Some(query_name))
                    }
                } else {
                    Err(vec![ValidationError::new(
                        ValidationMessage::ExpectQueryNameToBeString {
                            query_name_value: print_value(
                                self.program.schema(),
                                &query_name_arg.value.item,
                            ),
                        },
                        vec![query_name_arg.name.location],
                    )])
                }
            } else {
                Err(vec![ValidationError::new(
                    ValidationMessage::QueryNameRequired,
                    vec![directive.name.location],
                )])
            }
        } else {
            Ok(None)
        }
    }

    fn attach_metadata(&self, refetch_root: RefetchRoot) -> ValidationResult<RefetchRoot> {
        // TODO: Extract and validate connection metadata
        // TODO: Add metadata as directives for codegen
        Ok(refetch_root)
    }
}

type BuildRefetchOperationFn = fn(
    schema: &Schema,
    fragment: &Arc<FragmentDefinition>,
    query_name: StringKey,
    variables_map: &VariableMap,
) -> ValidationResult<Option<RefetchRoot>>;
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

const GENERATORS: [QueryGenerator; 2] = [QUERY_QUERY_GENERATOR, NODE_QUERY_GENERATOR];

#[allow(dead_code)]
pub struct RefetchRoot {
    identifier_field: Option<StringKey>,
    path: Vec<StringKey>,
    operation: Arc<OperationDefinition>,
    fragment: Arc<FragmentDefinition>,
}
