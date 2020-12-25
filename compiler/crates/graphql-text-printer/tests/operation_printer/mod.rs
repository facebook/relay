/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::SourceLocationKey;
use fixture_tests::Fixture;
use graphql_ir::{build, ExecutableDefinition, Program};
use graphql_syntax::parse_executable;
use graphql_text_printer::print_full_operation;
use relay_test_schema::TEST_SCHEMA;
use std::sync::Arc;

pub fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let source_location = SourceLocationKey::standalone(fixture.file_name);
    let ast = parse_executable(fixture.content, source_location).unwrap();
    let ir = build(&TEST_SCHEMA, &ast.definitions).unwrap();
    let program = Program::from_definitions(Arc::clone(&TEST_SCHEMA), ir);

    build(&TEST_SCHEMA, &ast.definitions)
        .map(|definitions| {
            definitions
                .into_iter()
                .filter_map(|definition| {
                    if let ExecutableDefinition::Operation(operation) = definition {
                        Some(print_full_operation(&program, &operation))
                    } else {
                        None
                    }
                })
                .collect::<Vec<String>>()
                .join("\n\n\n\n")
        })
        .map_err(|errors| {
            errors
                .into_iter()
                .map(|error| format!("{:?}", error))
                .collect::<Vec<_>>()
                .join("\n\n")
        })
}
