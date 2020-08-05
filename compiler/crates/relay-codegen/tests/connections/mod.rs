/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::SourceLocationKey;
use fixture_tests::Fixture;
use fnv::FnvHashMap;
use graphql_ir::{build, FragmentDefinition, Program};
use graphql_syntax::parse_executable;
use graphql_transforms::{transform_connections, validate_connections, ConnectionInterface};
use relay_codegen::{build_request_params, Printer};
use std::sync::Arc;
use test_schema::get_test_schema;

pub fn transform_fixture(fixture: &Fixture) -> Result<String, String> {
    let mut printer = Printer::default();
    let source_location = SourceLocationKey::standalone(fixture.file_name);

    let mut sources = FnvHashMap::default();
    sources.insert(source_location, fixture.content);

    let schema = get_test_schema();

    let ast = parse_executable(fixture.content, source_location).unwrap();
    let ir_result = build(&schema, &ast.definitions);
    let ir = match ir_result {
        Ok(res) => res,
        Err(errors) => {
            let mut errs = errors
                .into_iter()
                .map(|err| err.print(&sources))
                .collect::<Vec<_>>();
            errs.sort();
            return Err(errs.join("\n\n"));
        }
    };

    let program = Program::from_definitions(Arc::clone(&schema), ir);

    let connection_interface = ConnectionInterface::default();

    let validation_result = validate_connections(&program, &connection_interface);
    match validation_result {
        Ok(_) => {}
        Err(errors) => {
            let mut errs = errors
                .into_iter()
                .map(|err| err.print(&sources))
                .collect::<Vec<_>>();
            errs.sort();
            return Err(errs.join("\n\n"));
        }
    }

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
            let request_parameters = build_request_params(&def);
            printer.print_request_deduped(&schema, def, &operation_fragment, request_parameters)
        })
        .collect::<Vec<_>>();
    for def in next_program.fragments() {
        printed.push(printer.print_fragment_deduped(&schema, def));
    }
    printed.sort();
    Ok(printed.join("\n\n"))
}
