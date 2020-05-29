/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::root_variables::InferVariablesVisitor;
use common::NamedItem;
use graphql_ir::{
    FragmentDefinition, OperationDefinition, Program, ValidationError, ValidationMessage,
    ValidationResult, Validator,
};
use interner::{Intern, StringKey};

pub fn validate_unused_variables(program: &Program) -> ValidationResult<()> {
    ValidateUnusedVariables::new(program).validate_program(program)
}

pub struct ValidateUnusedVariables<'program> {
    visitor: InferVariablesVisitor<'program>,
    ignore_directive_name: StringKey,
}

impl<'program> ValidateUnusedVariables<'program> {
    fn new(program: &'program Program) -> Self {
        Self {
            visitor: InferVariablesVisitor::new(program),
            ignore_directive_name: "DEPRECATED__relay_ignore_unused_variables_error".intern(),
        }
    }
}

/// Validates that there are no unused variables in the operation.
/// former `graphql-js`` NoUnusedVariablesRule
impl Validator for ValidateUnusedVariables<'_> {
    const NAME: &'static str = "ValidateUnusedVariables";
    const VALIDATE_ARGUMENTS: bool = false;
    const VALIDATE_DIRECTIVES: bool = false;

    fn validate_operation(&mut self, operation: &OperationDefinition) -> ValidationResult<()> {
        let variables = self.visitor.infer_operation_variables(operation);
        let unused_variables: Vec<_> = operation
            .variable_definitions
            .iter()
            .filter(|var| !variables.contains_key(&var.name.item))
            .collect();

        let ignore_directive = operation.directives.named(self.ignore_directive_name);
        if !unused_variables.is_empty() && ignore_directive.is_none() {
            let is_plural = unused_variables.len() > 1;
            return Err(vec![ValidationError::new(
                ValidationMessage::UnusedVariables {
                    operation_name: operation.name.item,
                    variables_string: format!(
                        "Variable{} '${}' {}",
                        if is_plural { "s" } else { "" },
                        unused_variables
                            .iter()
                            .map(|var| var.name.item.lookup())
                            .collect::<Vec<_>>()
                            .join("', '$"),
                        if is_plural { "are" } else { "is" },
                    ),
                },
                unused_variables
                    .into_iter()
                    .map(|var| var.name.location)
                    .collect(),
            )]);
        }
        if unused_variables.is_empty() {
            if let Some(directive) = ignore_directive {
                return Err(vec![ValidationError::new(
                    ValidationMessage::UnusedIgnoreUnusedVariablesDirective {
                        operation_name: operation.name.item,
                    },
                    vec![directive.name.location],
                )]);
            }
        }
        Ok(())
    }

    fn validate_fragment(&mut self, _: &FragmentDefinition) -> ValidationResult<()> {
        Ok(())
    }
}
