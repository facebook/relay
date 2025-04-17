/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use extract_graphql::JavaScriptSourceFeature;
use extract_graphql::extract;
use fixture_tests::Fixture;

pub async fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let features = extract(fixture.content);
    Ok(features
        .into_iter()
        .map(|feature| match feature {
            JavaScriptSourceFeature::Docblock(docblock_source) => {
                let s = docblock_source.text_source();
                format!(
                    "docblock - line: {}, column: {}, text: <{}>",
                    s.line_index, s.column_index, s.text
                )
            }
            JavaScriptSourceFeature::GraphQL(graphql_source) => {
                let s = graphql_source.text_source();
                format!(
                    "graphql - line: {}, column: {}, text: <{}>",
                    s.line_index, s.column_index, s.text
                )
            }
        })
        .collect::<Vec<_>>()
        .join("\n"))
}
