/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use ::intern::intern;
use common::DirectiveName;
use common::NamedItem;
use graphql_ir::FragmentDefinition;
use graphql_ir::OperationDefinition;
use graphql_ir::Program;
use graphql_ir::Transformed;
use graphql_ir::Transformer;
use graphql_text_printer::PrinterOptions;
use graphql_text_printer::print_fragment;
use graphql_text_printer::print_operation;
use schema::SDLSchema;

/// A transform for debugging purpose only. Insert it to `apply_transforms`, and
/// annotate the fragment or operation with `@__debug` to print the graphql text.
pub fn debug_transform(program: &Program) {
    let mut transform = DebugTransform {
        schema: Arc::clone(&program.schema),
    };
    transform.transform_program(program);
}

struct DebugTransform {
    schema: Arc<SDLSchema>,
}

const PRINTER_OPTIONS: PrinterOptions = PrinterOptions {
    compact: false,
    sort_keys: true,
    json_format: false,
    debug_directive_data: false,
};

impl Transformer<'_> for DebugTransform {
    const NAME: &'static str = "DebugTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_operation(
        &mut self,
        operation: &OperationDefinition,
    ) -> Transformed<OperationDefinition> {
        if operation
            .directives
            .named(DirectiveName(intern!("__debug")))
            .is_some()
        {
            let output = print_operation(&self.schema, operation, PRINTER_OPTIONS);
            println!("{output}");
        }
        Transformed::Keep
    }

    fn transform_fragment(
        &mut self,
        fragment: &FragmentDefinition,
    ) -> Transformed<FragmentDefinition> {
        if fragment
            .directives
            .named(DirectiveName(intern!("__debug")))
            .is_some()
        {
            let output = print_fragment(&self.schema, fragment, PRINTER_OPTIONS);
            println!("{output}");
        }
        Transformed::Keep
    }
}
