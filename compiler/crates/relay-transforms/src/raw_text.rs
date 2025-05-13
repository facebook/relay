use common::{DiagnosticsResult, NamedItem};
use graphql_ir::{OperationDefinition, Program, Transformed, Transformer};
use graphql_text_printer::{OperationPrinter, PrinterOptions};

use crate::test_operation_metadata::TEST_OPERATION_DIRECTIVE;

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
            let options = PrinterOptions::default();

            let mut printer = OperationPrinter::new(self.program, options);
            let raw_text = printer.print(operation);

            Transformed::Replace(OperationDefinition {
                raw_text: Some(raw_text),
                ..operation.clone()
            })
        } else {
            Transformed::Keep
        }
    }
}
