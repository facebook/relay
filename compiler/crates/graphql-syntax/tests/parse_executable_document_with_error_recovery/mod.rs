/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::{Diagnostic, SourceLocationKey};
use fixture_tests::Fixture;
use graphql_cli::DiagnosticPrinter;
use graphql_syntax::parse_executable_with_error_recovery;

pub fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let result = parse_executable_with_error_recovery(
        fixture.content,
        SourceLocationKey::standalone(fixture.file_name),
    );
    Ok(format!(
        "{:#?}\nErrors:\n{}",
        result.item,
        diagnostics_to_sorted_string(fixture.content, &result.errors)
    ))
}

// NOTE: copied from graphql-test-helpers to avoid cyclic dependency breaking Rust Analyzer
fn diagnostics_to_sorted_string(source: &str, diagnostics: &[Diagnostic]) -> String {
    let printer = DiagnosticPrinter::new(|_| Some(source.to_string()));
    let mut printed = diagnostics
        .iter()
        .map(|diagnostic| printer.diagnostic_to_string(diagnostic))
        .collect::<Vec<_>>();
    printed.sort();
    printed.join("\n\n")
}
