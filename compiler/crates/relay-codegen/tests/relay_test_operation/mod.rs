/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::FileKey;
use fixture_tests::Fixture;
use graphql_ir::{build, ExecutableDefinition, FragmentDefinition};
use graphql_syntax::parse;
use relay_codegen::{build_request_params, print_fragment, print_request};
use test_schema::TEST_SCHEMA;

pub fn transform_fixture(fixture: &Fixture) -> Result<String, String> {
    let ast = parse(fixture.content, FileKey::new(fixture.file_name)).unwrap();
    let program = build(&TEST_SCHEMA, &ast.definitions);

    program
        .map(|definitions| {
            definitions
                .iter()
                .map(|def| match def {
                    ExecutableDefinition::Operation(operation) => {
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
                            operation,
                            &operation_fragment,
                            request_parameters,
                            &vec![],
                        )
                    }
                    ExecutableDefinition::Fragment(fragment) => {
                        print_fragment(&TEST_SCHEMA, fragment)
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
