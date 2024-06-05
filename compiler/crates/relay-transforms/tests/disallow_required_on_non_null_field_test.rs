/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<15d8112fa196877ae75bb477cbacb0bd>>
 */

mod disallow_required_on_non_null_field;

use disallow_required_on_non_null_field::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn fragment_with_required_non_null_field_invalid() {
    let input = include_str!("disallow_required_on_non_null_field/fixtures/fragment_with_required_non_null_field.invalid.graphql");
    let expected = include_str!("disallow_required_on_non_null_field/fixtures/fragment_with_required_non_null_field.invalid.expected");
    test_fixture(transform_fixture, file!(), "fragment_with_required_non_null_field.invalid.graphql", "disallow_required_on_non_null_field/fixtures/fragment_with_required_non_null_field.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_with_required_semantic_field_invalid() {
    let input = include_str!("disallow_required_on_non_null_field/fixtures/fragment_with_required_semantic_field.invalid.graphql");
    let expected = include_str!("disallow_required_on_non_null_field/fixtures/fragment_with_required_semantic_field.invalid.expected");
    test_fixture(transform_fixture, file!(), "fragment_with_required_semantic_field.invalid.graphql", "disallow_required_on_non_null_field/fixtures/fragment_with_required_semantic_field.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_with_required_semantic_field_no_explicit_errors() {
    let input = include_str!("disallow_required_on_non_null_field/fixtures/fragment_with_required_semantic_field_no_explicit_errors.graphql");
    let expected = include_str!("disallow_required_on_non_null_field/fixtures/fragment_with_required_semantic_field_no_explicit_errors.expected");
    test_fixture(transform_fixture, file!(), "fragment_with_required_semantic_field_no_explicit_errors.graphql", "disallow_required_on_non_null_field/fixtures/fragment_with_required_semantic_field_no_explicit_errors.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_with_required_semantic_field_via_linked_invalid() {
    let input = include_str!("disallow_required_on_non_null_field/fixtures/fragment_with_required_semantic_field_via_linked.invalid.graphql");
    let expected = include_str!("disallow_required_on_non_null_field/fixtures/fragment_with_required_semantic_field_via_linked.invalid.expected");
    test_fixture(transform_fixture, file!(), "fragment_with_required_semantic_field_via_linked.invalid.graphql", "disallow_required_on_non_null_field/fixtures/fragment_with_required_semantic_field_via_linked.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn query_with_disallowed_throw_invalid() {
    let input = include_str!("disallow_required_on_non_null_field/fixtures/query_with_disallowed_throw.invalid.graphql");
    let expected = include_str!("disallow_required_on_non_null_field/fixtures/query_with_disallowed_throw.invalid.expected");
    test_fixture(transform_fixture, file!(), "query_with_disallowed_throw.invalid.graphql", "disallow_required_on_non_null_field/fixtures/query_with_disallowed_throw.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn query_with_required_field() {
    let input = include_str!("disallow_required_on_non_null_field/fixtures/query_with_required_field.graphql");
    let expected = include_str!("disallow_required_on_non_null_field/fixtures/query_with_required_field.expected");
    test_fixture(transform_fixture, file!(), "query_with_required_field.graphql", "disallow_required_on_non_null_field/fixtures/query_with_required_field.expected", input, expected).await;
}

#[tokio::test]
async fn query_with_required_field_no_explicit_errors() {
    let input = include_str!("disallow_required_on_non_null_field/fixtures/query_with_required_field_no_explicit_errors.graphql");
    let expected = include_str!("disallow_required_on_non_null_field/fixtures/query_with_required_field_no_explicit_errors.expected");
    test_fixture(transform_fixture, file!(), "query_with_required_field_no_explicit_errors.graphql", "disallow_required_on_non_null_field/fixtures/query_with_required_field_no_explicit_errors.expected", input, expected).await;
}

#[tokio::test]
async fn query_with_required_semantic_field_invalid() {
    let input = include_str!("disallow_required_on_non_null_field/fixtures/query_with_required_semantic_field.invalid.graphql");
    let expected = include_str!("disallow_required_on_non_null_field/fixtures/query_with_required_semantic_field.invalid.expected");
    test_fixture(transform_fixture, file!(), "query_with_required_semantic_field.invalid.graphql", "disallow_required_on_non_null_field/fixtures/query_with_required_semantic_field.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn query_with_required_semantic_field_no_explicit_errors() {
    let input = include_str!("disallow_required_on_non_null_field/fixtures/query_with_required_semantic_field_no_explicit_errors.graphql");
    let expected = include_str!("disallow_required_on_non_null_field/fixtures/query_with_required_semantic_field_no_explicit_errors.expected");
    test_fixture(transform_fixture, file!(), "query_with_required_semantic_field_no_explicit_errors.graphql", "disallow_required_on_non_null_field/fixtures/query_with_required_semantic_field_no_explicit_errors.expected", input, expected).await;
}

#[tokio::test]
async fn query_with_required_semantic_plural_field_invalid() {
    let input = include_str!("disallow_required_on_non_null_field/fixtures/query_with_required_semantic_plural_field.invalid.graphql");
    let expected = include_str!("disallow_required_on_non_null_field/fixtures/query_with_required_semantic_plural_field.invalid.expected");
    test_fixture(transform_fixture, file!(), "query_with_required_semantic_plural_field.invalid.graphql", "disallow_required_on_non_null_field/fixtures/query_with_required_semantic_plural_field.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn query_with_semantic_field() {
    let input = include_str!("disallow_required_on_non_null_field/fixtures/query_with_semantic_field.graphql");
    let expected = include_str!("disallow_required_on_non_null_field/fixtures/query_with_semantic_field.expected");
    test_fixture(transform_fixture, file!(), "query_with_semantic_field.graphql", "disallow_required_on_non_null_field/fixtures/query_with_semantic_field.expected", input, expected).await;
}

#[tokio::test]
async fn query_with_semantic_field_no_explicit_errors() {
    let input = include_str!("disallow_required_on_non_null_field/fixtures/query_with_semantic_field_no_explicit_errors.graphql");
    let expected = include_str!("disallow_required_on_non_null_field/fixtures/query_with_semantic_field_no_explicit_errors.expected");
    test_fixture(transform_fixture, file!(), "query_with_semantic_field_no_explicit_errors.graphql", "disallow_required_on_non_null_field/fixtures/query_with_semantic_field_no_explicit_errors.expected", input, expected).await;
}
