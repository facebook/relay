/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use ::errors::try_all;
use common::Diagnostic;
use common::DiagnosticTag;
use common::DiagnosticsResult;
use common::DirectiveName;
use common::NamedItem;
use errors::try2;
use graphql_ir::reexport::Intern;
use graphql_ir::ExecutableDefinition;
use graphql_ir::Field;
use graphql_ir::FragmentDefinition;
use graphql_ir::Program;
use graphql_ir::Selection;
use graphql_ir::Validator;
use lazy_static::lazy_static;
use schema::SDLSchema;
use schema::Schema;

use crate::required_directive;
use crate::ValidationMessageWithData;
use crate::CATCH_DIRECTIVE_NAME;
use crate::CHILDREN_CAN_BUBBLE_METADATA_KEY;
use crate::REQUIRED_DIRECTIVE_NAME;

lazy_static! {
    static ref SEMANTIC_NON_NULL_DIRECTIVE: DirectiveName =
        DirectiveName("semanticNonNull".intern());
    static ref THROW_ON_FIELD_ERROR_DIRECTIVE: DirectiveName =
        DirectiveName("throwOnFieldError".intern());
}

// NOTE: This validation expects to run on UNTRANSFORMED IR. To the extent that
// it relies on other transforms, it runs them itself.
//
// If you start running this validation on transformed IR, you will want/need to
// refactor the places that run this transform to pre-apply all required
// transforms.
pub fn disallow_required_on_non_null_field(
    program: &Program,
) -> DiagnosticsResult<Vec<Diagnostic>> {
    // This validation depends on metadata directives added by the
    // required_directive transform. This validation is run on untransformed
    // versions of IR both in the LSP and as a codemod, so we apply the transform
    // ourselves locally.
    let program = required_directive(program)?;
    let mut validator = DisallowRequiredOnNonNullField::new(&program.schema);
    validator.validate_program(&program)?;
    Ok(validator.warnings)
}

pub fn disallow_required_on_non_null_field_for_executable_definition(
    schema: &Arc<SDLSchema>,
    definition: &ExecutableDefinition,
) -> DiagnosticsResult<Vec<Diagnostic>> {
    let program = Program::from_definitions(Arc::clone(schema), vec![definition.clone()]);
    disallow_required_on_non_null_field(&program)
}

struct DisallowRequiredOnNonNullField<'a> {
    schema: &'a Arc<SDLSchema>,
    warnings: Vec<Diagnostic>,
}

impl<'a> DisallowRequiredOnNonNullField<'a> {
    fn new(schema: &'a Arc<SDLSchema>) -> Self {
        Self {
            schema,
            warnings: vec![],
        }
    }

    fn validate_required_field(
        &mut self,
        field: &Arc<impl Field>,
        errors_are_caught: bool,
    ) -> DiagnosticsResult<()> {
        if !errors_are_caught {
            return Ok(());
        }

        let required_directive = field.directives().named(*REQUIRED_DIRECTIVE_NAME);

        if required_directive.is_none() {
            return Ok(());
        }

        if self
            .schema
            .field(field.definition().item)
            .type_
            .is_non_null()
        {
            self.warnings.push(Diagnostic::hint_with_data(
                ValidationMessageWithData::RequiredOnNonNull,
                required_directive.unwrap().location,
                vec![DiagnosticTag::UNNECESSARY],
            ));
        } else if self
            .schema
            .field(field.definition().item)
            .directives
            .named(*SEMANTIC_NON_NULL_DIRECTIVE)
            .is_some()
        {
            // @required on a semantically-non-null field is unnecessary
            self.warnings.push(Diagnostic::hint_with_data(
                ValidationMessageWithData::RequiredOnSemanticNonNull,
                required_directive.unwrap().location,
                vec![DiagnosticTag::UNNECESSARY],
            ));
        }

        Ok(())
    }

    fn validate_selection_fields(
        &mut self,
        selections: &[Selection],
        errors_are_caught: bool,
    ) -> DiagnosticsResult<()> {
        try_all(selections.iter().map(|selection| match selection {
            Selection::LinkedField(linked_field) => {
                let errors_are_caught = errors_are_caught
                    || linked_field
                        .directives()
                        .named(*CATCH_DIRECTIVE_NAME)
                        .is_some();

                let field_result = match linked_field
                    .directives()
                    .named(*CHILDREN_CAN_BUBBLE_METADATA_KEY)
                {
                    Some(_) => Ok(()),
                    None => self.validate_required_field(linked_field, errors_are_caught),
                };

                let selection_result =
                    self.validate_selection_fields(&linked_field.selections, errors_are_caught);

                try2(field_result, selection_result)?;
                Ok(())
            }
            Selection::ScalarField(scalar_field) => {
                self.validate_required_field(scalar_field, errors_are_caught)
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

        let has_throw_on_field_error_directive = throw_on_field_error_directive.is_some();

        self.validate_selection_fields(&fragment.selections, has_throw_on_field_error_directive)
    }

    fn validate_operation(
        &mut self,
        operation: &graphql_ir::OperationDefinition,
    ) -> DiagnosticsResult<()> {
        let throw_on_field_error_directive =
            operation.directives.named(*THROW_ON_FIELD_ERROR_DIRECTIVE);

        let has_throw_on_field_error_directive = throw_on_field_error_directive.is_some();
        self.validate_selection_fields(&operation.selections, has_throw_on_field_error_directive)
    }
}
