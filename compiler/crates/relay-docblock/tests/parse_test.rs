/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<5f08fb834712e36cfb8d384567778614>>
 */

mod parse;

use parse::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn edge_to_non_null_invalid() {
    let input = include_str!("parse/fixtures/edge-to-non-null.invalid.js");
    let expected = include_str!("parse/fixtures/edge-to-non-null.invalid.expected");
    test_fixture(transform_fixture, "edge-to-non-null.invalid.js", "parse/fixtures/edge-to-non-null.invalid.expected", input, expected);
}

#[test]
fn edge_to_non_null_plural_item_invalid() {
    let input = include_str!("parse/fixtures/edge-to-non-null-plural-item.invalid.js");
    let expected = include_str!("parse/fixtures/edge-to-non-null-plural-item.invalid.expected");
    test_fixture(transform_fixture, "edge-to-non-null-plural-item.invalid.js", "parse/fixtures/edge-to-non-null-plural-item.invalid.expected", input, expected);
}

#[test]
fn edge_to_not_identifier_invalid() {
    let input = include_str!("parse/fixtures/edge-to-not-identifier.invalid.js");
    let expected = include_str!("parse/fixtures/edge-to-not-identifier.invalid.expected");
    test_fixture(transform_fixture, "edge-to-not-identifier.invalid.js", "parse/fixtures/edge-to-not-identifier.invalid.expected", input, expected);
}

#[test]
fn output_type_edge_to_invalid() {
    let input = include_str!("parse/fixtures/output-type-edge-to-invalid.js");
    let expected = include_str!("parse/fixtures/output-type-edge-to-invalid.expected");
    test_fixture(transform_fixture, "output-type-edge-to-invalid.js", "parse/fixtures/output-type-edge-to-invalid.expected", input, expected);
}

#[test]
fn output_type_invalid_type() {
    let input = include_str!("parse/fixtures/output-type-invalid-type.js");
    let expected = include_str!("parse/fixtures/output-type-invalid-type.expected");
    test_fixture(transform_fixture, "output-type-invalid-type.js", "parse/fixtures/output-type-invalid-type.expected", input, expected);
}

#[test]
fn relay_resolver() {
    let input = include_str!("parse/fixtures/relay-resolver.js");
    let expected = include_str!("parse/fixtures/relay-resolver.expected");
    test_fixture(transform_fixture, "relay-resolver.js", "parse/fixtures/relay-resolver.expected", input, expected);
}

#[test]
fn relay_resolver_deprecated() {
    let input = include_str!("parse/fixtures/relay-resolver-deprecated.js");
    let expected = include_str!("parse/fixtures/relay-resolver-deprecated.expected");
    test_fixture(transform_fixture, "relay-resolver-deprecated.js", "parse/fixtures/relay-resolver-deprecated.expected", input, expected);
}

#[test]
fn relay_resolver_deprecated_no_description() {
    let input = include_str!("parse/fixtures/relay-resolver-deprecated-no-description.js");
    let expected = include_str!("parse/fixtures/relay-resolver-deprecated-no-description.expected");
    test_fixture(transform_fixture, "relay-resolver-deprecated-no-description.js", "parse/fixtures/relay-resolver-deprecated-no-description.expected", input, expected);
}

#[test]
fn relay_resolver_invalid_field_invalid() {
    let input = include_str!("parse/fixtures/relay-resolver-invalid-field.invalid.js");
    let expected = include_str!("parse/fixtures/relay-resolver-invalid-field.invalid.expected");
    test_fixture(transform_fixture, "relay-resolver-invalid-field.invalid.js", "parse/fixtures/relay-resolver-invalid-field.invalid.expected", input, expected);
}

#[test]
fn relay_resolver_missing_field_invalid() {
    let input = include_str!("parse/fixtures/relay-resolver-missing-field.invalid.js");
    let expected = include_str!("parse/fixtures/relay-resolver-missing-field.invalid.expected");
    test_fixture(transform_fixture, "relay-resolver-missing-field.invalid.js", "parse/fixtures/relay-resolver-missing-field.invalid.expected", input, expected);
}

#[test]
fn relay_resolver_missing_multiple_fields_invalid() {
    let input = include_str!("parse/fixtures/relay-resolver-missing-multiple-fields.invalid.js");
    let expected = include_str!("parse/fixtures/relay-resolver-missing-multiple-fields.invalid.expected");
    test_fixture(transform_fixture, "relay-resolver-missing-multiple-fields.invalid.js", "parse/fixtures/relay-resolver-missing-multiple-fields.invalid.expected", input, expected);
}

#[test]
fn relay_resolver_on_interface_mismatch_invalid() {
    let input = include_str!("parse/fixtures/relay-resolver-on-interface-mismatch.invalid.js");
    let expected = include_str!("parse/fixtures/relay-resolver-on-interface-mismatch.invalid.expected");
    test_fixture(transform_fixture, "relay-resolver-on-interface-mismatch.invalid.js", "parse/fixtures/relay-resolver-on-interface-mismatch.invalid.expected", input, expected);
}

#[test]
fn relay_resolver_on_interface_no_value_invalid() {
    let input = include_str!("parse/fixtures/relay-resolver-on-interface-no-value.invalid.js");
    let expected = include_str!("parse/fixtures/relay-resolver-on-interface-no-value.invalid.expected");
    test_fixture(transform_fixture, "relay-resolver-on-interface-no-value.invalid.js", "parse/fixtures/relay-resolver-on-interface-no-value.invalid.expected", input, expected);
}

