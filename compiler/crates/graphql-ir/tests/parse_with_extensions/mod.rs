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
use test_schema::test_schema_with_extensions;

pub fn transform_fixture(fixture: &Fixture) -> Result<String, String> {
    let mut sources = FnvHashMap::default();
    sources.insert(FileKey::new(fixture.file_name), fixture.content);

    let parts: Vec<_> = fixture.content.split("%extensions%").collect();
    if let [base, extensions] = parts.as_slice() {
        let file_key = FileKey::new(fixture.file_name);
        let ast = parse(base, file_key).unwrap();
        let schema = test_schema_with_extensions(extensions);
        build(&schema, &ast.definitions)
            .map(|x| format!("{:#?}", x))
            .map_err(|errors| {
                errors
                    .into_iter()
                    .map(|error| error.print(&sources))
                    .collect::<Vec<_>>()
                    .join("\n\n")
            })
    } else {
        panic!("Expected exactly one %extensions% section marker.")
    }
}
