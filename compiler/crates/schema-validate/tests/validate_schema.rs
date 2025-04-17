/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::SourceLocationKey;
use common::TextSource;
use fixture_tests::Fixture;
use graphql_cli::DiagnosticPrinter;
use schema::build_schema_with_extensions;
use schema_validate_lib::SchemaValidationOptions;
use schema_validate_lib::validate;

pub async fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let result = build_schema_with_extensions::<&str, &str>(
        &[(
            fixture.content,
            SourceLocationKey::standalone(fixture.file_name),
        )],
        &[],
    )
    .and_then(|schema| {
        validate(
            &schema,
            SchemaValidationOptions {
                allow_introspection_names: false,
            },
        )
    });
    match result {
        Ok(_) => Ok("OK".to_string()),
        Err(diagnostics) => {
            let printer = DiagnosticPrinter::new(|_| {
                Some(TextSource::from_whole_document(fixture.content.to_string()))
            });
            Ok(printer.diagnostics_to_string(&diagnostics))
        }
    }
}
