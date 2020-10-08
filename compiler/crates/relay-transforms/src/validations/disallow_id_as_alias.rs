/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::{Diagnostic, DiagnosticsResult, WithLocation};
use errors::validate;
use graphql_ir::{LinkedField, Program, ScalarField, ValidationMessage, Validator};
use interner::{Intern, StringKey};
use schema::{FieldID, Schema};

pub fn disallow_id_as_alias(program: &Program) -> DiagnosticsResult<()> {
    let mut validator = DisallowIdAsAlias::new(program);
    validator.validate_program(program)
}

struct DisallowIdAsAlias<'program> {
    program: &'program Program,
    id_key: StringKey,
}

impl<'program> DisallowIdAsAlias<'program> {
    fn new(program: &'program Program) -> Self {
        Self {
            program,
            id_key: "id".intern(),
        }
    }
}

impl Validator for DisallowIdAsAlias<'_> {
    const NAME: &'static str = "DisallowIdAsAlias";
    const VALIDATE_ARGUMENTS: bool = false;
    const VALIDATE_DIRECTIVES: bool = false;

    fn validate_linked_field(&mut self, field: &LinkedField) -> DiagnosticsResult<()> {
        validate!(
            if let Some(alias) = field.alias {
                validate_field_alias(
                    &self.program.schema,
                    self.id_key,
                    &alias,
                    field.definition.item,
                )
            } else {
                Ok(())
            },
            self.validate_selections(&field.selections)
        )
    }

    fn validate_scalar_field(&mut self, field: &ScalarField) -> DiagnosticsResult<()> {
        if let Some(alias) = field.alias {
            validate_field_alias(
                &self.program.schema,
                self.id_key,
                &alias,
                field.definition.item,
            )
        } else {
            Ok(())
        }
    }
}

fn validate_field_alias(
    schema: &Schema,
    id_key: StringKey,
    alias: &WithLocation<StringKey>,
    field: FieldID,
) -> DiagnosticsResult<()> {
    if alias.item == id_key && schema.field(field).name != id_key {
        Err(vec![Diagnostic::error(
            ValidationMessage::DisallowIdAsAliasError(),
            alias.location,
        )])
    } else {
        Ok(())
    }
}
