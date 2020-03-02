/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::FileKey;
use fixture_tests::Fixture;
use graphql_ir::build;
use graphql_syntax::parse;
use relay_codegen::{print_fragment_deduped, print_operation_deduped};
use test_schema::TEST_SCHEMA;

pub fn transform_fixture(fixture: &Fixture) -> Result<String, String> {
    let ast = parse(fixture.content, FileKey::new(fixture.file_name)).unwrap();
    build(&TEST_SCHEMA, &ast.definitions)
        .map(|definitions| {
            definitions
                .iter()
                .map(|def| match def {
                    graphql_ir::ExecutableDefinition::Operation(operation) => format!(
                        "Operation:\n{}\n",
                        print_operation_deduped(&TEST_SCHEMA, operation)
                    ),
                    graphql_ir::ExecutableDefinition::Fragment(fragment) => format!(
                        "Fragment:\n{}\n",
                        print_fragment_deduped(&TEST_SCHEMA, fragment)
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
