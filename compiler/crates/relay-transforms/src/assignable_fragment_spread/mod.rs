/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::{Diagnostic, DiagnosticsResult, Location, NamedItem, WithLocation};
use graphql_ir::{
    Condition, FragmentSpread, InlineFragment, LinkedField, OperationDefinition, Program,
    ScalarField, Selection, Transformed, Transformer, ValidationMessage,
};
use intern::string_key::{Intern, StringKey};
use lazy_static::lazy_static;
use schema::{FieldID, Schema};
use std::sync::Arc;

lazy_static! {
    static ref ASSIGNABLE_DIRECTIVE: StringKey = "assignable".intern();
    static ref UPDATABLE_DIRECTIVE: StringKey = "updatable".intern();
}

pub fn transform_assignable_fragment_spreads(program: &Program) -> DiagnosticsResult<Program> {
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

impl<'s> AssignableFragmentSpread<'s> {
    /// 1. Validate that the assignable fragment does not have @skip/@defer, and
    /// is not within an inline fragment with directives, and is nested in a linked field
    /// 2. Mark the enclosing linked field as containing an assignable fragment spread.
    /// This later results in an __id (clientid_field) selection being added to the linked
    /// field.
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
                    encountered_assignable_fragment_spread,
                } => {
                    in_linked_field = true;
                    *encountered_assignable_fragment_spread = true;
                    break;
                }
                PathSegment::InlineFragment => {
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
        if in_inline_fragment {
            self.errors.push(Diagnostic::error(
                ValidationMessage::AssignableFragmentSpreadNotWithinInlineFragment,
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
        encountered_assignable_fragment_spread: bool,
    },
    InlineFragment,
}

impl<'s> Transformer for AssignableFragmentSpread<'s> {
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

    fn transform_fragment_spread(
        &mut self,
        fragment_spread: &FragmentSpread,
    ) -> Transformed<Selection> {
        // When we encounter a spread of an assignable fragment, we
        // return the current fragment spread and a peer inline fragment of the form
        // ... on FragmentType { __isFragmentName: __typename }
        // However, because we are returning Transformed<Selection>, i.e. a single selection, we
        // instead return
        // ... on FragmentType { ...ExistingFragmentSpread, __isFragmentName }
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

        self.validate_nesting_and_mark_enclosing_linked_field(fragment_spread);

        // Assignable fragments cannot have directives, but we error only on the first one
        if let Some(directive) = fragment_spread.directives.first() {
            self.errors.push(Diagnostic::error(
                ValidationMessage::AssignableFragmentSpreadNoOtherDirectives {
                    disallowed_directive_name: directive.name.item,
                },
                directive.name.location,
            ));
        }

        if fragment_definition.type_condition.is_abstract_type() {
            let new_inline_fragment = Selection::InlineFragment(Arc::new(InlineFragment {
                type_condition: Some(fragment_definition.type_condition),
                directives: vec![],
                selections: vec![
                    Selection::FragmentSpread(Arc::new(fragment_spread.clone())),
                    // This is the "abstract fragment spread marker"
                    Selection::ScalarField(Arc::new(ScalarField {
                        alias: Some(WithLocation {
                            location: Location::generated(),
                            item: format!("__is{}", fragment_spread.fragment.item.lookup())
                                .intern(),
                        }),
                        definition: WithLocation {
                            location: Location::generated(),
                            item: self.program.schema.typename_field(),
                        },
                        arguments: vec![],
                        directives: vec![],
                    })),
                ],
            }));
            Transformed::Replace(new_inline_fragment)
        } else {
            Transformed::Keep
        }
    }

    fn transform_linked_field(&mut self, linked_field: &LinkedField) -> Transformed<Selection> {
        self.path.push(PathSegment::LinkedField {
            encountered_assignable_fragment_spread: false,
        });
        let response = self.default_transform_linked_field(linked_field);
        let encountered_assignable_fragment_spread = if let PathSegment::LinkedField {
            encountered_assignable_fragment_spread,
        } =
            self.path.pop().expect("path should be empty")
        {
            encountered_assignable_fragment_spread
        } else {
            panic!("Unexpected non-linked field");
        };

        match response {
            Transformed::Delete => panic!("Unexpected Transformed::Delete"),
            Transformed::Keep => {
                if encountered_assignable_fragment_spread {
                    get_transformed_linked_field(linked_field, self.program.schema.clientid_field())
                } else {
                    Transformed::Keep
                }
            }
            Transformed::Replace(selection) => {
                if encountered_assignable_fragment_spread {
                    let linked_field = match selection {
                        Selection::LinkedField(l) => l,
                        _ => panic!("Unexpected non-linked field"),
                    };
                    get_transformed_linked_field(
                        &linked_field,
                        self.program.schema.clientid_field(),
                    )
                } else {
                    Transformed::Replace(selection)
                }
            }
        }
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

fn get_transformed_linked_field(
    linked_field: &LinkedField,
    additional_field: FieldID,
) -> Transformed<Selection> {
    let mut selections = linked_field.selections.clone();
    selections.push(Selection::ScalarField(Arc::new(ScalarField {
        alias: None,
        definition: WithLocation {
            location: Location::generated(),
            item: additional_field,
        },
        arguments: vec![],
        directives: vec![],
    })));
    Transformed::Replace(Selection::LinkedField(Arc::new(LinkedField {
        selections,
        directives: linked_field.directives.clone(),
        alias: linked_field.alias,
        definition: linked_field.definition,
        arguments: linked_field.arguments.clone(),
    })))
}
