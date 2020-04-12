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
use graphql_text_printer::print_operation;
use graphql_transforms::{inline_fragments, skip_redundant_nodes};
use test_schema::{test_schema_with_extensions, TEST_SCHEMA};

pub fn transform_fixture(fixture: &Fixture) -> Result<String, String> {
    let file_key = FileKey::new(fixture.file_name);
    let parts: Vec<_> = fixture.content.split("%extensions%").collect();
    let mut printed = if let [base, extensions] = parts.as_slice() {
        let ast = parse(base, file_key).unwrap();
        let schema = test_schema_with_extensions(extensions);
        let ir = build(&schema, &ast.definitions).unwrap();
        let program = Program::from_definitions(&schema, ir);
        let next_program = skip_redundant_nodes(&inline_fragments(&program));
        next_program
            .operations()
            .map(|def| print_operation(&schema, def))
            .collect::<Vec<_>>()
    } else {
        let ast = parse(fixture.content, file_key).unwrap();
        let ir = build(&TEST_SCHEMA, &ast.definitions).unwrap();
        let program = Program::from_definitions(&TEST_SCHEMA, ir);
        let next_program = skip_redundant_nodes(&inline_fragments(&program));
        next_program
            .operations()
            .map(|def| print_operation(&TEST_SCHEMA, def))
            .collect::<Vec<_>>()
    };

    printed.sort();
    Ok(printed.join("\n\n"))
}
