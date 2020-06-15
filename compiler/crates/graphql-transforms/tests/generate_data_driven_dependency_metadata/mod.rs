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
use graphql_transforms::{generate_data_driven_dependency_metadata, transform_match};
use std::sync::Arc;
use test_schema::get_test_schema;

pub fn transform_fixture(fixture: &Fixture) -> Result<String, String> {
    let file_key = FileKey::new(fixture.file_name);

    let mut sources = FnvHashMap::default();
    sources.insert(FileKey::new(fixture.file_name), fixture.content);

    let schema = get_test_schema();
    let ast = parse(fixture.content, file_key).unwrap();
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
    let next_program = transform_match(&program).map_err(|errors| {
        let mut errors = errors
            .into_iter()
            .map(|err| err.print(&sources))
            .collect::<Vec<_>>();
        errors.sort();
        errors.join("\n\n")
    })?;

    let next_program = generate_data_driven_dependency_metadata(&next_program);

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
