/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::SourceLocationKey;
use fixture_tests::Fixture;
use fnv::FnvHashMap;
use graphql_ir::build;
use graphql_syntax::parse_executable;
use test_schema::TEST_SCHEMA;

pub fn transform_fixture(fixture: &Fixture) -> Result<String, String> {
    let source_location = SourceLocationKey::standalone(fixture.file_name);
    let ast = parse_executable(fixture.content, source_location).unwrap();
    let mut sources = FnvHashMap::default();
    sources.insert(source_location, fixture.content);

    build(&TEST_SCHEMA, &ast.definitions)
        .map(|x| format!("{:#?}", x))
        .map_err(|errors| {
            errors
                .into_iter()
                .map(|error| error.print_with_sources(&sources))
                .collect::<Vec<_>>()
                .join("\n\n")
        })
}
