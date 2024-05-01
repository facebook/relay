/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<93e5f2ac6e6d960616d4f1a412fccc79>>
 */

mod catch_directive;

use catch_directive::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn catch_usage() {
    let input = include_str!("catch_directive/fixtures/catch-usage.graphql");
    let expected = include_str!("catch_directive/fixtures/catch-usage.expected");
    test_fixture(transform_fixture, file!(), "catch-usage.graphql", "catch_directive/fixtures/catch-usage.expected", input, expected).await;
}

#[tokio::test]
async fn catch_usage_linked() {
    let input = include_str!("catch_directive/fixtures/catch-usage-linked.graphql");
    let expected = include_str!("catch_directive/fixtures/catch-usage-linked.expected");
    test_fixture(transform_fixture, file!(), "catch-usage-linked.graphql", "catch_directive/fixtures/catch-usage-linked.expected", input, expected).await;
}

#[tokio::test]
async fn catch_usage_linked_with_linked_sibling() {
    let input = include_str!("catch_directive/fixtures/catch-usage-linked-with-linked-sibling.graphql");
    let expected = include_str!("catch_directive/fixtures/catch-usage-linked-with-linked-sibling.expected");
    test_fixture(transform_fixture, file!(), "catch-usage-linked-with-linked-sibling.graphql", "catch_directive/fixtures/catch-usage-linked-with-linked-sibling.expected", input, expected).await;
}

#[tokio::test]
async fn catch_usage_nested_catches() {
    let input = include_str!("catch_directive/fixtures/catch-usage-nested-catches.graphql");
    let expected = include_str!("catch_directive/fixtures/catch-usage-nested-catches.expected");
    test_fixture(transform_fixture, file!(), "catch-usage-nested-catches.graphql", "catch_directive/fixtures/catch-usage-nested-catches.expected", input, expected).await;
}

#[tokio::test]
async fn catch_usage_on_query() {
    let input = include_str!("catch_directive/fixtures/catch-usage-on-query.graphql");
    let expected = include_str!("catch_directive/fixtures/catch-usage-on-query.expected");
    test_fixture(transform_fixture, file!(), "catch-usage-on-query.graphql", "catch_directive/fixtures/catch-usage-on-query.expected", input, expected).await;
}

#[tokio::test]
async fn catch_usage_on_query_with_required_invalid() {
    let input = include_str!("catch_directive/fixtures/catch-usage-on-query-with-required.invalid.graphql");
    let expected = include_str!("catch_directive/fixtures/catch-usage-on-query-with-required.invalid.expected");
    test_fixture(transform_fixture, file!(), "catch-usage-on-query-with-required.invalid.graphql", "catch_directive/fixtures/catch-usage-on-query-with-required.invalid.expected", input, expected).await;
}
