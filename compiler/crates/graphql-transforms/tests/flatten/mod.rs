/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::FileKey;
use fixture_tests::Fixture;
use graphql_ir::{build, Program};
use graphql_printer::{print_fragment, print_operation};
use graphql_syntax::parse;
use graphql_transforms::{flatten, sort_selections};
use test_schema::TEST_SCHEMA;

pub fn transform_fixture(fixture: &Fixture) -> Result<String, String> {
    let file_key = FileKey::new(fixture.file_name);
    let ast = parse(fixture.content, file_key).unwrap();
    let ir = build(&TEST_SCHEMA, &ast.definitions).unwrap();
    let context = Program::from_definitions(&TEST_SCHEMA, ir);
    let flatten_context = flatten(&context, true);
    let next_context = sort_selections(&flatten_context);

    assert_eq!(
        context.fragments().count(),
        next_context.fragments().count()
    );

    assert_eq!(
        context.operations().count(),
        next_context.operations().count()
    );

    let mut printed_queries = next_context
        .operations()
        .map(|def| print_operation(&TEST_SCHEMA, def))
        .collect::<Vec<_>>();

    let mut printed = next_context
        .fragments()
        .map(|def| print_fragment(&TEST_SCHEMA, def))
        .collect::<Vec<_>>();
    printed.append(&mut printed_queries);
    printed.sort();
    Ok(printed.join("\n\n"))
}
