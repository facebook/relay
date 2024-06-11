/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<523e6262355cff63df80d9ea70e0d2ef>>
 */

mod validate_deprecated_fields;

use validate_deprecated_fields::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn deprecated_directive_arg() {
    let input = include_str!("validate_deprecated_fields/fixtures/deprecated_directive_arg.graphql");
    let expected = include_str!("validate_deprecated_fields/fixtures/deprecated_directive_arg.expected");
    test_fixture(transform_fixture, file!(), "deprecated_directive_arg.graphql", "validate_deprecated_fields/fixtures/deprecated_directive_arg.expected", input, expected).await;
}

#[tokio::test]
async fn deprecated_directive_arg_with_reason() {
    let input = include_str!("validate_deprecated_fields/fixtures/deprecated_directive_arg_with_reason.graphql");
    let expected = include_str!("validate_deprecated_fields/fixtures/deprecated_directive_arg_with_reason.expected");
    test_fixture(transform_fixture, file!(), "deprecated_directive_arg_with_reason.graphql", "validate_deprecated_fields/fixtures/deprecated_directive_arg_with_reason.expected", input, expected).await;
}

#[tokio::test]
async fn deprecated_field_arg() {
    let input = include_str!("validate_deprecated_fields/fixtures/deprecated_field_arg.graphql");
    let expected = include_str!("validate_deprecated_fields/fixtures/deprecated_field_arg.expected");
    test_fixture(transform_fixture, file!(), "deprecated_field_arg.graphql", "validate_deprecated_fields/fixtures/deprecated_field_arg.expected", input, expected).await;
}

#[tokio::test]
async fn deprecated_field_arg_with_reason() {
    let input = include_str!("validate_deprecated_fields/fixtures/deprecated_field_arg_with_reason.graphql");
    let expected = include_str!("validate_deprecated_fields/fixtures/deprecated_field_arg_with_reason.expected");
    test_fixture(transform_fixture, file!(), "deprecated_field_arg_with_reason.graphql", "validate_deprecated_fields/fixtures/deprecated_field_arg_with_reason.expected", input, expected).await;
}

#[tokio::test]
async fn deprecated_field_with_arguments() {
    let input = include_str!("validate_deprecated_fields/fixtures/deprecated_field_with_arguments.graphql");
    let expected = include_str!("validate_deprecated_fields/fixtures/deprecated_field_with_arguments.expected");
    test_fixture(transform_fixture, file!(), "deprecated_field_with_arguments.graphql", "validate_deprecated_fields/fixtures/deprecated_field_with_arguments.expected", input, expected).await;
}

#[tokio::test]
async fn deprecated_field_with_reason() {
    let input = include_str!("validate_deprecated_fields/fixtures/deprecated_field_with_reason.graphql");
    let expected = include_str!("validate_deprecated_fields/fixtures/deprecated_field_with_reason.expected");
    test_fixture(transform_fixture, file!(), "deprecated_field_with_reason.graphql", "validate_deprecated_fields/fixtures/deprecated_field_with_reason.expected", input, expected).await;
}

#[tokio::test]
async fn deprecated_linked_field() {
    let input = include_str!("validate_deprecated_fields/fixtures/deprecated_linked_field.graphql");
    let expected = include_str!("validate_deprecated_fields/fixtures/deprecated_linked_field.expected");
    test_fixture(transform_fixture, file!(), "deprecated_linked_field.graphql", "validate_deprecated_fields/fixtures/deprecated_linked_field.expected", input, expected).await;
}

#[tokio::test]
async fn deprecated_scalar_field() {
    let input = include_str!("validate_deprecated_fields/fixtures/deprecated_scalar_field.graphql");
    let expected = include_str!("validate_deprecated_fields/fixtures/deprecated_scalar_field.expected");
    test_fixture(transform_fixture, file!(), "deprecated_scalar_field.graphql", "validate_deprecated_fields/fixtures/deprecated_scalar_field.expected", input, expected).await;
}

#[tokio::test]
async fn deprecated_scalar_field_within_linked_field() {
    let input = include_str!("validate_deprecated_fields/fixtures/deprecated_scalar_field_within_linked_field.graphql");
    let expected = include_str!("validate_deprecated_fields/fixtures/deprecated_scalar_field_within_linked_field.expected");
    test_fixture(transform_fixture, file!(), "deprecated_scalar_field_within_linked_field.graphql", "validate_deprecated_fields/fixtures/deprecated_scalar_field_within_linked_field.expected", input, expected).await;
}
