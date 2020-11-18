/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<1579b412cf0ff94712cf0d01c91de8fc>>
 */

mod transform_connections;

use transform_connections::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn connection() {
    let input = include_str!("transform_connections/fixtures/connection.graphql");
    let expected = include_str!("transform_connections/fixtures/connection.expected");
    test_fixture(transform_fixture, "connection.graphql", "transform_connections/fixtures/connection.expected", input, expected);
}

#[test]
fn connection_directions() {
    let input = include_str!("transform_connections/fixtures/connection-directions.graphql");
    let expected = include_str!("transform_connections/fixtures/connection-directions.expected");
    test_fixture(transform_fixture, "connection-directions.graphql", "transform_connections/fixtures/connection-directions.expected", input, expected);
}

#[test]
fn connection_empty_filters() {
    let input = include_str!("transform_connections/fixtures/connection-empty-filters.graphql");
    let expected = include_str!("transform_connections/fixtures/connection-empty-filters.expected");
    test_fixture(transform_fixture, "connection-empty-filters.graphql", "transform_connections/fixtures/connection-empty-filters.expected", input, expected);
}

#[test]
fn connection_filters() {
    let input = include_str!("transform_connections/fixtures/connection-filters.graphql");
    let expected = include_str!("transform_connections/fixtures/connection-filters.expected");
    test_fixture(transform_fixture, "connection-filters.graphql", "transform_connections/fixtures/connection-filters.expected", input, expected);
}

#[test]
fn connection_generate_filters() {
    let input = include_str!("transform_connections/fixtures/connection-generate-filters.graphql");
    let expected = include_str!("transform_connections/fixtures/connection-generate-filters.expected");
    test_fixture(transform_fixture, "connection-generate-filters.graphql", "transform_connections/fixtures/connection-generate-filters.expected", input, expected);
}

#[test]
fn connection_with_aliased_edges_page_info() {
    let input = include_str!("transform_connections/fixtures/connection-with-aliased-edges-page-info.graphql");
    let expected = include_str!("transform_connections/fixtures/connection-with-aliased-edges-page-info.expected");
    test_fixture(transform_fixture, "connection-with-aliased-edges-page-info.graphql", "transform_connections/fixtures/connection-with-aliased-edges-page-info.expected", input, expected);
}

#[test]
fn connection_with_custom_handler() {
    let input = include_str!("transform_connections/fixtures/connection-with-custom-handler.graphql");
    let expected = include_str!("transform_connections/fixtures/connection-with-custom-handler.expected");
    test_fixture(transform_fixture, "connection-with-custom-handler.graphql", "transform_connections/fixtures/connection-with-custom-handler.expected", input, expected);
}

#[test]
fn connection_with_page_info() {
    let input = include_str!("transform_connections/fixtures/connection-with-page-info.graphql");
    let expected = include_str!("transform_connections/fixtures/connection-with-page-info.expected");
    test_fixture(transform_fixture, "connection-with-page-info.graphql", "transform_connections/fixtures/connection-with-page-info.expected", input, expected);
}

#[test]
fn connection_with_variables() {
    let input = include_str!("transform_connections/fixtures/connection-with-variables.graphql");
    let expected = include_str!("transform_connections/fixtures/connection-with-variables.expected");
    test_fixture(transform_fixture, "connection-with-variables.graphql", "transform_connections/fixtures/connection-with-variables.expected", input, expected);
}

#[test]
fn stream_connection() {
    let input = include_str!("transform_connections/fixtures/stream-connection.graphql");
    let expected = include_str!("transform_connections/fixtures/stream-connection.expected");
    test_fixture(transform_fixture, "stream-connection.graphql", "transform_connections/fixtures/stream-connection.expected", input, expected);
}

#[test]
fn stream_connection_no_label() {
    let input = include_str!("transform_connections/fixtures/stream-connection-no-label.graphql");
    let expected = include_str!("transform_connections/fixtures/stream-connection-no-label.expected");
    test_fixture(transform_fixture, "stream-connection-no-label.graphql", "transform_connections/fixtures/stream-connection-no-label.expected", input, expected);
}
