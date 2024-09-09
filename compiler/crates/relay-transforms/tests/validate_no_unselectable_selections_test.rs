/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<816428d5c7728de4b7b23dddd578359b>>
 */

mod validate_no_unselectable_selections;

use validate_no_unselectable_selections::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn multiple_unselectables_invalid() {
    let input = include_str!("validate_no_unselectable_selections/fixtures/multiple-unselectables.invalid.graphql");
    let expected = include_str!("validate_no_unselectable_selections/fixtures/multiple-unselectables.invalid.expected");
    test_fixture(transform_fixture, file!(), "multiple-unselectables.invalid.graphql", "validate_no_unselectable_selections/fixtures/multiple-unselectables.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn unselectable_linked_field_invalid() {
    let input = include_str!("validate_no_unselectable_selections/fixtures/unselectable-linked-field.invalid.graphql");
    let expected = include_str!("validate_no_unselectable_selections/fixtures/unselectable-linked-field.invalid.expected");
    test_fixture(transform_fixture, file!(), "unselectable-linked-field.invalid.graphql", "validate_no_unselectable_selections/fixtures/unselectable-linked-field.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn unselectable_scalar_invalid() {
    let input = include_str!("validate_no_unselectable_selections/fixtures/unselectable-scalar.invalid.graphql");
    let expected = include_str!("validate_no_unselectable_selections/fixtures/unselectable-scalar.invalid.expected");
    test_fixture(transform_fixture, file!(), "unselectable-scalar.invalid.graphql", "validate_no_unselectable_selections/fixtures/unselectable-scalar.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn valid_selection() {
    let input = include_str!("validate_no_unselectable_selections/fixtures/valid-selection.graphql");
    let expected = include_str!("validate_no_unselectable_selections/fixtures/valid-selection.expected");
    test_fixture(transform_fixture, file!(), "valid-selection.graphql", "validate_no_unselectable_selections/fixtures/valid-selection.expected", input, expected).await;
}
