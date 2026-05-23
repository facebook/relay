/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<6eb30dc78dfe1878bc1456bffe63bb3c>>
 */

mod assignable_fragment_spread;

use assignable_fragment_spread::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn abstract_assignable_fragment_spread_on_concrete_type() {
    let input = include_str!("assignable_fragment_spread/fixtures/abstract-assignable-fragment-spread-on-concrete-type.graphql");
    let expected = include_str!("assignable_fragment_spread/fixtures/abstract-assignable-fragment-spread-on-concrete-type.expected");
    test_fixture(transform_fixture, file!(), "abstract-assignable-fragment-spread-on-concrete-type.graphql", "assignable_fragment_spread/fixtures/abstract-assignable-fragment-spread-on-concrete-type.expected", input, expected).await;
}

#[tokio::test]
async fn abstract_assignable_fragment_spread_on_concrete_type_in_updatable_fragment() {
    let input = include_str!("assignable_fragment_spread/fixtures/abstract-assignable-fragment-spread-on-concrete-type-in-updatable-fragment.graphql");
    let expected = include_str!("assignable_fragment_spread/fixtures/abstract-assignable-fragment-spread-on-concrete-type-in-updatable-fragment.expected");
    test_fixture(transform_fixture, file!(), "abstract-assignable-fragment-spread-on-concrete-type-in-updatable-fragment.graphql", "assignable_fragment_spread/fixtures/abstract-assignable-fragment-spread-on-concrete-type-in-updatable-fragment.expected", input, expected).await;
}

#[tokio::test]
async fn abstract_assignable_fragment_spread_on_different_abstract_type() {
    let input = include_str!("assignable_fragment_spread/fixtures/abstract-assignable-fragment-spread-on-different-abstract-type.graphql");
    let expected = include_str!("assignable_fragment_spread/fixtures/abstract-assignable-fragment-spread-on-different-abstract-type.expected");
    test_fixture(transform_fixture, file!(), "abstract-assignable-fragment-spread-on-different-abstract-type.graphql", "assignable_fragment_spread/fixtures/abstract-assignable-fragment-spread-on-different-abstract-type.expected", input, expected).await;
}

#[tokio::test]
async fn abstract_assignable_fragment_spread_on_matching_abstract_type() {
    let input = include_str!("assignable_fragment_spread/fixtures/abstract-assignable-fragment-spread-on-matching-abstract-type.graphql");
    let expected = include_str!("assignable_fragment_spread/fixtures/abstract-assignable-fragment-spread-on-matching-abstract-type.expected");
    test_fixture(transform_fixture, file!(), "abstract-assignable-fragment-spread-on-matching-abstract-type.graphql", "assignable_fragment_spread/fixtures/abstract-assignable-fragment-spread-on-matching-abstract-type.expected", input, expected).await;
}

