/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::FileKey;
use fixture_tests::Fixture;
use fnv::FnvHashMap;
use graphql_ir::{build, FragmentDefinition, Program};
use graphql_syntax::parse;
use graphql_transforms::{transform_connections, validate_connections, OSSConnectionInterface};
use relay_codegen::{print_fragment_deduped, print_request_deduped};
use test_schema::TEST_SCHEMA;

pub fn transform_fixture(fixture: &Fixture) -> Result<String, String> {
    let file_key = FileKey::new(fixture.file_name);

    let mut sources = FnvHashMap::default();
    sources.insert(FileKey::new(fixture.file_name), fixture.content);

    let ast = parse(fixture.content, file_key).unwrap();
    let ir_result = build(&TEST_SCHEMA, &ast.definitions);
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

    let program = Program::from_definitions(&TEST_SCHEMA, ir);

    let validation_result = validate_connections(&program, &OSSConnectionInterface::default());
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

    let next_program = transform_connections(&program, &OSSConnectionInterface::default());

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
            print_request_deduped(&TEST_SCHEMA, def, &operation_fragment)
        })
        .chain(
            next_program
                .fragments()
                .map(|def| print_fragment_deduped(&TEST_SCHEMA, def)),
        )
        .collect::<Vec<_>>();
    printed.sort();
    Ok(printed.join("\n\n"))
}
