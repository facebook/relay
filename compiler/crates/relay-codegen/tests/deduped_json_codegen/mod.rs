/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::SourceLocationKey;
use fixture_tests::Fixture;
use graphql_ir::build;
use graphql_syntax::parse_executable;
use relay_codegen::JsModuleFormat;
use relay_codegen::Printer;
use relay_config::ProjectConfig;
use relay_test_schema::TEST_SCHEMA;

pub async fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let project_config = ProjectConfig {
        js_module_format: JsModuleFormat::Haste,
        ..Default::default()
    };
    let mut printer = Printer::with_dedupe(&project_config);
    let ast = parse_executable(
        fixture.content,
        SourceLocationKey::standalone(fixture.file_name),
    )
    .unwrap();
    build(&TEST_SCHEMA, &ast.definitions)
        .map(|definitions| {
            definitions
                .iter()
                .map(|def| match def {
                    graphql_ir::ExecutableDefinition::Operation(operation) => {
                        let mut import_statements = Default::default();
                        let operation = printer.print_operation(
                            &TEST_SCHEMA,
                            operation,
                            &mut import_statements,
                        );
                        format!("Operation:\n{}{}\n", import_statements, operation,)
                    }
                    graphql_ir::ExecutableDefinition::Fragment(fragment) => {
                        let mut import_statements = Default::default();
                        let fragment =
                            printer.print_fragment(&TEST_SCHEMA, fragment, &mut import_statements);
                        format!("Fragment:\n{}{}\n", import_statements, fragment)
                    }
                })
                .collect::<Vec<_>>()
                .join("\n\n")
        })
        .map_err(|errors| {
            errors
                .into_iter()
                .map(|error| format!("{:?}", error))
                .collect::<Vec<_>>()
                .join("\n\n")
        })
}
