/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::FileKey;
use fixture_tests::Fixture;
use graphql_ir::{build, ExecutableDefinition, Program};
use graphql_syntax::parse;
use graphql_transforms::{client_extensions, sort_selections};
use relay_codegen::print_json;
use test_schema::test_schema_with_extensions;

pub fn transform_fixture(fixture: &Fixture) -> Result<String, String> {
    let parts: Vec<_> = fixture.content.split("%extensions%").collect();
    if let [base, extensions] = parts.as_slice() {
        let ast = parse(base, FileKey::new(fixture.file_name)).unwrap();
        let schema = test_schema_with_extensions(extensions);
        let ir = build(&schema, &ast.definitions).unwrap();
        let program = Program::from_definitions(&schema, ir);
        let next_program = sort_selections(&client_extensions(&program));
        let mut result = next_program
            .fragments()
            .map(|def| {
                print_json(
                    &schema,
                    &ExecutableDefinition::Fragment(def.as_ref().clone()),
                )
            })
            .chain(next_program.operations().map(|def| {
                print_json(
                    &schema,
                    &ExecutableDefinition::Operation(def.as_ref().clone()),
                )
            }))
            .collect::<Vec<_>>();
        result.sort_unstable();
        Ok(result.join("\n\n"))
    } else {
        panic!("Expected exactly one %extensions% section marker.")
    }
}
