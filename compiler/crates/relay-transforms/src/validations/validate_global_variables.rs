/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::{root_variables::InferVariablesVisitor, DIRECTIVE_SPLIT_OPERATION};
use common::{Diagnostic, DiagnosticsResult, NamedItem};
use graphql_ir::{FragmentDefinition, OperationDefinition, Program, ValidationMessage, Validator};

pub fn validate_global_variables(program: &Program) -> DiagnosticsResult<()> {
    ValidateGlobalVariables::new(program).validate_program(program)
}

pub struct ValidateGlobalVariables<'program> {
    visitor: InferVariablesVisitor<'program>,
}

impl<'program> ValidateGlobalVariables<'program> {
    fn new(program: &'program Program) -> Self {
        Self {
            visitor: InferVariablesVisitor::new(program),
        }
    }
}

/// Validates that all used arguments must be defined
impl Validator for ValidateGlobalVariables<'_> {
    const NAME: &'static str = "ValidateGlobalVariables";
    const VALIDATE_ARGUMENTS: bool = false;
    const VALIDATE_DIRECTIVES: bool = false;

    fn validate_operation(&mut self, operation: &OperationDefinition) -> DiagnosticsResult<()> {
        // Skip 3D normalization fragments
        if operation
            .directives
            .named(*DIRECTIVE_SPLIT_OPERATION)
            .is_some()
        {
            return Ok(());
        }
        let (variables, _) = self.visitor.infer_operation_variables(operation);

        let undefined_variables: Vec<_> = variables
            .values()
            .filter(|var| {
                !(operation
                    .variable_definitions
                    .iter()
                    .any(|def| def.name.item == var.name.item))
            })
            .collect();

        if !undefined_variables.is_empty() {
            let is_plural = undefined_variables.len() > 1;
            let mut locations = undefined_variables
                .iter()
                .map(|arg_def| arg_def.name.location);
            let mut error = Diagnostic::error(
                ValidationMessage::GlobalVariables {
                    operation_name: operation.name.item,
                    variables_string: format!(
                        "{}: '${}'",
                        if is_plural { "s" } else { "" },
                        undefined_variables
                            .iter()
                            .map(|var| var.name.item.lookup())
                            .collect::<Vec<_>>()
                            .join("', '$"),
                    ),
                },
                locations.next().unwrap(),
            );
            for related_location in locations {
                error = error.annotate("related location", related_location);
            }
            return Err(vec![error]);
        }
        Ok(())
    }

    fn validate_fragment(&mut self, _: &FragmentDefinition) -> DiagnosticsResult<()> {
        Ok(())
    }
}
