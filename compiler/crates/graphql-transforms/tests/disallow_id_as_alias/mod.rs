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
    let file_key = FileKey::new(fixture.file_name);
    let ast = parse(fixture.content, file_key).unwrap();
    let ir = build(&TEST_SCHEMA, &ast.definitions).unwrap();
    let program = Program::from_definitions(&TEST_SCHEMA, ir);
    let validation_result = disallow_id_as_alias(&program);

    let mut sources = FnvHashMap::default();
    sources.insert(FileKey::new(fixture.file_name), fixture.content);

    match validation_result {
        Ok(_) => Ok("OK".to_owned()),
        Err(errors) => {
            let mut errs = errors
                .into_iter()
                .map(|err| err.print(&sources))
                .collect::<Vec<_>>();
            errs.sort();
            Err(errs.join("\n\n"))
        }
    }
}