#[test]
fn relay_resolver_on_type_and_on_interface_invalid() {
    let input = include_str!("parse/fixtures/relay-resolver-on-type-and-on-interface.invalid.js");
    let expected = include_str!("parse/fixtures/relay-resolver-on-type-and-on-interface.invalid.expected");
    test_fixture(transform_fixture, "relay-resolver-on-type-and-on-interface.invalid.js", "parse/fixtures/relay-resolver-on-type-and-on-interface.invalid.expected", input, expected);
}

#[test]
fn relay_resolver_on_type_mismatch_invalid() {
    let input = include_str!("parse/fixtures/relay-resolver-on-type-mismatch.invalid.js");
    let expected = include_str!("parse/fixtures/relay-resolver-on-type-mismatch.invalid.expected");
    test_fixture(transform_fixture, "relay-resolver-on-type-mismatch.invalid.js", "parse/fixtures/relay-resolver-on-type-mismatch.invalid.expected", input, expected);
}

#[test]
fn relay_resolver_on_type_no_value_invalid() {
    let input = include_str!("parse/fixtures/relay-resolver-on-type-no-value.invalid.js");
    let expected = include_str!("parse/fixtures/relay-resolver-on-type-no-value.invalid.expected");
    test_fixture(transform_fixture, "relay-resolver-on-type-no-value.invalid.js", "parse/fixtures/relay-resolver-on-type-no-value.invalid.expected", input, expected);
}

#[test]
fn relay_resolver_with_args() {
    let input = include_str!("parse/fixtures/relay-resolver-with-args.js");
    let expected = include_str!("parse/fixtures/relay-resolver-with-args.expected");
    test_fixture(transform_fixture, "relay-resolver-with-args.js", "parse/fixtures/relay-resolver-with-args.expected", input, expected);
}

#[test]
fn relay_resolver_with_args_default_value_invalid() {
    let input = include_str!("parse/fixtures/relay-resolver-with-args-default-value.invalid.js");
    let expected = include_str!("parse/fixtures/relay-resolver-with-args-default-value.invalid.expected");
    test_fixture(transform_fixture, "relay-resolver-with-args-default-value.invalid.js", "parse/fixtures/relay-resolver-with-args-default-value.invalid.expected", input, expected);
}

#[test]
fn relay_resolver_with_args_syntax_error_invalid() {
    let input = include_str!("parse/fixtures/relay-resolver-with-args-syntax-error.invalid.js");
    let expected = include_str!("parse/fixtures/relay-resolver-with-args-syntax-error.invalid.expected");
    test_fixture(transform_fixture, "relay-resolver-with-args-syntax-error.invalid.js", "parse/fixtures/relay-resolver-with-args-syntax-error.invalid.expected", input, expected);
}

#[test]
fn relay_resolver_with_conflicting_args_invalid() {
    let input = include_str!("parse/fixtures/relay-resolver-with-conflicting-args.invalid.js");
    let expected = include_str!("parse/fixtures/relay-resolver-with-conflicting-args.invalid.expected");
    test_fixture(transform_fixture, "relay-resolver-with-conflicting-args.invalid.js", "parse/fixtures/relay-resolver-with-conflicting-args.invalid.expected", input, expected);
}

#[test]
fn relay_resolver_with_field_and_fragment_args() {
    let input = include_str!("parse/fixtures/relay-resolver-with-field-and-fragment-args.js");
    let expected = include_str!("parse/fixtures/relay-resolver-with-field-and-fragment-args.expected");
    test_fixture(transform_fixture, "relay-resolver-with-field-and-fragment-args.js", "parse/fixtures/relay-resolver-with-field-and-fragment-args.expected", input, expected);
}

#[test]
fn relay_resolver_with_field_args() {
    let input = include_str!("parse/fixtures/relay-resolver-with-field-args.js");
    let expected = include_str!("parse/fixtures/relay-resolver-with-field-args.expected");
    test_fixture(transform_fixture, "relay-resolver-with-field-args.js", "parse/fixtures/relay-resolver-with-field-args.expected", input, expected);
}

#[test]
fn relay_resolver_with_fragment() {
    let input = include_str!("parse/fixtures/relay-resolver-with-fragment.js");
    let expected = include_str!("parse/fixtures/relay-resolver-with-fragment.expected");
    test_fixture(transform_fixture, "relay-resolver-with-fragment.js", "parse/fixtures/relay-resolver-with-fragment.expected", input, expected);
}

#[test]
fn relay_resolver_with_fragment_invalid() {
    let input = include_str!("parse/fixtures/relay-resolver-with-fragment.invalid.js");
    let expected = include_str!("parse/fixtures/relay-resolver-with-fragment.invalid.expected");
    test_fixture(transform_fixture, "relay-resolver-with-fragment.invalid.js", "parse/fixtures/relay-resolver-with-fragment.invalid.expected", input, expected);
}

#[test]
fn relay_resolver_with_output_type() {
    let input = include_str!("parse/fixtures/relay-resolver-with-output-type.js");
    let expected = include_str!("parse/fixtures/relay-resolver-with-output-type.expected");
    test_fixture(transform_fixture, "relay-resolver-with-output-type.js", "parse/fixtures/relay-resolver-with-output-type.expected", input, expected);
}
