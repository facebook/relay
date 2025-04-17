/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::collections::HashMap;
use std::sync::Arc;

use common::SourceLocationKey;
use fixture_tests::Fixture;
use graphql_ir::Program;
use graphql_ir::build;
use graphql_syntax::parse_executable;
use graphql_test_helpers::diagnostics_to_sorted_string;
use intern::intern;
use relay_config::NonNodeIdFieldsConfig;
use relay_config::SchemaConfig;
use relay_test_schema::get_test_schema_with_extensions;
use relay_transforms::disallow_non_node_id_fields;

pub async fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let parts: Vec<_> = fixture.content.split("%extensions%").collect();

    if let [base, extensions] = parts.as_slice() {
        let source_location = SourceLocationKey::standalone(fixture.file_name);
        let ast = parse_executable(base, source_location).unwrap();
        let schema = get_test_schema_with_extensions(extensions);

        let ir = build(&schema, &ast.definitions).unwrap();
        let program = Program::from_definitions(Arc::clone(&schema), ir);

        let schema_config = SchemaConfig {
            non_node_id_fields: Some(NonNodeIdFieldsConfig {
                allowed_id_types: {
                    let mut mappings = HashMap::new();

                    // Add types to allow here from `testschema.graphql`
                    mappings.insert(intern!("NonNode"), intern!("String"));

                    // Add test types that should also be allowed here
                    mappings.insert(
                        intern!("UserWithAllowedCustomIDType"),
                        intern!("AllowedCustomIDType"),
                    );

                    mappings
                },
            }),
            ..Default::default()
        };

        disallow_non_node_id_fields(&program, &schema_config)
            .map_err(|diagnostics| diagnostics_to_sorted_string(fixture.content, &diagnostics))?;

        Ok("OK".to_owned())
    } else {
        panic!("Expected exactly one %extensions% section marker.")
    }
}
