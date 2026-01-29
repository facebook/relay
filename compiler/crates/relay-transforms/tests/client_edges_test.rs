/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b7e5853c7562e13d0e5708fb6b18f962>>
 */

mod client_edges;

use client_edges::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn client_edge() {
    let input = include_str!("client_edges/fixtures/client-edge.graphql");
    let expected = include_str!("client_edges/fixtures/client-edge.expected");
    test_fixture(transform_fixture, file!(), "client-edge.graphql", "client_edges/fixtures/client-edge.expected", input, expected).await;
}

#[tokio::test]
async fn client_edge_duplicate_fragment_with_exec_time_resolvers_invalid() {
    let input = include_str!("client_edges/fixtures/client-edge-duplicate-fragment-with-exec-time-resolvers.invalid.graphql");
    let expected = include_str!("client_edges/fixtures/client-edge-duplicate-fragment-with-exec-time-resolvers.invalid.expected");
    test_fixture(transform_fixture, file!(), "client-edge-duplicate-fragment-with-exec-time-resolvers.invalid.graphql", "client_edges/fixtures/client-edge-duplicate-fragment-with-exec-time-resolvers.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn client_edge_in_fragment_with_exec_time_resolvers_invalid() {
    let input = include_str!("client_edges/fixtures/client-edge-in-fragment-with-exec-time-resolvers.invalid.graphql");
    let expected = include_str!("client_edges/fixtures/client-edge-in-fragment-with-exec-time-resolvers.invalid.expected");
    test_fixture(transform_fixture, file!(), "client-edge-in-fragment-with-exec-time-resolvers.invalid.graphql", "client_edges/fixtures/client-edge-in-fragment-with-exec-time-resolvers.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn client_edge_in_nested_fragment_with_exec_time_resolvers_invalid() {
    let input = include_str!("client_edges/fixtures/client-edge-in-nested-fragment-with-exec-time-resolvers.invalid.graphql");
    let expected = include_str!("client_edges/fixtures/client-edge-in-nested-fragment-with-exec-time-resolvers.invalid.expected");
    test_fixture(transform_fixture, file!(), "client-edge-in-nested-fragment-with-exec-time-resolvers.invalid.graphql", "client_edges/fixtures/client-edge-in-nested-fragment-with-exec-time-resolvers.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn client_edge_inline_fragment() {
    let input = include_str!("client_edges/fixtures/client-edge-inline-fragment.graphql");
    let expected = include_str!("client_edges/fixtures/client-edge-inline-fragment.expected");
    test_fixture(transform_fixture, file!(), "client-edge-inline-fragment.graphql", "client_edges/fixtures/client-edge-inline-fragment.expected", input, expected).await;
}

#[tokio::test]
async fn client_edge_inline_fragment_no_type_condition() {
    let input = include_str!("client_edges/fixtures/client-edge-inline-fragment-no-type-condition.graphql");
    let expected = include_str!("client_edges/fixtures/client-edge-inline-fragment-no-type-condition.expected");
    test_fixture(transform_fixture, file!(), "client-edge-inline-fragment-no-type-condition.graphql", "client_edges/fixtures/client-edge-inline-fragment-no-type-condition.expected", input, expected).await;
}

#[tokio::test]
async fn client_edge_to_client_interface() {
    let input = include_str!("client_edges/fixtures/client-edge-to-client-interface.graphql");
    let expected = include_str!("client_edges/fixtures/client-edge-to-client-interface.expected");
    test_fixture(transform_fixture, file!(), "client-edge-to-client-interface.graphql", "client_edges/fixtures/client-edge-to-client-interface.expected", input, expected).await;
}

#[tokio::test]
async fn client_edge_to_client_interface_invalid() {
    let input = include_str!("client_edges/fixtures/client-edge-to-client-interface.invalid.graphql");
    let expected = include_str!("client_edges/fixtures/client-edge-to-client-interface.invalid.expected");
    test_fixture(transform_fixture, file!(), "client-edge-to-client-interface.invalid.graphql", "client_edges/fixtures/client-edge-to-client-interface.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn client_edge_to_client_object() {
    let input = include_str!("client_edges/fixtures/client-edge-to-client-object.graphql");
    let expected = include_str!("client_edges/fixtures/client-edge-to-client-object.expected");
    test_fixture(transform_fixture, file!(), "client-edge-to-client-object.graphql", "client_edges/fixtures/client-edge-to-client-object.expected", input, expected).await;
}

#[tokio::test]
async fn client_edge_to_client_union() {
    let input = include_str!("client_edges/fixtures/client-edge-to-client-union.graphql");
    let expected = include_str!("client_edges/fixtures/client-edge-to-client-union.expected");
    test_fixture(transform_fixture, file!(), "client-edge-to-client-union.graphql", "client_edges/fixtures/client-edge-to-client-union.expected", input, expected).await;
}

#[tokio::test]
async fn client_edge_to_client_with_exec_time_resolvers() {
    let input = include_str!("client_edges/fixtures/client-edge-to-client-with-exec-time-resolvers.graphql");
    let expected = include_str!("client_edges/fixtures/client-edge-to-client-with-exec-time-resolvers.expected");
    test_fixture(transform_fixture, file!(), "client-edge-to-client-with-exec-time-resolvers.graphql", "client_edges/fixtures/client-edge-to-client-with-exec-time-resolvers.expected", input, expected).await;
}

#[tokio::test]
async fn client_edge_to_server_with_exec_time_resolvers_invalid() {
    let input = include_str!("client_edges/fixtures/client-edge-to-server-with-exec-time-resolvers.invalid.graphql");
    let expected = include_str!("client_edges/fixtures/client-edge-to-server-with-exec-time-resolvers.invalid.expected");
    test_fixture(transform_fixture, file!(), "client-edge-to-server-with-exec-time-resolvers.invalid.graphql", "client_edges/fixtures/client-edge-to-server-with-exec-time-resolvers.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn client_edge_variables() {
    let input = include_str!("client_edges/fixtures/client-edge-variables.graphql");
    let expected = include_str!("client_edges/fixtures/client-edge-variables.expected");
    test_fixture(transform_fixture, file!(), "client-edge-variables.graphql", "client_edges/fixtures/client-edge-variables.expected", input, expected).await;
}

#[tokio::test]
async fn client_edge_with_required() {
    let input = include_str!("client_edges/fixtures/client-edge-with-required.graphql");
    let expected = include_str!("client_edges/fixtures/client-edge-with-required.expected");
    test_fixture(transform_fixture, file!(), "client-edge-with-required.graphql", "client_edges/fixtures/client-edge-with-required.expected", input, expected).await;
}

#[tokio::test]
async fn client_edge_within_non_client_edge() {
    let input = include_str!("client_edges/fixtures/client-edge-within-non-client-edge.graphql");
    let expected = include_str!("client_edges/fixtures/client-edge-within-non-client-edge.expected");
    test_fixture(transform_fixture, file!(), "client-edge-within-non-client-edge.graphql", "client_edges/fixtures/client-edge-within-non-client-edge.expected", input, expected).await;
}

#[tokio::test]
async fn nested_client_edges() {
    let input = include_str!("client_edges/fixtures/nested-client-edges.graphql");
    let expected = include_str!("client_edges/fixtures/nested-client-edges.expected");
    test_fixture(transform_fixture, file!(), "nested-client-edges.graphql", "client_edges/fixtures/nested-client-edges.expected", input, expected).await;
}

#[tokio::test]
async fn nested_client_edges_with_variables() {
    let input = include_str!("client_edges/fixtures/nested-client-edges-with-variables.graphql");
    let expected = include_str!("client_edges/fixtures/nested-client-edges-with-variables.expected");
    test_fixture(transform_fixture, file!(), "nested-client-edges-with-variables.graphql", "client_edges/fixtures/nested-client-edges-with-variables.expected", input, expected).await;
}

#[tokio::test]
async fn nested_path() {
    let input = include_str!("client_edges/fixtures/nested-path.graphql");
    let expected = include_str!("client_edges/fixtures/nested-path.expected");
    test_fixture(transform_fixture, file!(), "nested-path.graphql", "client_edges/fixtures/nested-path.expected", input, expected).await;
}

#[tokio::test]
async fn nested_path_with_alias() {
    let input = include_str!("client_edges/fixtures/nested-path-with-alias.graphql");
    let expected = include_str!("client_edges/fixtures/nested-path-with-alias.expected");
    test_fixture(transform_fixture, file!(), "nested-path-with-alias.graphql", "client_edges/fixtures/nested-path-with-alias.expected", input, expected).await;
}

#[tokio::test]
async fn output_type() {
    let input = include_str!("client_edges/fixtures/output-type.graphql");
    let expected = include_str!("client_edges/fixtures/output-type.expected");
    test_fixture(transform_fixture, file!(), "output-type.graphql", "client_edges/fixtures/output-type.expected", input, expected).await;
}

#[tokio::test]
async fn server_edge_to_client_in_fragment_with_exec_time_resolvers_invalid() {
    let input = include_str!("client_edges/fixtures/server-edge-to-client-in-fragment-with-exec-time-resolvers.invalid.graphql");
    let expected = include_str!("client_edges/fixtures/server-edge-to-client-in-fragment-with-exec-time-resolvers.invalid.expected");
    test_fixture(transform_fixture, file!(), "server-edge-to-client-in-fragment-with-exec-time-resolvers.invalid.graphql", "client_edges/fixtures/server-edge-to-client-in-fragment-with-exec-time-resolvers.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn server_edge_to_client_with_exec_time_resolvers_invalid() {
    let input = include_str!("client_edges/fixtures/server-edge-to-client-with-exec-time-resolvers.invalid.graphql");
    let expected = include_str!("client_edges/fixtures/server-edge-to-client-with-exec-time-resolvers.invalid.expected");
    test_fixture(transform_fixture, file!(), "server-edge-to-client-with-exec-time-resolvers.invalid.graphql", "client_edges/fixtures/server-edge-to-client-with-exec-time-resolvers.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn unexpected_waterfall_invalid() {
    let input = include_str!("client_edges/fixtures/unexpected-waterfall.invalid.graphql");
    let expected = include_str!("client_edges/fixtures/unexpected-waterfall.invalid.expected");
    test_fixture(transform_fixture, file!(), "unexpected-waterfall.invalid.graphql", "client_edges/fixtures/unexpected-waterfall.invalid.expected", input, expected).await;
}
