/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::{FileKey, NamedItem};
use fixture_tests::Fixture;
use graphql_ir::{build, ExecutableDefinition, FragmentDefinition};
use graphql_syntax::parse;
use interner::Intern;
use relay_codegen::{
    build_request_params, print_fragment, print_request, MetadataGeneratorFn, Primitive,
};
use test_schema::test_schema_with_extensions;

pub fn transform_fixture(fixture: &Fixture) -> Result<String, String> {
    let test_schema = test_schema_with_extensions("directive @my_custom_directive on QUERY");

    let ast = parse(fixture.content, FileKey::new(fixture.file_name)).unwrap();
    let program = build(&test_schema, &ast.definitions);

    let metadata_generators: Vec<MetadataGeneratorFn> = vec![Box::new(|operation| {
        operation
            .directives
            .named("my_custom_directive".intern())
            .map(|_| ("test_metadata".intern(), Primitive::Bool(true)))
    })];

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
                            &test_schema,
                            operation,
                            &operation_fragment,
                            request_parameters,
                            &metadata_generators,
                        )
                    }
                    ExecutableDefinition::Fragment(fragment) => {
                        print_fragment(&test_schema, fragment)
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
