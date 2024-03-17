/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<8a035f3972bb95c60f23754821230364>>
 */

mod flatten;

use flatten::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn anonymous_inline_fragment_with_directives() {
    let input = include_str!("flatten/fixtures/anonymous-inline-fragment-with-directives.graphql");
    let expected = include_str!("flatten/fixtures/anonymous-inline-fragment-with-directives.expected");
    test_fixture(transform_fixture, file!(), "anonymous-inline-fragment-with-directives.graphql", "flatten/fixtures/anonymous-inline-fragment-with-directives.expected", input, expected).await;
}

#[tokio::test]
async fn flatten_multiple_conditions() {
    let input = include_str!("flatten/fixtures/flatten-multiple-conditions.graphql");
    let expected = include_str!("flatten/fixtures/flatten-multiple-conditions.expected");
    test_fixture(transform_fixture, file!(), "flatten-multiple-conditions.graphql", "flatten/fixtures/flatten-multiple-conditions.expected", input, expected).await;
}

#[tokio::test]
async fn flatten_same_conditions() {
    let input = include_str!("flatten/fixtures/flatten-same-conditions.graphql");
    let expected = include_str!("flatten/fixtures/flatten-same-conditions.expected");
    test_fixture(transform_fixture, file!(), "flatten-same-conditions.graphql", "flatten/fixtures/flatten-same-conditions.expected", input, expected).await;
}

#[tokio::test]
async fn flatten_transform() {
    let input = include_str!("flatten/fixtures/flatten-transform.graphql");
    let expected = include_str!("flatten/fixtures/flatten-transform.expected");
    test_fixture(transform_fixture, file!(), "flatten-transform.graphql", "flatten/fixtures/flatten-transform.expected", input, expected).await;
}

#[tokio::test]
async fn flattens_inline_inside_condition() {
    let input = include_str!("flatten/fixtures/flattens-inline-inside-condition.graphql");
    let expected = include_str!("flatten/fixtures/flattens-inline-inside-condition.expected");
    test_fixture(transform_fixture, file!(), "flattens-inline-inside-condition.graphql", "flatten/fixtures/flattens-inline-inside-condition.expected", input, expected).await;
}

#[tokio::test]
async fn flattens_inside_plural() {
    let input = include_str!("flatten/fixtures/flattens-inside-plural.graphql");
    let expected = include_str!("flatten/fixtures/flattens-inside-plural.expected");
    test_fixture(transform_fixture, file!(), "flattens-inside-plural.graphql", "flatten/fixtures/flattens-inside-plural.expected", input, expected).await;
}

#[tokio::test]
async fn flattens_matching_fragment_types() {
    let input = include_str!("flatten/fixtures/flattens-matching-fragment-types.graphql");
    let expected = include_str!("flatten/fixtures/flattens-matching-fragment-types.expected");
    test_fixture(transform_fixture, file!(), "flattens-matching-fragment-types.graphql", "flatten/fixtures/flattens-matching-fragment-types.expected", input, expected).await;
}

#[tokio::test]
async fn inline_fragment_with_directives() {
    let input = include_str!("flatten/fixtures/inline-fragment-with-directives.graphql");
    let expected = include_str!("flatten/fixtures/inline-fragment-with-directives.expected");
    test_fixture(transform_fixture, file!(), "inline-fragment-with-directives.graphql", "flatten/fixtures/inline-fragment-with-directives.expected", input, expected).await;
}

#[tokio::test]
async fn inline_fragment_with_directives_text() {
    let input = include_str!("flatten/fixtures/inline-fragment-with-directives-text.graphql");
    let expected = include_str!("flatten/fixtures/inline-fragment-with-directives-text.expected");
    test_fixture(transform_fixture, file!(), "inline-fragment-with-directives-text.graphql", "flatten/fixtures/inline-fragment-with-directives-text.expected", input, expected).await;
}

#[tokio::test]
async fn linked_handle_field() {
    let input = include_str!("flatten/fixtures/linked-handle-field.graphql");
    let expected = include_str!("flatten/fixtures/linked-handle-field.expected");
    test_fixture(transform_fixture, file!(), "linked-handle-field.graphql", "flatten/fixtures/linked-handle-field.expected", input, expected).await;
}

#[tokio::test]
async fn match_field() {
    let input = include_str!("flatten/fixtures/match-field.graphql");
    let expected = include_str!("flatten/fixtures/match-field.expected");
    test_fixture(transform_fixture, file!(), "match-field.graphql", "flatten/fixtures/match-field.expected", input, expected).await;
}

#[tokio::test]
async fn match_field_overlap() {
    let input = include_str!("flatten/fixtures/match-field-overlap.graphql");
    let expected = include_str!("flatten/fixtures/match-field-overlap.expected");
    test_fixture(transform_fixture, file!(), "match-field-overlap.graphql", "flatten/fixtures/match-field-overlap.expected", input, expected).await;
}

#[tokio::test]
async fn scalar_handle_field() {
    let input = include_str!("flatten/fixtures/scalar-handle-field.graphql");
    let expected = include_str!("flatten/fixtures/scalar-handle-field.expected");
    test_fixture(transform_fixture, file!(), "scalar-handle-field.graphql", "flatten/fixtures/scalar-handle-field.expected", input, expected).await;
}
