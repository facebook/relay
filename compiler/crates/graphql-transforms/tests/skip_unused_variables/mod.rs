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
use graphql_text_printer::{print_fragment, print_operation};
use graphql_transforms::skip_unused_variables;
use std::sync::Arc;
use test_schema::get_test_schema;

pub fn transform_fixture(fixture: &Fixture) -> Result<String, String> {
    let file_key = FileKey::new(fixture.file_name);
    let schema = get_test_schema();
    let ast = parse(fixture.content, file_key).unwrap();
    let ir = build(&schema, &ast.definitions).unwrap();
    let program = Program::from_definitions(Arc::clone(&schema), ir);

    let next_program = skip_unused_variables(&program);

    let mut printed = next_program
        .operations()
        .map(|def| print_operation(&schema, def))
        .chain(
            next_program
                .fragments()
                .map(|def| print_fragment(&schema, def)),
        )
        .collect::<Vec<_>>();
    printed.sort();

    Ok(printed.join("\n\n"))
}
