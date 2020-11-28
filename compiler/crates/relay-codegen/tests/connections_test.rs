/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<f2128e79f8e566d6635820996ed1fa23>>
 */

mod connections;

use connections::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn connection() {
    let input = include_str!("connections/fixtures/connection.graphql");
    let expected = include_str!("connections/fixtures/connection.expected");
    test_fixture(transform_fixture, "connection.graphql", "connections/fixtures/connection.expected", input, expected);
}

#[test]
fn connection_directions() {
    let input = include_str!("connections/fixtures/connection-directions.graphql");
    let expected = include_str!("connections/fixtures/connection-directions.expected");
    test_fixture(transform_fixture, "connection-directions.graphql", "connections/fixtures/connection-directions.expected", input, expected);
}

#[test]
fn connection_empty_filters() {
    let input = include_str!("connections/fixtures/connection-empty-filters.graphql");
    let expected = include_str!("connections/fixtures/connection-empty-filters.expected");
    test_fixture(transform_fixture, "connection-empty-filters.graphql", "connections/fixtures/connection-empty-filters.expected", input, expected);
}

#[test]
fn connection_filters() {
    let input = include_str!("connections/fixtures/connection-filters.graphql");
    let expected = include_str!("connections/fixtures/connection-filters.expected");
    test_fixture(transform_fixture, "connection-filters.graphql", "connections/fixtures/connection-filters.expected", input, expected);
}

#[test]
fn connection_generate_filters() {
    let input = include_str!("connections/fixtures/connection-generate-filters.graphql");
    let expected = include_str!("connections/fixtures/connection-generate-filters.expected");
    test_fixture(transform_fixture, "connection-generate-filters.graphql", "connections/fixtures/connection-generate-filters.expected", input, expected);
}

#[test]
fn connection_with_aliased_edges_page_info() {
    let input = include_str!("connections/fixtures/connection-with-aliased-edges-page-info.graphql");
    let expected = include_str!("connections/fixtures/connection-with-aliased-edges-page-info.expected");
    test_fixture(transform_fixture, "connection-with-aliased-edges-page-info.graphql", "connections/fixtures/connection-with-aliased-edges-page-info.expected", input, expected);
}

#[test]
fn connection_with_custom_handler() {
    let input = include_str!("connections/fixtures/connection-with-custom-handler.graphql");
    let expected = include_str!("connections/fixtures/connection-with-custom-handler.expected");
    test_fixture(transform_fixture, "connection-with-custom-handler.graphql", "connections/fixtures/connection-with-custom-handler.expected", input, expected);
}

#[test]
fn connection_with_page_info() {
    let input = include_str!("connections/fixtures/connection-with-page-info.graphql");
    let expected = include_str!("connections/fixtures/connection-with-page-info.expected");
    test_fixture(transform_fixture, "connection-with-page-info.graphql", "connections/fixtures/connection-with-page-info.expected", input, expected);
}

#[test]
fn connection_with_variables() {
    let input = include_str!("connections/fixtures/connection-with-variables.graphql");
    let expected = include_str!("connections/fixtures/connection-with-variables.expected");
    test_fixture(transform_fixture, "connection-with-variables.graphql", "connections/fixtures/connection-with-variables.expected", input, expected);
}
