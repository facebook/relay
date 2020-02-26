/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::FileKey;
use fixture_tests::Fixture;
use graphql_ir::{build, ExecutableDefinition, Program};
use graphql_syntax::parse;
use graphql_text_printer::OperationPrinter;
use test_schema::TEST_SCHEMA;

pub fn transform_fixture(fixture: &Fixture) -> Result<String, String> {
    let file_key = FileKey::new(fixture.file_name);
    let ast = parse(fixture.content, file_key).unwrap();
    let ir = build(&TEST_SCHEMA, &ast.definitions).unwrap();
    let program = Program::from_definitions(&TEST_SCHEMA, ir);
    let mut printer = OperationPrinter::new(&program);

    build(&TEST_SCHEMA, &ast.definitions)
        .map(|definitions| {
            definitions
                .into_iter()
                .filter_map(|definition| {
                    if let ExecutableDefinition::Operation(definitions) = definition {
                        Some(printer.print(&definitions))
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
