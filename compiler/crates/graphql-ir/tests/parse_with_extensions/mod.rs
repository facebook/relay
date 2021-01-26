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
use graphql_syntax::parse_executable;
use relay_test_schema::get_test_schema_with_extensions;

pub fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let mut sources = FnvHashMap::default();
    sources.insert(
        SourceLocationKey::standalone(fixture.file_name),
        fixture.content,
    );

    let parts: Vec<_> = fixture.content.split("%extensions%").collect();
    if let [base, extensions] = parts.as_slice() {
        let source_location = SourceLocationKey::standalone(fixture.file_name);
        let ast = parse_executable(base, source_location).unwrap();
        let schema = get_test_schema_with_extensions(extensions);
        build(&schema, &ast.definitions)
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
    } else {
        panic!("Expected exactly one %extensions% section marker.")
    }
}
