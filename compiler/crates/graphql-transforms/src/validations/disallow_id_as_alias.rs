/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::Spanned;
use graphql_ir::{LinkedField, Program, ScalarField, ValidationError, ValidationMessage, Visitor};
use interner::{Intern, StringKey};
use schema::{FieldID, Schema};

pub fn disallow_id_as_alias<'s>(program: &'s Program<'s>) -> Vec<ValidationError> {
    let mut visitor = DisallowIdAsAlias::new(program);
    visitor.visit_program(program);
    visitor.errors
}

struct DisallowIdAsAlias<'s> {
    program: &'s Program<'s>,
    errors: Vec<ValidationError>,
    id_key: StringKey,
}

impl<'s> DisallowIdAsAlias<'s> {
    fn new(program: &'s Program<'s>) -> Self {
        Self {
            program,
            errors: Default::default(),
            id_key: "id".intern(),
        }
    }
}

impl<'s> Visitor for DisallowIdAsAlias<'s> {
    const NAME: &'static str = "DisallowIdAsAlias";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn visit_linked_field(&mut self, field: &LinkedField) {
        if let Some(alias) = field.alias {
            if let Some(error) = validate_field_alias(
                self.program.schema(),
                self.id_key,
                &alias,
                field.definition.item,
            ) {
                self.errors.push(error);
            }
        }
    }

    fn visit_scalar_field(&mut self, field: &ScalarField) {
        if let Some(alias) = field.alias {
            if let Some(error) = validate_field_alias(
                self.program.schema(),
                self.id_key,
                &alias,
                field.definition.item,
            ) {
                self.errors.push(error);
            }
        }
    }
}

fn validate_field_alias<'s>(
    schema: &'s Schema,
    id_key: StringKey,
    alias: &Spanned<StringKey>,
    field: FieldID,
) -> Option<ValidationError> {
    if alias.item == id_key && schema.field(field).name != id_key {
        Some(ValidationError::new(
            ValidationMessage::DisallowIdAsAliasError(),
            vec![], // TODO (T62615093) Figure out how to get location here?
        ))
    } else {
        None
    }
}
