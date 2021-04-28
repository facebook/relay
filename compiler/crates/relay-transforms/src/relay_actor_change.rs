/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::FeatureFlag;

use super::ValidationMessage;
use common::{Diagnostic, DiagnosticsResult, NamedItem, WithLocation};
use graphql_ir::{
    Directive, InlineFragment, LinkedField, Program, ScalarField, Selection, Transformed,
    Transformer,
};
use interner::Intern;
use interner::StringKey;
use lazy_static::lazy_static;
use std::sync::Arc;

pub fn relay_actor_change_transform(
    program: &Program,
    feature_flag: &FeatureFlag,
) -> DiagnosticsResult<Program> {
    let mut transform = ActorChangeTransform::new(feature_flag);
    let next_program = transform
        .transform_program(program)
        .replace_or_else(|| program.clone());

    if transform.errors.is_empty() {
        Ok(next_program)
    } else {
        Err(transform.errors)
    }
}

lazy_static! {
    pub static ref RELAY_ACTOR_CHANGE_DIRECTIVE: StringKey = "EXPERIMENTAL__as_actor".intern();
    pub static ref RELAY_ACTOR_CHANGE_DIRECTIVE_FOR_CODEGEN: StringKey = "__as_actor".intern();
}

struct ActorChangeTransform<'feature> {
    feature_flag: &'feature FeatureFlag,
    errors: Vec<Diagnostic>,
}

impl<'feature> ActorChangeTransform<'feature> {
    fn new(feature_flag: &'feature FeatureFlag) -> Self {
        Self {
            feature_flag,
            errors: Default::default(),
        }
    }
}

impl Transformer for ActorChangeTransform<'_> {
    const NAME: &'static str = "ActorChangeTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_linked_field(&mut self, field: &LinkedField) -> Transformed<Selection> {
        if let Some(actor_change_directive) = field.directives.named(*RELAY_ACTOR_CHANGE_DIRECTIVE)
        {
            if field.selections.len() != 1 {
                self.errors.push(Diagnostic::error(
                    ValidationMessage::ActorChangeInvalidSelection,
                    field.alias_or_name_location(),
                ));
                return Transformed::Keep;
            }

            match &field.selections[0] {
                Selection::FragmentSpread(fragment_spread) => {
                    if !self
                        .feature_flag
                        .is_enabled_for(fragment_spread.fragment.item)
                    {
                        self.errors.push(Diagnostic::error(
                            ValidationMessage::ActorChangeIsExperimental,
                            fragment_spread.fragment.location,
                        ));
                        return Transformed::Keep;
                    }
                }

                selection => {
                    self.errors.push(Diagnostic::error(
                        ValidationMessage::ActorChangeInvalidSelection,
                        selection
                            .location()
                            .unwrap_or_else(|| field.alias_or_name_location()),
                    ));
                    return Transformed::Keep;
                }
            }

            let next_directives = field
                .directives
                .iter()
                .filter_map(|directive| {
                    if directive == actor_change_directive {
                        None
                    } else {
                        Some(directive.clone())
                    }
                })
                .collect::<_>();

            let next_selection = Selection::InlineFragment(Arc::new(InlineFragment {
                type_condition: None,
                directives: vec![Directive {
                    name: WithLocation::new(
                        actor_change_directive.name.location,
                        *RELAY_ACTOR_CHANGE_DIRECTIVE_FOR_CODEGEN,
                    ),
                    arguments: vec![],
                }],
                selections: vec![Selection::LinkedField(Arc::new(LinkedField {
                    directives: next_directives,
                    ..field.clone()
                }))],
            }));

            Transformed::Replace(next_selection)
        } else {
            self.default_transform_linked_field(field)
        }
    }

    fn transform_scalar_field(&mut self, field: &ScalarField) -> Transformed<Selection> {
        if field
            .directives
            .named(*RELAY_ACTOR_CHANGE_DIRECTIVE)
            .is_some()
        {
            self.errors.push(Diagnostic::error(
                ValidationMessage::ActorChangeCannotUseOnScalarFields,
                field.alias_or_name_location(),
            ));
        }

        Transformed::Keep
    }
}
