/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<e6d8b286211a343f2c6ee423c31df22f>>
 */

mod relay_resolvers_abstract_types;

use relay_resolvers_abstract_types::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn edge_to_abstract_type() {
    let input = include_str!("relay_resolvers_abstract_types/fixtures/edge_to_abstract_type.graphql");
    let expected = include_str!("relay_resolvers_abstract_types/fixtures/edge_to_abstract_type.expected");
    test_fixture(transform_fixture, file!(), "edge_to_abstract_type.graphql", "relay_resolvers_abstract_types/fixtures/edge_to_abstract_type.expected", input, expected).await;
}

#[tokio::test]
async fn edge_to_abstract_type_disabled() {
    let input = include_str!("relay_resolvers_abstract_types/fixtures/edge_to_abstract_type_disabled.graphql");
    let expected = include_str!("relay_resolvers_abstract_types/fixtures/edge_to_abstract_type_disabled.expected");
    test_fixture(transform_fixture, file!(), "edge_to_abstract_type_disabled.graphql", "relay_resolvers_abstract_types/fixtures/edge_to_abstract_type_disabled.expected", input, expected).await;
}

#[tokio::test]
async fn edge_to_abstract_type_with_inline_fragment() {
    let input = include_str!("relay_resolvers_abstract_types/fixtures/edge_to_abstract_type_with_inline_fragment.graphql");
    let expected = include_str!("relay_resolvers_abstract_types/fixtures/edge_to_abstract_type_with_inline_fragment.expected");
    test_fixture(transform_fixture, file!(), "edge_to_abstract_type_with_inline_fragment.graphql", "relay_resolvers_abstract_types/fixtures/edge_to_abstract_type_with_inline_fragment.expected", input, expected).await;
}

#[tokio::test]
async fn edge_to_abstract_type_with_inline_fragment_on_abstract_type() {
    let input = include_str!("relay_resolvers_abstract_types/fixtures/edge_to_abstract_type_with_inline_fragment_on_abstract_type.graphql");
    let expected = include_str!("relay_resolvers_abstract_types/fixtures/edge_to_abstract_type_with_inline_fragment_on_abstract_type.expected");
    test_fixture(transform_fixture, file!(), "edge_to_abstract_type_with_inline_fragment_on_abstract_type.graphql", "relay_resolvers_abstract_types/fixtures/edge_to_abstract_type_with_inline_fragment_on_abstract_type.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_on_abstract_type_disabled() {
    let input = include_str!("relay_resolvers_abstract_types/fixtures/fragment_on_abstract_type_disabled.graphql");
    let expected = include_str!("relay_resolvers_abstract_types/fixtures/fragment_on_abstract_type_disabled.expected");
    test_fixture(transform_fixture, file!(), "fragment_on_abstract_type_disabled.graphql", "relay_resolvers_abstract_types/fixtures/fragment_on_abstract_type_disabled.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_on_abstract_type_enabled() {
    let input = include_str!("relay_resolvers_abstract_types/fixtures/fragment_on_abstract_type_enabled.graphql");
    let expected = include_str!("relay_resolvers_abstract_types/fixtures/fragment_on_abstract_type_enabled.expected");
    test_fixture(transform_fixture, file!(), "fragment_on_abstract_type_enabled.graphql", "relay_resolvers_abstract_types/fixtures/fragment_on_abstract_type_enabled.expected", input, expected).await;
}

#[tokio::test]
async fn nested_abstract_type_fragment() {
    let input = include_str!("relay_resolvers_abstract_types/fixtures/nested_abstract_type_fragment.graphql");
    let expected = include_str!("relay_resolvers_abstract_types/fixtures/nested_abstract_type_fragment.expected");
    test_fixture(transform_fixture, file!(), "nested_abstract_type_fragment.graphql", "relay_resolvers_abstract_types/fixtures/nested_abstract_type_fragment.expected", input, expected).await;
}

#[tokio::test]
async fn nested_abstract_type_query() {
    let input = include_str!("relay_resolvers_abstract_types/fixtures/nested_abstract_type_query.graphql");
    let expected = include_str!("relay_resolvers_abstract_types/fixtures/nested_abstract_type_query.expected");
    test_fixture(transform_fixture, file!(), "nested_abstract_type_query.graphql", "relay_resolvers_abstract_types/fixtures/nested_abstract_type_query.expected", input, expected).await;
}

#[tokio::test]
async fn nested_fragment_spread_on_abstract_type() {
    let input = include_str!("relay_resolvers_abstract_types/fixtures/nested_fragment_spread_on_abstract_type.graphql");
    let expected = include_str!("relay_resolvers_abstract_types/fixtures/nested_fragment_spread_on_abstract_type.expected");
    test_fixture(transform_fixture, file!(), "nested_fragment_spread_on_abstract_type.graphql", "relay_resolvers_abstract_types/fixtures/nested_fragment_spread_on_abstract_type.expected", input, expected).await;
}

#[tokio::test]
async fn spread_fragment_on_abstract_type() {
    let input = include_str!("relay_resolvers_abstract_types/fixtures/spread_fragment_on_abstract_type.graphql");
    let expected = include_str!("relay_resolvers_abstract_types/fixtures/spread_fragment_on_abstract_type.expected");
    test_fixture(transform_fixture, file!(), "spread_fragment_on_abstract_type.graphql", "relay_resolvers_abstract_types/fixtures/spread_fragment_on_abstract_type.expected", input, expected).await;
}

#[tokio::test]
async fn union_types_are_skipped() {
    let input = include_str!("relay_resolvers_abstract_types/fixtures/union_types_are_skipped.graphql");
    let expected = include_str!("relay_resolvers_abstract_types/fixtures/union_types_are_skipped.expected");
    test_fixture(transform_fixture, file!(), "union_types_are_skipped.graphql", "relay_resolvers_abstract_types/fixtures/union_types_are_skipped.expected", input, expected).await;
}
