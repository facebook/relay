/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

mod extract_module_name;

use common::Diagnostic;
use common::DiagnosticsResult;
use graphql_ir::FragmentDefinition;
use graphql_ir::OperationDefinition;
use graphql_ir::Program;
use graphql_ir::Validator;
use graphql_syntax::OperationKind;
use thiserror::Error;

pub fn validate_module_names(program: &Program) -> DiagnosticsResult<()> {
    (ValidateModuleNames {}).validate_program(program)
}

pub use extract_module_name::extract_module_name;

pub struct ValidateModuleNames {}

impl Validator for ValidateModuleNames {
    const NAME: &'static str = "ValidateModuleNames";
    const VALIDATE_ARGUMENTS: bool = false;
    const VALIDATE_DIRECTIVES: bool = true;

    fn validate_operation(&mut self, operation: &OperationDefinition) -> DiagnosticsResult<()> {
        let operation_name = operation.name.item.0.to_string();
        let path = operation.name.location.source_location().path();
        let module_name = extract_module_name(path).expect("Unable to extract module name.");
        let (operation_type_suffix, pluralized_string) = match operation.kind {
            OperationKind::Query => ("Query", "Queries"),
            OperationKind::Mutation => ("Mutation", "Mutations"),
            OperationKind::Subscription => ("Subscription", "Subscriptions"),
        };

        let operation_name_ending_is_valid = operation_name.ends_with("Query")
            || operation_name.ends_with("Mutation")
            || operation_name.ends_with("Subscription");

        if !operation_name.starts_with(&module_name) || !operation_name_ending_is_valid
        // TODO: T71484519 re-enable this line when queries are correctly named in www
        // || !operation_name.ends_with(operation_type_suffix)
        {
            return Err(vec![Diagnostic::error(
                ValidationMessage::InvalidOperationName {
                    pluralized_string: pluralized_string.to_string(),
                    operation_type_suffix: operation_type_suffix.to_string(),
                    module_name,
                    operation_name,
                },
                operation.name.location,
            )]);
        }

        Ok(())
    }

    fn validate_fragment(&mut self, fragment: &FragmentDefinition) -> DiagnosticsResult<()> {
        let fragment_name = fragment.name.item.to_string();
        let path = fragment.name.location.source_location().path();
        let module_name =
            extract_module_name::extract_module_name(path).expect("Unable to extract module name.");

        if !fragment_name.starts_with(&module_name) {
            return Err(vec![Diagnostic::error(
                ValidationMessage::InvalidFragmentName {
                    module_name,
                    fragment_name,
                },
                fragment.name.location,
            )]);
        }
        Ok(())
    }
}

#[derive(Debug, Error, serde::Serialize)]
#[serde(tag = "type")]
pub enum ValidationMessage {
    #[error(
        "{pluralized_string} in graphql tags must start with the module name ('{module_name}') and end with '{operation_type_suffix}'. Got '{operation_name}' instead."
    )]
    InvalidOperationName {
        pluralized_string: String,
        module_name: String,
        operation_type_suffix: String,
        operation_name: String,
    },

    #[error(
        "Fragments in graphql tags must start with the module name ('{module_name}'). Got '{fragment_name}' instead."
    )]
    InvalidFragmentName {
        module_name: String,
        fragment_name: String,
    },
}
