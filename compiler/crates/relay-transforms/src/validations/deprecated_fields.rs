/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::{Diagnostic, DiagnosticTag, DiagnosticsResult, NamedItem, WithLocation};
use graphql_ir::{
    ExecutableDefinition, LinkedField, Program, ScalarField, ValidationMessage, Validator, Value,
};
use intern::string_key::{Intern, StringKey};
use lazy_static::lazy_static;
use schema::{FieldID, SDLSchema, Schema};

lazy_static! {
    static ref DIRECTIVE_DEPRECATED: StringKey = "deprecated".intern();
    static ref ARGUMENT_REASON: StringKey = "reason".intern();
}

pub fn deprecated_fields(
    schema: &Arc<SDLSchema>,
    program: &Program,
) -> DiagnosticsResult<Vec<Diagnostic>> {
    let mut validator = DeprecatedFields::new(schema);
    validator.validate_program(program)?;
    Ok(validator.warnings)
}

pub fn deprecated_fields_for_executable_definition(
    schema: &Arc<SDLSchema>,
    definition: &ExecutableDefinition,
) -> DiagnosticsResult<Vec<Diagnostic>> {
    let mut validator = DeprecatedFields::new(schema);

    match definition {
        ExecutableDefinition::Fragment(fragment) => validator.validate_fragment(fragment),
        ExecutableDefinition::Operation(operation) => validator.validate_operation(operation),
    }?;
    Ok(validator.warnings)
}

struct DeprecatedFields<'a> {
    schema: &'a Arc<SDLSchema>,
    warnings: Vec<Diagnostic>,
}

impl<'a> DeprecatedFields<'a> {
    fn new(schema: &'a Arc<SDLSchema>) -> Self {
        Self {
            schema,
            warnings: vec![],
        }
    }

    fn validate_field(&mut self, field_id: &WithLocation<FieldID>) {
        let schema = &self.schema;
        let field_definition = schema.field(field_id.item);
        if let Some(directive) = field_definition.directives.named(*DIRECTIVE_DEPRECATED) {
            let deprecation_reason = directive
                .arguments
                .named(*ARGUMENT_REASON)
                .and_then(|arg| arg.value.get_string_literal());
            let parent_type = field_definition.parent_type.unwrap();
            let parent_name = schema.get_type_name(parent_type);

            self.warnings.push(Diagnostic::hint(
                ValidationMessage::DeprecatedField {
                    field_name: field_definition.name.item,
                    parent_name,
                    deprecation_reason,
                },
                field_id.location,
                vec![DiagnosticTag::Deprecated],
            ));
        }
    }
}

// While the individual methods return a diagnostic, since using deprecated fields are not errors per-se, we reserve
// returning an `Err` for cases where we are unable to correctly check.
// Deprecation warnings are collected in `self.warnings`.
impl<'a> Validator for DeprecatedFields<'a> {
    const NAME: &'static str = "DeprecatedFields";
    const VALIDATE_ARGUMENTS: bool = false;
    const VALIDATE_DIRECTIVES: bool = false;

    fn validate_linked_field(&mut self, field: &LinkedField) -> DiagnosticsResult<()> {
        self.validate_field(&field.definition);
        self.default_validate_linked_field(field)
    }

    fn validate_scalar_field(&mut self, field: &ScalarField) -> DiagnosticsResult<()> {
        self.validate_field(&field.definition);
        self.default_validate_scalar_field(field)
    }

    fn validate_value(&mut self, value: &Value) -> DiagnosticsResult<()> {
        // TODO: `@deprecated` is allowed on Enum values, so technically we
        // should also be validating when someone uses a deprecated enum value
        // as an argument, but that will require some additional methods on our
        // Schema, and potentially some additional traversal in our validation
        // trait to traverse into potentially deep constant objects/arrays.
        self.default_validate_value(value)
    }
}
