/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<c853392e0d552b83b2d32540f9c74eef>>
 */

mod relay_client_component;

use relay_client_component::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn fragment_on_all_non_node_union_invalid() {
    let input = include_str!("relay_client_component/fixtures/fragment-on-all-non-node-union.invalid.graphql");
    let expected = include_str!("relay_client_component/fixtures/fragment-on-all-non-node-union.invalid.expected");
    test_fixture(transform_fixture, "fragment-on-all-non-node-union.invalid.graphql", "relay_client_component/fixtures/fragment-on-all-non-node-union.invalid.expected", input, expected);
}

#[test]
fn fragment_on_fake_node_type_invalid() {
    let input = include_str!("relay_client_component/fixtures/fragment-on-fake-node-type.invalid.graphql");
    let expected = include_str!("relay_client_component/fixtures/fragment-on-fake-node-type.invalid.expected");
    test_fixture(transform_fixture, "fragment-on-fake-node-type.invalid.graphql", "relay_client_component/fixtures/fragment-on-fake-node-type.invalid.expected", input, expected);
}

#[test]
fn fragment_on_non_node_type_invalid() {
    let input = include_str!("relay_client_component/fixtures/fragment-on-non-node-type.invalid.graphql");
    let expected = include_str!("relay_client_component/fixtures/fragment-on-non-node-type.invalid.expected");
    test_fixture(transform_fixture, "fragment-on-non-node-type.invalid.graphql", "relay_client_component/fixtures/fragment-on-non-node-type.invalid.expected", input, expected);
}

#[test]
fn fragment_on_some_non_node_union_invalid() {
    let input = include_str!("relay_client_component/fixtures/fragment-on-some-non-node-union.invalid.graphql");
    let expected = include_str!("relay_client_component/fixtures/fragment-on-some-non-node-union.invalid.expected");
    test_fixture(transform_fixture, "fragment-on-some-non-node-union.invalid.graphql", "relay_client_component/fixtures/fragment-on-some-non-node-union.invalid.expected", input, expected);
}

#[test]
fn fragment_with_arguments_invalid() {
    let input = include_str!("relay_client_component/fixtures/fragment-with-arguments.invalid.graphql");
    let expected = include_str!("relay_client_component/fixtures/fragment-with-arguments.invalid.expected");
    test_fixture(transform_fixture, "fragment-with-arguments.invalid.graphql", "relay_client_component/fixtures/fragment-with-arguments.invalid.expected", input, expected);
}

#[test]
fn fragment_with_incompatible_directives_invalid() {
    let input = include_str!("relay_client_component/fixtures/fragment-with-incompatible-directives.invalid.graphql");
    let expected = include_str!("relay_client_component/fixtures/fragment-with-incompatible-directives.invalid.expected");
    test_fixture(transform_fixture, "fragment-with-incompatible-directives.invalid.graphql", "relay_client_component/fixtures/fragment-with-incompatible-directives.invalid.expected", input, expected);
}

#[test]
fn fragment_with_relay_client_component() {
    let input = include_str!("relay_client_component/fixtures/fragment-with-relay-client-component.graphql");
    let expected = include_str!("relay_client_component/fixtures/fragment-with-relay-client-component.expected");
    test_fixture(transform_fixture, "fragment-with-relay-client-component.graphql", "relay_client_component/fixtures/fragment-with-relay-client-component.expected", input, expected);
}

#[test]
fn fragment_with_relay_client_component_on_query() {
    let input = include_str!("relay_client_component/fixtures/fragment-with-relay-client-component-on-query.graphql");
    let expected = include_str!("relay_client_component/fixtures/fragment-with-relay-client-component-on-query.expected");
    test_fixture(transform_fixture, "fragment-with-relay-client-component-on-query.graphql", "relay_client_component/fixtures/fragment-with-relay-client-component-on-query.expected", input, expected);
}

#[test]
fn fragment_with_relay_client_component_on_viewer() {
    let input = include_str!("relay_client_component/fixtures/fragment-with-relay-client-component-on-viewer.graphql");
    let expected = include_str!("relay_client_component/fixtures/fragment-with-relay-client-component-on-viewer.expected");
    test_fixture(transform_fixture, "fragment-with-relay-client-component-on-viewer.graphql", "relay_client_component/fixtures/fragment-with-relay-client-component-on-viewer.expected", input, expected);
}

#[test]
fn query_with_relay_client_component() {
    let input = include_str!("relay_client_component/fixtures/query-with-relay-client-component.graphql");
    let expected = include_str!("relay_client_component/fixtures/query-with-relay-client-component.expected");
    test_fixture(transform_fixture, "query-with-relay-client-component.graphql", "relay_client_component/fixtures/query-with-relay-client-component.expected", input, expected);
}
