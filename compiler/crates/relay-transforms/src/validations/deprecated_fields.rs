/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::Diagnostic;
use common::DiagnosticTag;
use common::DiagnosticsResult;
use common::WithLocation;
use graphql_ir::Argument;
use graphql_ir::Directive;
use graphql_ir::ExecutableDefinition;
use graphql_ir::LinkedField;
use graphql_ir::Program;
use graphql_ir::ScalarField;
use graphql_ir::ValidationMessage;
use graphql_ir::ValidationMessageWithData;
use graphql_ir::Validator;
use graphql_ir::Value;
use schema::FieldID;
use schema::SDLSchema;
use schema::Schema;

use crate::fragment_alias_directive::FRAGMENT_DANGEROUSLY_UNALIAS_DIRECTIVE_NAME;

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

    fn validate_field(&mut self, field_id: &WithLocation<FieldID>, arguments: &[Argument]) {
        let schema = &self.schema;
        let field_definition = schema.field(field_id.item);
        if let Some(deprecation) = field_definition.deprecated() {
            let parent_type = field_definition.parent_type.unwrap();
            let parent_name = schema.get_type_name(parent_type);

            self.warnings.push(Diagnostic::hint(
                ValidationMessage::DeprecatedField {
                    field_name: field_definition.name.item,
                    parent_name,
                    deprecation_reason: deprecation.reason,
                },
                field_id.location,
                vec![DiagnosticTag::DEPRECATED],
            ));
        }

        for arg in arguments {
            if let Some(arg_definition) = field_definition.arguments.named(arg.name.item)
                && let Some(directive) = arg_definition.deprecated()
            {
                let parent_type = field_definition.parent_type.unwrap();
                let parent_name = schema.get_type_name(parent_type);

                self.warnings.push(Diagnostic::hint(
                    ValidationMessage::DeprecatedFieldArgument {
                        argument_name: arg.name.item,
                        field_name: field_definition.name.item,
                        parent_name,
                        deprecation_reason: directive.reason,
                    },
                    arg.name.location,
                    vec![DiagnosticTag::DEPRECATED],
                ));
            }
        }
    }
}

// While the individual methods return a diagnostic, since using deprecated fields are not errors per-se, we reserve
// returning an `Err` for cases where we are unable to correctly check.
// Deprecation warnings are collected in `self.warnings`.
impl Validator for DeprecatedFields<'_> {
    const NAME: &'static str = "DeprecatedFields";
    const VALIDATE_ARGUMENTS: bool = false;
    const VALIDATE_DIRECTIVES: bool = true;

    fn validate_linked_field(&mut self, field: &LinkedField) -> DiagnosticsResult<()> {
        self.validate_field(&field.definition, &field.arguments);
        self.default_validate_linked_field(field)
    }

    fn validate_scalar_field(&mut self, field: &ScalarField) -> DiagnosticsResult<()> {
        self.validate_field(&field.definition, &field.arguments);
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

    fn validate_directive(&mut self, directive: &Directive) -> DiagnosticsResult<()> {
        if let Some(directive_definition) = self.schema.get_directive(directive.name.item) {
            // GraphQL does not support @deprecated on directive definitions,
            // but there are some directives that Relay exposes as escape
            // hatches which we would like to render as struckthrough in order
            // to indicate that they should be avoided or migrated to some other pattern.
            if directive_definition.name.item == *FRAGMENT_DANGEROUSLY_UNALIAS_DIRECTIVE_NAME {
                self.warnings.push(Diagnostic::hint_with_data(
                    ValidationMessageWithData::DeprecatedDangerouslyUnaliasedDirective,
                    directive.location,
                    vec![DiagnosticTag::DEPRECATED],
                ));
            }
            for arg in &directive.arguments {
                if let Some(arg_definition) = directive_definition.arguments.named(arg.name.item)
                    && let Some(deprecation) = arg_definition.deprecated()
                {
                    self.warnings.push(Diagnostic::hint(
                        ValidationMessage::DeprecatedDirectiveArgument {
                            argument_name: arg.name.item,
                            directive_name: directive.name.item,
                            deprecation_reason: deprecation.reason,
                        },
                        arg.name.location,
                        vec![DiagnosticTag::DEPRECATED],
                    ));
                }
            }
        }
        Ok(())
    }
}
