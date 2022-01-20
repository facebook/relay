/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::SourceLocationKey;
use fixture_tests::Fixture;
use graphql_ir::{build, Program};
use graphql_syntax::parse_executable;
use relay_codegen::{print_fragment, print_operation, JsModuleFormat};
use relay_config::ProjectConfig;
use relay_test_schema::get_test_schema;
use relay_transforms::{sort_selections, transform_defer_stream};
use std::sync::Arc;

pub fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let ast = parse_executable(
        fixture.content,
        SourceLocationKey::standalone(fixture.file_name),
    )
    .unwrap();
    let schema = get_test_schema();
    let ir = build(&schema, &ast.definitions).unwrap();
    let program = Program::from_definitions(Arc::clone(&schema), ir);
    let next_program = sort_selections(&transform_defer_stream(&program).unwrap());
    let mut result = next_program
        .fragments()
        .map(|def| {
            let mut import_statements = Default::default();
            let fragment = print_fragment(
                &schema,
                def,
                &ProjectConfig {
                    js_module_format: JsModuleFormat::Haste,
                    ..Default::default()
                },
                &mut import_statements,
            );
            format!("{}{}", import_statements, fragment)
        })
        .chain(next_program.operations().map(|def| {
            let mut import_statements = Default::default();
            let operation = print_operation(
                &schema,
                def,
                &ProjectConfig {
                    js_module_format: JsModuleFormat::Haste,
                    ..Default::default()
                },
                &mut import_statements,
            );
            format!("{}{}", import_statements, operation)
        }))
        .collect::<Vec<_>>();
    result.sort_unstable();
    Ok(result.join("\n\n"))
}
