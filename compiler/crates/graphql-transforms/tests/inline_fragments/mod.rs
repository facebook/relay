/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::FileKey;
use fixture_tests::Fixture;
use graphql_ir::{build, Program};
use graphql_printer::print_operation;
use graphql_syntax::parse;
use graphql_transforms::inline_fragments;
use test_schema::TEST_SCHEMA;

pub fn transform_fixture(fixture: &Fixture) -> Result<String, String> {
    let file_key = FileKey::new(fixture.file_name);
    let ast = parse(fixture.content, file_key).unwrap();
    let ir = build(&TEST_SCHEMA, &ast.definitions).unwrap();
    let program = Program::from_definitions(&TEST_SCHEMA, ir);

    let next_program = inline_fragments(&program);

    assert_eq!(next_program.fragments().count(), 0);
    assert_eq!(
        next_program.operations().count(),
        program.operations().count()
    );

    let mut printed = next_program
        .operations()
        .map(|def| print_operation(&TEST_SCHEMA, def))
        .collect::<Vec<_>>();
    printed.sort();
    Ok(printed.join("\n\n"))
}
