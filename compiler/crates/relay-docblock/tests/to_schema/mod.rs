/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::DiagnosticsResult;
use common::SourceLocationKey;
use docblock_syntax::parse_docblock;
use docblock_syntax::DocblockSource;
use extract_graphql::JavaScriptSourceFeature;
use fixture_tests::Fixture;
use graphql_syntax::parse_executable;
use graphql_syntax::ExecutableDefinition;
use graphql_test_helpers::diagnostics_to_sorted_string;
use intern::string_key::Intern;
use relay_docblock::parse_docblock_ast;
use relay_docblock::ParseOptions;
use relay_test_schema::get_test_schema;
use relay_test_schema::get_test_schema_with_extensions;
use schema::SDLSchema;

pub fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let parts: Vec<_> = fixture.content.split("%extensions%").collect();
    let (base, schema) = match parts.as_slice() {
        [base, extensions] => (base, extract_schema_from_js(extensions)),
        [base] => (base, get_test_schema()),
        _ => panic!("Invalid fixture input {}", fixture.content),
    };

    let js_features = extract_graphql::extract(base);

    let executable_documents = js_features
        .iter()
        .enumerate()
        .filter_map(|(_, source)| match source {
            JavaScriptSourceFeature::GraphQL(source) => Some(
                parse_executable(&source.text_source().text, SourceLocationKey::Generated)
                    .map_err(|diagnostics| {
                        diagnostics_to_sorted_string(&source.text_source().text, &diagnostics)
                    })
                    .map(|document| document.definitions),
            ),
            JavaScriptSourceFeature::Docblock(_) => None,
        })
        .collect::<Result<Vec<_>, String>>()?
        .iter()
        .flatten()
        .cloned()
        .collect::<Vec<ExecutableDefinition>>();

    let stringify = |i: usize, source: &DocblockSource| -> DiagnosticsResult<String> {
        let ast = parse_docblock(
            &source.text_source().text,
            SourceLocationKey::Embedded {
                path: format!("/path/to/test/fixture/{}", fixture.file_name).intern(),
                index: i as u16,
            },
        )?;
        let ir = parse_docblock_ast(
            &ast,
            Some(&executable_documents),
            ParseOptions {
                use_named_imports: fixture.content.contains("// relay:use_named_imports"),
                relay_resolver_model_syntax_enabled: !fixture
                    .content
                    .contains("// relay:disable_relay_resolver_model_syntax"),
            },
        )?
        .unwrap();

        ir.to_sdl_string(&schema)
    };

    let schema_strings = js_features
        .iter()
        .enumerate()
        .filter_map(|(i, source)| match source {
            JavaScriptSourceFeature::GraphQL(_) => None,
            JavaScriptSourceFeature::Docblock(docblock_source) => Some((i, docblock_source)),
        })
        .map(|(i, source)| {
            stringify(i, source).map_err(|diagnostics| {
                diagnostics_to_sorted_string(&source.text_source().text, &diagnostics)
            })
        })
        .collect::<Result<Vec<_>, String>>()?;

    Ok(schema_strings.join("\n\n"))
}

fn extract_schema_from_js(js: &str) -> Arc<SDLSchema> {
    let js_features = extract_graphql::extract(js);
    let sdl_text = match js_features.as_slice() {
        [JavaScriptSourceFeature::GraphQL(source)] => &source.text_source().text,
        _ => {
            panic!("Expected %extensions% to contain exactly 1 graphql`` tagged template literal.")
        }
    };

    get_test_schema_with_extensions(sdl_text)
}
