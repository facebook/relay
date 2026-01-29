/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

mod project_fixture;
mod temp_dir;
use std::collections::HashMap;
use std::sync::Arc;

use common::Diagnostic;
use common::DiagnosticsResult;
use common::SourceLocationKey;
use common::TextSource;
use fixture_tests::Fixture;
use graphql_cli::DiagnosticPrinter;
use graphql_cli::Sources as DiagnosticPrinterSources;
use graphql_ir::BuilderOptions;
use graphql_ir::FragmentVariablesSemantic;
use graphql_ir::Program;
use graphql_ir::RelayMode;
use graphql_ir::build_ir_with_extra_features;
use graphql_syntax::parse_executable;
use graphql_text_printer::PrinterOptions;
use graphql_text_printer::print_fragment;
use graphql_text_printer::print_operation;
pub use project_fixture::ProjectFixture;
use relay_test_schema::get_test_schema;
use relay_test_schema::get_test_schema_with_located_extensions;
pub use temp_dir::TestDir;

pub fn apply_transform_for_test<T>(fixture: &Fixture<'_>, transform: T) -> Result<String, String>
where
    T: Fn(&Program) -> DiagnosticsResult<Program>,
{
    let parts: Vec<_> = fixture.content.split("%extensions%").collect();
    let source_location = SourceLocationKey::embedded(fixture.file_name, 0);
    let source_text = parts[0];

    let mut sources_map: HashMap<SourceLocationKey, String> = Default::default();

    sources_map.insert(source_location, source_text.to_string());
    let ast = parse_executable(source_text, source_location).unwrap();
    let schema = if let Some(extensions_text) = parts.get(1) {
        let extension_location = SourceLocationKey::embedded(fixture.file_name, 1);
        sources_map.insert(extension_location, extensions_text.to_string());

        get_test_schema_with_located_extensions(extensions_text, extension_location)
    } else {
        get_test_schema()
    };

    let ir_result = build_ir_with_extra_features(
        &schema,
        &ast.definitions,
        &BuilderOptions {
            allow_undefined_fragment_spreads: false,
            allow_non_overlapping_abstract_spreads: false,
            fragment_variables_semantic: FragmentVariablesSemantic::PassedValue,
            relay_mode: Some(RelayMode),
            default_anonymous_operation_name: None,
            allow_custom_scalar_literals: true, // for compatibility
        },
    );
    let ir = ir_result.map_err(|diagnostics| {
        diagnostics_to_sorted_strings_with_sources_map(&sources_map, &diagnostics)
    })?;

    let program = Program::from_definitions(Arc::clone(&schema), ir);
    let next_program = transform(&program).map_err(|diagnostics| {
        diagnostics_to_sorted_strings_with_sources_map(&sources_map, &diagnostics)
    })?;

    let printer_options = PrinterOptions {
        debug_directive_data: true,
        ..Default::default()
    };

    let mut printed = next_program
        .operations()
        .map(|def| print_operation(&schema, def, printer_options.clone()))
        .collect::<Vec<_>>();
    printed.sort();

    let mut printed_fragments = next_program
        .fragments()
        .map(|def| print_fragment(&schema, def, printer_options.clone()))
        .collect::<Vec<_>>();
    printed_fragments.sort();
    printed.extend(printed_fragments);

    Ok(printed.join("\n\n"))
}

pub fn diagnostics_to_sorted_string(source: &str, diagnostics: &[Diagnostic]) -> String {
    let printer =
        DiagnosticPrinter::new(|_| Some(TextSource::from_whole_document(source.to_string())));

    print_diagnostics_to_sorted_string(&printer, diagnostics)
}

pub fn diagnostics_to_sorted_strings_with_sources_map(
    sources: &HashMap<SourceLocationKey, String>,
    diagnostics: &[Diagnostic],
) -> String {
    let printer = DiagnosticPrinter::new(|source_location| {
        sources
            .get(&source_location)
            .map(TextSource::from_whole_document)
    });
    print_diagnostics_to_sorted_string(&printer, diagnostics)
}

fn print_diagnostics_to_sorted_string<T: DiagnosticPrinterSources>(
    printer: &DiagnosticPrinter<T>,
    diagnostics: &[Diagnostic],
) -> String {
    let mut printed = diagnostics
        .iter()
        .map(|diagnostic| printer.diagnostic_to_string(diagnostic))
        .collect::<Vec<_>>();
    printed.sort();
    printed.join("\n\n")
}
