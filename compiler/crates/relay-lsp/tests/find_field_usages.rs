/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::SourceLocationKey;
use fixture_tests::Fixture;
use graphql_ir::Program;
use graphql_ir::build;
use graphql_ir::reexport::Intern;
use graphql_syntax::parse_executable;
use relay_lsp::find_field_usages;
use relay_test_schema::get_test_schema;

pub async fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let parts: Vec<_> = fixture.content.split("%arguments%").collect();
    if let [document, arguments] = parts.as_slice() {
        if let [type_name, field_name] = arguments
            .split_ascii_whitespace()
            .collect::<Vec<&str>>()
            .as_slice()
        {
            let source_location = SourceLocationKey::standalone(fixture.file_name);
            let schema = get_test_schema();
            let ast = parse_executable(document, source_location).unwrap();
            let ir = build(&schema, &ast.definitions).unwrap();
            let program = Program::from_definitions(schema, ir);

            let result = find_field_usages::get_usages(
                &program,
                &get_test_schema(),
                type_name.intern(),
                field_name.intern(),
            )
            .unwrap()
            .into_iter()
            .map(|location| format!("{:?}\n", location))
            .collect::<Vec<String>>();

            Ok(result.concat())
        } else {
            panic!(
                "Fixture {} has incorrect # arguments (expected 2)",
                fixture.file_name
            );
        }
    } else {
        panic!("Fixture {} missing %arguments%", fixture.file_name);
    }
}
