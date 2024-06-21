/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<404c5d236c3730337a395ae6aefa158c>>
 */

mod generate_flow_with_custom_id;

use generate_flow_with_custom_id::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn relay_client_id_field() {
    let input = include_str!("generate_flow_with_custom_id/fixtures/relay-client-id-field.graphql");
    let expected = include_str!("generate_flow_with_custom_id/fixtures/relay-client-id-field.expected");
    test_fixture(transform_fixture, "relay-client-id-field.graphql", "generate_flow_with_custom_id/fixtures/relay-client-id-field.expected", input, expected);
}

#[test]
fn simple() {
    let input = include_str!("generate_flow_with_custom_id/fixtures/simple.graphql");
    let expected = include_str!("generate_flow_with_custom_id/fixtures/simple.expected");
    test_fixture(transform_fixture, "simple.graphql", "generate_flow_with_custom_id/fixtures/simple.expected", input, expected);
}
