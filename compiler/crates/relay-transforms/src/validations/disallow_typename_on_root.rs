/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::{Diagnostic, DiagnosticsResult};
use graphql_ir::{
    FragmentDefinition, OperationDefinition, Program, Selection, ValidationMessage, Validator,
};
use schema::Schema;

pub fn disallow_typename_on_root(program: &Program) -> DiagnosticsResult<()> {
    let mut validator = DisallowTypenameOnRoot::new(program);
    validator.validate_program(program)
}

struct DisallowTypenameOnRoot<'program> {
    program: &'program Program,
}

impl<'program> DisallowTypenameOnRoot<'program> {
    fn new(program: &'program Program) -> Self {
        Self { program }
    }
}

impl Validator for DisallowTypenameOnRoot<'_> {
    const NAME: &'static str = "disallow_typename_on_root";
    const VALIDATE_ARGUMENTS: bool = false;
    const VALIDATE_DIRECTIVES: bool = false;

    fn validate_operation(&mut self, operation: &OperationDefinition) -> DiagnosticsResult<()> {
        let typename_selection = operation.selections.iter().find_map(|sel| {
            if let Selection::ScalarField(field) = sel {
                if field.definition.item == self.program.schema.typename_field() {
                    Some(field)
                } else {
                    None
                }
            } else {
                None
            }
        });
        if let Some(typename_selection) = typename_selection {
            Err(vec![Diagnostic::error(
                ValidationMessage::DisallowTypenameOnRoot(),
                typename_selection.definition.location,
            )])
        } else {
            Ok(())
        }
    }

    fn validate_fragment(&mut self, _: &FragmentDefinition) -> DiagnosticsResult<()> {
        Ok(())
    }
}
