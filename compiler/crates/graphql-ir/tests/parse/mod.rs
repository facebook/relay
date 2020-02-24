/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::FileKey;
use fixture_tests::Fixture;
use fnv::FnvHashMap;
use graphql_ir::build;
use graphql_syntax::parse;
use test_schema::TEST_SCHEMA;

pub fn transform_fixture(fixture: &Fixture) -> Result<String, String> {
    let file_key = FileKey::new(fixture.file_name);
    let ast = parse(fixture.content, file_key).unwrap();
    let mut sources = FnvHashMap::default();
    sources.insert(file_key, fixture.content);

    build(&TEST_SCHEMA, &ast.definitions)
        .map(|x| format!("{:#?}", x))
        .map_err(|errors| {
            errors
                .into_iter()
                .map(|error| error.print(&sources))
                .collect::<Vec<_>>()
                .join("\n\n")
        })
}
