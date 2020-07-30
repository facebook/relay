/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::SourceLocationKey;
use fixture_tests::Fixture;
use fnv::FnvHashMap;
use graphql_ir::{build, Program};
use graphql_syntax::parse;
use graphql_text_printer::{print_fragment, print_operation};
use graphql_transforms::{
    transform_connections, transform_refetchable_fragment, ConnectionInterface,
};
use std::sync::Arc;
use test_schema::get_test_schema;

pub fn transform_fixture(fixture: &Fixture) -> Result<String, String> {
    let source_location = SourceLocationKey::standalone(fixture.file_name);

    let mut sources = FnvHashMap::default();
    sources.insert(source_location, fixture.content);

    let schema = get_test_schema();
    let ast = parse(fixture.content, source_location).unwrap();
    let ir = match build(&schema, &ast.definitions) {
        Ok(ir) => ir,
        Err(err) => return Err(format!("{:?}", err)),
    };
    let program = Program::from_definitions(Arc::clone(&schema), ir);
    let program = transform_connections(&program, &ConnectionInterface::default());
    let base_fragments = Default::default();
    let next_program =
        transform_refetchable_fragment(&program, &base_fragments, false).map_err(|errors| {
            let mut errors = errors
                .into_iter()
                .map(|err| err.print(&sources))
                .collect::<Vec<_>>();
            errors.sort();
            errors.join("\n\n")
        })?;

    let mut printed = next_program
        .operations()
        .map(|def| print_operation(&schema, def))
        .collect::<Vec<_>>();
    printed.sort();

    let mut printed_fragments = next_program
        .fragments()
        .map(|def| print_fragment(&schema, def))
        .collect::<Vec<_>>();
    printed_fragments.sort();
    printed.extend(printed_fragments);

    Ok(printed.join("\n\n"))
}
