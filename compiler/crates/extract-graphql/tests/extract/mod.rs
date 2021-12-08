/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use extract_graphql::extract;
use extract_graphql::JavaScriptSourceFeature;
use fixture_tests::Fixture;

pub fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    Ok(extract(fixture.content)
        .into_iter()
        .map(|source| match source {
            JavaScriptSourceFeature::GraphQLSource(s) => {
                format!(
                    "graphql - line: {}, column: {}, text: <{}>",
                    s.line_index, s.column_index, s.text
                )
            }
            JavaScriptSourceFeature::RelayResolverMetadataSource(s) => {
                format!(
                    "resolver - line: {}, column: {}, text: <{}>",
                    s.line_index, s.column_index, s.text
                )
            }
        })
        .collect::<Vec<_>>()
        .join("\n"))
}
