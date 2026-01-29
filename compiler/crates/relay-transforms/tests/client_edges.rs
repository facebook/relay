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
use graphql_test_helpers::diagnostics_to_sorted_string;
use graphql_text_printer::PrinterOptions;
use graphql_text_printer::print_fragment;
use graphql_text_printer::print_operation;
use relay_config::ProjectConfig;
use relay_config::ProjectName;
use relay_test_schema::get_test_schema_with_extensions;
use relay_transforms::client_edges;
use relay_transforms::relay_resolvers;

pub async fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let parts: Vec<_> = fixture.content.split("%extensions%").collect();
    if let [base, extensions] = parts.as_slice() {
        let source_location = SourceLocationKey::standalone(fixture.file_name);
        let ast = parse_executable(base, source_location).unwrap();
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
        let feature_flags = Arc::new(FeatureFlags {
            relay_resolver_enable_interface_output_type,
            ..Default::default()
        });
        let project_config: ProjectConfig = ProjectConfig {
            feature_flags,
            ..Default::default()
        };
        let mut next_program = client_edges(&program, &project_config, &Default::default(), true)
            .map_err(|diagnostics| {
            diagnostics_to_sorted_string(fixture.content, &diagnostics)
        })?;

        next_program = relay_resolvers(ProjectName::default(), &next_program)
            .map_err(|diagnostics| diagnostics_to_sorted_string(fixture.content, &diagnostics))?;

        let printer_options = PrinterOptions {
            debug_directive_data: true,
            ..Default::default()
        };

        let mut printed = next_program
            .operations()
            .map(|def| print_operation(&schema, def, printer_options.clone()))
            .chain(
                next_program
                    .fragments()
                    .map(|def| print_fragment(&schema, def, printer_options.clone())),
            )
            .collect::<Vec<_>>();
        printed.sort();

        Ok(printed.join("\n\n"))
    } else {
        panic!("Expected exactly one %extensions% section marker.")
    }
}
