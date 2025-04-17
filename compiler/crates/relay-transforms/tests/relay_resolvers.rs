/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::Diagnostic;
use common::FeatureFlag;
use common::SourceLocationKey;
use common::TextSource;
use fixture_tests::Fixture;
use graphql_cli::DiagnosticPrinter;
use graphql_ir::Program;
use graphql_ir::build;
use graphql_syntax::parse_executable;
use graphql_text_printer::PrinterOptions;
use graphql_text_printer::print_fragment;
use graphql_text_printer::print_operation;
use relay_config::ProjectName;
use relay_test_schema::get_test_schema_with_located_extensions;
use relay_transforms::fragment_alias_directive;
use relay_transforms::relay_resolvers;
use relay_transforms::validate_resolver_fragments;

pub async fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let parts: Vec<_> = fixture.content.split("%extensions%").collect();
    if let [base, extensions] = parts.as_slice() {
        let graphql_location = SourceLocationKey::embedded(fixture.file_name, 0);
        let extension_location = SourceLocationKey::embedded(fixture.file_name, 1);

        let ast = parse_executable(base, graphql_location).unwrap();
        let schema = get_test_schema_with_located_extensions(extensions, extension_location);
        let ir = build(&schema, &ast.definitions).unwrap();
        let program = Program::from_definitions(Arc::clone(&schema), ir);

        validate_resolver_fragments(&program)
            .map_err(|diagnostics| diagnostics_to_sorted_string(base, extensions, &diagnostics))?;

        // Run `fragment_alias_directive` first because we want to ensure we
        // correctly generate paths for named inline fragment spreads.
        let next_program = fragment_alias_directive(&program, &FeatureFlag::Enabled)
            .and_then(|program| relay_resolvers(ProjectName::default(), &program))
            .map_err(|diagnostics| diagnostics_to_sorted_string(base, extensions, &diagnostics))?;

        let printer_options = PrinterOptions {
            debug_directive_data: true,
            ..Default::default()
        };
        let mut printed = next_program
            .operations()
            .map(|def| print_operation(&schema, def, printer_options.clone()))
            .chain(
                next_program
                    .fragments()
                    .map(|def| print_fragment(&schema, def, printer_options.clone())),
            )
            .collect::<Vec<_>>();
        printed.sort();

        Ok(printed.join("\n\n"))
    } else {
        panic!("Expected exactly one %extensions% section marker.")
    }
}

pub fn diagnostics_to_sorted_string(
    source: &str,
    extensions: &str,
    diagnostics: &[Diagnostic],
) -> String {
    let printer = DiagnosticPrinter::new(|source_location| match source_location {
        SourceLocationKey::Embedded { index, .. } => {
            Some(TextSource::from_whole_document(match index {
                0 => source,
                1 => extensions,
                _ => panic!("Expected index to be 0 or 1"),
            }))
        }
        SourceLocationKey::Standalone { .. } => None,
        SourceLocationKey::Generated => None,
    });
    let mut printed = diagnostics
        .iter()
        .map(|diagnostic| printer.diagnostic_to_string(diagnostic))
        .collect::<Vec<_>>();
    printed.sort();
    printed.join("\n\n")
}
