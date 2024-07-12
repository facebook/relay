/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use ::errors::try_all;
use common::Diagnostic;
use common::DiagnosticsResult;
use common::DirectiveName;
use common::NamedItem;
use errors::try2;
use graphql_ir::reexport::Intern;
use graphql_ir::Field;
use graphql_ir::FragmentDefinition;
use graphql_ir::Program;
use graphql_ir::Selection;
use graphql_ir::ValidationMessage;
use graphql_ir::Validator;
use lazy_static::lazy_static;
use schema::Schema;

use crate::ValidationMessageWithData;
use crate::CHILDREN_CAN_BUBBLE_METADATA_KEY;
use crate::REQUIRED_DIRECTIVE_NAME;

lazy_static! {
    static ref SEMANTIC_NON_NULL_DIRECTIVE: DirectiveName =
        DirectiveName("semanticNonNull".intern());
    static ref THROW_ON_FIELD_ERROR_DIRECTIVE: DirectiveName =
        DirectiveName("throwOnFieldError".intern());
}

pub fn disallow_required_on_non_null_field(
    program: &Program,
    is_no_required_on_non_null: bool,
    experimental_emit_semantic_nullability_types: bool,
) -> DiagnosticsResult<()> {
    let mut validator = DisallowRequiredOnNonNullField::new(
        program,
        is_no_required_on_non_null,
        experimental_emit_semantic_nullability_types,
    );
    validator.validate_program(program)
}

struct DisallowRequiredOnNonNullField<'program> {
    program: &'program Program,
    is_no_required_on_non_null: bool,
    experimental_emit_semantic_nullability_types: bool,
}

impl<'program> DisallowRequiredOnNonNullField<'program> {
    fn new(
        program: &'program Program,
        is_no_required_on_non_null: bool,
        experimental_emit_semantic_nullability_types: bool,
    ) -> Self {
        Self {
            program,
            is_no_required_on_non_null,
            experimental_emit_semantic_nullability_types,
        }
    }

    fn validate_required_field(
        &self,
        field: &Arc<impl Field>,
        is_throw_on_field_error: bool,
    ) -> DiagnosticsResult<()> {
        if self.is_no_required_on_non_null
            && field.directives().named(*REQUIRED_DIRECTIVE_NAME).is_some()
            && self
                .program
                .schema
                .field(field.definition().item)
                .type_
                .is_non_null()
        {
            // @required on a non-null (!) field is an error.
            return Err(vec![Diagnostic::error_with_data(
                ValidationMessageWithData::RequiredOnNonNull,
                field
                    .directives()
                    .named(*REQUIRED_DIRECTIVE_NAME)
                    .unwrap()
                    .name
                    .location,
            )]);
        }

        if is_throw_on_field_error
            && field.directives().named(*REQUIRED_DIRECTIVE_NAME).is_some()
            && (self
                .program
                .schema
                .field(field.definition().item)
                .directives
                .named(*SEMANTIC_NON_NULL_DIRECTIVE)
                .is_some())
        {
            // @required on a semantically-non-null field is an error.
            return Err(vec![Diagnostic::error(
                ValidationMessageWithData::RequiredOnSemanticNonNull,
                field
                    .directives()
                    .named(*REQUIRED_DIRECTIVE_NAME)
                    .unwrap()
                    .name
                    .location,
            )]);
        }

        Ok(())
    }

    fn validate_selection_fields(
        &self,
        selections: &[Selection],
        is_throw_on_field_error: bool,
    ) -> DiagnosticsResult<()> {
        try_all(selections.iter().map(|selection| match selection {
            Selection::LinkedField(linked_field) => {
                let field_result = match linked_field
                    .directives()
                    .named(*CHILDREN_CAN_BUBBLE_METADATA_KEY)
                {
                    Some(_) => Ok(()),
                    None => self.validate_required_field(linked_field, is_throw_on_field_error),
                };

                let selection_result = self
                    .validate_selection_fields(&linked_field.selections, is_throw_on_field_error);

                try2(field_result, selection_result)?;
                Ok(())
            }
            Selection::ScalarField(scalar_field) => {
                self.validate_required_field(scalar_field, is_throw_on_field_error)
            }
            _ => Ok(()),
        }))?;
        Ok(())
    }
}
impl Validator for DisallowRequiredOnNonNullField<'_> {
    const NAME: &'static str = "disallow_required_on_non_null_field";
    const VALIDATE_ARGUMENTS: bool = false;
    const VALIDATE_DIRECTIVES: bool = false;

    fn validate_fragment(&mut self, fragment: &FragmentDefinition) -> DiagnosticsResult<()> {
        let throw_on_field_error_directive =
            fragment.directives.named(*THROW_ON_FIELD_ERROR_DIRECTIVE);

        if !self.experimental_emit_semantic_nullability_types
            && throw_on_field_error_directive.is_some()
        {
            return Err(vec![Diagnostic::error(
                ValidationMessage::ThrowOnFieldErrorNotEnabled,
                throw_on_field_error_directive.unwrap().name.location,
            )]);
        }

        self.validate_selection_fields(
            &fragment.selections,
            throw_on_field_error_directive.is_some(),
        )
    }

    fn validate_operation(
        &mut self,
        operation: &graphql_ir::OperationDefinition,
    ) -> DiagnosticsResult<()> {
        let throw_on_field_error_directive =
            operation.directives.named(*THROW_ON_FIELD_ERROR_DIRECTIVE);

        if !self.experimental_emit_semantic_nullability_types
            && throw_on_field_error_directive.is_some()
        {
            return Err(vec![Diagnostic::error(
                ValidationMessage::ThrowOnFieldErrorNotEnabled,
                throw_on_field_error_directive.unwrap().name.location,
            )]);
        }

        self.validate_selection_fields(
            &operation.selections,
            throw_on_field_error_directive.is_some(),
        )
    }
}
