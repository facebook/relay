/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::SourceLocationKey;
use fixture_tests::Fixture;
use graphql_ir::build;
use graphql_syntax::parse_executable;
use relay_codegen::{JsModuleFormat, Printer};
use relay_test_schema::TEST_SCHEMA;

pub fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let mut printer = Printer::with_dedupe(JsModuleFormat::Haste);
    let ast = parse_executable(
        fixture.content,
        SourceLocationKey::standalone(fixture.file_name),
    )
    .unwrap();
    build(&TEST_SCHEMA, &ast.definitions)
        .map(|definitions| {
            definitions
                .iter()
                .map(|def| match def {
                    graphql_ir::ExecutableDefinition::Operation(operation) => format!(
                        "Operation:\n{}\n",
                        printer.print_operation(&TEST_SCHEMA, operation)
                    ),
                    graphql_ir::ExecutableDefinition::Fragment(fragment) => format!(
                        "Fragment:\n{}\n",
                        printer.print_fragment(&TEST_SCHEMA, fragment)
                    ),
                })
                .collect::<Vec<_>>()
                .join("\n\n")
        })
        .map_err(|errors| {
            errors
                .into_iter()
                .map(|error| format!("{:?}", error))
                .collect::<Vec<_>>()
                .join("\n\n")
        })
}
