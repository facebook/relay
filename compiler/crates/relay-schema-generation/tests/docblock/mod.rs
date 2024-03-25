/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::path::Path;

use common::Diagnostic;
use common::SourceLocationKey;
use common::TextSource;
use fixture_tests::Fixture;
use graphql_cli::DiagnosticPrinter;
use graphql_test_helpers::ProjectFixture;
use intern::Lookup;
use relay_schema_generation::RelayResolverExtractor;

pub async fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let mut extractor = RelayResolverExtractor::new();
    let mut errors: Vec<Diagnostic> = vec![];
    let project_fixture = ProjectFixture::deserialize(fixture.content);

    // let files = fixture.content.split("//%SPLIT_FILE%");
    project_fixture.files().iter().for_each(|(path, content)| {
        let source_location = SourceLocationKey::standalone(path.to_string_lossy().as_ref());
        if let Err(err) = extractor.parse_document(content, source_location) {
            errors.extend(err);
        }
    });

    let out = match extractor.resolve() {
        Ok((objects, fields)) => objects
            .into_iter()
            .map(|o| format!("{:#?}", o))
            .chain(fields.into_iter().map(|f| format!("{:#?}", f)))
            .collect::<Vec<_>>()
            .join("\n\n"),
        Err(err) => {
            errors.extend(err);
            Default::default()
        }
    };
    let err = diagnostics_to_sorted_string(&project_fixture, &errors);
    Ok(out + "\n\n" + &err)
}

fn diagnostics_to_sorted_string(fixtures: &ProjectFixture, diagnostics: &[Diagnostic]) -> String {
    let printer = DiagnosticPrinter::new(|source_location| match source_location {
        SourceLocationKey::Standalone { path } => {
            let source = fixtures.files().get(Path::new(path.lookup())).unwrap();
            Some(TextSource::from_whole_document(source))
        }
        SourceLocationKey::Embedded { .. } | SourceLocationKey::Generated => unreachable!(),
    });
    let mut printed = diagnostics
        .iter()
        .map(|diagnostic| printer.diagnostic_to_string(diagnostic))
        .collect::<Vec<_>>();
    printed.sort();
    printed.join("\n\n")
}
