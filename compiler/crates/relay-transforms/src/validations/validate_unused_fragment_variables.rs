/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::{Diagnostic, DiagnosticsResult, NamedItem};
use fnv::FnvHashSet;
use graphql_ir::{
    FragmentDefinition, OperationDefinition, Program, ValidationMessage, Validator, Variable,
    UNUSED_LOCAL_VARIABLE_DEPRECATED,
};
use intern::string_key::StringKey;

/// Validates that there are no unused fragment variables on fragments.
///
/// Fragment variables are allowed (actually required) to be unused when
/// marked as `unusedLocalVariable_DEPRECATED`.
pub fn validate_unused_fragment_variables(program: &Program) -> DiagnosticsResult<()> {
    ValidateUnusedFragmentVariables::default().validate_program(program)
}

#[derive(Default)]
pub struct ValidateUnusedFragmentVariables {
    used_variables: FnvHashSet<StringKey>,
}

impl Validator for ValidateUnusedFragmentVariables {
    const NAME: &'static str = "ValidateUnusedFragmentVariables";
    const VALIDATE_ARGUMENTS: bool = true;
    const VALIDATE_DIRECTIVES: bool = true;

    fn validate_operation(&mut self, _: &OperationDefinition) -> DiagnosticsResult<()> {
        Ok(())
    }

    fn validate_fragment(&mut self, fragment: &FragmentDefinition) -> DiagnosticsResult<()> {
        self.used_variables.clear();

        self.validate_selections(&fragment.selections)?;

        let diagnostics: Vec<_> = fragment
            .variable_definitions
            .iter()
            .filter_map(|variable_definition| {
                let actually_unused = !self.used_variables.contains(&variable_definition.name.item);
                let expect_unused_directive = variable_definition
                    .directives
                    .named(*UNUSED_LOCAL_VARIABLE_DEPRECATED);
                if expect_unused_directive.is_some() == actually_unused {
                    None
                } else if let Some(expect_unused_directive) = expect_unused_directive {
                    Some(Diagnostic::error(
                        ValidationMessage::UselessUnusedFragmentVariableAnnotation {
                            fragment_name: fragment.name.item,
                            variable_name: variable_definition.name.item,
                        },
                        expect_unused_directive.name.location,
                    ))
                } else {
                    Some(Diagnostic::error(
                        ValidationMessage::UnusedFragmentVariable {
                            fragment_name: fragment.name.item,
                            variable_name: variable_definition.name.item,
                        },
                        variable_definition.name.location,
                    ))
                }
            })
            .collect();
        if !diagnostics.is_empty() {
            return Err(diagnostics);
        }
        Ok(())
    }

    fn validate_variable(&mut self, value: &Variable) -> DiagnosticsResult<()> {
        self.used_variables.insert(value.name.item);
        Ok(())
    }
}
