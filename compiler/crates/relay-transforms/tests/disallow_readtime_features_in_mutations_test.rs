/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<ce28c55dce46aeeb001d3f3402c4050e>>
 */

mod disallow_readtime_features_in_mutations;

use disallow_readtime_features_in_mutations::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn fragment_with_required_spread_in_fragment() {
    let input = include_str!("disallow_readtime_features_in_mutations/fixtures/fragment_with_required_spread_in_fragment.graphql");
    let expected = include_str!("disallow_readtime_features_in_mutations/fixtures/fragment_with_required_spread_in_fragment.expected");
    test_fixture(transform_fixture, file!(), "fragment_with_required_spread_in_fragment.graphql", "disallow_readtime_features_in_mutations/fixtures/fragment_with_required_spread_in_fragment.expected", input, expected).await;
}

#[tokio::test]
async fn mutation_with_linked_resolver_invalid() {
    let input = include_str!("disallow_readtime_features_in_mutations/fixtures/mutation_with_linked_resolver.invalid.graphql");
    let expected = include_str!("disallow_readtime_features_in_mutations/fixtures/mutation_with_linked_resolver.invalid.expected");
    test_fixture(transform_fixture, file!(), "mutation_with_linked_resolver.invalid.graphql", "disallow_readtime_features_in_mutations/fixtures/mutation_with_linked_resolver.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn mutation_with_required_field_in_inline_fragment_invalid() {
    let input = include_str!("disallow_readtime_features_in_mutations/fixtures/mutation_with_required_field_in_inline_fragment.invalid.graphql");
    let expected = include_str!("disallow_readtime_features_in_mutations/fixtures/mutation_with_required_field_in_inline_fragment.invalid.expected");
    test_fixture(transform_fixture, file!(), "mutation_with_required_field_in_inline_fragment.invalid.graphql", "disallow_readtime_features_in_mutations/fixtures/mutation_with_required_field_in_inline_fragment.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn mutation_with_required_field_invalid() {
    let input = include_str!("disallow_readtime_features_in_mutations/fixtures/mutation_with_required_field.invalid.graphql");
    let expected = include_str!("disallow_readtime_features_in_mutations/fixtures/mutation_with_required_field.invalid.expected");
    test_fixture(transform_fixture, file!(), "mutation_with_required_field.invalid.graphql", "disallow_readtime_features_in_mutations/fixtures/mutation_with_required_field.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn mutation_with_required_log_or_none_field() {
    let input = include_str!("disallow_readtime_features_in_mutations/fixtures/mutation_with_required_log_or_none_field.graphql");
    let expected = include_str!("disallow_readtime_features_in_mutations/fixtures/mutation_with_required_log_or_none_field.expected");
    test_fixture(transform_fixture, file!(), "mutation_with_required_log_or_none_field.graphql", "disallow_readtime_features_in_mutations/fixtures/mutation_with_required_log_or_none_field.expected", input, expected).await;
}

#[tokio::test]
async fn mutation_with_scalar_resolver_invalid() {
    let input = include_str!("disallow_readtime_features_in_mutations/fixtures/mutation_with_scalar_resolver.invalid.graphql");
    let expected = include_str!("disallow_readtime_features_in_mutations/fixtures/mutation_with_scalar_resolver.invalid.expected");
    test_fixture(transform_fixture, file!(), "mutation_with_scalar_resolver.invalid.graphql", "disallow_readtime_features_in_mutations/fixtures/mutation_with_scalar_resolver.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn query_with_required_field() {
    let input = include_str!("disallow_readtime_features_in_mutations/fixtures/query_with_required_field.graphql");
    let expected = include_str!("disallow_readtime_features_in_mutations/fixtures/query_with_required_field.expected");
    test_fixture(transform_fixture, file!(), "query_with_required_field.graphql", "disallow_readtime_features_in_mutations/fixtures/query_with_required_field.expected", input, expected).await;
}
