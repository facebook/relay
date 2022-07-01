/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::Diagnostic;
use common::DiagnosticsResult;
use graphql_ir::FragmentDefinition;
use graphql_ir::OperationDefinition;
use graphql_ir::Program;
use graphql_ir::Selection;
use graphql_ir::ValidationMessage;
use graphql_ir::Validator;
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

    fn validate_query_selections(&mut self, selections: &[Selection]) -> DiagnosticsResult<()> {
        let typename_selection = selections.iter().find_map(|sel| {
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
}

impl Validator for DisallowTypenameOnRoot<'_> {
    const NAME: &'static str = "disallow_typename_on_root";
    const VALIDATE_ARGUMENTS: bool = false;
    const VALIDATE_DIRECTIVES: bool = false;

    fn validate_operation(&mut self, operation: &OperationDefinition) -> DiagnosticsResult<()> {
        self.validate_query_selections(&operation.selections)
    }

    fn validate_fragment(&mut self, fragment: &FragmentDefinition) -> DiagnosticsResult<()> {
        if self.program.schema.query_type() == Some(fragment.type_condition) {
            self.validate_query_selections(&fragment.selections)?
        }
        Ok(())
    }
}
