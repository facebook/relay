/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<14f3bebd3c7df4188cb21afad859aacd>>
 */

mod validate_connections;

use validate_connections::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn connection() {
    let input = include_str!("validate_connections/fixtures/connection.graphql");
    let expected = include_str!("validate_connections/fixtures/connection.expected");
    test_fixture(transform_fixture, file!(), "connection.graphql", "validate_connections/fixtures/connection.expected", input, expected).await;
}

#[tokio::test]
async fn connection_directions() {
    let input = include_str!("validate_connections/fixtures/connection-directions.graphql");
    let expected = include_str!("validate_connections/fixtures/connection-directions.expected");
    test_fixture(transform_fixture, file!(), "connection-directions.graphql", "validate_connections/fixtures/connection-directions.expected", input, expected).await;
}

#[tokio::test]
async fn connection_empty_filters() {
    let input = include_str!("validate_connections/fixtures/connection-empty-filters.graphql");
    let expected = include_str!("validate_connections/fixtures/connection-empty-filters.expected");
    test_fixture(transform_fixture, file!(), "connection-empty-filters.graphql", "validate_connections/fixtures/connection-empty-filters.expected", input, expected).await;
}

#[tokio::test]
async fn connection_filters() {
    let input = include_str!("validate_connections/fixtures/connection-filters.graphql");
    let expected = include_str!("validate_connections/fixtures/connection-filters.expected");
    test_fixture(transform_fixture, file!(), "connection-filters.graphql", "validate_connections/fixtures/connection-filters.expected", input, expected).await;
}

#[tokio::test]
async fn connection_filters_not_a_string() {
    let input = include_str!("validate_connections/fixtures/connection-filters-not-a-string.graphql");
    let expected = include_str!("validate_connections/fixtures/connection-filters-not-a-string.expected");
    test_fixture(transform_fixture, file!(), "connection-filters-not-a-string.graphql", "validate_connections/fixtures/connection-filters-not-a-string.expected", input, expected).await;
}

#[tokio::test]
async fn connection_filters_not_an_arg() {
    let input = include_str!("validate_connections/fixtures/connection-filters-not-an-arg.graphql");
    let expected = include_str!("validate_connections/fixtures/connection-filters-not-an-arg.expected");
    test_fixture(transform_fixture, file!(), "connection-filters-not-an-arg.graphql", "validate_connections/fixtures/connection-filters-not-an-arg.expected", input, expected).await;
}

