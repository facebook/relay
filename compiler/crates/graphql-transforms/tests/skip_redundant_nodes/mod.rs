/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::SourceLocationKey;
use fixture_tests::Fixture;
use graphql_ir::{build, Program};
use graphql_syntax::parse_executable;
use graphql_text_printer::print_operation;
use graphql_transforms::{inline_fragments, skip_redundant_nodes};
use std::sync::Arc;
use test_schema::{get_test_schema, get_test_schema_with_extensions};

pub fn transform_fixture(fixture: &Fixture) -> Result<String, String> {
    let source_location = SourceLocationKey::standalone(fixture.file_name);
    let parts: Vec<_> = fixture.content.split("%extensions%").collect();
    let mut printed = if let [base, extensions] = parts.as_slice() {
        let ast = parse_executable(base, source_location).unwrap();
        let schema = get_test_schema_with_extensions(extensions);
        let ir = build(&schema, &ast.definitions).unwrap();
        let program = Program::from_definitions(Arc::clone(&schema), ir);
        let next_program = skip_redundant_nodes(&inline_fragments(&program));
        next_program
            .operations()
            .map(|def| print_operation(&schema, def))
            .collect::<Vec<_>>()
    } else {
        let schema = get_test_schema();
        let ast = parse_executable(fixture.content, source_location).unwrap();
        let ir = build(&schema, &ast.definitions).unwrap();
        let program = Program::from_definitions(Arc::clone(&schema), ir);
        let next_program = skip_redundant_nodes(&inline_fragments(&program));
        next_program
            .operations()
            .map(|def| print_operation(&schema, def))
            .collect::<Vec<_>>()
    };

    printed.sort();
    Ok(printed.join("\n\n"))
}
