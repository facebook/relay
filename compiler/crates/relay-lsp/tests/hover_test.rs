/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<7f7ba42d92c3419f1fffd8013ba3d40f>>
 */

mod hover;

use hover::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn double_underscore_id_field() {
    let input = include_str!("hover/fixtures/double_underscore_id_field.graphql");
    let expected = include_str!("hover/fixtures/double_underscore_id_field.expected");
    test_fixture(transform_fixture, file!(), "double_underscore_id_field.graphql", "hover/fixtures/double_underscore_id_field.expected", input, expected).await;
}

#[tokio::test]
async fn double_underscore_typename_field() {
    let input = include_str!("hover/fixtures/double_underscore_typename_field.graphql");
    let expected = include_str!("hover/fixtures/double_underscore_typename_field.expected");
    test_fixture(transform_fixture, file!(), "double_underscore_typename_field.graphql", "hover/fixtures/double_underscore_typename_field.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_definition_name() {
    let input = include_str!("hover/fixtures/fragment_definition_name.graphql");
    let expected = include_str!("hover/fixtures/fragment_definition_name.expected");
    test_fixture(transform_fixture, file!(), "fragment_definition_name.graphql", "hover/fixtures/fragment_definition_name.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_spread() {
    let input = include_str!("hover/fixtures/fragment_spread.graphql");
    let expected = include_str!("hover/fixtures/fragment_spread.expected");
    test_fixture(transform_fixture, file!(), "fragment_spread.graphql", "hover/fixtures/fragment_spread.expected", input, expected).await;
}

#[tokio::test]
async fn scalar_field_from_client_schema_extension() {
    let input = include_str!("hover/fixtures/scalar_field_from_client_schema_extension.graphql");
    let expected = include_str!("hover/fixtures/scalar_field_from_client_schema_extension.expected");
    test_fixture(transform_fixture, file!(), "scalar_field_from_client_schema_extension.graphql", "hover/fixtures/scalar_field_from_client_schema_extension.expected", input, expected).await;
}

#[tokio::test]
async fn scalar_field_from_relay_resolver() {
    let input = include_str!("hover/fixtures/scalar_field_from_relay_resolver.graphql");
    let expected = include_str!("hover/fixtures/scalar_field_from_relay_resolver.expected");
    test_fixture(transform_fixture, file!(), "scalar_field_from_relay_resolver.graphql", "hover/fixtures/scalar_field_from_relay_resolver.expected", input, expected).await;
}

#[tokio::test]
async fn scalar_field_with_description() {
    let input = include_str!("hover/fixtures/scalar_field_with_description.graphql");
    let expected = include_str!("hover/fixtures/scalar_field_with_description.expected");
    test_fixture(transform_fixture, file!(), "scalar_field_with_description.graphql", "hover/fixtures/scalar_field_with_description.expected", input, expected).await;
}

#[tokio::test]
async fn whitespace_after_query_selection() {
    let input = include_str!("hover/fixtures/whitespace_after_query_selection.graphql");
    let expected = include_str!("hover/fixtures/whitespace_after_query_selection.expected");
    test_fixture(transform_fixture, file!(), "whitespace_after_query_selection.graphql", "hover/fixtures/whitespace_after_query_selection.expected", input, expected).await;
}

#[tokio::test]
async fn whitespace_within_linked_field_selection() {
    let input = include_str!("hover/fixtures/whitespace_within_linked_field_selection.graphql");
    let expected = include_str!("hover/fixtures/whitespace_within_linked_field_selection.expected");
    test_fixture(transform_fixture, file!(), "whitespace_within_linked_field_selection.graphql", "hover/fixtures/whitespace_within_linked_field_selection.expected", input, expected).await;
}
