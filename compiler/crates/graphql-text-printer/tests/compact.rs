/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::SourceLocationKey;
use fixture_tests::Fixture;
use graphql_ir::ExecutableDefinition;
use graphql_ir::Program;
use graphql_ir::build;
use graphql_ir::node_identifier::LocationAgnosticPartialEq;
use graphql_syntax::parse_executable;
use graphql_text_printer::PrinterOptions;
use graphql_text_printer::print_full_operation;
use relay_test_schema::TEST_SCHEMA;
use relay_transforms::RelayLocationAgnosticBehavior;

pub async fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let source_location = SourceLocationKey::standalone(fixture.file_name);
    let initial_ast = parse_executable(fixture.content, source_location).unwrap();
    let initial_ir = build(&TEST_SCHEMA, &initial_ast.definitions).unwrap();
    let initial_ir_copy = initial_ir.clone();
    let program = Program::from_definitions(Arc::clone(&TEST_SCHEMA), initial_ir.clone());
    let options = PrinterOptions {
        compact: true,
        ..Default::default()
    };

    // Print the IR into a GraphQL string for the fixture
    let output = initial_ir
        .into_iter()
        .filter_map(|definition| match definition {
            ExecutableDefinition::Operation(operation) => Some(operation),
            _ => None,
        })
        .map(|operation| print_full_operation(&program, &operation, options))
        .collect::<Vec<String>>()
        .join("\n\n");

    // Roundtrip the output back into an IR
    let roundtrip_ast = parse_executable(output.as_str(), SourceLocationKey::Generated).unwrap();
    let roundtrip_ir = build(&TEST_SCHEMA, &roundtrip_ast.definitions).unwrap();

    // Check the roundtripped IR matches the initial IR to ensure we printed a valid schema
    assert!(roundtrip_ir.location_agnostic_eq::<RelayLocationAgnosticBehavior>(&initial_ir_copy));

    Ok(output)
}
