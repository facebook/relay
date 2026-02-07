/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::DiagnosticsResult;
use common::FeatureFlag;
use common::SourceLocationKey;
use docblock_syntax::DocblockSource;
use docblock_syntax::parse_docblock;
use extract_graphql::JavaScriptSourceFeature;
use fixture_tests::Fixture;
use graphql_syntax::ExecutableDefinition;
use graphql_syntax::parse_executable;
use graphql_test_helpers::diagnostics_to_sorted_string;
use intern::string_key::Intern;
use relay_config::ProjectName;
use relay_docblock::ParseOptions;
use relay_docblock::extend_schema_with_resolver_type_system_definition;
use relay_docblock::parse_docblock_ast;
use relay_docblock::validate_resolver_schema;
use relay_test_schema::get_test_schema_with_extensions;
use schema::SDLSchema;

pub async fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let parts: Vec<_> = fixture.content.split("%extensions%").collect();
    let (base, mut schema) = match parts.as_slice() {
        [base, extensions] => (base, extract_schema_from_js(extensions)),
        [base] => (base, get_test_schema_with_extensions("")),
        _ => panic!("Invalid fixture input {}", fixture.content),
    };

    let js_features = extract_graphql::extract(base);
    let project_name = ProjectName::default();

    let executable_documents = js_features
        .iter()
        .filter_map(|source| match source {
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

    let mut stringify = |i: usize, source: &DocblockSource| -> DiagnosticsResult<String> {
        let ast = parse_docblock(
            &source.text_source().text,
            SourceLocationKey::Embedded {
                path: format!("/path/to/test/fixture/{}", fixture.file_name).intern(),
                index: i as u16,
            },
        )?;
        let ir = parse_docblock_ast(
            &project_name,
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
        )?
        .unwrap();

        // In non-tests, this function (correctly) consumes TypeSystemDefinition when modifying the
        // schema.
        // In tests, we need to clone, because we **also** want to print the schema changes.
        let schema_document =
            ir.clone()
                .to_graphql_schema_ast(project_name, &schema, &Default::default())?;
        for definition in &schema_document.definitions {
            extend_schema_with_resolver_type_system_definition(
                definition.clone(),
                Arc::get_mut(&mut schema)
                    .expect("Expected to be able to get mutable reference to schema"),
                schema_document.location,
            )?;
        }

        validate_resolver_schema(&schema, &Default::default())?;

        ir.to_sdl_string(project_name, &schema, &Default::default())
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
