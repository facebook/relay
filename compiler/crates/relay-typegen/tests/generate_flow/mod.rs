/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::{ConsoleLogger, FileKey};
use fixture_tests::Fixture;
use fnv::FnvHashMap;
use graphql_ir::{build, Program};
use graphql_syntax::parse;
use graphql_transforms::OSS_CONNECTION_INTERFACE;
use relay_compiler::apply_transforms;
use relay_typegen;
use test_schema::test_schema;

pub fn transform_fixture(fixture: &Fixture) -> Result<String, String> {
    let mut sources = FnvHashMap::default();
    sources.insert(FileKey::new(fixture.file_name), fixture.content);
    let schema = test_schema();
    let ast = parse(fixture.content, FileKey::new(fixture.file_name)).unwrap();
    let ir = build(&schema, &ast.definitions).unwrap();
    let program = Program::from_definitions(&schema, ir);
    let programs = apply_transforms(
        "test",
        program,
        &Default::default(),
        &*OSS_CONNECTION_INTERFACE,
        &ConsoleLogger,
    )
    .unwrap();

    let mut operations: Vec<_> = programs.typegen.operations().collect();
    operations.sort_by_key(|op| op.name.item);
    let operation_strings = operations.into_iter().map(|typegen_operation| {
        let normalization_operation = programs
            .normalization
            .operation(typegen_operation.name.item)
            .unwrap();
        relay_typegen::generate_operation_type(
            typegen_operation,
            normalization_operation,
            &schema,
            &None,
            &Vec::new(),
        )
    });

    let mut fragments: Vec<_> = programs.typegen.fragments().collect();
    fragments.sort_by_key(|frag| frag.name.item);
    let fragment_strings = fragments
        .into_iter()
        .map(|frag| relay_typegen::generate_fragment_type(frag, &schema, &None, &Vec::new()));

    let mut result: Vec<String> = operation_strings.collect();
    result.extend(fragment_strings);
    Ok(result
        .join("-------------------------------------------------------------------------------\n"))
}
