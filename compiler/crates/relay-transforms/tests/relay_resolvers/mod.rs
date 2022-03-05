/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::{Diagnostic, SourceLocationKey, TextSource};
use fixture_tests::Fixture;
use graphql_cli::DiagnosticPrinter;
use graphql_ir::{build, Program};
use graphql_syntax::parse_executable;
use graphql_text_printer::{print_fragment, print_operation, PrinterOptions};
use relay_test_schema::get_test_schema_with_located_extensions;
use relay_transforms::{find_resolver_dependencies, relay_resolvers, DependencyMap};
use std::sync::Arc;

pub fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let parts: Vec<_> = fixture.content.split("%extensions%").collect();
    if let [base, extensions] = parts.as_slice() {
        let grapqhl_location = SourceLocationKey::embedded(fixture.file_name, 0);
        let extension_location = SourceLocationKey::embedded(fixture.file_name, 1);

        let ast = parse_executable(base, grapqhl_location).unwrap();
        let schema = get_test_schema_with_located_extensions(extensions, extension_location);
        let ir = build(&schema, &ast.definitions).unwrap();
        let program = Program::from_definitions(Arc::clone(&schema), ir);

        let mut implicit_dependencies = Default::default();
        find_resolver_dependencies(&mut implicit_dependencies, &program);
        let next_program = relay_resolvers(&program, true)
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

        printed.push(print_dependency_map(implicit_dependencies));

        Ok(printed.join("\n\n"))
    } else {
        panic!("Expected exactly one %extensions% section marker.")
    }
}

fn print_dependency_map(dependency_map: DependencyMap) -> String {
    let mut lines = dependency_map
        .into_iter()
        .map(|(operation_name, dependencies)| {
            let mut dependency_list = dependencies
                .into_iter()
                .map(|key| key.to_string())
                .collect::<Vec<_>>();
            dependency_list.sort();
            format!(
                "# {} --> {{{}}}",
                operation_name,
                dependency_list.join(", ")
            )
        })
        .collect::<Vec<_>>();

    lines.sort();

    format!("# Implicit Dependencies:\n#\n{}", lines.join("\n"))
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
