/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<8a8e28e0166bb499685474fdca341ba5>>
 */

mod relay_client_component;

use relay_client_component::transform_fixture;
use fixture_tests::test_fixture;

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
