/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::Diagnostic;
use common::DiagnosticsResult;
use common::NamedItem;
use graphql_ir::FragmentDefinition;
use graphql_ir::OperationDefinition;
use graphql_ir::Program;
use graphql_ir::ValidationDiagnosticCode;
use graphql_ir::ValidationMessageWithData;
use graphql_ir::Validator;
use itertools::Itertools;
use schema::Schema;

use crate::root_variables::InferVariablesVisitor;
use crate::DIRECTIVE_SPLIT_OPERATION;

pub fn validate_global_variables(program: &Program) -> DiagnosticsResult<()> {
    ValidateGlobalVariables::new(program).validate_program(program)
}

pub struct ValidateGlobalVariables<'program> {
    visitor: InferVariablesVisitor<'program>,
    program: &'program Program,
}

impl<'program> ValidateGlobalVariables<'program> {
    fn new(program: &'program Program) -> Self {
        Self {
            visitor: InferVariablesVisitor::new(program),
            program,
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

        let mut undefined_variables: Vec<_> = variables
            .values()
            .filter(|var| {
                !(operation
                    .variable_definitions
                    .iter()
                    .any(|def| def.name.item == var.name.item))
            })
            .collect();
        undefined_variables.sort_by(|a, b| a.name.cmp(&b.name));
        if !undefined_variables.is_empty() {
            return Err(undefined_variables
                .iter()
                .map(|variable| {
                    Diagnostic::error_with_data_and_code(
                        ValidationDiagnosticCode::UNDEFINED_VARIABLE_REFERENCED,
                        ValidationMessageWithData::UndefinedVariableReferenced {
                            operation_name: operation.name.item.0,
                            variable_name: variable.name.item,
                            variable_type: self.program.schema.get_type_string(&variable.type_),
                        },
                        variable.name.location,
                    )
                })
                .collect_vec());
        }
        Ok(())
    }

    fn validate_fragment(&mut self, _: &FragmentDefinition) -> DiagnosticsResult<()> {
        Ok(())
    }
}
