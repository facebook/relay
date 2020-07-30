// @generated SignedSource<<1a75eaed08a6f9322f03787154a24326>>

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
fn delete_from_store() {
    let input = include_str!("declarative_connection/fixtures/delete-from-store.graphql");
    let expected = include_str!("declarative_connection/fixtures/delete-from-store.expected");
    test_fixture(transform_fixture, "delete-from-store.graphql", "declarative_connection/fixtures/delete-from-store.expected", input, expected);
}

#[test]
fn delete_on_unspported_type_invalid() {
    let input = include_str!("declarative_connection/fixtures/delete-on-unspported-type.invalid.graphql");
    let expected = include_str!("declarative_connection/fixtures/delete-on-unspported-type.invalid.expected");
    test_fixture(transform_fixture, "delete-on-unspported-type.invalid.graphql", "declarative_connection/fixtures/delete-on-unspported-type.invalid.expected", input, expected);
}
