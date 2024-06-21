/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<dd56e861b0bff2823f35d73903e01dc6>>
 */

mod client_edges;

use client_edges::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn client_edge_backed_by_resolver() {
    let input = include_str!("client_edges/fixtures/client-edge-backed-by-resolver.graphql");
    let expected = include_str!("client_edges/fixtures/client-edge-backed-by-resolver.expected");
    test_fixture(transform_fixture, "client-edge-backed-by-resolver.graphql", "client_edges/fixtures/client-edge-backed-by-resolver.expected", input, expected);
}

#[test]
fn client_edge_to_client_object() {
    let input = include_str!("client_edges/fixtures/client-edge-to-client-object.graphql");
    let expected = include_str!("client_edges/fixtures/client-edge-to-client-object.expected");
    test_fixture(transform_fixture, "client-edge-to-client-object.graphql", "client_edges/fixtures/client-edge-to-client-object.expected", input, expected);
}

#[test]
fn client_edge_to_plural_client_object() {
    let input = include_str!("client_edges/fixtures/client-edge-to-plural-client-object.graphql");
    let expected = include_str!("client_edges/fixtures/client-edge-to-plural-client-object.expected");
    test_fixture(transform_fixture, "client-edge-to-plural-client-object.graphql", "client_edges/fixtures/client-edge-to-plural-client-object.expected", input, expected);
}

#[test]
fn relay_resolver_field_and_fragment_args() {
    let input = include_str!("client_edges/fixtures/relay-resolver-field-and-fragment-args.graphql");
    let expected = include_str!("client_edges/fixtures/relay-resolver-field-and-fragment-args.expected");
    test_fixture(transform_fixture, "relay-resolver-field-and-fragment-args.graphql", "client_edges/fixtures/relay-resolver-field-and-fragment-args.expected", input, expected);
}
