/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<395589ed7293b0ebd4fbc20085c91123>>
 */

mod to_schema;

use to_schema::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn client_edge_relay_resolver() {
    let input = include_str!("to_schema/fixtures/client-edge-relay-resolver.js");
    let expected = include_str!("to_schema/fixtures/client-edge-relay-resolver.expected");
    test_fixture(transform_fixture, "client-edge-relay-resolver.js", "to_schema/fixtures/client-edge-relay-resolver.expected", input, expected);
}

#[test]
fn relay_resolver() {
    let input = include_str!("to_schema/fixtures/relay-resolver.js");
    let expected = include_str!("to_schema/fixtures/relay-resolver.expected");
    test_fixture(transform_fixture, "relay-resolver.js", "to_schema/fixtures/relay-resolver.expected", input, expected);
}

#[test]
fn relay_resolver_deprecated() {
    let input = include_str!("to_schema/fixtures/relay-resolver-deprecated.js");
    let expected = include_str!("to_schema/fixtures/relay-resolver-deprecated.expected");
    test_fixture(transform_fixture, "relay-resolver-deprecated.js", "to_schema/fixtures/relay-resolver-deprecated.expected", input, expected);
}

#[test]
fn relay_resolver_deprecated_no_description() {
    let input = include_str!("to_schema/fixtures/relay-resolver-deprecated-no-description.js");
    let expected = include_str!("to_schema/fixtures/relay-resolver-deprecated-no-description.expected");
    test_fixture(transform_fixture, "relay-resolver-deprecated-no-description.js", "to_schema/fixtures/relay-resolver-deprecated-no-description.expected", input, expected);
}

#[test]
fn relay_resolver_on_interface() {
    let input = include_str!("to_schema/fixtures/relay-resolver-on-interface.js");
    let expected = include_str!("to_schema/fixtures/relay-resolver-on-interface.expected");
    test_fixture(transform_fixture, "relay-resolver-on-interface.js", "to_schema/fixtures/relay-resolver-on-interface.expected", input, expected);
}

#[test]
fn relay_resolver_on_interface_with_type_invalid() {
    let input = include_str!("to_schema/fixtures/relay-resolver-on-interface-with-type.invalid.js");
    let expected = include_str!("to_schema/fixtures/relay-resolver-on-interface-with-type.invalid.expected");
    test_fixture(transform_fixture, "relay-resolver-on-interface-with-type.invalid.js", "to_schema/fixtures/relay-resolver-on-interface-with-type.invalid.expected", input, expected);
}

#[test]
fn relay_resolver_on_invalid_interface_invalid() {
    let input = include_str!("to_schema/fixtures/relay-resolver-on-invalid-interface.invalid.js");
    let expected = include_str!("to_schema/fixtures/relay-resolver-on-invalid-interface.invalid.expected");
    test_fixture(transform_fixture, "relay-resolver-on-invalid-interface.invalid.js", "to_schema/fixtures/relay-resolver-on-invalid-interface.invalid.expected", input, expected);
}

#[test]
fn relay_resolver_on_invalid_type_invalid() {
    let input = include_str!("to_schema/fixtures/relay-resolver-on-invalid-type.invalid.js");
    let expected = include_str!("to_schema/fixtures/relay-resolver-on-invalid-type.invalid.expected");
    test_fixture(transform_fixture, "relay-resolver-on-invalid-type.invalid.js", "to_schema/fixtures/relay-resolver-on-invalid-type.invalid.expected", input, expected);
}

#[test]
fn relay_resolver_on_type_with_interface_invalid() {
    let input = include_str!("to_schema/fixtures/relay-resolver-on-type-with-interface.invalid.js");
    let expected = include_str!("to_schema/fixtures/relay-resolver-on-type-with-interface.invalid.expected");
    test_fixture(transform_fixture, "relay-resolver-on-type-with-interface.invalid.js", "to_schema/fixtures/relay-resolver-on-type-with-interface.invalid.expected", input, expected);
}
