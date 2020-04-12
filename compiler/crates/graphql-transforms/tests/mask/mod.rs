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
use graphql_text_printer::print_fragment;
use graphql_transforms::mask;
use test_schema::TEST_SCHEMA;

pub fn transform_fixture(fixture: &Fixture) -> Result<String, String> {
    let file_key = FileKey::new(fixture.file_name);
    let ast = parse(fixture.content, file_key).unwrap();
    let ir = build(&TEST_SCHEMA, &ast.definitions).unwrap();
    let program = Program::from_definitions(&TEST_SCHEMA, ir);
    let next_program = &mask(&program);

    assert_eq!(
        next_program.fragments().count(),
        program.fragments().count()
    );
    let mut printed = next_program
        .fragments()
        .map(|def| {
            format!(
                "{}\n{:#?}",
                print_fragment(&TEST_SCHEMA, def),
                def.used_global_variables
            )
        })
        .collect::<Vec<_>>();
    printed.sort();

    Ok(printed.join("\n\n"))
}
