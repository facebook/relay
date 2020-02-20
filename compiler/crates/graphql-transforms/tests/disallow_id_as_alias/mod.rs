/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use fixture_tests::Fixture;
use graphql_ir::{build, Program};
// use graphql_printer::{print_fragment, print_operation};
use fnv::FnvHashMap;
use graphql_syntax::parse;
use graphql_transforms::disallow_id_as_alias;
use test_schema::TEST_SCHEMA;

pub fn transform_fixture(fixture: &Fixture) -> Result<String, String> {
    let ast = parse(fixture.content, fixture.file_name).unwrap();
    let ir = build(&TEST_SCHEMA, &ast.definitions).unwrap();
    let program = Program::from_definitions(&TEST_SCHEMA, ir);
    let errors = disallow_id_as_alias(&program);

    let fake_sources = FnvHashMap::default();
    let messages: Vec<String> = errors
        .iter()
        .map(|error| error.print(&fake_sources))
        .collect::<Vec<_>>();

    Ok(messages.join("\n\n"))
}
