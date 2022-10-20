/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<cf6624b2cc4cc339f5ee14ff078309f8>>
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
fn client_edge_to_non_null_plural_server_object_relay_resolver_invalid() {
    let input = include_str!("to_schema/fixtures/client-edge-to-non-null-plural-server-object-relay-resolver.invalid.js");
    let expected = include_str!("to_schema/fixtures/client-edge-to-non-null-plural-server-object-relay-resolver.invalid.expected");
    test_fixture(transform_fixture, "client-edge-to-non-null-plural-server-object-relay-resolver.invalid.js", "to_schema/fixtures/client-edge-to-non-null-plural-server-object-relay-resolver.invalid.expected", input, expected);
}

#[test]
fn client_edge_to_plural_server_object_relay_resolver_invalid() {
    let input = include_str!("to_schema/fixtures/client-edge-to-plural-server-object-relay-resolver.invalid.js");
    let expected = include_str!("to_schema/fixtures/client-edge-to-plural-server-object-relay-resolver.invalid.expected");
    test_fixture(transform_fixture, "client-edge-to-plural-server-object-relay-resolver.invalid.js", "to_schema/fixtures/client-edge-to-plural-server-object-relay-resolver.invalid.expected", input, expected);
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
fn relay_resolver_implementing_a_field_defined_by_grandparent_interface() {
    let input = include_str!("to_schema/fixtures/relay-resolver-implementing-a-field-defined-by-grandparent-interface.js");
    let expected = include_str!("to_schema/fixtures/relay-resolver-implementing-a-field-defined-by-grandparent-interface.expected");
    test_fixture(transform_fixture, "relay-resolver-implementing-a-field-defined-by-grandparent-interface.js", "to_schema/fixtures/relay-resolver-implementing-a-field-defined-by-grandparent-interface.expected", input, expected);
}

#[test]
fn relay_resolver_implementing_a_field_defined_by_parent_interface() {
    let input = include_str!("to_schema/fixtures/relay-resolver-implementing-a-field-defined-by-parent-interface.js");
    let expected = include_str!("to_schema/fixtures/relay-resolver-implementing-a-field-defined-by-parent-interface.expected");
    test_fixture(transform_fixture, "relay-resolver-implementing-a-field-defined-by-parent-interface.js", "to_schema/fixtures/relay-resolver-implementing-a-field-defined-by-parent-interface.expected", input, expected);
}

#[test]
fn relay_resolver_named_export() {
    let input = include_str!("to_schema/fixtures/relay-resolver-named-export.js");
    let expected = include_str!("to_schema/fixtures/relay-resolver-named-export.expected");
    test_fixture(transform_fixture, "relay-resolver-named-export.js", "to_schema/fixtures/relay-resolver-named-export.expected", input, expected);
}

#[test]
fn relay_resolver_on_interface() {
    let input = include_str!("to_schema/fixtures/relay-resolver-on-interface.js");
    let expected = include_str!("to_schema/fixtures/relay-resolver-on-interface.expected");
    test_fixture(transform_fixture, "relay-resolver-on-interface.js", "to_schema/fixtures/relay-resolver-on-interface.expected", input, expected);
}

#[test]
fn relay_resolver_on_interface_implementing_a_field_defined_by_parent_interface() {
    let input = include_str!("to_schema/fixtures/relay-resolver-on-interface-implementing-a-field-defined-by-parent-interface.js");
    let expected = include_str!("to_schema/fixtures/relay-resolver-on-interface-implementing-a-field-defined-by-parent-interface.expected");
    test_fixture(transform_fixture, "relay-resolver-on-interface-implementing-a-field-defined-by-parent-interface.js", "to_schema/fixtures/relay-resolver-on-interface-implementing-a-field-defined-by-parent-interface.expected", input, expected);
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

#[test]
fn relay_resolver_strong_object() {
    let input = include_str!("to_schema/fixtures/relay-resolver-strong-object.js");
    let expected = include_str!("to_schema/fixtures/relay-resolver-strong-object.expected");
    test_fixture(transform_fixture, "relay-resolver-strong-object.js", "to_schema/fixtures/relay-resolver-strong-object.expected", input, expected);
}

#[test]
fn relay_resolver_with_args() {
    let input = include_str!("to_schema/fixtures/relay-resolver-with-args.js");
    let expected = include_str!("to_schema/fixtures/relay-resolver-with-args.expected");
    test_fixture(transform_fixture, "relay-resolver-with-args.js", "to_schema/fixtures/relay-resolver-with-args.expected", input, expected);
}

#[test]
fn relay_resolver_with_field_and_fragment_args() {
    let input = include_str!("to_schema/fixtures/relay-resolver-with-field-and-fragment-args.js");
    let expected = include_str!("to_schema/fixtures/relay-resolver-with-field-and-fragment-args.expected");
    test_fixture(transform_fixture, "relay-resolver-with-field-and-fragment-args.js", "to_schema/fixtures/relay-resolver-with-field-and-fragment-args.expected", input, expected);
}

#[test]
fn relay_resolver_with_field_args() {
    let input = include_str!("to_schema/fixtures/relay-resolver-with-field-args.js");
    let expected = include_str!("to_schema/fixtures/relay-resolver-with-field-args.expected");
    test_fixture(transform_fixture, "relay-resolver-with-field-args.js", "to_schema/fixtures/relay-resolver-with-field-args.expected", input, expected);
}

#[test]
fn relay_resolver_with_output_type() {
    let input = include_str!("to_schema/fixtures/relay-resolver-with-output-type.js");
    let expected = include_str!("to_schema/fixtures/relay-resolver-with-output-type.expected");
    test_fixture(transform_fixture, "relay-resolver-with-output-type.js", "to_schema/fixtures/relay-resolver-with-output-type.expected", input, expected);
}

#[test]
fn terse_relay_resolver() {
    let input = include_str!("to_schema/fixtures/terse-relay-resolver.js");
    let expected = include_str!("to_schema/fixtures/terse-relay-resolver.expected");
    test_fixture(transform_fixture, "terse-relay-resolver.js", "to_schema/fixtures/terse-relay-resolver.expected", input, expected);
}

#[test]
fn terse_relay_resolver_with_output_type() {
    let input = include_str!("to_schema/fixtures/terse-relay-resolver-with-output-type.js");
    let expected = include_str!("to_schema/fixtures/terse-relay-resolver-with-output-type.expected");
    test_fixture(transform_fixture, "terse-relay-resolver-with-output-type.js", "to_schema/fixtures/terse-relay-resolver-with-output-type.expected", input, expected);
}

#[test]
fn weak_type() {
    let input = include_str!("to_schema/fixtures/weak-type.js");
    let expected = include_str!("to_schema/fixtures/weak-type.expected");
    test_fixture(transform_fixture, "weak-type.js", "to_schema/fixtures/weak-type.expected", input, expected);
}
