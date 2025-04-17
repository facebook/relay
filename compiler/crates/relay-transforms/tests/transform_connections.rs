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
use graphql_test_helpers::diagnostics_to_sorted_string;
use graphql_text_printer::PrinterOptions;
use graphql_text_printer::print_fragment;
use graphql_text_printer::print_operation;
use relay_config::DeferStreamInterface;
use relay_test_schema::get_test_schema;
use relay_transforms::ConnectionInterface;
use relay_transforms::transform_connections;
use relay_transforms::validate_connections;

pub async fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let source_location = SourceLocationKey::standalone(fixture.file_name);

    let schema = get_test_schema();

    let ast = parse_executable(fixture.content, source_location).unwrap();
    let ir = build(&schema, &ast.definitions)
        .map_err(|diagnostics| diagnostics_to_sorted_string(fixture.content, &diagnostics))?;

    let program = Program::from_definitions(Arc::clone(&schema), ir);

    let connection_interface = ConnectionInterface::default();
    let defer_stream_interface = DeferStreamInterface::default();

    validate_connections(&program, &connection_interface)
        .map_err(|diagnostics| diagnostics_to_sorted_string(fixture.content, &diagnostics))?;

    let next_program = transform_connections(
        &program,
        &connection_interface,
        &defer_stream_interface,
        false,
    );

    let printer_options = PrinterOptions {
        debug_directive_data: true,
        ..Default::default()
    };
    let mut printed = next_program
        .operations()
        .map(|def| print_operation(&schema, def, printer_options.clone()))
        .chain(
            next_program
                .fragments()
                .map(|def| print_fragment(&schema, def, printer_options.clone())),
        )
        .collect::<Vec<_>>();
    printed.sort();
    Ok(printed.join("\n\n"))
}
