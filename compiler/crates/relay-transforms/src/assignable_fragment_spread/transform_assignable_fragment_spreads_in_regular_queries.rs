/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::Diagnostic;
use common::DiagnosticsResult;
use common::Location;
use common::NamedItem;
use common::WithLocation;
use graphql_ir::Condition;
use graphql_ir::FragmentDefinition;
use graphql_ir::FragmentSpread;
use graphql_ir::InlineFragment;
use graphql_ir::LinkedField;
use graphql_ir::OperationDefinition;
use graphql_ir::Program;
use graphql_ir::ScalarField;
use graphql_ir::Selection;
use graphql_ir::Transformed;
use graphql_ir::Transformer;
use intern::Lookup;
use intern::string_key::Intern;
use schema::Schema;

use super::ASSIGNABLE_DIRECTIVE;
use super::UPDATABLE_DIRECTIVE;
use super::ensure_discriminated_union_is_created;
use super::errors::ValidationMessage;
use crate::fragment_alias_directive::FRAGMENT_DANGEROUSLY_UNALIAS_DIRECTIVE_NAME;

pub fn transform_assignable_fragment_spreads_in_regular_queries(
    program: &Program,
) -> DiagnosticsResult<Program> {
    let mut transform = AssignableFragmentSpread {
        program,
        errors: Default::default(),
        path: vec![],
    };

    let next_program = transform
        .transform_program(program)
        .replace_or_else(|| program.clone());

    if transform.errors.is_empty() {
        Ok(next_program)
    } else {
        Err(transform.errors)
    }
}

struct AssignableFragmentSpread<'s> {
    program: &'s Program,
    errors: Vec<Diagnostic>,
    path: Vec<PathSegment>,
}

impl AssignableFragmentSpread<'_> {
    /// 1. Validate that the assignable fragment does not have @skip/@defer, and
    ///    is not within an inline fragment with directives, and is nested in a linked field
    /// 2. Mark the enclosing linked field as containing an assignable fragment spread.
    ///    This later results in an __id (clientid_field) selection being added to the linked
    ///    field.
    fn validate_nesting_and_mark_enclosing_linked_field(
        &mut self,
        fragment_spread: &FragmentSpread,
    ) {
        let mut directly_in_condition = None;
        let mut in_linked_field = false;
        let mut in_inline_fragment = false;

        for (index, item) in self.path.iter_mut().rev().enumerate() {
            match item {
                PathSegment::Condition(c) => {
                    // We can encounter a condition (before a linked field) in two ways:
                    // Directly on the assignable fragment spread: ... Assignable_foo @skip
                    // or
                    // As a directive on an inline fragment ... @skip { ...Assignable_foo }
                    if index == 0 {
                        directly_in_condition = Some(*c);
                    }
                }
                PathSegment::LinkedField {
                    valid_generated_flow_type,
                } => {
                    in_linked_field = true;
                    if in_inline_fragment {
                        *valid_generated_flow_type = ValidGeneratedFlowType::OnlyDiscriminatedUnion;
                    }
                    break;
                }
                PathSegment::InlineFragment => {
                    if in_inline_fragment {
                        self.errors.push(Diagnostic::error(
                            ValidationMessage::AssignableFragmentSpreadContainingInlineFragmentSingleNesting,
                            fragment_spread.fragment.location
                        ));
                    }
                    in_inline_fragment = true;
                }
            }
        }

        if let Some(condition_directive_name) = directly_in_condition {
            self.errors.push(Diagnostic::error(
                ValidationMessage::AssignableFragmentSpreadNoOtherDirectives {
                    disallowed_directive_name: condition_directive_name.intern(),
                },
                fragment_spread.fragment.location,
            ));
        }

        if !in_linked_field {
            self.errors.push(Diagnostic::error(
                ValidationMessage::AssignableNoTopLevelFragmentSpreads,
                fragment_spread.fragment.location,
            ));
        }
    }
}

#[derive(Debug)]
enum PathSegment {
    Condition(&'static str),
    LinkedField {
        valid_generated_flow_type: ValidGeneratedFlowType,
    },
    InlineFragment,
}

#[derive(Debug)]
enum ValidGeneratedFlowType {
    OnlyDiscriminatedUnion,
    Any,
}

impl Transformer<'_> for AssignableFragmentSpread<'_> {
    const NAME: &'static str = "AssignableFragmentTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_operation(
        &mut self,
        operation: &OperationDefinition,
    ) -> Transformed<OperationDefinition> {
        if operation.directives.named(*UPDATABLE_DIRECTIVE).is_some() {
            Transformed::Keep
        } else {
            self.default_transform_operation(operation)
        }
    }

    fn transform_fragment(
        &mut self,
        fragment_definition: &FragmentDefinition,
    ) -> Transformed<FragmentDefinition> {
        if fragment_definition
            .directives
            .named(*UPDATABLE_DIRECTIVE)
            .is_some()
        {
            Transformed::Keep
        } else {
            self.default_transform_fragment(fragment_definition)
        }
    }

