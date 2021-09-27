/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::SourceLocationKey;
use fixture_tests::Fixture;
use graphql_ir::{build, Program};
use graphql_syntax::parse_executable;
use graphql_test_helpers::diagnostics_to_sorted_string;
use graphql_text_printer::{print_fragment, print_operation, PrinterOptions};
use relay_test_schema::get_test_schema_with_extensions;
use relay_transforms::{find_resolver_dependencies, relay_resolvers, DependencyMap};
use std::sync::Arc;

pub fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let parts: Vec<_> = fixture.content.split("%extensions%").collect();
    if let [base, extensions] = parts.as_slice() {
        let source_location = SourceLocationKey::standalone(fixture.file_name);
        let ast = parse_executable(base, source_location).unwrap();
        let schema = get_test_schema_with_extensions(extensions);
        let ir = build(&schema, &ast.definitions).unwrap();
        let program = Program::from_definitions(Arc::clone(&schema), ir);

        let mut implicit_dependencies = Default::default();
        find_resolver_dependencies(&mut implicit_dependencies, &program);
        let next_program = relay_resolvers(&program, true)
            .map_err(|diagnostics| diagnostics_to_sorted_string(fixture.content, &diagnostics))?;

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
