/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::SourceLocationKey;
use docblock_syntax::parse_docblock;

use fixture_tests::Fixture;
use graphql_test_helpers::diagnostics_to_sorted_string;
use relay_docblock::parse_docblock_ast;

pub fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let js_features = extract_graphql::extract(fixture.content);

    let asts = js_features
        .docblock_sources
        .iter()
        .map(|souce| parse_docblock(&souce.text, SourceLocationKey::Generated))
        .collect::<Result<Vec<_>, _>>()
        .map_err(|diagnostics| diagnostics_to_sorted_string(fixture.content, &diagnostics))?;

    let irs = asts
        .iter()
        .map(parse_docblock_ast)
        .collect::<Result<Vec<_>, _>>()
        .map_err(|diagnostics| diagnostics_to_sorted_string(fixture.content, &diagnostics))?
        .iter()
        .flatten()
        .map(|ir| format!("{:#?}", ir))
        .collect::<Vec<_>>()
        .join("\n\n");

    Ok(irs)
}
