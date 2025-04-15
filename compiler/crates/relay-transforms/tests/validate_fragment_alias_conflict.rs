/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::SourceLocationKey;
use common::TextSource;
use fixture_tests::Fixture;
use graphql_cli::DiagnosticPrinter;
use graphql_ir::Program;
use graphql_ir::build;
use graphql_syntax::parse_executable;
use graphql_test_helpers::diagnostics_to_sorted_string;
use relay_test_schema::TEST_SCHEMA;
use relay_test_schema::get_test_schema_with_located_extensions;
use relay_transforms::validate_fragment_alias_conflict;

pub async fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let mut schema = TEST_SCHEMA.to_owned();
    let mut source = fixture.content;
    let source_location = SourceLocationKey::embedded(fixture.file_name, 0);
    if fixture.content.contains("%extensions%") {
        let extension_location = SourceLocationKey::embedded(fixture.file_name, 1);
        let parts: Vec<_> = fixture.content.split("%extensions%").collect();
        if let [base, extensions] = parts.as_slice() {
            source = base;
            schema = get_test_schema_with_located_extensions(extensions, extension_location);
        } else {
            panic!("Expected exactly one %extensions% section marker.")
        }
    }
    let ast = parse_executable(source, source_location).unwrap();
    let ir_result = build(&schema, &ast.definitions);
    let ir = match ir_result {
        Ok(res) => res,
        Err(errors) => {
            let mut errs = errors
                .into_iter()
                .map(|err| {
                    let printer = DiagnosticPrinter::new(|_| {
                        Some(TextSource::from_whole_document(fixture.content.to_string()))
                    });
                    printer.diagnostic_to_string(&err)
                })
                .collect::<Vec<_>>();
            errs.sort();
            return Err(errs.join("\n\n"));
        }
    };

    let program = Program::from_definitions(Arc::clone(&TEST_SCHEMA), ir);
    validate_fragment_alias_conflict(&program)
        .map_err(|diagnostics| diagnostics_to_sorted_string(fixture.content, &diagnostics))?;

    Ok("OK".to_owned())
}
