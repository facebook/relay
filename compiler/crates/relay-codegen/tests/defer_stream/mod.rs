/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::FileKey;
use fixture_tests::Fixture;
use graphql_ir::{build, Program};
use graphql_syntax::parse;
use graphql_transforms::{sort_selections, transform_defer_stream};
use relay_codegen::{print_fragment, print_operation};
use test_schema::TEST_SCHEMA;

pub fn transform_fixture(fixture: &Fixture) -> Result<String, String> {
    let ast = parse(fixture.content, FileKey::new(fixture.file_name)).unwrap();
    let ir = build(&TEST_SCHEMA, &ast.definitions).unwrap();
    let program = Program::from_definitions(&TEST_SCHEMA, ir);
    let next_program = sort_selections(&transform_defer_stream(&program).unwrap());
    let mut result = next_program
        .fragments()
        .map(|def| print_fragment(&TEST_SCHEMA, &def))
        .chain(
            next_program
                .operations()
                .map(|def| print_operation(&TEST_SCHEMA, &def)),
        )
        .collect::<Vec<_>>();
    result.sort_unstable();
    Ok(result.join("\n\n"))
}
