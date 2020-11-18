/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<0dbd89ace1108177b6970f2f1bf82430>>
 */

mod declarative_connection;

use declarative_connection::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn append_edge() {
    let input = include_str!("declarative_connection/fixtures/append-edge.graphql");
    let expected = include_str!("declarative_connection/fixtures/append-edge.expected");
    test_fixture(transform_fixture, "append-edge.graphql", "declarative_connection/fixtures/append-edge.expected", input, expected);
}

#[test]
fn append_edge_unspported_invalid() {
    let input = include_str!("declarative_connection/fixtures/append-edge-unspported.invalid.graphql");
    let expected = include_str!("declarative_connection/fixtures/append-edge-unspported.invalid.expected");
    test_fixture(transform_fixture, "append-edge-unspported.invalid.graphql", "declarative_connection/fixtures/append-edge-unspported.invalid.expected", input, expected);
}

#[test]
fn append_node() {
    let input = include_str!("declarative_connection/fixtures/append-node.graphql");
    let expected = include_str!("declarative_connection/fixtures/append-node.expected");
    test_fixture(transform_fixture, "append-node.graphql", "declarative_connection/fixtures/append-node.expected", input, expected);
}

#[test]
fn append_node_edge_literal() {
    let input = include_str!("declarative_connection/fixtures/append-node-edge-literal.graphql");
    let expected = include_str!("declarative_connection/fixtures/append-node-edge-literal.expected");
    test_fixture(transform_fixture, "append-node-edge-literal.graphql", "declarative_connection/fixtures/append-node-edge-literal.expected", input, expected);
}

#[test]
fn append_node_unsupported_invalid() {
    let input = include_str!("declarative_connection/fixtures/append-node-unsupported.invalid.graphql");
    let expected = include_str!("declarative_connection/fixtures/append-node-unsupported.invalid.expected");
    test_fixture(transform_fixture, "append-node-unsupported.invalid.graphql", "declarative_connection/fixtures/append-node-unsupported.invalid.expected", input, expected);
}

#[test]
fn delete_edge_from_connection() {
    let input = include_str!("declarative_connection/fixtures/delete-edge-from-connection.graphql");
    let expected = include_str!("declarative_connection/fixtures/delete-edge-from-connection.expected");
    test_fixture(transform_fixture, "delete-edge-from-connection.graphql", "declarative_connection/fixtures/delete-edge-from-connection.expected", input, expected);
}

#[test]
fn delete_edge_from_connection_on_unsupported_type_invalid() {
    let input = include_str!("declarative_connection/fixtures/delete-edge-from-connection-on-unsupported-type.invalid.graphql");
    let expected = include_str!("declarative_connection/fixtures/delete-edge-from-connection-on-unsupported-type.invalid.expected");
    test_fixture(transform_fixture, "delete-edge-from-connection-on-unsupported-type.invalid.graphql", "declarative_connection/fixtures/delete-edge-from-connection-on-unsupported-type.invalid.expected", input, expected);
}

#[test]
fn delete_edge_from_connection_plural() {
    let input = include_str!("declarative_connection/fixtures/delete-edge-from-connection-plural.graphql");
    let expected = include_str!("declarative_connection/fixtures/delete-edge-from-connection-plural.expected");
    test_fixture(transform_fixture, "delete-edge-from-connection-plural.graphql", "declarative_connection/fixtures/delete-edge-from-connection-plural.expected", input, expected);
}

#[test]
fn delete_from_store() {
    let input = include_str!("declarative_connection/fixtures/delete-from-store.graphql");
    let expected = include_str!("declarative_connection/fixtures/delete-from-store.expected");
    test_fixture(transform_fixture, "delete-from-store.graphql", "declarative_connection/fixtures/delete-from-store.expected", input, expected);
}

#[test]
fn delete_from_store_plural() {
    let input = include_str!("declarative_connection/fixtures/delete-from-store-plural.graphql");
    let expected = include_str!("declarative_connection/fixtures/delete-from-store-plural.expected");
    test_fixture(transform_fixture, "delete-from-store-plural.graphql", "declarative_connection/fixtures/delete-from-store-plural.expected", input, expected);
}

#[test]
fn delete_on_unspported_type_invalid() {
    let input = include_str!("declarative_connection/fixtures/delete-on-unspported-type.invalid.graphql");
    let expected = include_str!("declarative_connection/fixtures/delete-on-unspported-type.invalid.expected");
    test_fixture(transform_fixture, "delete-on-unspported-type.invalid.graphql", "declarative_connection/fixtures/delete-on-unspported-type.invalid.expected", input, expected);
}
