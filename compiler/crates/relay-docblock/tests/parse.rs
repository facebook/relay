/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::Diagnostic;
use common::FeatureFlag;
use common::SourceLocationKey;
use docblock_syntax::parse_docblock;
use extract_graphql::JavaScriptSourceFeature;
use fixture_tests::Fixture;
use graphql_cli::DiagnosticPrinter;
use graphql_syntax::ExecutableDefinition;
use graphql_syntax::parse_executable;
use intern::string_key::Intern;
use relay_config::ProjectName;
use relay_docblock::ParseOptions;
use relay_docblock::parse_docblock_ast;

pub async fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let js_features = extract_graphql::extract(fixture.content);
    let executable_documents = js_features
        .iter()
        .enumerate()
        .filter_map(|(i, source)| match source {
            JavaScriptSourceFeature::GraphQL(source) => Some(
                parse_executable(
                    &source.text_source().text,
                    SourceLocationKey::Embedded {
                        path: format!("/path/to/test/fixture/{}", fixture.file_name).intern(),
                        index: i as u16,
                    },
                )
                .map_err(|diagnostics| diagnostics_to_sorted_string(fixture.content, &diagnostics))
                .map(|document| document.definitions),
            ),
            JavaScriptSourceFeature::Docblock(_) => None,
        })
        .collect::<Result<Vec<_>, String>>()?
        .iter()
        .flatten()
        .cloned()
        .collect::<Vec<ExecutableDefinition>>();

    let irs = js_features
        .iter()
        .enumerate()
        .filter_map(|(i, source)| match source {
            JavaScriptSourceFeature::GraphQL(_) => None,
            JavaScriptSourceFeature::Docblock(docblock_source) => Some(
                parse_docblock(
                    &docblock_source.text_source().text,
                    SourceLocationKey::Embedded {
                        path: format!("/path/to/test/fixture/{}", fixture.file_name).intern(),
                        index: i as u16,
                    },
                )
                .and_then(|ast| {
                    parse_docblock_ast(
                        &ProjectName::default(),
                        &ast,
                        Some(&executable_documents),
                        &ParseOptions {
                            enable_interface_output_type: if fixture
                                .content
                                .contains("// relay:enable_interface_output_type")
                            {
                                &FeatureFlag::Enabled
                            } else {
                                &FeatureFlag::Disabled
                            },
                            allow_resolver_non_nullable_return_type: if fixture
                                .content
                                .contains("// relay:allow_resolver_non_nullable_return_type")
                            {
                                &FeatureFlag::Enabled
                            } else {
                                &FeatureFlag::Disabled
                            },
                            enable_legacy_verbose_resolver_syntax: if fixture
                                .content
                                .contains("// relay:allow_legacy_verbose_syntax")
                            {
                                &FeatureFlag::Enabled
                            } else {
                                &FeatureFlag::Disabled
                            },
                        },
                    )
                })
                .map_err(|diagnostics| diagnostics_to_sorted_string(fixture.content, &diagnostics)),
            ),
        })
        .collect::<Result<Vec<_>, String>>()?;

    let output = irs
        .iter()
        .flatten()
        .map(|ir| format!("{:#?}", ir))
        .collect::<Vec<_>>()
        .join("\n\n");

    Ok(output)
}

pub fn diagnostics_to_sorted_string(source: &str, diagnostics: &[Diagnostic]) -> String {
    let printer = DiagnosticPrinter::new(|source_location| match source_location {
        SourceLocationKey::Embedded { index, .. } => Some(
            extract_graphql::extract(source)[index as usize]
                .text_source()
                .clone(),
        ),
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
