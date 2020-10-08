/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::{ConsoleLogger, NamedItem, SourceLocationKey};
use fixture_tests::Fixture;
use graphql_ir::{build, FragmentDefinition, OperationDefinition, Program};
use graphql_syntax::parse_executable;
use graphql_test_helpers::diagnostics_to_sorted_string;
use graphql_text_printer::print_full_operation;
use interner::Intern;
use relay_codegen::{build_request_params, print_fragment, print_operation, print_request};
use relay_compiler::{apply_transforms, validate};
use relay_transforms::{ConnectionInterface, FeatureFlags, MATCH_CONSTANTS};
use std::sync::Arc;
use test_schema::{get_test_schema, get_test_schema_with_extensions};

pub fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let source_location = SourceLocationKey::standalone(fixture.file_name);

    if fixture.content.find("%TODO%").is_some() {
        if fixture.content.find("expected-to-throw").is_some() {
            return Err("TODO".to_string());
        }
        return Ok("TODO".to_string());
    }

    let parts: Vec<_> = fixture.content.split("%extensions%").collect();
    let (base, schema) = match parts.as_slice() {
        [base, extensions] => (base, get_test_schema_with_extensions(extensions)),
        [base] => (base, get_test_schema()),
        _ => panic!("Invalid fixture input {}", fixture.content),
    };

    let ast = parse_executable(base, source_location).unwrap();
    let ir = build(&schema, &ast.definitions)
        .map_err(|diagnostics| diagnostics_to_sorted_string(fixture.content, &diagnostics))?;
    let program = Program::from_definitions(Arc::clone(&schema), ir);

    let connection_interface = ConnectionInterface::default();

    validate(&program, &connection_interface)
        .map_err(|diagnostics| diagnostics_to_sorted_string(fixture.content, &diagnostics))?;

    let feature_flags = FeatureFlags {
        enable_flight_transform: true,
        enable_required_transform_for_prefix: Some("".intern()),
    };

    // TODO pass base fragment names
    let programs = apply_transforms(
        "test".intern(),
        Arc::new(program),
        Default::default(),
        &connection_interface,
        Arc::new(feature_flags),
        Arc::new(ConsoleLogger),
    )
    .map_err(|diagnostics| diagnostics_to_sorted_string(fixture.content, &diagnostics))?;

    let mut operations: Vec<&std::sync::Arc<OperationDefinition>> =
        programs.normalization.operations().collect();
    operations.sort_by(|a, b| a.name.item.lookup().cmp(&b.name.item.lookup()));
    let result = operations
        .into_iter()
        .map(|operation| {
            if operation
                .directives
                .named(MATCH_CONSTANTS.custom_module_directive_name)
                .is_some()
            {
                print_operation(&schema, operation)
            } else {
                let name = operation.name.item;
                let print_operation_node = programs
                    .operation_text
                    .operation(name)
                    .expect("a query text operation should be generated for this operation");
                let text = print_full_operation(&programs.operation_text, print_operation_node);

                let reader_operation = programs
                    .reader
                    .operation(name)
                    .expect("a reader fragment should be generated for this operation");
                let operation_fragment = FragmentDefinition {
                    name: reader_operation.name,
                    variable_definitions: reader_operation.variable_definitions.clone(),
                    selections: reader_operation.selections.clone(),
                    used_global_variables: Default::default(),
                    directives: reader_operation.directives.clone(),
                    type_condition: reader_operation.type_,
                };
                let request_parameters = build_request_params(&operation);
                format!(
                    "{}\n\nQUERY:\n\n{}",
                    print_request(&schema, operation, &operation_fragment, request_parameters,),
                    text
                )
            }
        })
        .chain({
            let mut fragments: Vec<&std::sync::Arc<FragmentDefinition>> =
                programs.reader.fragments().collect();
            fragments.sort_by(|a, b| a.name.item.lookup().cmp(&b.name.item.lookup()));
            fragments
                .into_iter()
                .map(|fragment| print_fragment(&schema, fragment))
        })
        .collect::<Vec<_>>();
    Ok(result.join("\n\n"))
}
