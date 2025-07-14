/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<2b8e7c34ba92b84e94641baec91414cd>>
 */

mod generate_live_query_metadata;

use generate_live_query_metadata::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn live_by_at_live() {
    let input = include_str!("generate_live_query_metadata/fixtures/live_by_at_live.graphql");
    let expected = include_str!("generate_live_query_metadata/fixtures/live_by_at_live.expected");
    test_fixture(transform_fixture, file!(), "live_by_at_live.graphql", "generate_live_query_metadata/fixtures/live_by_at_live.expected", input, expected).await;
}

#[tokio::test]
async fn live_by_config_id() {
    let input = include_str!("generate_live_query_metadata/fixtures/live_by_config_id.graphql");
    let expected = include_str!("generate_live_query_metadata/fixtures/live_by_config_id.expected");
    test_fixture(transform_fixture, file!(), "live_by_config_id.graphql", "generate_live_query_metadata/fixtures/live_by_config_id.expected", input, expected).await;
}

#[tokio::test]
async fn live_by_polling_interval() {
    let input = include_str!("generate_live_query_metadata/fixtures/live_by_polling_interval.graphql");
    let expected = include_str!("generate_live_query_metadata/fixtures/live_by_polling_interval.expected");
    test_fixture(transform_fixture, file!(), "live_by_polling_interval.graphql", "generate_live_query_metadata/fixtures/live_by_polling_interval.expected", input, expected).await;
}
