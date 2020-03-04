/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::WithLocation;
use errors::try2;
use graphql_ir::{
    LinkedField, Program, ScalarField, ValidationError, ValidationMessage, ValidationResult,
    Validator,
};
use interner::{Intern, StringKey};
use schema::{FieldID, Schema};

pub fn disallow_id_as_alias<'s>(program: &Program<'s>) -> ValidationResult<()> {
    let mut validator = DisallowIdAsAlias::new(program);
    validator.validate_program(program)
}

struct DisallowIdAsAlias<'s> {
    program: &'s Program<'s>,
    id_key: StringKey,
}

impl<'s> DisallowIdAsAlias<'s> {
    fn new(program: &'s Program<'s>) -> Self {
        Self {
            program,
            id_key: "id".intern(),
        }
    }
}

impl<'s> Validator for DisallowIdAsAlias<'s> {
    const NAME: &'static str = "DisallowIdAsAlias";
    const VALIDATE_ARGUMENTS: bool = false;
    const VALIDATE_DIRECTIVES: bool = false;

    fn validate_linked_field(&mut self, field: &LinkedField) -> ValidationResult<()> {
        if let Some(alias) = field.alias {
            try2(
                validate_field_alias(
                    self.program.schema(),
                    self.id_key,
                    &alias,
                    field.definition.item,
                ),
                self.validate_selections(&field.selections),
            )?;
            Ok(())
        } else {
            self.validate_selections(&field.selections)
        }
    }

    fn validate_scalar_field(&mut self, field: &ScalarField) -> ValidationResult<()> {
        if let Some(alias) = field.alias {
            validate_field_alias(
                self.program.schema(),
                self.id_key,
                &alias,
                field.definition.item,
            )
        } else {
            Ok(())
        }
    }
}

fn validate_field_alias<'s>(
    schema: &'s Schema,
    id_key: StringKey,
    alias: &WithLocation<StringKey>,
    field: FieldID,
) -> ValidationResult<()> {
    if alias.item == id_key && schema.field(field).name != id_key {
        Err(vec![ValidationError::new(
            ValidationMessage::DisallowIdAsAliasError(),
            vec![alias.location],
        )])
    } else {
        Ok(())
    }
}
