/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::{Diagnostic, DiagnosticsResult, WithLocation};
use errors::validate;
use graphql_ir::{LinkedField, Program, ScalarField, ValidationMessage, Validator};
use intern::string_key::StringKey;

pub fn validate_no_double_underscore_alias(program: &Program) -> DiagnosticsResult<()> {
    let mut validator = ValidateNoDoubleUnderscoreAlias {};
    validator.validate_program(program)
}

struct ValidateNoDoubleUnderscoreAlias {}

impl Validator for ValidateNoDoubleUnderscoreAlias {
    const NAME: &'static str = "ValidateNoDoubleUnderscoreAlias";
    const VALIDATE_ARGUMENTS: bool = false;
    const VALIDATE_DIRECTIVES: bool = false;

    fn validate_linked_field(&mut self, field: &LinkedField) -> DiagnosticsResult<()> {
        validate!(
            if let Some(alias) = field.alias {
                validate_field_alias(&alias).map_err(|x| vec![x])
            } else {
                Ok(())
            },
            self.validate_selections(&field.selections)
        )
    }

    fn validate_scalar_field(&mut self, field: &ScalarField) -> DiagnosticsResult<()> {
        if let Some(alias) = field.alias {
            validate_field_alias(&alias).map_err(|x| vec![x])
        } else {
            Ok(())
        }
    }
}

fn validate_field_alias(alias: &WithLocation<StringKey>) -> Result<(), Diagnostic> {
    if alias.item.lookup().starts_with("__") {
        return Err(Diagnostic::error(
            ValidationMessage::NoDoubleUnderscoreAlias,
            alias.location,
        ));
    }
    Ok(())
}
