/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::SourceLocationKey;
use dependency_analyzer::compute_query_stats;
use dependency_analyzer::get_definition_references;
use fixture_tests::Fixture;
use graphql_syntax::*;

pub async fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let source_location = SourceLocationKey::standalone(fixture.file_name);
    let document = parse_executable(fixture.content, source_location).unwrap();
    let dep_map = get_definition_references(&document.definitions);
    let report = compute_query_stats(&document.definitions, &dep_map);
    Ok(report.format_report())
}
