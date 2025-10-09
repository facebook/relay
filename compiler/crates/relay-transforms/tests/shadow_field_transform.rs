/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::SourceLocationKey;
use fixture_tests::Fixture;
use graphql_ir::ExecutableDefinition;
use graphql_ir::Program;
use graphql_syntax::parse_executable;
use graphql_test_helpers::diagnostics_to_sorted_string;
use graphql_text_printer::print_ir;
use intern::string_key::Intern;
use relay_config::SchemaConfig;
use relay_config::ShadowFieldConfig;
use relay_test_schema::get_test_schema_with_extensions;
use relay_transforms::extend_schema_with_shadow_fields;
use relay_transforms::shadow_field_transform;
use relay_transforms::unwrap_shadow_fields;

pub async fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let parts = fixture.content.split("%extensions%").collect::<Vec<_>>();
    let source_location = SourceLocationKey::standalone(fixture.file_name);

    let schema_arc = get_test_schema_with_extensions(parts[1]);

    // Unwrap Arc to get mutable access for extending schema
    let mut schema =
        Arc::try_unwrap(schema_arc).map_err(|_| "Failed to unwrap schema Arc".to_string())?;

    // Parse shadow field config from comment
    let shadow_field_configs = parse_shadow_field_configs(fixture.content);
    let schema_config = SchemaConfig {
        shadow_fields: shadow_field_configs,
        ..Default::default()
    };

    // Extend schema with shadow fields
    if let Err(diagnostics) = extend_schema_with_shadow_fields(&mut schema, &schema_config) {
        return Err(diagnostics_to_sorted_string(fixture.content, &diagnostics));
    }

    let ast = parse_executable(parts[0], source_location).unwrap();
    let ir_result = graphql_ir::build(&schema, &ast.definitions);
    let ir = match ir_result {
        Ok(res) => res,
        Err(errors) => {
            return Err(diagnostics_to_sorted_string(fixture.content, &errors));
        }
    };

    let schema = Arc::new(schema);
    let program = Program::from_definitions(Arc::clone(&schema), ir);
    let next_program = shadow_field_transform(&program);
    // Unwrap shadow fields for reader representation
    let next_program = unwrap_shadow_fields(&next_program);

    // Collect all operations and fragments into a vector
    let mut definitions: Vec<ExecutableDefinition> = Vec::new();
    for operation in next_program.operations() {
        definitions.push(ExecutableDefinition::Operation((**operation).clone()));
    }
    for fragment in next_program.fragments() {
        definitions.push(ExecutableDefinition::Fragment((**fragment).clone()));
    }

    Ok(print_ir(&schema, &definitions).join("\n\n"))
}

fn parse_shadow_field_configs(content: &str) -> Vec<ShadowFieldConfig> {
    let mut configs = Vec::new();
    for line in content.lines() {
        if let Some(config_str) = line.strip_prefix("# relay:shadow_fields ") {
            let parts: Vec<&str> = config_str.split_whitespace().collect();
            if parts.len() >= 5 {
                let parent_and_field: Vec<&str> = parts[0].split('.').collect();
                if parent_and_field.len() == 2 {
                    configs.push(ShadowFieldConfig {
                        parent_type_name: parent_and_field[0].intern(),
                        shadow_field_name: parent_and_field[1].intern(),
                        variable_name: parts[1].intern(),
                        true_field_name: parts[2].intern(),
                        false_field_name: parts[3].intern(),
                        return_type_name: parts[4].intern(),
                    });
                }
            }
        }
    }
    configs
}
