/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::{Diagnostic, DiagnosticsResult, FeatureFlag, SourceLocationKey};
use fixture_tests::Fixture;
use graphql_cli::DiagnosticPrinter;
use graphql_ir::{
    build_ir_with_extra_features, BuilderOptions, FragmentVariablesSemantic, Program, RelayMode,
};
use graphql_syntax::parse_executable;
use graphql_text_printer::{print_fragment, print_operation, PrinterOptions};
use relay_test_schema::get_test_schema;
use std::sync::Arc;

pub fn apply_transform_for_test<T>(fixture: &Fixture<'_>, transform: T) -> Result<String, String>
where
    T: Fn(&Program) -> DiagnosticsResult<Program>,
{
    let source_location = SourceLocationKey::standalone(fixture.file_name);
    let schema = get_test_schema();
    let ast = parse_executable(fixture.content, source_location).unwrap();
    let ir_result = build_ir_with_extra_features(
        &schema,
        &ast.definitions,
        &BuilderOptions {
            allow_undefined_fragment_spreads: false,
            fragment_variables_semantic: FragmentVariablesSemantic::PassedValue,
            relay_mode: Some(RelayMode {
                enable_provided_variables: &FeatureFlag::Enabled,
            }),
            default_anonymous_operation_name: None,
        },
    );
    let ir = ir_result
        .map_err(|diagnostics| diagnostics_to_sorted_string(fixture.content, &diagnostics))?;

    let program = Program::from_definitions(Arc::clone(&schema), ir);
    let next_program = transform(&program)
        .map_err(|diagnostics| diagnostics_to_sorted_string(fixture.content, &diagnostics))?;


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
    let printer = DiagnosticPrinter::new(|_| Some(source.to_string()));
    let mut printed = diagnostics
        .iter()
        .map(|diagnostic| printer.diagnostic_to_string(diagnostic))
        .collect::<Vec<_>>();
    printed.sort();
    printed.join("\n\n")
}