#[tokio::test]
async fn assignable_fragment_spread_top_level_invalid() {
    let input = include_str!("assignable_fragment_spread/fixtures/assignable-fragment-spread-top-level.invalid.graphql");
    let expected = include_str!("assignable_fragment_spread/fixtures/assignable-fragment-spread-top-level.invalid.expected");
    test_fixture(transform_fixture, file!(), "assignable-fragment-spread-top-level.invalid.graphql", "assignable_fragment_spread/fixtures/assignable-fragment-spread-top-level.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn assignable_fragment_spread_with_directives_invalid() {
    let input = include_str!("assignable_fragment_spread/fixtures/assignable-fragment-spread-with-directives.invalid.graphql");
    let expected = include_str!("assignable_fragment_spread/fixtures/assignable-fragment-spread-with-directives.invalid.expected");
    test_fixture(transform_fixture, file!(), "assignable-fragment-spread-with-directives.invalid.graphql", "assignable_fragment_spread/fixtures/assignable-fragment-spread-with-directives.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn assignable_fragment_spread_with_fixme_directives() {
    let input = include_str!("assignable_fragment_spread/fixtures/assignable-fragment-spread-with-fixme-directives.graphql");
    let expected = include_str!("assignable_fragment_spread/fixtures/assignable-fragment-spread-with-fixme-directives.expected");
    test_fixture(transform_fixture, file!(), "assignable-fragment-spread-with-fixme-directives.graphql", "assignable_fragment_spread/fixtures/assignable-fragment-spread-with-fixme-directives.expected", input, expected).await;
}

#[tokio::test]
async fn assignable_fragment_spread_within_inline_fragment() {
    let input = include_str!("assignable_fragment_spread/fixtures/assignable-fragment-spread-within-inline-fragment.graphql");
    let expected = include_str!("assignable_fragment_spread/fixtures/assignable-fragment-spread-within-inline-fragment.expected");
    test_fixture(transform_fixture, file!(), "assignable-fragment-spread-within-inline-fragment.graphql", "assignable_fragment_spread/fixtures/assignable-fragment-spread-within-inline-fragment.expected", input, expected).await;
}

#[tokio::test]
async fn assignable_fragment_spread_within_inline_fragment_and_linked_field() {
    let input = include_str!("assignable_fragment_spread/fixtures/assignable-fragment-spread-within-inline-fragment-and-linked-field.graphql");
    let expected = include_str!("assignable_fragment_spread/fixtures/assignable-fragment-spread-within-inline-fragment-and-linked-field.expected");
    test_fixture(transform_fixture, file!(), "assignable-fragment-spread-within-inline-fragment-and-linked-field.graphql", "assignable_fragment_spread/fixtures/assignable-fragment-spread-within-inline-fragment-and-linked-field.expected", input, expected).await;
}

#[tokio::test]
async fn assignable_fragment_spread_within_skipped_inline_fragment_invalid() {
    let input = include_str!("assignable_fragment_spread/fixtures/assignable-fragment-spread-within-skipped-inline-fragment.invalid.graphql");
    let expected = include_str!("assignable_fragment_spread/fixtures/assignable-fragment-spread-within-skipped-inline-fragment.invalid.expected");
    test_fixture(transform_fixture, file!(), "assignable-fragment-spread-within-skipped-inline-fragment.invalid.graphql", "assignable_fragment_spread/fixtures/assignable-fragment-spread-within-skipped-inline-fragment.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn concrete_assignable_fragment_spread_on_abstract_type() {
    let input = include_str!("assignable_fragment_spread/fixtures/concrete-assignable-fragment-spread-on-abstract-type.graphql");
    let expected = include_str!("assignable_fragment_spread/fixtures/concrete-assignable-fragment-spread-on-abstract-type.expected");
    test_fixture(transform_fixture, file!(), "concrete-assignable-fragment-spread-on-abstract-type.graphql", "assignable_fragment_spread/fixtures/concrete-assignable-fragment-spread-on-abstract-type.expected", input, expected).await;
}

#[tokio::test]
async fn concrete_assignable_fragment_spread_on_matching_concrete_type() {
    let input = include_str!("assignable_fragment_spread/fixtures/concrete-assignable-fragment-spread-on-matching-concrete-type.graphql");
    let expected = include_str!("assignable_fragment_spread/fixtures/concrete-assignable-fragment-spread-on-matching-concrete-type.expected");
    test_fixture(transform_fixture, file!(), "concrete-assignable-fragment-spread-on-matching-concrete-type.graphql", "assignable_fragment_spread/fixtures/concrete-assignable-fragment-spread-on-matching-concrete-type.expected", input, expected).await;
}

#[tokio::test]
async fn included_assignable_fragment_spread_invalid() {
    let input = include_str!("assignable_fragment_spread/fixtures/included-assignable-fragment-spread.invalid.graphql");
    let expected = include_str!("assignable_fragment_spread/fixtures/included-assignable-fragment-spread.invalid.expected");
    test_fixture(transform_fixture, file!(), "included-assignable-fragment-spread.invalid.graphql", "assignable_fragment_spread/fixtures/included-assignable-fragment-spread.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn skipped_assignable_fragment_spread_invalid() {
    let input = include_str!("assignable_fragment_spread/fixtures/skipped-assignable-fragment-spread.invalid.graphql");
    let expected = include_str!("assignable_fragment_spread/fixtures/skipped-assignable-fragment-spread.invalid.expected");
    test_fixture(transform_fixture, file!(), "skipped-assignable-fragment-spread.invalid.graphql", "assignable_fragment_spread/fixtures/skipped-assignable-fragment-spread.invalid.expected", input, expected).await;
}
