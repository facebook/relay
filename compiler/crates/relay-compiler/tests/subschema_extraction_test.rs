/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<c24a4d536283c943d1f25fe169858745>>
 */

mod subschema_extraction;

use subschema_extraction::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn inlined_nested_input() {
    let input = include_str!("subschema_extraction/fixtures/inlined_nested_input.input");
    let expected = include_str!("subschema_extraction/fixtures/inlined_nested_input.expected");
    test_fixture(transform_fixture, file!(), "inlined_nested_input.input", "subschema_extraction/fixtures/inlined_nested_input.expected", input, expected).await;
}

#[tokio::test]
async fn interface_empty_without_id() {
    let input = include_str!("subschema_extraction/fixtures/interface_empty_without_id.input");
    let expected = include_str!("subschema_extraction/fixtures/interface_empty_without_id.expected");
    test_fixture(transform_fixture, file!(), "interface_empty_without_id.input", "subschema_extraction/fixtures/interface_empty_without_id.expected", input, expected).await;
}

#[tokio::test]
async fn interface_nested() {
    let input = include_str!("subschema_extraction/fixtures/interface_nested.input");
    let expected = include_str!("subschema_extraction/fixtures/interface_nested.expected");
    test_fixture(transform_fixture, file!(), "interface_nested.input", "subschema_extraction/fixtures/interface_nested.expected", input, expected).await;
}

#[tokio::test]
async fn interface_on_object_field() {
    let input = include_str!("subschema_extraction/fixtures/interface_on_object_field.input");
    let expected = include_str!("subschema_extraction/fixtures/interface_on_object_field.expected");
    test_fixture(transform_fixture, file!(), "interface_on_object_field.input", "subschema_extraction/fixtures/interface_on_object_field.expected", input, expected).await;
}

#[tokio::test]
async fn interface_only_inline_fragments() {
    let input = include_str!("subschema_extraction/fixtures/interface_only_inline_fragments.input");
    let expected = include_str!("subschema_extraction/fixtures/interface_only_inline_fragments.expected");
    test_fixture(transform_fixture, file!(), "interface_only_inline_fragments.input", "subschema_extraction/fixtures/interface_only_inline_fragments.expected", input, expected).await;
}

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
