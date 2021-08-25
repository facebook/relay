/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<1903fbba81a336e83f044b4885fc2730>>
 */

mod client_edges;

use client_edges::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn client_edge() {
    let input = include_str!("client_edges/fixtures/client-edge.graphql");
    let expected = include_str!("client_edges/fixtures/client-edge.expected");
    test_fixture(transform_fixture, "client-edge.graphql", "client_edges/fixtures/client-edge.expected", input, expected);
}

#[test]
fn client_edge_within_non_client_edge() {
    let input = include_str!("client_edges/fixtures/client-edge-within-non-client-edge.graphql");
    let expected = include_str!("client_edges/fixtures/client-edge-within-non-client-edge.expected");
    test_fixture(transform_fixture, "client-edge-within-non-client-edge.graphql", "client_edges/fixtures/client-edge-within-non-client-edge.expected", input, expected);
}

#[test]
fn nested_client_edges() {
    let input = include_str!("client_edges/fixtures/nested-client-edges.graphql");
    let expected = include_str!("client_edges/fixtures/nested-client-edges.expected");
    test_fixture(transform_fixture, "nested-client-edges.graphql", "client_edges/fixtures/nested-client-edges.expected", input, expected);
}

#[test]
fn retain_directives() {
    let input = include_str!("client_edges/fixtures/retain-directives.graphql");
    let expected = include_str!("client_edges/fixtures/retain-directives.expected");
    test_fixture(transform_fixture, "retain-directives.graphql", "client_edges/fixtures/retain-directives.expected", input, expected);
}
