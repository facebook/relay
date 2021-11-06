/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<6f934a29b7735b37f4a3538256d3cca7>>
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
fn client_edge_inline_fragment() {
    let input = include_str!("client_edges/fixtures/client-edge-inline-fragment.graphql");
    let expected = include_str!("client_edges/fixtures/client-edge-inline-fragment.expected");
    test_fixture(transform_fixture, "client-edge-inline-fragment.graphql", "client_edges/fixtures/client-edge-inline-fragment.expected", input, expected);
}

#[test]
fn client_edge_inline_fragment_no_type_condition() {
    let input = include_str!("client_edges/fixtures/client-edge-inline-fragment-no-type-condition.graphql");
    let expected = include_str!("client_edges/fixtures/client-edge-inline-fragment-no-type-condition.expected");
    test_fixture(transform_fixture, "client-edge-inline-fragment-no-type-condition.graphql", "client_edges/fixtures/client-edge-inline-fragment-no-type-condition.expected", input, expected);
}

#[test]
fn client_edge_variables() {
    let input = include_str!("client_edges/fixtures/client-edge-variables.graphql");
    let expected = include_str!("client_edges/fixtures/client-edge-variables.expected");
    test_fixture(transform_fixture, "client-edge-variables.graphql", "client_edges/fixtures/client-edge-variables.expected", input, expected);
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
fn nested_client_edges_with_variables() {
    let input = include_str!("client_edges/fixtures/nested-client-edges-with-variables.graphql");
    let expected = include_str!("client_edges/fixtures/nested-client-edges-with-variables.expected");
    test_fixture(transform_fixture, "nested-client-edges-with-variables.graphql", "client_edges/fixtures/nested-client-edges-with-variables.expected", input, expected);
}
