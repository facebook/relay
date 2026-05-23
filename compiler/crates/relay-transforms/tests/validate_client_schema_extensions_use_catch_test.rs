/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<db92316369cbe254e6ace0c1fb8ff00b>>
 */

mod validate_client_schema_extensions_use_catch;

use validate_client_schema_extensions_use_catch::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn built_in_field_without_catch() {
    let input = include_str!("validate_client_schema_extensions_use_catch/fixtures/built_in_field_without_catch.graphql");
    let expected = include_str!("validate_client_schema_extensions_use_catch/fixtures/built_in_field_without_catch.expected");
    test_fixture(transform_fixture, file!(), "built_in_field_without_catch.graphql", "validate_client_schema_extensions_use_catch/fixtures/built_in_field_without_catch.expected", input, expected).await;
}

#[tokio::test]
async fn client_field_with_catch() {
    let input = include_str!("validate_client_schema_extensions_use_catch/fixtures/client_field_with_catch.graphql");
    let expected = include_str!("validate_client_schema_extensions_use_catch/fixtures/client_field_with_catch.expected");
    test_fixture(transform_fixture, file!(), "client_field_with_catch.graphql", "validate_client_schema_extensions_use_catch/fixtures/client_field_with_catch.expected", input, expected).await;
}

#[tokio::test]
async fn client_field_with_inline_fragment_alias_with_catch() {
    let input = include_str!("validate_client_schema_extensions_use_catch/fixtures/client_field_with_inline_fragment_alias_with_catch.graphql");
    let expected = include_str!("validate_client_schema_extensions_use_catch/fixtures/client_field_with_inline_fragment_alias_with_catch.expected");
    test_fixture(transform_fixture, file!(), "client_field_with_inline_fragment_alias_with_catch.graphql", "validate_client_schema_extensions_use_catch/fixtures/client_field_with_inline_fragment_alias_with_catch.expected", input, expected).await;
}

#[tokio::test]
async fn client_field_within_catch() {
    let input = include_str!("validate_client_schema_extensions_use_catch/fixtures/client_field_within_catch.graphql");
    let expected = include_str!("validate_client_schema_extensions_use_catch/fixtures/client_field_within_catch.expected");
    test_fixture(transform_fixture, file!(), "client_field_within_catch.graphql", "validate_client_schema_extensions_use_catch/fixtures/client_field_within_catch.expected", input, expected).await;
}

#[tokio::test]
async fn client_field_without_catch() {
    let input = include_str!("validate_client_schema_extensions_use_catch/fixtures/client_field_without_catch.graphql");
    let expected = include_str!("validate_client_schema_extensions_use_catch/fixtures/client_field_without_catch.expected");
    test_fixture(transform_fixture, file!(), "client_field_without_catch.graphql", "validate_client_schema_extensions_use_catch/fixtures/client_field_without_catch.expected", input, expected).await;
}

#[tokio::test]
async fn client_linked_field_without_catch() {
    let input = include_str!("validate_client_schema_extensions_use_catch/fixtures/client_linked_field_without_catch.graphql");
    let expected = include_str!("validate_client_schema_extensions_use_catch/fixtures/client_linked_field_without_catch.expected");
    test_fixture(transform_fixture, file!(), "client_linked_field_without_catch.graphql", "validate_client_schema_extensions_use_catch/fixtures/client_linked_field_without_catch.expected", input, expected).await;
}

#[tokio::test]
async fn non_nullable_client_field_with_catch() {
    let input = include_str!("validate_client_schema_extensions_use_catch/fixtures/non_nullable_client_field_with_catch.graphql");
    let expected = include_str!("validate_client_schema_extensions_use_catch/fixtures/non_nullable_client_field_with_catch.expected");
    test_fixture(transform_fixture, file!(), "non_nullable_client_field_with_catch.graphql", "validate_client_schema_extensions_use_catch/fixtures/non_nullable_client_field_with_catch.expected", input, expected).await;
}
