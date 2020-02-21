/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::FileKey;
use fixture_tests::Fixture;
use fnv::FnvHashMap;
use graphql_ir::{build, Program};
use graphql_syntax::parse;
use graphql_transforms::disallow_id_as_alias;
use test_schema::TEST_SCHEMA;

pub fn transform_fixture(fixture: &Fixture) -> Result<String, String> {
    let ast = parse(fixture.content, fixture.file_name).unwrap();
    let ir = build(&TEST_SCHEMA, &ast.definitions).unwrap();
    let program = Program::from_definitions(&TEST_SCHEMA, ir);
    let errors = disallow_id_as_alias(&program);

    let mut sources = FnvHashMap::default();
    sources.insert(FileKey::new(fixture.file_name), fixture.content);
    let messages: Vec<String> = errors
        .iter()
        .map(|error| error.print(&sources))
        .collect::<Vec<_>>();

    Ok(messages.join("\n\n"))
}
