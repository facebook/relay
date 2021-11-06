/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::SourceLocationKey;
use fixture_tests::Fixture;
use graphql_ir::{build, Program};
use graphql_syntax::parse_executable;
use graphql_text_printer::{print_operation, PrinterOptions};
use relay_test_schema::{get_test_schema, get_test_schema_with_extensions};
use relay_transforms::{inline_fragments, skip_redundant_nodes};
use std::sync::Arc;

pub fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let source_location = SourceLocationKey::standalone(fixture.file_name);
    let parts: Vec<_> = fixture.content.split("%extensions%").collect();
    let printer_options = PrinterOptions {
        debug_directive_data: true,
        ..Default::default()
    };
    let mut printed = if let [base, extensions] = parts.as_slice() {
        let ast = parse_executable(base, source_location).unwrap();
        let schema = get_test_schema_with_extensions(extensions);
        let ir = build(&schema, &ast.definitions).unwrap();
        let program = Program::from_definitions(Arc::clone(&schema), ir);
        let next_program = skip_redundant_nodes(&inline_fragments(&program));
        next_program
            .operations()
            .map(|def| print_operation(&schema, def, printer_options.clone()))
            .collect::<Vec<_>>()
    } else {
        let schema = get_test_schema();
        let ast = parse_executable(fixture.content, source_location).unwrap();
        let ir = build(&schema, &ast.definitions).unwrap();
        let program = Program::from_definitions(Arc::clone(&schema), ir);
        let next_program = skip_redundant_nodes(&inline_fragments(&program));
        next_program
            .operations()
            .map(|def| print_operation(&schema, def, printer_options.clone()))
            .collect::<Vec<_>>()
    };

    printed.sort();
    Ok(printed.join("\n\n"))
}
