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
use graphql_transforms::client_extensions;
use test_schema::test_schema_with_extensions;

pub fn transform_fixture(fixture: &Fixture) -> Result<String, String> {
    let parts: Vec<_> = fixture.content.split("%extensions%").collect();
    if let [base, extensions] = parts.as_slice() {
        let file_key = FileKey::new(fixture.file_name);
        let ast = parse(base, file_key).unwrap();
        let schema = test_schema_with_extensions(extensions);
        let ir = build(&schema, &ast.definitions).unwrap();
        let program = Program::from_definitions(&schema, ir);
        let next_program = client_extensions(&program);

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
    } else {
        panic!("Expected exactly one %extensions% section marker.")
    }
}
