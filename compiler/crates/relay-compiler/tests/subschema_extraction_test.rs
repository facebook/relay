/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<2041e5f30a9d9b11cee1caf612cbffb1>>
 */

mod subschema_extraction;

use subschema_extraction::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn missing_full_schema() {
    let input = include_str!("subschema_extraction/fixtures/missing_full_schema.input");
    let expected = include_str!("subschema_extraction/fixtures/missing_full_schema.expected");
    test_fixture(transform_fixture, file!(), "missing_full_schema.input", "subschema_extraction/fixtures/missing_full_schema.expected", input, expected).await;
}

#[tokio::test]
async fn multiple_operations() {
    let input = include_str!("subschema_extraction/fixtures/multiple_operations.input");
    let expected = include_str!("subschema_extraction/fixtures/multiple_operations.expected");
    test_fixture(transform_fixture, file!(), "multiple_operations.input", "subschema_extraction/fixtures/multiple_operations.expected", input, expected).await;
}

#[tokio::test]
async fn mutation_with_input_types() {
    let input = include_str!("subschema_extraction/fixtures/mutation_with_input_types.input");
    let expected = include_str!("subschema_extraction/fixtures/mutation_with_input_types.expected");
    test_fixture(transform_fixture, file!(), "mutation_with_input_types.input", "subschema_extraction/fixtures/mutation_with_input_types.expected", input, expected).await;
}

#[tokio::test]
async fn simple_extraction() {
    let input = include_str!("subschema_extraction/fixtures/simple_extraction.input");
    let expected = include_str!("subschema_extraction/fixtures/simple_extraction.expected");
    test_fixture(transform_fixture, file!(), "simple_extraction.input", "subschema_extraction/fixtures/simple_extraction.expected", input, expected).await;
}

#[tokio::test]
async fn subscription_only() {
    let input = include_str!("subschema_extraction/fixtures/subscription_only.input");
    let expected = include_str!("subschema_extraction/fixtures/subscription_only.expected");
    test_fixture(transform_fixture, file!(), "subscription_only.input", "subschema_extraction/fixtures/subscription_only.expected", input, expected).await;
}

#[tokio::test]
async fn unknown_field_error() {
    let input = include_str!("subschema_extraction/fixtures/unknown_field_error.input");
    let expected = include_str!("subschema_extraction/fixtures/unknown_field_error.expected");
    test_fixture(transform_fixture, file!(), "unknown_field_error.input", "subschema_extraction/fixtures/unknown_field_error.expected", input, expected).await;
}

#[tokio::test]
async fn with_client_extensions() {
    let input = include_str!("subschema_extraction/fixtures/with_client_extensions.input");
    let expected = include_str!("subschema_extraction/fixtures/with_client_extensions.expected");
    test_fixture(transform_fixture, file!(), "with_client_extensions.input", "subschema_extraction/fixtures/with_client_extensions.expected", input, expected).await;
}
