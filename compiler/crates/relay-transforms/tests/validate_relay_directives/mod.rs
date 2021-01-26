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
use graphql_test_helpers::diagnostics_to_sorted_string;
use relay_test_schema::get_test_schema;
use relay_transforms::validate_relay_directives;

pub fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let source_location = SourceLocationKey::standalone(fixture.file_name);

    let schema = get_test_schema();
    let ast = parse_executable(fixture.content, source_location).unwrap();
    let ir = build(&schema, &ast.definitions)
        .map_err(|diagnostics| diagnostics_to_sorted_string(fixture.content, &diagnostics))?;

    let program = Program::from_definitions(schema, ir);
    validate_relay_directives(&program)
        .map_err(|diagnostics| diagnostics_to_sorted_string(fixture.content, &diagnostics))?;

    Ok("OK".to_owned())
}
