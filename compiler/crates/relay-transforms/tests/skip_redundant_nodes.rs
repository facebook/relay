/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::SourceLocationKey;
use fixture_tests::Fixture;
use graphql_ir::Program;
use graphql_ir::build;
use graphql_syntax::parse_executable;
use graphql_text_printer::PrinterOptions;
use graphql_text_printer::print_operation;
use relay_config::DeferStreamInterface;
use relay_test_schema::get_test_schema;
use relay_test_schema::get_test_schema_with_extensions;
use relay_transforms::inline_fragments;
use relay_transforms::skip_redundant_nodes;

pub async fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let source_location = SourceLocationKey::standalone(fixture.file_name);
    let parts: Vec<_> = fixture.content.split("%extensions%").collect();
    let printer_options = PrinterOptions {
        debug_directive_data: true,
        ..Default::default()
    };
    let defer_stream_interface = DeferStreamInterface::default();
    let mut printed = if let [base, extensions] = parts.as_slice() {
        let ast = parse_executable(base, source_location).unwrap();
        let schema = get_test_schema_with_extensions(extensions);
        let ir = build(&schema, &ast.definitions).unwrap();
        let program = Program::from_definitions(Arc::clone(&schema), ir);
        let next_program =
            skip_redundant_nodes(&inline_fragments(&program), defer_stream_interface);
        next_program
            .operations()
            .map(|def| print_operation(&schema, def, printer_options.clone()))
            .collect::<Vec<_>>()
    } else {
        let schema = get_test_schema();
        let ast = parse_executable(fixture.content, source_location).unwrap();
        let ir = build(&schema, &ast.definitions).unwrap();
        let program = Program::from_definitions(Arc::clone(&schema), ir);
        let next_program =
            skip_redundant_nodes(&inline_fragments(&program), defer_stream_interface);
        next_program
            .operations()
            .map(|def| print_operation(&schema, def, printer_options.clone()))
            .collect::<Vec<_>>()
    };

    printed.sort();
    Ok(printed.join("\n\n"))
}
