/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::FeatureFlag;
use common::SourceLocationKey;
use fixture_tests::Fixture;
use graphql_ir::Program;
use graphql_ir::build;
use graphql_syntax::parse_executable;
use graphql_test_helpers::diagnostics_to_sorted_string;
use relay_codegen::JsModuleFormat;
use relay_codegen::print_fragment;
use relay_codegen::print_operation;
use relay_config::ProjectConfig;
use relay_test_schema::get_test_schema;
use relay_transforms::fragment_alias_directive;

pub async fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let base = fixture.content;
    let schema = get_test_schema();

    let ast = parse_executable(base, SourceLocationKey::standalone(fixture.file_name)).unwrap();
    let ir = build(&schema, &ast.definitions)
        .map_err(|diagnostics| diagnostics_to_sorted_string(fixture.content, &diagnostics))?;
    let program = Program::from_definitions(Arc::clone(&schema), ir);

    fragment_alias_directive(&program, &FeatureFlag::Enabled)
        .map(|next_program| {
            next_program
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
                .collect::<Vec<_>>()
                .join("\n\n")
        })
        .map_err(|diagnostics| diagnostics_to_sorted_string(fixture.content, &diagnostics))
}
