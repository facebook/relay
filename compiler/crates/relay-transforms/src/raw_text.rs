/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use ::intern::string_key::Intern;
use common::ArgumentName;
use common::DiagnosticsResult;
use common::DirectiveName;
use common::Location;
use common::NamedItem;
use common::WithLocation;
use graphql_ir::Argument;
use graphql_ir::ConstantValue;
use graphql_ir::Directive;
use graphql_ir::OperationDefinition;
use graphql_ir::Program;
use graphql_ir::Transformed;
use graphql_ir::Transformer;
use graphql_ir::Value;
use graphql_text_printer::OperationPrinter;
use intern::intern;
use lazy_static::lazy_static;

use crate::test_operation_metadata::EMIT_RAW_TEXT_ARG;
use crate::test_operation_metadata::TEST_OPERATION_DIRECTIVE;

lazy_static! {
    pub static ref RAW_TEXT_DIRECTIVE_NAME: DirectiveName = DirectiveName(intern!("rawText"));
}

struct RawTextTransform<'program> {
    printer: OperationPrinter<'program>,
}

impl<'program> RawTextTransform<'program> {
    fn new(program: &'program Program) -> Self {
        Self {
            printer: OperationPrinter::new(program, Default::default()),
        }
    }
}

pub fn set_raw_text(program: &Program) -> DiagnosticsResult<Program> {
    let mut transform = RawTextTransform::new(program);
    let next_program = transform
        .transform_program(program)
        .replace_or_else(|| program.clone());
    Ok(next_program)
}

impl Transformer<'_> for RawTextTransform<'_> {
    const NAME: &'static str = "RawTextTransform";

    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_operation(
        &mut self,
        operation: &OperationDefinition,
    ) -> Transformed<OperationDefinition> {
        if operation
            .directives
            .named(*TEST_OPERATION_DIRECTIVE)
            .and_then(|directive| directive.arguments.named(*EMIT_RAW_TEXT_ARG))
            .is_some()
        {
            let raw_text = self.printer.print(operation);

            let mut next_directives = operation.directives.clone();
            next_directives.push(create_raw_text_directive(&raw_text));
            Transformed::Replace(OperationDefinition {
                directives: next_directives,
                ..operation.clone()
            })
        } else {
            Transformed::Keep
        }
    }
}

pub fn create_raw_text_directive(raw_text: &String) -> Directive {
    Directive {
        name: WithLocation::generated(*RAW_TEXT_DIRECTIVE_NAME),
        arguments: vec![Argument {
            name: WithLocation::generated(ArgumentName(intern!("rawText"))),
            value: WithLocation::generated(Value::Constant(ConstantValue::String(
                raw_text.intern(),
            ))),
        }],
        data: None,
        location: Location::generated(),
    }
}

pub fn get_raw_text_value(op: &OperationDefinition) -> Option<String> {
    op.directives
        .named(*RAW_TEXT_DIRECTIVE_NAME)
        .and_then(|dir| dir.arguments.named(ArgumentName(intern!("rawText"))))
        .and_then(|arg| match &arg.value.item {
            Value::Constant(ConstantValue::String(s)) => Some(s.to_string()),
            _ => None,
        })
}
