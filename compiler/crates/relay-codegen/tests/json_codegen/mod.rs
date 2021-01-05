/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::SourceLocationKey;
use fixture_tests::Fixture;
use graphql_ir::{build, ExecutableDefinition};
use graphql_syntax::parse_executable;
use relay_codegen::{print_fragment, print_operation};
use relay_test_schema::TEST_SCHEMA;
use relay_transforms::DeferStreamInterface;

pub fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let ast = parse_executable(
        fixture.content,
        SourceLocationKey::standalone(fixture.file_name),
    )
    .unwrap();
    let defer_stream_interface = DeferStreamInterface::default();
    build(&TEST_SCHEMA, &ast.definitions)
        .map(|definitions| {
            definitions
                .iter()
                .map(|def| match def {
                    ExecutableDefinition::Operation(operation) => {
                        print_operation(&TEST_SCHEMA, operation, &defer_stream_interface)
                    }
                    ExecutableDefinition::Fragment(fragment) => {
                        print_fragment(&TEST_SCHEMA, fragment, &defer_stream_interface)
                    }
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
