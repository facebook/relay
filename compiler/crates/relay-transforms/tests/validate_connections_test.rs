/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<981e7da5ea873a593f2fe97a963d1810>>
 */

mod validate_connections;

use validate_connections::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn connection() {
    let input = include_str!("validate_connections/fixtures/connection.graphql");
    let expected = include_str!("validate_connections/fixtures/connection.expected");
    test_fixture(transform_fixture, "connection.graphql", "validate_connections/fixtures/connection.expected", input, expected);
}

#[test]
fn connection_directions() {
    let input = include_str!("validate_connections/fixtures/connection-directions.graphql");
    let expected = include_str!("validate_connections/fixtures/connection-directions.expected");
    test_fixture(transform_fixture, "connection-directions.graphql", "validate_connections/fixtures/connection-directions.expected", input, expected);
}

#[test]
fn connection_empty_filters() {
    let input = include_str!("validate_connections/fixtures/connection-empty-filters.graphql");
    let expected = include_str!("validate_connections/fixtures/connection-empty-filters.expected");
    test_fixture(transform_fixture, "connection-empty-filters.graphql", "validate_connections/fixtures/connection-empty-filters.expected", input, expected);
}

#[test]
fn connection_filters() {
    let input = include_str!("validate_connections/fixtures/connection-filters.graphql");
    let expected = include_str!("validate_connections/fixtures/connection-filters.expected");
    test_fixture(transform_fixture, "connection-filters.graphql", "validate_connections/fixtures/connection-filters.expected", input, expected);
}

#[test]
fn connection_filters_null_invalid() {
    let input = include_str!("validate_connections/fixtures/connection-filters-null.invalid.graphql");
    let expected = include_str!("validate_connections/fixtures/connection-filters-null.invalid.expected");
    test_fixture(transform_fixture, "connection-filters-null.invalid.graphql", "validate_connections/fixtures/connection-filters-null.invalid.expected", input, expected);
}

#[test]
fn connection_generate_filters() {
    let input = include_str!("validate_connections/fixtures/connection-generate-filters.graphql");
    let expected = include_str!("validate_connections/fixtures/connection-generate-filters.expected");
    test_fixture(transform_fixture, "connection-generate-filters.graphql", "validate_connections/fixtures/connection-generate-filters.expected", input, expected);
}

#[test]
fn connection_invalid_key_name_invalid() {
    let input = include_str!("validate_connections/fixtures/connection-invalid-key-name.invalid.graphql");
    let expected = include_str!("validate_connections/fixtures/connection-invalid-key-name.invalid.expected");
    test_fixture(transform_fixture, "connection-invalid-key-name.invalid.graphql", "validate_connections/fixtures/connection-invalid-key-name.invalid.expected", input, expected);
}

#[test]
fn connection_invalid_key_type_invalid() {
    let input = include_str!("validate_connections/fixtures/connection-invalid-key-type.invalid.graphql");
    let expected = include_str!("validate_connections/fixtures/connection-invalid-key-type.invalid.expected");
    test_fixture(transform_fixture, "connection-invalid-key-type.invalid.graphql", "validate_connections/fixtures/connection-invalid-key-type.invalid.expected", input, expected);
}

#[test]
fn connection_invalid_type_invalid() {
    let input = include_str!("validate_connections/fixtures/connection-invalid-type.invalid.graphql");
    let expected = include_str!("validate_connections/fixtures/connection-invalid-type.invalid.expected");
    test_fixture(transform_fixture, "connection-invalid-type.invalid.graphql", "validate_connections/fixtures/connection-invalid-type.invalid.expected", input, expected);
}

#[test]
fn connection_missing_edges_selection_invalid() {
    let input = include_str!("validate_connections/fixtures/connection-missing-edges-selection.invalid.graphql");
    let expected = include_str!("validate_connections/fixtures/connection-missing-edges-selection.invalid.expected");
    test_fixture(transform_fixture, "connection-missing-edges-selection.invalid.graphql", "validate_connections/fixtures/connection-missing-edges-selection.invalid.expected", input, expected);
}

#[test]
fn connection_missing_first_arg_invalid() {
    let input = include_str!("validate_connections/fixtures/connection-missing-first-arg.invalid.graphql");
    let expected = include_str!("validate_connections/fixtures/connection-missing-first-arg.invalid.expected");
    test_fixture(transform_fixture, "connection-missing-first-arg.invalid.graphql", "validate_connections/fixtures/connection-missing-first-arg.invalid.expected", input, expected);
}

#[test]
fn connection_with_aliased_edges_page_info() {
    let input = include_str!("validate_connections/fixtures/connection-with-aliased-edges-page-info.graphql");
    let expected = include_str!("validate_connections/fixtures/connection-with-aliased-edges-page-info.expected");
    test_fixture(transform_fixture, "connection-with-aliased-edges-page-info.graphql", "validate_connections/fixtures/connection-with-aliased-edges-page-info.expected", input, expected);
}

#[test]
fn connection_with_custom_handler() {
    let input = include_str!("validate_connections/fixtures/connection-with-custom-handler.graphql");
    let expected = include_str!("validate_connections/fixtures/connection-with-custom-handler.expected");
    test_fixture(transform_fixture, "connection-with-custom-handler.graphql", "validate_connections/fixtures/connection-with-custom-handler.expected", input, expected);
}

#[test]
fn connection_with_invalid_custom_handler_invalid() {
    let input = include_str!("validate_connections/fixtures/connection-with-invalid-custom-handler.invalid.graphql");
    let expected = include_str!("validate_connections/fixtures/connection-with-invalid-custom-handler.invalid.expected");
    test_fixture(transform_fixture, "connection-with-invalid-custom-handler.invalid.graphql", "validate_connections/fixtures/connection-with-invalid-custom-handler.invalid.expected", input, expected);
}

#[test]
fn connection_with_page_info() {
    let input = include_str!("validate_connections/fixtures/connection-with-page-info.graphql");
    let expected = include_str!("validate_connections/fixtures/connection-with-page-info.expected");
    test_fixture(transform_fixture, "connection-with-page-info.graphql", "validate_connections/fixtures/connection-with-page-info.expected", input, expected);
}

#[test]
fn connection_with_variables() {
    let input = include_str!("validate_connections/fixtures/connection-with-variables.graphql");
    let expected = include_str!("validate_connections/fixtures/connection-with-variables.expected");
    test_fixture(transform_fixture, "connection-with-variables.graphql", "validate_connections/fixtures/connection-with-variables.expected", input, expected);
}

#[test]
fn stream_connection_with_aliased_edges_invalid() {
    let input = include_str!("validate_connections/fixtures/stream-connection-with-aliased-edges.invalid.graphql");
    let expected = include_str!("validate_connections/fixtures/stream-connection-with-aliased-edges.invalid.expected");
    test_fixture(transform_fixture, "stream-connection-with-aliased-edges.invalid.graphql", "validate_connections/fixtures/stream-connection-with-aliased-edges.invalid.expected", input, expected);
}

#[test]
fn stream_connection_with_aliased_page_info_invalid() {
    let input = include_str!("validate_connections/fixtures/stream-connection-with-aliased-page-info.invalid.graphql");
    let expected = include_str!("validate_connections/fixtures/stream-connection-with-aliased-page-info.invalid.expected");
    test_fixture(transform_fixture, "stream-connection-with-aliased-page-info.invalid.graphql", "validate_connections/fixtures/stream-connection-with-aliased-page-info.invalid.expected", input, expected);
}
