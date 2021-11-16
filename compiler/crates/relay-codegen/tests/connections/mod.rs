/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::SourceLocationKey;
use fixture_tests::Fixture;
use graphql_ir::{build, FragmentDefinition, Program};
use graphql_syntax::parse_executable;
use graphql_test_helpers::diagnostics_to_sorted_string;
use relay_codegen::{build_request_params, JsModuleFormat, Printer};
use relay_test_schema::get_test_schema;
use relay_transforms::{transform_connections, validate_connections, ConnectionInterface};
use std::sync::Arc;

pub fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let mut printer = Printer::with_dedupe(JsModuleFormat::Haste);
    let source_location = SourceLocationKey::standalone(fixture.file_name);

    let schema = get_test_schema();

    let ast = parse_executable(fixture.content, source_location).unwrap();
    let ir = build(&schema, &ast.definitions)
        .map_err(|diagnostics| diagnostics_to_sorted_string(fixture.content, &diagnostics))?;

    let program = Program::from_definitions(Arc::clone(&schema), ir);

    let connection_interface = ConnectionInterface::default();

    validate_connections(&program, &connection_interface)
        .map_err(|diagnostics| diagnostics_to_sorted_string(fixture.content, &diagnostics))?;

    let next_program = transform_connections(&program, &connection_interface);

    let mut printed = next_program
        .operations()
        .map(|def| {
            let operation_fragment = FragmentDefinition {
                name: def.name,
                variable_definitions: def.variable_definitions.clone(),
                selections: def.selections.clone(),
                used_global_variables: Default::default(),
                directives: def.directives.clone(),
                type_condition: def.type_,
            };
            let request_parameters = build_request_params(def);
            printer.print_request(&schema, def, &operation_fragment, request_parameters)
        })
        .collect::<Vec<_>>();
    for def in next_program.fragments() {
        printed.push(printer.print_fragment(&schema, def));
    }
    printed.sort();
    Ok(printed.join("\n\n"))
}
