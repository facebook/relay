/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<1c25f56c7131b7ca80b5d3064376b38e>>
 */

mod validate_required_arguments;

use validate_required_arguments::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn argument_on_field() {
    let input = include_str!("validate_required_arguments/fixtures/argument-on-field.graphql");
    let expected = include_str!("validate_required_arguments/fixtures/argument-on-field.expected");
    test_fixture(transform_fixture, file!(), "argument-on-field.graphql", "validate_required_arguments/fixtures/argument-on-field.expected", input, expected).await;
}

#[tokio::test]
async fn argument_on_linked_field() {
    let input = include_str!("validate_required_arguments/fixtures/argument-on-linked-field.graphql");
    let expected = include_str!("validate_required_arguments/fixtures/argument-on-linked-field.expected");
    test_fixture(transform_fixture, file!(), "argument-on-linked-field.graphql", "validate_required_arguments/fixtures/argument-on-linked-field.expected", input, expected).await;
}

#[tokio::test]
async fn default_argument_on_field() {
    let input = include_str!("validate_required_arguments/fixtures/default-argument-on-field.graphql");
    let expected = include_str!("validate_required_arguments/fixtures/default-argument-on-field.expected");
    test_fixture(transform_fixture, file!(), "default-argument-on-field.graphql", "validate_required_arguments/fixtures/default-argument-on-field.expected", input, expected).await;
}

#[tokio::test]
async fn missing_argument_on_directive_invalid() {
    let input = include_str!("validate_required_arguments/fixtures/missing-argument-on-directive.invalid.graphql");
    let expected = include_str!("validate_required_arguments/fixtures/missing-argument-on-directive.invalid.expected");
    test_fixture(transform_fixture, file!(), "missing-argument-on-directive.invalid.graphql", "validate_required_arguments/fixtures/missing-argument-on-directive.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn missing_argument_on_field_invalid() {
    let input = include_str!("validate_required_arguments/fixtures/missing-argument-on-field.invalid.graphql");
    let expected = include_str!("validate_required_arguments/fixtures/missing-argument-on-field.invalid.expected");
    test_fixture(transform_fixture, file!(), "missing-argument-on-field.invalid.graphql", "validate_required_arguments/fixtures/missing-argument-on-field.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn missing_argument_on_linked_field_in_inline_fragment_invalid() {
    let input = include_str!("validate_required_arguments/fixtures/missing-argument-on-linked-field-in-inline-fragment.invalid.graphql");
    let expected = include_str!("validate_required_arguments/fixtures/missing-argument-on-linked-field-in-inline-fragment.invalid.expected");
    test_fixture(transform_fixture, file!(), "missing-argument-on-linked-field-in-inline-fragment.invalid.graphql", "validate_required_arguments/fixtures/missing-argument-on-linked-field-in-inline-fragment.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn missing_argument_on_linked_field_invalid() {
    let input = include_str!("validate_required_arguments/fixtures/missing-argument-on-linked-field.invalid.graphql");
    let expected = include_str!("validate_required_arguments/fixtures/missing-argument-on-linked-field.invalid.expected");
    test_fixture(transform_fixture, file!(), "missing-argument-on-linked-field.invalid.graphql", "validate_required_arguments/fixtures/missing-argument-on-linked-field.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn missing_argument_on_linked_field_on_abstract_type_invalid() {
    let input = include_str!("validate_required_arguments/fixtures/missing-argument-on-linked-field-on-abstract-type.invalid.graphql");
    let expected = include_str!("validate_required_arguments/fixtures/missing-argument-on-linked-field-on-abstract-type.invalid.expected");
    test_fixture(transform_fixture, file!(), "missing-argument-on-linked-field-on-abstract-type.invalid.graphql", "validate_required_arguments/fixtures/missing-argument-on-linked-field-on-abstract-type.invalid.expected", input, expected).await;
}
