/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use extract_graphql::parse_chunks;
use fixture_tests::Fixture;

pub fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    Ok(parse_chunks(fixture.content)
        .into_iter()
        .map(|source| {
            format!(
                "line: {}, column: {}, text: <{}>",
                source.line_index, source.column_index, source.text
            )
        })
        .collect::<Vec<_>>()
        .join("\n"))
}
