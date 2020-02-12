/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use fixture_tests::Fixture;
use graphql_ir::build;
use graphql_printer::print_fragment;
use graphql_syntax::parse;
use graphql_transforms::{sort_selections, CompilerContext};
use test_schema::TEST_SCHEMA;

pub fn transform_fixture(fixture: &Fixture) -> Result<String, String> {
    let ast = parse(fixture.content, fixture.file_name).unwrap();
    let ir = build(&TEST_SCHEMA, ast.definitions).unwrap();
    let context = CompilerContext::from_definitions(&TEST_SCHEMA, ir);
    let next_context = sort_selections(&context);

    assert_eq!(
        next_context.fragments().count(),
        context.fragments().count()
    );
    let mut printed = next_context
        .fragments()
        .map(|def| print_fragment(&TEST_SCHEMA, def))
        .collect::<Vec<_>>();
    printed.sort();
    Ok(printed.join("\n\n"))
}
