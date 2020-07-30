/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::SourceLocationKey;
use fixture_tests::Fixture;
use fnv::FnvHashMap;
use graphql_ir::{build, Program};
use graphql_syntax::parse;
use graphql_transforms::{validate_connections, ConnectionInterface};
use std::sync::Arc;
use test_schema::get_test_schema_with_extensions;

pub fn transform_fixture(fixture: &Fixture) -> Result<String, String> {
    let parts: Vec<_> = fixture.content.split("%extensions%").collect();

    if let [base, extensions] = parts.as_slice() {
        let source_location = SourceLocationKey::standalone(fixture.file_name);
        let ast = parse(base, source_location).unwrap();
        let schema = get_test_schema_with_extensions(extensions);
        let mut sources = FnvHashMap::default();
        sources.insert(source_location, fixture.content);

        let ir = build(&schema, &ast.definitions).unwrap();
        let program = Program::from_definitions(Arc::clone(&schema), ir);
        let result = validate_connections(&program, &ConnectionInterface::default());

        match result {
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
    } else {
        panic!("Expected exactly one %extensions% section marker.")
    }
}
