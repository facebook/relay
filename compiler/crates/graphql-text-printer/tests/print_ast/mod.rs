/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::SourceLocationKey;
use fixture_tests::Fixture;
use graphql_syntax::parse;
use graphql_text_printer::print_exectutable_definition_ast;

pub fn transform_fixture(fixture: &Fixture) -> Result<String, String> {
    let source_location = SourceLocationKey::standalone(fixture.file_name);
    let ast = parse(fixture.content, source_location).unwrap();

    Ok(ast
        .definitions
        .iter()
        .map(|definition| print_exectutable_definition_ast(&definition))
        .collect::<Vec<String>>()
        .join("\n"))
}
