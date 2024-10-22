/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<5873fe295d3d76246e0125a0b8a37f15>>
 */

mod client_edges;

use client_edges::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn client_edge_backed_by_resolver() {
    let input = include_str!("client_edges/fixtures/client-edge-backed-by-resolver.graphql");
    let expected = include_str!("client_edges/fixtures/client-edge-backed-by-resolver.expected");
    test_fixture(transform_fixture, file!(), "client-edge-backed-by-resolver.graphql", "client_edges/fixtures/client-edge-backed-by-resolver.expected", input, expected).await;
}

#[tokio::test]
async fn client_edge_exec_time_resolver() {
    let input = include_str!("client_edges/fixtures/client-edge-exec-time-resolver.graphql");
    let expected = include_str!("client_edges/fixtures/client-edge-exec-time-resolver.expected");
    test_fixture(transform_fixture, file!(), "client-edge-exec-time-resolver.graphql", "client_edges/fixtures/client-edge-exec-time-resolver.expected", input, expected).await;
}

#[tokio::test]
async fn client_edge_to_client_object() {
    let input = include_str!("client_edges/fixtures/client-edge-to-client-object.graphql");
    let expected = include_str!("client_edges/fixtures/client-edge-to-client-object.expected");
    test_fixture(transform_fixture, file!(), "client-edge-to-client-object.graphql", "client_edges/fixtures/client-edge-to-client-object.expected", input, expected).await;
}

#[tokio::test]
async fn client_edge_to_plural_client_object() {
    let input = include_str!("client_edges/fixtures/client-edge-to-plural-client-object.graphql");
    let expected = include_str!("client_edges/fixtures/client-edge-to-plural-client-object.expected");
    test_fixture(transform_fixture, file!(), "client-edge-to-plural-client-object.graphql", "client_edges/fixtures/client-edge-to-plural-client-object.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_field_and_fragment_args() {
    let input = include_str!("client_edges/fixtures/relay-resolver-field-and-fragment-args.graphql");
    let expected = include_str!("client_edges/fixtures/relay-resolver-field-and-fragment-args.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-field-and-fragment-args.graphql", "client_edges/fixtures/relay-resolver-field-and-fragment-args.expected", input, expected).await;
}
