/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::SourceLocationKey;
use fixture_tests::Fixture;
use graphql_syntax::parse_executable;
use graphql_text_printer::prettier_print_executable_document;

pub async fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let source_location = SourceLocationKey::standalone(fixture.file_name);
    let document = parse_executable(fixture.content, source_location)
        .map_err(|errors| format!("Parse errors: {:?}", errors))?;

    Ok(prettier_print_executable_document(&document))
}
