/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::ArgumentName;
use common::Diagnostic;
use common::DiagnosticsResult;
use common::NamedItem;
use common::WithLocation;
use graphql_ir::LinkedField;
use graphql_ir::Program;
use graphql_ir::ScalarField;
use graphql_ir::Validator;
use intern::string_key::Intern;
use lazy_static::lazy_static;
use relay_config::SchemaConfig;
use schema::FieldID;
use schema::SDLSchema;
use schema::Schema;

use crate::ValidationMessage;

lazy_static! {
    static ref ARGUMENT_REASON: ArgumentName = ArgumentName("reason".intern());
}

pub fn validate_no_unselectable_selections(
    program: &Program,
    schema_config: &SchemaConfig,
) -> DiagnosticsResult<()> {
    let mut validator = UnselectableSelections::new(&program.schema, schema_config);
    validator.validate_program(program)?;

    if validator.errors.is_empty() {
        Ok(())
    } else {
        Err(validator.errors)
    }
}

// This validates that all linked and scalar fields aren't marked as unselectable.
// Unselectable fields cannot be selected for any reason (including no reason at all!).
#[derive(Debug)]
struct UnselectableSelections<'a, 'b> {
    schema: &'a Arc<SDLSchema>,
    schema_config: &'b SchemaConfig,
    errors: Vec<Diagnostic>,
}

impl<'a, 'b> UnselectableSelections<'a, 'b> {
    fn new(schema: &'a Arc<SDLSchema>, schema_config: &'b SchemaConfig) -> Self {
        Self {
            schema,
            schema_config,
            errors: vec![],
        }
    }

    fn validate_field(&mut self, field_id: &WithLocation<FieldID>) {
        let schema = &self.schema;
        let field_definition = schema.field(field_id.item);

        if let Some(directive) = field_definition
            .directives
            .named(self.schema_config.unselectable_directive_name)
        {
            let reason = directive
                .arguments
                .named(*ARGUMENT_REASON)
                .and_then(|arg| arg.value.get_string_literal());

            let parent_name = field_definition
                .parent_type
                .map(|parent_type| schema.get_type_name(parent_type));

            self.errors.push(Diagnostic::error(
                ValidationMessage::UnselectableField {
                    field_name: field_definition.name.item,
                    parent_name,
                    reason,
                },
                field_id.location,
            ));
        }
    }
}

impl Validator for UnselectableSelections<'_, '_> {
    const NAME: &'static str = "UnselectableSelections";
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
}