    /// When we encountered a spread of an assignable fragment, we want to return
    /// some additional selections. However, we must return a Transformed<Selection>,
    /// i.e. at most a single selection from this function. So, instead, we return
    /// an inline fragment with no directives and no type condition to house our
    /// additional peer selections and the original fragment spread.
    ///
    /// Thus we return:
    /// - The original fragment spread.
    /// - A fragment spread marker:
    ///   - If the fragment spread's type is abstract, we want to return an additional
    ///     `... on FragmentType { __isFragmentName: __typename }`.
    ///   - If the fragment spread's type is concrete, we either want to return an additional
    ///     `__typename`.
    /// - An unconditional `__id` selection
    ///
    /// So, e.g. we might transform the fragment spread into:
    /// ```graphql
    /// ... {
    ///   ...Original_assignable_node
    ///   ... on Node { __isNode: __typename }
    ///   __id
    /// }
    /// ```
    fn transform_fragment_spread(
        &mut self,
        fragment_spread: &FragmentSpread,
    ) -> Transformed<Selection> {
        let fragment_definition = self
            .program
            .fragment(fragment_spread.fragment.item)
            .expect("Expected fragment to exist.");

        if fragment_definition
            .directives
            .named(*ASSIGNABLE_DIRECTIVE)
            .is_none()
        {
            return Transformed::Keep;
        }

        let dissallowed_directives = fragment_spread
            .directives
            .iter()
            .filter(|directive| directive.name.item != *FRAGMENT_DANGEROUSLY_UNALIAS_DIRECTIVE_NAME)
            .collect::<Vec<_>>();

        // Assignable fragments cannot have directives, but we error only on the first one
        if let Some(directive) = dissallowed_directives.first() {
            self.errors.push(Diagnostic::error(
                ValidationMessage::AssignableFragmentSpreadNoOtherDirectives {
                    disallowed_directive_name: directive.name.item.0,
                },
                directive.location,
            ));
        }

        self.validate_nesting_and_mark_enclosing_linked_field(fragment_spread);

        let clientid_selection = Selection::ScalarField(Arc::new(ScalarField {
            alias: None,
            definition: WithLocation::generated(self.program.schema.clientid_field()),
            arguments: vec![],
            directives: vec![],
        }));

        let fragment_spread_marker = if fragment_definition.type_condition.is_abstract_type() {
            Selection::InlineFragment(Arc::new(InlineFragment {
                type_condition: Some(fragment_definition.type_condition),
                directives: vec![],
                selections: vec![Selection::ScalarField(Arc::new(ScalarField {
                    alias: Some(WithLocation::generated(
                        format!("__is{}", fragment_spread.fragment.item.0.lookup()).intern(),
                    )),
                    definition: WithLocation::generated(self.program.schema.typename_field()),
                    arguments: vec![],
                    directives: vec![],
                }))],
                spread_location: Location::generated(),
            }))
        } else {
            Selection::ScalarField(Arc::new(ScalarField {
                alias: None,
                definition: WithLocation::generated(self.program.schema.typename_field()),
                arguments: vec![],
                directives: vec![],
            }))
        };

        Transformed::Replace(Selection::InlineFragment(Arc::new(InlineFragment {
            type_condition: None,
            directives: vec![],
            selections: vec![
                Selection::FragmentSpread(Arc::new(fragment_spread.clone())),
                fragment_spread_marker,
                clientid_selection,
            ],
            spread_location: Location::generated(),
        })))
    }

    fn transform_linked_field(&mut self, linked_field: &LinkedField) -> Transformed<Selection> {
        self.path.push(PathSegment::LinkedField {
            valid_generated_flow_type: ValidGeneratedFlowType::Any,
        });
        let response = self.default_transform_linked_field(linked_field);

        // If we encountered an assignable fragment in an inline fragment, the linked field
        // must result in a discriminated union being created
        let valid_generated_flow_type = if let PathSegment::LinkedField {
            valid_generated_flow_type,
        } = self.path.pop().expect("path should not be empty")
        {
            valid_generated_flow_type
        } else {
            panic!("Unexpected non-linked field");
        };
        if matches!(
            valid_generated_flow_type,
            ValidGeneratedFlowType::OnlyDiscriminatedUnion
        ) && let Err(e) = ensure_discriminated_union_is_created(
            &self.program.schema,
            linked_field,
            "an assignable fragment was spread in this linked field",
        ) {
            self.errors.extend(e);
        }

        response
    }

    fn transform_condition(&mut self, condition: &Condition) -> Transformed<Selection> {
        self.path
            .push(PathSegment::Condition(condition.directive_name()));
        let response = self.default_transform_condition(condition);
        self.path.pop().expect("path should not be empty");
        response
    }

    fn transform_inline_fragment(&mut self, fragment: &InlineFragment) -> Transformed<Selection> {
        self.path.push(PathSegment::InlineFragment);
        let response = self.default_transform_inline_fragment(fragment);
        self.path.pop().expect("path should not be empty");
        response
    }
}
