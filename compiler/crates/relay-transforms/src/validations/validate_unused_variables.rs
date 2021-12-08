/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::root_variables::InferVariablesVisitor;
use common::{Diagnostic, DiagnosticsResult, NamedItem};
use graphql_ir::{FragmentDefinition, OperationDefinition, Program, ValidationMessage, Validator};
use intern::string_key::{Intern, StringKey};

pub fn validate_unused_variables(program: &Program) -> DiagnosticsResult<()> {
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
/// former `graphql-js` NoUnusedVariablesRule
impl Validator for ValidateUnusedVariables<'_> {
    const NAME: &'static str = "ValidateUnusedVariables";
    const VALIDATE_ARGUMENTS: bool = false;
    const VALIDATE_DIRECTIVES: bool = false;

    fn validate_operation(&mut self, operation: &OperationDefinition) -> DiagnosticsResult<()> {
        let (variables, _) = self.visitor.infer_operation_variables(operation);
        let unused_variables: Vec<_> = operation
            .variable_definitions
            .iter()
            .filter(|var| !variables.contains_key(&var.name.item))
            .collect();

        let ignore_directive = operation.directives.named(self.ignore_directive_name);
        if !unused_variables.is_empty() && ignore_directive.is_none() {
            return Err(unused_variables
                .into_iter()
                .map(|unused_variable| {
                    Diagnostic::error(
                        ValidationMessage::UnusedVariable {
                            operation_name: operation.name.item,
                            variable_name: unused_variable.name.item,
                        },
                        unused_variable.name.location,
                    )
                })
                .collect());
        }
        if unused_variables.is_empty() {
            if let Some(directive) = ignore_directive {
                return Err(vec![Diagnostic::error(
                    ValidationMessage::UnusedIgnoreUnusedVariablesDirective {
                        operation_name: operation.name.item,
                    },
                    directive.name.location,
                )]);
            }
        }
        Ok(())
    }

    fn validate_fragment(&mut self, _: &FragmentDefinition) -> DiagnosticsResult<()> {
        Ok(())
    }
}
