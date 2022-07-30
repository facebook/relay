/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::Diagnostic;
use common::DiagnosticsResult;
use common::WithLocation;
use errors::validate;
use graphql_ir::LinkedField;
use graphql_ir::Program;
use graphql_ir::ScalarField;
use graphql_ir::ValidationMessage;
use graphql_ir::Validator;
use intern::string_key::Intern;
use intern::string_key::StringKey;
use relay_config::SchemaConfig;
use schema::FieldID;
use schema::SDLSchema;
use schema::Schema;

pub fn disallow_reserved_aliases(
    program: &Program,
    schema_config: &SchemaConfig,
) -> DiagnosticsResult<()> {
    let mut validator = DisallowReservedAliases::new(program, schema_config);
    validator.validate_program(program)
}

struct DisallowReservedAliases<'program> {
    program: &'program Program,
    reserved_aliases: Vec<StringKey>,
}

impl<'program> DisallowReservedAliases<'program> {
    fn new(program: &'program Program, schema_config: &SchemaConfig) -> Self {
        Self {
            program,
            reserved_aliases: vec![
                schema_config.node_interface_id_field,
                "__typename".intern(),
                "__id".intern(),
            ],
        }
    }
}

impl Validator for DisallowReservedAliases<'_> {
    const NAME: &'static str = "DisallowReservedAliases";
    const VALIDATE_ARGUMENTS: bool = false;
    const VALIDATE_DIRECTIVES: bool = false;

    fn validate_linked_field(&mut self, field: &LinkedField) -> DiagnosticsResult<()> {
        validate!(
            if let Some(alias) = field.alias {
                validate_field_alias(
                    &self.program.schema,
                    &self.reserved_aliases,
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
                &self.reserved_aliases,
                &alias,
                field.definition.item,
            )
        } else {
            Ok(())
        }
    }
}

fn validate_field_alias(
    schema: &SDLSchema,
    reserved_aliases: &[StringKey],
    alias: &WithLocation<StringKey>,
    field: FieldID,
) -> DiagnosticsResult<()> {
    let mut validation_errors = vec![];
    for reserved_alias in reserved_aliases {
        let result = validate_field_alias_once(schema, *reserved_alias, alias, field);
        if let Err(errors) = result {
            for err in errors {
                validation_errors.push(err);
            }
        }
    }
    if validation_errors.is_empty() {
        Ok(())
    } else {
        Err(validation_errors)
    }
}

fn validate_field_alias_once(
    schema: &SDLSchema,
    reserved_alias: StringKey,
    alias: &WithLocation<StringKey>,
    field: FieldID,
) -> DiagnosticsResult<()> {
    if alias.item == reserved_alias && schema.field(field).name.item != reserved_alias {
        Err(vec![Diagnostic::error(
            ValidationMessage::DisallowReservedAliasError(reserved_alias),
            alias.location,
        )])
    } else {
        Ok(())
    }
}
