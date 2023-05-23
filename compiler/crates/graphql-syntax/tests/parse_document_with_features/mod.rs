/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::Diagnostic;
use common::SourceLocationKey;
use common::TextSource;
use fixture_tests::Fixture;
use graphql_cli::DiagnosticPrinter;
use graphql_syntax::parse_document_with_features;
use graphql_syntax::FragmentArgumentSyntaxKind;
use graphql_syntax::ParserFeatures;

pub fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    parse_document_with_features(
        fixture.content,
        SourceLocationKey::standalone(fixture.file_name),
        ParserFeatures {
            fragment_argument_capability:
                FragmentArgumentSyntaxKind::SpreadArgumentsAndFragmentVariableDefinitions,
        },
    )
    .map(|x| format!("{:#?}", x))
    .map_err(|diagnostics| diagnostics_to_sorted_string(fixture.content, &diagnostics))
}

// NOTE: copied from graphql-test-helpers to avoid cyclic dependency breaking Rust Analyzer
fn diagnostics_to_sorted_string(source: &str, diagnostics: &[Diagnostic]) -> String {
    let printer =
        DiagnosticPrinter::new(|_| Some(TextSource::from_whole_document(source.to_string())));
    let mut printed = diagnostics
        .iter()
        .map(|diagnostic| printer.diagnostic_to_string(diagnostic))
        .collect::<Vec<_>>();
    printed.sort();
    printed.join("\n\n")
}
