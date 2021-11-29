/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::{SourceLocationKey, WithLocation};
use fixture_tests::Fixture;
use graphql_ir::{
    build, Argument, ConstantValue, Directive, ExecutableDefinition, FragmentDefinition,
    OperationDefinition, Value,
};
use graphql_syntax::parse_executable;
use intern::string_key::Intern;
use relay_codegen::{build_request_params, print_fragment, print_request, JsModuleFormat};
use relay_test_schema::TEST_SCHEMA;

pub fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
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
                                    "__metadata".intern(),
                                ),
                                arguments: vec![Argument {
                                    name: WithLocation::new(
                                        operation.name.location,
                                        "metadataKey".intern(),
                                    ),
                                    value: WithLocation::new(
                                        operation.name.location,
                                        Value::Constant(ConstantValue::String(
                                            "Hello world!".intern(),
                                        )),
                                    ),
                                }],
                                data: None,
                            }],
                            ..operation.clone()
                        };

                        let operation_fragment = FragmentDefinition {
                            name: operation.name,
                            variable_definitions: operation.variable_definitions.clone(),
                            selections: operation.selections.clone(),
                            used_global_variables: Default::default(),
                            directives: operation.directives.clone(),
                            type_condition: operation.type_,
                        };
                        let request_parameters = build_request_params(&operation);
                        print_request(
                            &TEST_SCHEMA,
                            &operation,
                            &operation_fragment,
                            request_parameters,
                            JsModuleFormat::Haste,
                        )
                    }
                    ExecutableDefinition::Fragment(fragment) => {
                        print_fragment(&TEST_SCHEMA, fragment, JsModuleFormat::Haste)
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
