/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::{DiagnosticsResult, SourceLocationKey};
use docblock_syntax::{parse_docblock, DocblockSource};
use extract_graphql::{self, JavaScriptSourceFeature};
use fixture_tests::Fixture;
use graphql_test_helpers::diagnostics_to_sorted_string;
use intern::string_key::Intern;
use relay_docblock::parse_docblock_ast;
use relay_test_schema::TEST_SCHEMA;

pub fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let js_features = extract_graphql::extract(fixture.content);

    let stringify = |i: usize, source: &DocblockSource| -> DiagnosticsResult<String> {
        let ast = parse_docblock(
            &source.text,
            SourceLocationKey::Embedded {
                path: format!("/path/to/test/fixture/{}", fixture.file_name).intern(),
                index: i as u16,
            },
        )?;
        let ir = parse_docblock_ast(&ast)?.unwrap();

        ir.to_sdl_string(&TEST_SCHEMA)
    };

    let schema_strings = js_features
        .iter()
        .enumerate()
        .filter_map(|(i, source)| match source {
            JavaScriptSourceFeature::GraphQL(_) => None,
            JavaScriptSourceFeature::Docblock(docblock_source) => Some((i, docblock_source)),
        })
        .map(|(i, source)| {
            stringify(i, source)
                .map_err(|diagnostics| diagnostics_to_sorted_string(&source.text, &diagnostics))
        })
        .collect::<Result<Vec<_>, String>>()?;

    Ok(schema_strings.join("\n\n"))
}
