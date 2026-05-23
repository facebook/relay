/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<7211f6cccf768071b335d8a5401867dc>>
 */

mod query_stats;

use query_stats::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn diamond_dependency() {
    let input = include_str!("query_stats/fixtures/diamond-dependency.graphql");
    let expected = include_str!("query_stats/fixtures/diamond-dependency.expected");
    test_fixture(transform_fixture, file!(), "diamond-dependency.graphql", "query_stats/fixtures/diamond-dependency.expected", input, expected).await;
}

#[tokio::test]
async fn direct_and_indirect() {
    let input = include_str!("query_stats/fixtures/direct-and-indirect.graphql");
    let expected = include_str!("query_stats/fixtures/direct-and-indirect.expected");
    test_fixture(transform_fixture, file!(), "direct-and-indirect.graphql", "query_stats/fixtures/direct-and-indirect.expected", input, expected).await;
}

#[tokio::test]
async fn direct_fragments_only() {
    let input = include_str!("query_stats/fixtures/direct-fragments-only.graphql");
    let expected = include_str!("query_stats/fixtures/direct-fragments-only.expected");
    test_fixture(transform_fixture, file!(), "direct-fragments-only.graphql", "query_stats/fixtures/direct-fragments-only.expected", input, expected).await;
}

#[tokio::test]
async fn mixed_operations() {
    let input = include_str!("query_stats/fixtures/mixed-operations.graphql");
    let expected = include_str!("query_stats/fixtures/mixed-operations.expected");
    test_fixture(transform_fixture, file!(), "mixed-operations.graphql", "query_stats/fixtures/mixed-operations.expected", input, expected).await;
}

#[tokio::test]
async fn multiple_operations() {
    let input = include_str!("query_stats/fixtures/multiple-operations.graphql");
    let expected = include_str!("query_stats/fixtures/multiple-operations.expected");
    test_fixture(transform_fixture, file!(), "multiple-operations.graphql", "query_stats/fixtures/multiple-operations.expected", input, expected).await;
}

#[tokio::test]
async fn nested_fragments() {
    let input = include_str!("query_stats/fixtures/nested-fragments.graphql");
    let expected = include_str!("query_stats/fixtures/nested-fragments.expected");
    test_fixture(transform_fixture, file!(), "nested-fragments.graphql", "query_stats/fixtures/nested-fragments.expected", input, expected).await;
}

#[tokio::test]
async fn no_fragments() {
    let input = include_str!("query_stats/fixtures/no-fragments.graphql");
    let expected = include_str!("query_stats/fixtures/no-fragments.expected");
    test_fixture(transform_fixture, file!(), "no-fragments.graphql", "query_stats/fixtures/no-fragments.expected", input, expected).await;
}
