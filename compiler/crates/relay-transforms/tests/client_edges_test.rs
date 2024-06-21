/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<4c8ae6c8320ef3ba5464f80d8fff1afd>>
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
fn client_edge_to_client_interface_invalid() {
    let input = include_str!("client_edges/fixtures/client-edge-to-client-interface.invalid.graphql");
    let expected = include_str!("client_edges/fixtures/client-edge-to-client-interface.invalid.expected");
    test_fixture(transform_fixture, "client-edge-to-client-interface.invalid.graphql", "client_edges/fixtures/client-edge-to-client-interface.invalid.expected", input, expected);
}

#[test]
fn client_edge_to_client_object() {
    let input = include_str!("client_edges/fixtures/client-edge-to-client-object.graphql");
    let expected = include_str!("client_edges/fixtures/client-edge-to-client-object.expected");
    test_fixture(transform_fixture, "client-edge-to-client-object.graphql", "client_edges/fixtures/client-edge-to-client-object.expected", input, expected);
}

#[test]
fn client_edge_to_client_union_invalid() {
    let input = include_str!("client_edges/fixtures/client-edge-to-client-union.invalid.graphql");
    let expected = include_str!("client_edges/fixtures/client-edge-to-client-union.invalid.expected");
    test_fixture(transform_fixture, "client-edge-to-client-union.invalid.graphql", "client_edges/fixtures/client-edge-to-client-union.invalid.expected", input, expected);
}

#[test]
fn client_edge_variables() {
    let input = include_str!("client_edges/fixtures/client-edge-variables.graphql");
    let expected = include_str!("client_edges/fixtures/client-edge-variables.expected");
    test_fixture(transform_fixture, "client-edge-variables.graphql", "client_edges/fixtures/client-edge-variables.expected", input, expected);
}

#[test]
fn client_edge_with_required() {
    let input = include_str!("client_edges/fixtures/client-edge-with-required.graphql");
    let expected = include_str!("client_edges/fixtures/client-edge-with-required.expected");
    test_fixture(transform_fixture, "client-edge-with-required.graphql", "client_edges/fixtures/client-edge-with-required.expected", input, expected);
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

#[test]
fn output_type() {
    let input = include_str!("client_edges/fixtures/output-type.graphql");
    let expected = include_str!("client_edges/fixtures/output-type.expected");
    test_fixture(transform_fixture, "output-type.graphql", "client_edges/fixtures/output-type.expected", input, expected);
}

#[test]
fn unexpected_waterfall_invalid() {
    let input = include_str!("client_edges/fixtures/unexpected-waterfall.invalid.graphql");
    let expected = include_str!("client_edges/fixtures/unexpected-waterfall.invalid.expected");
    test_fixture(transform_fixture, "unexpected-waterfall.invalid.graphql", "client_edges/fixtures/unexpected-waterfall.invalid.expected", input, expected);
}
