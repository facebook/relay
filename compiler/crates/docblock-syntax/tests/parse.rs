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

pub async fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let mut content = fixture.content;
    if !content.starts_with("/*") {
        panic!("Expected fixture to start with \"/*\".")
    };
    if !content.ends_with("*/\n") {
        panic!("Expected fixture to end with \"*/\" followed by a newline.")
    }
    content = &content[2..content.len() - 3];
    parse_docblock(content, SourceLocationKey::standalone(fixture.file_name))
        .map(|x| format!("{:#?}", x))
        .map_err(|diagnostics| diagnostics_to_sorted_string(content, &diagnostics))
}
