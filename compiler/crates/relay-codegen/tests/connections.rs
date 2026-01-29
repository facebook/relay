/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::SourceLocationKey;
use fixture_tests::Fixture;
use graphql_ir::FragmentDefinition;
use graphql_ir::FragmentDefinitionName;
use graphql_ir::Program;
use graphql_ir::build;
use graphql_syntax::parse_executable;
use graphql_test_helpers::diagnostics_to_sorted_string;
use relay_codegen::JsModuleFormat;
use relay_codegen::Printer;
use relay_codegen::build_request_params;
use relay_config::DeferStreamInterface;
use relay_config::ProjectConfig;
use relay_test_schema::get_test_schema;
use relay_transforms::ConnectionInterface;
use relay_transforms::transform_connections;
use relay_transforms::validate_connections;

pub async fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let project_config = ProjectConfig {
        js_module_format: JsModuleFormat::Haste,
        ..Default::default()
    };
    let mut printer = Printer::with_dedupe(&project_config);
    let source_location = SourceLocationKey::standalone(fixture.file_name);

    let schema = get_test_schema();

    let ast = parse_executable(fixture.content, source_location).unwrap();
    let ir = build(&schema, &ast.definitions)
        .map_err(|diagnostics| diagnostics_to_sorted_string(fixture.content, &diagnostics))?;

    let program = Program::from_definitions(Arc::clone(&schema), ir);

    let connection_interface = ConnectionInterface::default();
    let defer_stream_interface = DeferStreamInterface::default();

    validate_connections(&program, &connection_interface)
        .map_err(|diagnostics| diagnostics_to_sorted_string(fixture.content, &diagnostics))?;

    let next_program = transform_connections(
        &program,
        &connection_interface,
        &defer_stream_interface,
        false,
    );

    let mut printed = next_program
        .operations()
        .map(|def| {
            let operation_fragment = FragmentDefinition {
                name: def.name.map(|x| FragmentDefinitionName(x.0)),
                variable_definitions: def.variable_definitions.clone(),
                selections: def.selections.clone(),
                used_global_variables: Default::default(),
                directives: def.directives.clone(),
                type_condition: def.type_,
            };
            let request_parameters = build_request_params(def);
            let mut import_statements = Default::default();
            let request = printer.print_request(
                &schema,
                def,
                &operation_fragment,
                request_parameters,
                &mut import_statements,
            );
            format!("{}{}", import_statements, request)
        })
        .collect::<Vec<_>>();
    let mut import_statements = Default::default();
    for def in next_program.fragments() {
        printed.push(printer.print_fragment(&schema, def, &mut import_statements));
    }
    if !import_statements.is_empty() {
        printed.push(import_statements.to_string())
    }
    printed.sort();
    Ok(printed.join("\n\n"))
}
