/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::SourceLocationKey;
// use docblock_syntax::parse_docblock;
use docblock_syntax::parse_docblock;
use extract_graphql;
use fixture_tests::Fixture;
use graphql_test_helpers::diagnostics_to_sorted_string;
use intern::string_key::Intern;
use relay_docblock::{parse_docblock_ast, DocblockIr};

pub fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let js_features = extract_graphql::extract(fixture.content);

    let asts = js_features
        .docblock_sources
        .iter()
        .enumerate()
        .map(|(i, souce)| {
            parse_docblock(
                &souce.text,
                SourceLocationKey::Embedded {
                    path: format!("/path/to/test/fixture/{}", fixture.file_name).intern(),
                    index: i as u16,
                },
            )
        })
        .collect::<Result<Vec<_>, _>>()
        .map_err(|diagnostics| diagnostics_to_sorted_string(fixture.content, &diagnostics))?;

    let irs = asts
        .iter()
        .map(|ast| parse_docblock_ast(ast))
        .collect::<Result<Vec<_>, _>>()
        .map_err(|diagnostics| diagnostics_to_sorted_string(fixture.content, &diagnostics))?
        .iter()
        .flatten()
        .map(|ir| {
            let schema = match ir {
                DocblockIr::RelayResolver(resolver) => resolver.to_graphql_schema_ast(),
            };
            schema
                .definitions
                .iter()
                .map(|def| format!("{}", def))
                .collect::<Vec<_>>()
        })
        .flatten()
        .collect::<Vec<_>>()
        .join("\n\n");

    Ok(irs)
}
