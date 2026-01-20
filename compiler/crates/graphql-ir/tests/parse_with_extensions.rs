/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::SourceLocationKey;
use common::TextSource;
use fixture_tests::Fixture;
use fnv::FnvHashMap;
use graphql_cli::DiagnosticPrinter;
use graphql_ir::BuilderOptions;
use graphql_ir::FragmentVariablesSemantic;
use graphql_ir::build_ir_with_extra_features;
use graphql_syntax::parse_executable;
use relay_test_schema::get_test_schema_with_extensions;

pub async fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let mut sources = FnvHashMap::default();
    sources.insert(
        SourceLocationKey::standalone(fixture.file_name),
        fixture.content,
    );

    let allow_custom_scalar_literals = !fixture.content.contains("relay:no_custom_scalar_literals");

    let parts: Vec<_> = fixture.content.split("%extensions%").collect();
    if let [base, extensions] = parts.as_slice() {
        let source_location = SourceLocationKey::standalone(fixture.file_name);
        let ast = parse_executable(base, source_location).unwrap();
        let schema = get_test_schema_with_extensions(extensions);
        build_ir_with_extra_features(
            &schema,
            &ast.definitions,
            &BuilderOptions {
                allow_undefined_fragment_spreads: false,
                allow_non_overlapping_abstract_spreads: false,
                fragment_variables_semantic: FragmentVariablesSemantic::PassedValue,
                relay_mode: None,
                default_anonymous_operation_name: None,
                allow_custom_scalar_literals,
            },
        )
        .map(|x| format!("{:#?}", x))
        .map_err(|errors| {
            errors
                .into_iter()
                .map(|error| {
                    let printer = DiagnosticPrinter::new(|_| {
                        Some(TextSource::from_whole_document(fixture.content.to_string()))
                    });
                    printer.diagnostic_to_string(&error)
                })
                .collect::<Vec<_>>()
                .join("\n\n")
        })
    } else {
        panic!("Expected exactly one %extensions% section marker.")
    }
}
