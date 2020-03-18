/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::FileKey;
use fixture_tests::Fixture;
use fnv::FnvHashMap;
use graphql_ir::{build, Program};
use graphql_syntax::parse;
use graphql_text_printer::{print_fragment, print_operation};
use graphql_transforms::apply_fragment_arguments;
use test_schema::TEST_SCHEMA;

pub fn transform_fixture(fixture: &Fixture) -> Result<String, String> {
    let file_key = FileKey::new(fixture.file_name);

    let mut sources = FnvHashMap::default();
    sources.insert(FileKey::new(fixture.file_name), fixture.content);

    let ast = parse(fixture.content, file_key).unwrap();
    let ir = match build(&TEST_SCHEMA, &ast.definitions) {
        Ok(ir) => ir,
        Err(err) => return Err(format!("{:?}", err)),
    };
    let program = Program::from_definitions(&TEST_SCHEMA, ir);

    let next_program = apply_fragment_arguments(&program).map_err(|errors| {
        let mut errors = errors
            .into_iter()
            .map(|err| err.print(&sources))
            .collect::<Vec<_>>();
        errors.sort();
        errors.join("\n\n")
    })?;

    let mut printed = next_program
        .operations()
        .map(|def| print_operation(&TEST_SCHEMA, def))
        .collect::<Vec<_>>();
    printed.sort();

    let mut printed_fragments = next_program
        .fragments()
        .map(|def| print_fragment(&TEST_SCHEMA, def))
        .collect::<Vec<_>>();
    printed_fragments.sort();
    printed.extend(printed_fragments);

    Ok(printed.join("\n\n"))
}