#[tokio::test]
async fn connection_filters_null_invalid() {
    let input = include_str!("validate_connections/fixtures/connection-filters-null.invalid.graphql");
    let expected = include_str!("validate_connections/fixtures/connection-filters-null.invalid.expected");
    test_fixture(transform_fixture, file!(), "connection-filters-null.invalid.graphql", "validate_connections/fixtures/connection-filters-null.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn connection_generate_filters() {
    let input = include_str!("validate_connections/fixtures/connection-generate-filters.graphql");
    let expected = include_str!("validate_connections/fixtures/connection-generate-filters.expected");
    test_fixture(transform_fixture, file!(), "connection-generate-filters.graphql", "validate_connections/fixtures/connection-generate-filters.expected", input, expected).await;
}

#[tokio::test]
async fn connection_invalid_key_name_invalid() {
    let input = include_str!("validate_connections/fixtures/connection-invalid-key-name.invalid.graphql");
    let expected = include_str!("validate_connections/fixtures/connection-invalid-key-name.invalid.expected");
    test_fixture(transform_fixture, file!(), "connection-invalid-key-name.invalid.graphql", "validate_connections/fixtures/connection-invalid-key-name.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn connection_invalid_key_type_invalid() {
    let input = include_str!("validate_connections/fixtures/connection-invalid-key-type.invalid.graphql");
    let expected = include_str!("validate_connections/fixtures/connection-invalid-key-type.invalid.expected");
    test_fixture(transform_fixture, file!(), "connection-invalid-key-type.invalid.graphql", "validate_connections/fixtures/connection-invalid-key-type.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn connection_invalid_type_invalid() {
    let input = include_str!("validate_connections/fixtures/connection-invalid-type.invalid.graphql");
    let expected = include_str!("validate_connections/fixtures/connection-invalid-type.invalid.expected");
    test_fixture(transform_fixture, file!(), "connection-invalid-type.invalid.graphql", "validate_connections/fixtures/connection-invalid-type.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn connection_missing_edges_selection_invalid() {
    let input = include_str!("validate_connections/fixtures/connection-missing-edges-selection.invalid.graphql");
    let expected = include_str!("validate_connections/fixtures/connection-missing-edges-selection.invalid.expected");
    test_fixture(transform_fixture, file!(), "connection-missing-edges-selection.invalid.graphql", "validate_connections/fixtures/connection-missing-edges-selection.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn connection_missing_first_arg_invalid() {
    let input = include_str!("validate_connections/fixtures/connection-missing-first-arg.invalid.graphql");
    let expected = include_str!("validate_connections/fixtures/connection-missing-first-arg.invalid.expected");
    test_fixture(transform_fixture, file!(), "connection-missing-first-arg.invalid.graphql", "validate_connections/fixtures/connection-missing-first-arg.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn connection_with_aliased_edges_page_info() {
    let input = include_str!("validate_connections/fixtures/connection-with-aliased-edges-page-info.graphql");
    let expected = include_str!("validate_connections/fixtures/connection-with-aliased-edges-page-info.expected");
    test_fixture(transform_fixture, file!(), "connection-with-aliased-edges-page-info.graphql", "validate_connections/fixtures/connection-with-aliased-edges-page-info.expected", input, expected).await;
}

#[tokio::test]
async fn connection_with_custom_handler() {
    let input = include_str!("validate_connections/fixtures/connection-with-custom-handler.graphql");
    let expected = include_str!("validate_connections/fixtures/connection-with-custom-handler.expected");
    test_fixture(transform_fixture, file!(), "connection-with-custom-handler.graphql", "validate_connections/fixtures/connection-with-custom-handler.expected", input, expected).await;
}

#[tokio::test]
async fn connection_with_invalid_custom_handler_invalid() {
    let input = include_str!("validate_connections/fixtures/connection-with-invalid-custom-handler.invalid.graphql");
    let expected = include_str!("validate_connections/fixtures/connection-with-invalid-custom-handler.invalid.expected");
    test_fixture(transform_fixture, file!(), "connection-with-invalid-custom-handler.invalid.graphql", "validate_connections/fixtures/connection-with-invalid-custom-handler.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn connection_with_page_info() {
    let input = include_str!("validate_connections/fixtures/connection-with-page-info.graphql");
    let expected = include_str!("validate_connections/fixtures/connection-with-page-info.expected");
    test_fixture(transform_fixture, file!(), "connection-with-page-info.graphql", "validate_connections/fixtures/connection-with-page-info.expected", input, expected).await;
}

#[tokio::test]
async fn connection_with_variables() {
    let input = include_str!("validate_connections/fixtures/connection-with-variables.graphql");
    let expected = include_str!("validate_connections/fixtures/connection-with-variables.expected");
    test_fixture(transform_fixture, file!(), "connection-with-variables.graphql", "validate_connections/fixtures/connection-with-variables.expected", input, expected).await;
}

#[tokio::test]
async fn stream_connection_with_aliased_edges_invalid() {
    let input = include_str!("validate_connections/fixtures/stream-connection-with-aliased-edges.invalid.graphql");
    let expected = include_str!("validate_connections/fixtures/stream-connection-with-aliased-edges.invalid.expected");
    test_fixture(transform_fixture, file!(), "stream-connection-with-aliased-edges.invalid.graphql", "validate_connections/fixtures/stream-connection-with-aliased-edges.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn stream_connection_with_aliased_page_info_invalid() {
    let input = include_str!("validate_connections/fixtures/stream-connection-with-aliased-page-info.invalid.graphql");
    let expected = include_str!("validate_connections/fixtures/stream-connection-with-aliased-page-info.invalid.expected");
    test_fixture(transform_fixture, file!(), "stream-connection-with-aliased-page-info.invalid.graphql", "validate_connections/fixtures/stream-connection-with-aliased-page-info.invalid.expected", input, expected).await;
}
