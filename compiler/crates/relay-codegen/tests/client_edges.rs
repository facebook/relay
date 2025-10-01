/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::FeatureFlag;
use common::FeatureFlags;
use common::SourceLocationKey;
use fixture_tests::Fixture;
use graphql_ir::Program;
use graphql_ir::build;
use graphql_syntax::parse_executable;
use relay_codegen::JsModuleFormat;
use relay_codegen::print_fragment;
use relay_codegen::print_operation;
use relay_config::ProjectConfig;
use relay_config::ProjectName;
use relay_test_schema::get_test_schema_with_extensions;
use relay_transforms::client_edges;
use relay_transforms::relay_resolvers;

pub async fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let parts: Vec<_> = fixture.content.split("%extensions%").collect();
    if let [base, extensions] = parts.as_slice() {
        let ast = parse_executable(base, SourceLocationKey::standalone(fixture.file_name)).unwrap();
        let schema = get_test_schema_with_extensions(extensions);
        let ir = build(&schema, &ast.definitions).unwrap();
        let program = Program::from_definitions(Arc::clone(&schema), ir);
        let relay_resolver_enable_interface_output_type = if fixture
            .content
            .contains("# relay-resolver-enable-interface-output-type")
        {
            FeatureFlag::Enabled
        } else {
            FeatureFlag::Disabled
        };
        let enable_exec_time_resolvers_directive = fixture
            .content
            .contains("# enable-exec-time-resolvers-directive");
        let feature_flags = Arc::new(FeatureFlags {
            relay_resolver_enable_interface_output_type,
            enable_exec_time_resolvers_directive,
            ..Default::default()
        });
        let project_config: ProjectConfig = ProjectConfig {
            feature_flags,
            ..Default::default()
        };
        let next_program = &client_edges(&program, &project_config, &Default::default(), false)
            .and_then(|program| relay_resolvers(ProjectName::default(), &program))
            .unwrap();
        let mut result = next_program
            .fragments()
            .map(|def| {
                let mut import_statements = Default::default();
                let fragment = print_fragment(
                    &schema,
                    def,
                    &ProjectConfig {
                        js_module_format: JsModuleFormat::Haste,
                        feature_flags: Arc::new(FeatureFlags {
                            enable_exec_time_resolvers_directive: true,
                            ..Default::default()
                        }),
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
                        feature_flags: Arc::new(FeatureFlags {
                            enable_exec_time_resolvers_directive: true,
                            ..Default::default()
                        }),
                        ..Default::default()
                    },
                    &mut import_statements,
                );
                format!("{}{}", import_statements, operation)
            }))
            .collect::<Vec<_>>();
        result.sort_unstable();
        Ok(result.join("\n\n"))
    } else {
        panic!("Expected exactly one %extensions% section marker.")
    }
}
