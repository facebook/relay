/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::SourceLocationKey;
use docblock_syntax::parse_docblock;
use extract_graphql::{self, JavaScriptSourceFeature};
use fixture_tests::Fixture;
use graphql_test_helpers::diagnostics_to_sorted_string;
use intern::string_key::Intern;
use relay_docblock::parse_docblock_ast;

pub fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let js_features = extract_graphql::extract(fixture.content);

    let irs = js_features
        .iter()
        .enumerate()
        .filter_map(|(i, source)| match source {
            JavaScriptSourceFeature::GraphQL(_) => None,
            JavaScriptSourceFeature::Docblock(docblock_source) => Some((i, docblock_source)),
        })
        .map(|(i, source)| {
            parse_docblock(
                &source.text,
                SourceLocationKey::Embedded {
                    path: format!("/path/to/test/fixture/{}", fixture.file_name).intern(),
                    index: i as u16,
                },
            )
            .and_then(|ast| parse_docblock_ast(&ast))
            .map_err(|diagnostics| diagnostics_to_sorted_string(&source.text, &diagnostics))
        })
        .collect::<Result<Vec<_>, String>>()?;

    let output = irs
        .iter()
        .flatten()
        .map(|ir| ir.to_sdl_string())
        .collect::<Vec<_>>()
        .join("\n\n");

    Ok(output)
}
