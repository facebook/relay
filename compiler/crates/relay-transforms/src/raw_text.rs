use common::{ArgumentName, DiagnosticsResult, DirectiveName, Location, NamedItem, WithLocation};
use graphql_ir::{
    Argument, ConstantValue, Directive, OperationDefinition, Program, Transformed, Transformer,
    Value,
};
use graphql_text_printer::{OperationPrinter, PrinterOptions};
use intern::string_key::Intern;
use lazy_static::lazy_static;

use crate::test_operation_metadata::TEST_OPERATION_DIRECTIVE;

lazy_static! {
    pub static ref RAW_TEXT_DIRECTIVE_NAME: DirectiveName = DirectiveName("rawText".intern());
    pub static ref RAW_TEXT_ARGUMENT_KEY: ArgumentName = ArgumentName("rawText".intern());
}

struct RawTextTransform<'program> {
    program: &'program Program,
}

impl<'program> RawTextTransform<'program> {
    fn new(program: &'program Program) -> Self {
        Self { program }
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
            .is_some()
        {
            let options = PrinterOptions {
                compact: true,
                json_format: true,
                ..Default::default()
            };

            let mut printer = OperationPrinter::new(self.program, options);
            let raw_text = printer.print(operation);

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
            name: WithLocation::generated(*RAW_TEXT_ARGUMENT_KEY),
            value: WithLocation::generated(Value::Constant(ConstantValue::String(
                raw_text.intern(),
            ))),
        }],
        data: None,
        location: Location::generated(),
    }
}

pub fn get_raw_text_value(operation: &OperationDefinition) -> Option<String> {
    match operation
        .directives
        .named(*RAW_TEXT_DIRECTIVE_NAME)
        .and_then(|directive| directive.arguments.named(*RAW_TEXT_ARGUMENT_KEY))
    {
        Some(argument) => match argument.value.item.clone() {
            Value::Constant(constant_value) => match constant_value {
                ConstantValue::String(string_key) => Some(string_key.to_string()),
                _ => None,
            },
            _ => None,
        },
        None => None,
    }
}
