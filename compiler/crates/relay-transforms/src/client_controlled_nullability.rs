/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use crate::{
    required_directive::{
        ACTION_ARGUMENT, LOG_ACTION, NONE_ACTION, REQUIRED_DIRECTIVE_NAME, THROW_ACTION,
    },
    ValidationMessage,
};
use common::{Diagnostic, DiagnosticsResult, Location, NamedItem, WithLocation};
use graphql_ir::{
    reexport::{Intern, StringKey},
    Directive, FragmentDefinition, LinkedField, Program, ScalarField, Selection, Transformed,
    Transformer,
};

use lazy_static::lazy_static;

lazy_static! {
    pub static ref ASSERT_DIRECTIVE_NAME: StringKey = "assert".intern(); // Stand in for !
    pub static ref CATCH_DIRECTIVE_NAME: StringKey = "catch".intern(); // Stand in for ?
}

pub fn client_controlled_nullability(program: &Program) -> DiagnosticsResult<Program> {
    let mut transform = ClientControlledNullabilityTransform::new(program);

    let next_program = transform
        .transform_program(program)
        .replace_or_else(|| program.clone());

    if transform.errors.is_empty() {
        Ok(next_program)
    } else {
        Err(transform.errors)
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum State {
    Bubbling,
    Throwing,
}

enum Annotation {
    Catch,
    Assert,
}

fn state_to_annotation(
    maybe_state: Option<WithLocation<State>>,
    catching: bool,
) -> Option<Annotation> {
    if catching {
        Some(Annotation::Catch)
    } else {
        maybe_state.map(|_state| Annotation::Assert)
    }
}

struct ClientControlledNullabilityTransform<'s> {
    _program: &'s Program,
    errors: Vec<Diagnostic>,
    state: Option<WithLocation<State>>,
}

impl<'program> ClientControlledNullabilityTransform<'program> {
    fn new(program: &'program Program) -> Self {
        Self {
            _program: program,
            errors: Default::default(),
            state: None,
        }
    }

    fn handle_required(&mut self, directives: &[Directive]) -> Option<WithLocation<State>> {
        if let Some(required_directive) = directives.named(*REQUIRED_DIRECTIVE_NAME) {
            let arg_value = &required_directive
                .arguments
                .named(*ACTION_ARGUMENT)
                .unwrap()
                .value;

            let action = arg_value.item.expect_constant().unwrap_enum();

            if action == *NONE_ACTION || action == *LOG_ACTION {
                Some(WithLocation::new(arg_value.location, State::Bubbling))
            } else if action == *THROW_ACTION {
                Some(WithLocation::new(arg_value.location, State::Throwing))
            } else {
                None
            }
        } else {
            None
        }
    }

    fn handle_state_transition(&mut self, new_state: WithLocation<State>) {
        if let Some(state) = self.state {
            if state.item == new_state.item {
                return;
            } else {
                self.errors.push(
                    Diagnostic::error(
                        ValidationMessage::ClientControlledNullabilityIncompatible,
                        new_state.location,
                    )
                    .annotate("previous state", state.location),
                );
            }
        }
        self.state = Some(new_state);
    }

    fn replace_required(
        &self,
        directives: &[Directive],
        annotation: Option<Annotation>,
    ) -> Transformed<Vec<Directive>> {
        let mut new_directives = directives
            .iter()
            .filter(|directive| directive.name.item != *REQUIRED_DIRECTIVE_NAME)
            .cloned()
            .collect::<Vec<_>>();

        let mut changed = new_directives.len() == directives.len();

        if let Some(annotation) = annotation {
            let directive_name = match annotation {
                Annotation::Catch => *CATCH_DIRECTIVE_NAME,
                Annotation::Assert => *ASSERT_DIRECTIVE_NAME,
            };
            let new_directive = Directive {
                name: WithLocation::new(Location::generated(), directive_name),
                arguments: Default::default(),
                data: None,
            };
            new_directives.push(new_directive);
            changed = true
        };

        if changed {
            Transformed::Replace(new_directives)
        } else {
            Transformed::Keep
        }
    }
}

impl<'s> Transformer for ClientControlledNullabilityTransform<'s> {
    const NAME: &'static str = "ClientControlledNullabilityTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_fragment(
        &mut self,
        fragment: &FragmentDefinition,
    ) -> Transformed<FragmentDefinition> {
        let transformed_selections = self.transform_selections(&fragment.selections);
        let children_state = self.state;
        let fragment_state = self.handle_required(&fragment.directives);

        let catching = if let Some(own_state) = fragment_state {
            self.handle_state_transition(own_state);
            false
        } else if let Some(WithLocation {
            item: State::Bubbling,
            ..
        }) = children_state
        {
            // If we were bubbling, but this field has no required directives, then we're implicitly catching here.
            self.state = None;
            true
        } else {
            false
        };

        let new_directives = self.replace_required(
            &fragment.directives,
            state_to_annotation(fragment_state, catching),
        );

        if new_directives.should_keep() && transformed_selections.should_keep() {
            return Transformed::Keep;
        }
        Transformed::Replace(FragmentDefinition {
            directives: new_directives.unwrap_or_else(|| fragment.directives.clone()),
            selections: transformed_selections.replace_or_else(|| fragment.selections.clone()),
            ..fragment.clone()
        })
    }

    fn transform_scalar_field(&mut self, field: &ScalarField) -> Transformed<Selection> {
        let field_state = self.handle_required(&field.directives);
        if let Some(field_state) = field_state {
            self.handle_state_transition(field_state);
        }
        self.replace_required(&field.directives, state_to_annotation(field_state, false))
            .map(|directives| {
                Selection::ScalarField(Arc::new(ScalarField {
                    directives,
                    ..field.clone()
                }))
            })
    }

    fn transform_linked_field(&mut self, field: &LinkedField) -> Transformed<Selection> {
        // TODO: Dedupe with transform_fragment
        let transformed_selections = self.transform_selections(&field.selections);
        let children_state = self.state;
        let field_state = self.handle_required(&field.directives);

        let catching = if let Some(own_state) = field_state {
            self.handle_state_transition(own_state);
            false
        } else if let Some(WithLocation {
            item: State::Bubbling,
            ..
        }) = children_state
        {
            // If we were bubbling, but this field has no required directives, then we're implicitly catching here.
            self.state = None;
            true
        } else {
            false
        };

        let new_directives = self.replace_required(
            &field.directives,
            state_to_annotation(field_state, catching),
        );

        if new_directives.should_keep() && transformed_selections.should_keep() {
            return Transformed::Keep;
        }
        Transformed::Replace(Selection::LinkedField(Arc::new(LinkedField {
            directives: new_directives.unwrap_or_else(|| field.directives.clone()),
            selections: transformed_selections.replace_or_else(|| field.selections.clone()),
            ..field.clone()
        })))
    }
}
