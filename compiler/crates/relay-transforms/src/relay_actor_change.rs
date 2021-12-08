/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::ValidationMessage;
use common::{Diagnostic, DiagnosticsResult, FeatureFlag, NamedItem, WithLocation};
use graphql_ir::{
    Directive, Field, InlineFragment, LinkedField, Program, ScalarField, Selection, Transformed,
    Transformer,
};
use intern::string_key::{Intern, StringKey};
use lazy_static::lazy_static;
use schema::Schema;
use std::sync::Arc;

pub fn relay_actor_change_transform(
    program: &Program,
    feature_flag: &FeatureFlag,
) -> DiagnosticsResult<Program> {
    let mut transform = ActorChangeTransform::new(program, feature_flag);
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
    pub static ref RELAY_ACTOR_CHANGE_DIRECTIVE: StringKey = "fb_actor_change".intern();
    pub static ref RELAY_ACTOR_CHANGE_DIRECTIVE_FOR_CODEGEN: StringKey =
        "__fb_actor_change".intern();
    static ref ACTOR_CHANGE_FIELD: StringKey = "actor_key".intern();
}

struct ActorChangeTransform<'program, 'feature> {
    program: &'program Program,
    feature_flag: &'feature FeatureFlag,
    errors: Vec<Diagnostic>,
}

impl<'program, 'feature> ActorChangeTransform<'program, 'feature> {
    fn new(program: &'program Program, feature_flag: &'feature FeatureFlag) -> Self {
        Self {
            program,
            feature_flag,
            errors: Default::default(),
        }
    }
}

impl<'program, 'feature> Transformer for ActorChangeTransform<'program, 'feature> {
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

            let schema_field = self.program.schema.field(field.definition.item);
            if schema_field.type_.is_list() {
                self.errors.push(Diagnostic::error(
                    ValidationMessage::ActorChangePluralFieldsNotSupported,
                    field.alias_or_name_location(),
                ));
                return Transformed::Keep;
            }
            let field_type = schema_field.type_.inner();
            let viewer_field = match self
                .program
                .schema
                .named_field(field_type, *ACTOR_CHANGE_FIELD)
            {
                Some(viewer_field_id) => {
                    let viewer_field = self.program.schema.field(viewer_field_id);
                    if !viewer_field.type_.inner().is_scalar() {
                        self.errors.push(Diagnostic::error(
                            ValidationMessage::ActorChangeViewerShouldBeScalar {
                                directive_name: *RELAY_ACTOR_CHANGE_DIRECTIVE,
                                actor_change_field: *ACTOR_CHANGE_FIELD,
                                field_name: schema_field.name.item,
                                actor_change_field_type: self
                                    .program
                                    .schema
                                    .get_type_name(viewer_field.type_.inner()),
                            },
                            actor_change_directive.name.location,
                        ));
                        return Transformed::Keep;
                    } else {
                        viewer_field_id
                    }
                }
                None => {
                    self.errors.push(Diagnostic::error(
                        ValidationMessage::ActorChangeExpectViewerFieldOnType {
                            directive_name: *RELAY_ACTOR_CHANGE_DIRECTIVE,
                            actor_change_field: *ACTOR_CHANGE_FIELD,
                            field_name: schema_field.name.item,
                            type_name: self.program.schema.get_type_name(field_type),
                        },
                        actor_change_directive.name.location,
                    ));
                    return Transformed::Keep;
                }
            };
            let mut next_selections = field.selections.clone();
            next_selections.push(Selection::ScalarField(Arc::new(ScalarField {
                alias: None,
                definition: WithLocation::new(actor_change_directive.name.location, viewer_field),
                arguments: vec![],
                directives: vec![],
            })));

            let next_selection = Selection::InlineFragment(Arc::new(InlineFragment {
                type_condition: None,
                directives: vec![Directive {
                    name: WithLocation::new(
                        actor_change_directive.name.location,
                        *RELAY_ACTOR_CHANGE_DIRECTIVE_FOR_CODEGEN,
                    ),
                    arguments: vec![],
                    data: None,
                }],
                selections: vec![Selection::LinkedField(Arc::new(LinkedField {
                    selections: next_selections,
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
