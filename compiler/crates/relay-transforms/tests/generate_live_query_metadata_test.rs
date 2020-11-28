/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<a4c9f3e981e99c6c93fc30a086221a89>>
 */

mod generate_live_query_metadata;

use generate_live_query_metadata::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn live_by_config_id() {
    let input = include_str!("generate_live_query_metadata/fixtures/live_by_config_id.graphql");
    let expected = include_str!("generate_live_query_metadata/fixtures/live_by_config_id.expected");
    test_fixture(transform_fixture, "live_by_config_id.graphql", "generate_live_query_metadata/fixtures/live_by_config_id.expected", input, expected);
}

#[test]
fn live_by_polling_interval() {
    let input = include_str!("generate_live_query_metadata/fixtures/live_by_polling_interval.graphql");
    let expected = include_str!("generate_live_query_metadata/fixtures/live_by_polling_interval.expected");
    test_fixture(transform_fixture, "live_by_polling_interval.graphql", "generate_live_query_metadata/fixtures/live_by_polling_interval.expected", input, expected);
}
