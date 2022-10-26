/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::Diagnostic;
use common::DiagnosticsResult;
use graphql_ir::OperationDefinition;
use graphql_ir::Program;
use graphql_ir::Validator;
use graphql_ir::VariableName;
use intern::Lookup;
use thiserror::Error;

use crate::util::INTERNAL_RELAY_VARIABLES_PREFIX;

pub fn validate_global_variable_names(program: &Program) -> DiagnosticsResult<()> {
    ValidateGlobalVariableNames {}.validate_program(program)
}

#[derive(Default)]
pub struct ValidateGlobalVariableNames {}

impl Validator for ValidateGlobalVariableNames {
    const NAME: &'static str = "ValidateGlobalVariableNames";
    const VALIDATE_ARGUMENTS: bool = false;
    const VALIDATE_DIRECTIVES: bool = false;

    fn validate_operation(&mut self, operation: &OperationDefinition) -> DiagnosticsResult<()> {
        let mut invalid_names = operation.variable_definitions.iter().filter_map(|def| {
            if def
                .name
                .item
                .0
                .lookup()
                .starts_with(INTERNAL_RELAY_VARIABLES_PREFIX.lookup())
            {
                Some(def.name)
            } else {
                None
            }
        });

        if let Some(first_name) = invalid_names.next() {
            let mut error = Diagnostic::error(
                ValidationMessage::InvalidOperationVariablePrefix(first_name.item),
                first_name.location,
            );

            for invalid_name in invalid_names {
                error = error.annotate("related location", invalid_name.location);
            }
            return Err(vec![error]);
        }
        Ok(())
    }
}

#[derive(Clone, Debug, Error, Eq, PartialEq, Ord, PartialOrd, Hash)]
enum ValidationMessage {
    #[error(
        "Invalid name `${0}` for an operation variable. The `__relay_internal` prefix is reserved for relay internal usage."
    )]
    InvalidOperationVariablePrefix(VariableName),
}
