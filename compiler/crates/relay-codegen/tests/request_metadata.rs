/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::ArgumentName;
use common::DirectiveName;
use common::SourceLocationKey;
use common::WithLocation;
use fixture_tests::Fixture;
use graphql_ir::Argument;
use graphql_ir::ConstantValue;
use graphql_ir::Directive;
use graphql_ir::ExecutableDefinition;
use graphql_ir::FragmentDefinition;
use graphql_ir::FragmentDefinitionName;
use graphql_ir::OperationDefinition;
use graphql_ir::Value;
use graphql_ir::build;
use graphql_syntax::parse_executable;
use intern::string_key::Intern;
use relay_codegen::JsModuleFormat;
use relay_codegen::build_request_params;
use relay_codegen::print_fragment;
use relay_codegen::print_request;
use relay_config::ProjectConfig;
use relay_test_schema::TEST_SCHEMA;

pub async fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let ast = parse_executable(
        fixture.content,
        SourceLocationKey::standalone(fixture.file_name),
    )
    .unwrap();
    let program = build(&TEST_SCHEMA, &ast.definitions);
    program
        .map(|definitions| {
            definitions
                .iter()
                .map(|def| match def {
                    ExecutableDefinition::Operation(operation) => {
                        let operation = OperationDefinition {
                            directives: vec![Directive {
                                name: WithLocation::new(
                                    operation.name.location,
                                    DirectiveName("__metadata".intern()),
                                ),
                                arguments: vec![Argument {
                                    name: WithLocation::new(
                                        operation.name.location,
                                        ArgumentName("metadataKey".intern()),
                                    ),
                                    value: WithLocation::new(
                                        operation.name.location,
                                        Value::Constant(ConstantValue::String(
                                            "Hello world!".intern(),
                                        )),
                                    ),
                                }],
                                data: None,
                                location: operation.name.location,
                            }],
                            ..operation.clone()
                        };

                        let operation_fragment = FragmentDefinition {
                            name: operation.name.map(|x| FragmentDefinitionName(x.0)),
                            variable_definitions: operation.variable_definitions.clone(),
                            selections: operation.selections.clone(),
                            used_global_variables: Default::default(),
                            directives: operation.directives.clone(),
                            type_condition: operation.type_,
                        };
                        let request_parameters = build_request_params(&operation);
                        let mut import_statements = Default::default();
                        let request = print_request(
                            &TEST_SCHEMA,
                            &operation,
                            &operation_fragment,
                            request_parameters,
                            &ProjectConfig {
                                js_module_format: JsModuleFormat::Haste,
                                ..Default::default()
                            },
                            &mut import_statements,
                        );
                        format!("{}{}", import_statements, request)
                    }
                    ExecutableDefinition::Fragment(fragment) => {
                        let mut import_statements = Default::default();
                        let fragment = print_fragment(
                            &TEST_SCHEMA,
                            fragment,
                            &ProjectConfig {
                                js_module_format: JsModuleFormat::Haste,
                                ..Default::default()
                            },
                            &mut import_statements,
                        );
                        format!("{}{}", import_statements, fragment)
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
