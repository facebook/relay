/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::SourceLocationKey;
use fixture_tests::Fixture;
use fnv::FnvHashMap;
use graphql_cli::DiagnosticPrinter;
use graphql_ir::build;
use graphql_syntax::{parse_executable_with_features, ParserFeatures};
use relay_test_schema::TEST_SCHEMA;

pub fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let source_location = SourceLocationKey::standalone(fixture.file_name);
    let features = ParserFeatures {
        enable_variable_definitions: true,
    };
    let ast = parse_executable_with_features(fixture.content, source_location, features).unwrap();
    let mut sources = FnvHashMap::default();
    sources.insert(source_location, fixture.content);

    build(&TEST_SCHEMA, &ast.definitions)
        .map(|x| format!("{:#?}", x))
        .map_err(|errors| {
            errors
                .into_iter()
                .map(|error| {
                    let printer = DiagnosticPrinter::new(|_| Some(fixture.content.to_string()));
                    printer.diagnostic_to_string(&error)
                })
                .collect::<Vec<_>>()
                .join("\n\n")
        })
}
