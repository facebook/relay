/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::path::Path;
use std::sync::Arc;

use common::Diagnostic;
use common::SourceLocationKey;
use common::TextSource;
use extract_graphql::JavaScriptSourceFeature;
use fixture_tests::Fixture;
use graphql_cli::DiagnosticPrinter;
use graphql_syntax::ExecutableDefinition;
use graphql_test_helpers::ProjectFixture;
use intern::Lookup;
use relay_config::ProjectName;
use relay_docblock::extend_schema_with_resolver_type_system_definition;
use relay_docblock::DocblockIr;
use relay_schema_generation::RelayResolverExtractor;
use relay_test_schema::get_test_schema_with_extensions;

pub async fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let mut extractor = RelayResolverExtractor::new();

    let project_name = ProjectName::default();
    let mut schema = get_test_schema_with_extensions("");

    let mut errors: Vec<Diagnostic> = vec![];
    let project_fixture = ProjectFixture::deserialize(fixture.content);

    project_fixture.files().iter().for_each(|(path, content)| {
        let gql_operations = parse_document_definitions(content, path);
        if let Err(err) = extractor.parse_document(
            content,
            path.to_string_lossy().as_ref(),
            &Some(&gql_operations),
        ) {
            errors.extend(err);
        }
    });

    let mut out = match extractor.resolve() {
        Ok((objects, fields)) => objects
            .into_iter()
            .chain(fields.into_iter().map(DocblockIr::TerseRelayResolver))
            .map(|ir| {
                // Extend schema with the IR and print SDL
                let schema_document = ir
                    .clone()
                    .to_graphql_schema_ast(
                        project_name,
                        &schema,
                        &Default::default(),
                        &Default::default(),
                    )
                    .unwrap();
                for definition in &schema_document.definitions {
                    extend_schema_with_resolver_type_system_definition(
                        definition.clone(),
                        Arc::get_mut(&mut schema)
                            .expect("Expected to be able to get mutable reference to schema"),
                        schema_document.location,
                    )
                    .unwrap();
                }

                let sdl = ir
                    .clone()
                    .to_sdl_string(
                        project_name,
                        &schema,
                        &Default::default(),
                        &Default::default(),
                    )
                    .unwrap();

                format!("{:#?}\n{}", &ir, sdl)
            })
            .collect::<Vec<_>>(),
        Err(err) => {
            errors.extend(err);
            Default::default()
        }
    };
    let err = diagnostics_to_sorted_string(&project_fixture, &errors);

    out.sort();
    Ok(out.join("\n\n") + "\n\n" + &err)
}

fn parse_document_definitions(content: &str, path: &Path) -> Vec<ExecutableDefinition> {
    let features = extract_graphql::extract(content);
    features
        .into_iter()
        .filter_map(|feature| {
            if let JavaScriptSourceFeature::GraphQL(graphql_source) = feature {
                Some(graphql_source.to_text_source().text)
            } else {
                None
            }
        })
        .flat_map(|query_text| {
            graphql_syntax::parse_executable(
                &query_text,
                SourceLocationKey::standalone(path.to_str().unwrap()),
            )
            .unwrap()
            .definitions
        })
        .collect()
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
