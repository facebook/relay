/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::SourceLocationKey;
use fixture_tests::Fixture;
use graphql_ir::Program;
use graphql_ir::build;
use graphql_syntax::parse_executable;
use graphql_test_helpers::diagnostics_to_sorted_string;
use graphql_text_printer::PrinterOptions;
use graphql_text_printer::print_fragment;
use graphql_text_printer::print_operation;
use relay_test_schema::get_test_schema_with_extensions;
use relay_transforms::flatten;

pub async fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let source_location = SourceLocationKey::standalone(fixture.file_name);
    let ast = parse_executable(fixture.content, source_location)
        .map_err(|diagnostics| diagnostics_to_sorted_string(fixture.content, &diagnostics))?;
    let schema = get_test_schema_with_extensions(
        r#"
directive @serverInlineDirective on INLINE_FRAGMENT"#,
    );
    let ir = build(&schema, &ast.definitions)
        .map_err(|diagnostics| diagnostics_to_sorted_string(fixture.content, &diagnostics))?;
    let mut context = Program::from_definitions(Arc::clone(&schema), ir);
    flatten(
        &mut context,
        !fixture.content.contains("%for_printing%"),
        false,
    )
    .map_err(|diagnostics| diagnostics_to_sorted_string(fixture.content, &diagnostics))?;

    let printer_options = PrinterOptions {
        debug_directive_data: true,
        ..Default::default()
    };

    let mut printed_queries = context
        .operations()
        .map(|def| print_operation(&schema, def, printer_options.clone()))
        .collect::<Vec<_>>();

    let mut printed = context
        .fragments()
        .map(|def| print_fragment(&schema, def, printer_options.clone()))
        .collect::<Vec<_>>();
    printed.append(&mut printed_queries);
    printed.sort();
    Ok(printed.join("\n\n"))
}
