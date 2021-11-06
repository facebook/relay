/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<d38be64acdaa74124c63c98b51418a54>>
 */

mod validate_required_arguments;

use validate_required_arguments::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn argument_on_field() {
    let input = include_str!("validate_required_arguments/fixtures/argument-on-field.graphql");
    let expected = include_str!("validate_required_arguments/fixtures/argument-on-field.expected");
    test_fixture(transform_fixture, "argument-on-field.graphql", "validate_required_arguments/fixtures/argument-on-field.expected", input, expected);
}

#[test]
fn argument_on_linked_field() {
    let input = include_str!("validate_required_arguments/fixtures/argument-on-linked-field.graphql");
    let expected = include_str!("validate_required_arguments/fixtures/argument-on-linked-field.expected");
    test_fixture(transform_fixture, "argument-on-linked-field.graphql", "validate_required_arguments/fixtures/argument-on-linked-field.expected", input, expected);
}

#[test]
fn default_argument_on_field() {
    let input = include_str!("validate_required_arguments/fixtures/default-argument-on-field.graphql");
    let expected = include_str!("validate_required_arguments/fixtures/default-argument-on-field.expected");
    test_fixture(transform_fixture, "default-argument-on-field.graphql", "validate_required_arguments/fixtures/default-argument-on-field.expected", input, expected);
}

#[test]
fn missing_argument_on_directive_invalid() {
    let input = include_str!("validate_required_arguments/fixtures/missing-argument-on-directive.invalid.graphql");
    let expected = include_str!("validate_required_arguments/fixtures/missing-argument-on-directive.invalid.expected");
    test_fixture(transform_fixture, "missing-argument-on-directive.invalid.graphql", "validate_required_arguments/fixtures/missing-argument-on-directive.invalid.expected", input, expected);
}

#[test]
fn missing_argument_on_field_invalid() {
    let input = include_str!("validate_required_arguments/fixtures/missing-argument-on-field.invalid.graphql");
    let expected = include_str!("validate_required_arguments/fixtures/missing-argument-on-field.invalid.expected");
    test_fixture(transform_fixture, "missing-argument-on-field.invalid.graphql", "validate_required_arguments/fixtures/missing-argument-on-field.invalid.expected", input, expected);
}

#[test]
fn missing_argument_on_linked_field_in_inline_fragment_invalid() {
    let input = include_str!("validate_required_arguments/fixtures/missing-argument-on-linked-field-in-inline-fragment.invalid.graphql");
    let expected = include_str!("validate_required_arguments/fixtures/missing-argument-on-linked-field-in-inline-fragment.invalid.expected");
    test_fixture(transform_fixture, "missing-argument-on-linked-field-in-inline-fragment.invalid.graphql", "validate_required_arguments/fixtures/missing-argument-on-linked-field-in-inline-fragment.invalid.expected", input, expected);
}

#[test]
fn missing_argument_on_linked_field_invalid() {
    let input = include_str!("validate_required_arguments/fixtures/missing-argument-on-linked-field.invalid.graphql");
    let expected = include_str!("validate_required_arguments/fixtures/missing-argument-on-linked-field.invalid.expected");
    test_fixture(transform_fixture, "missing-argument-on-linked-field.invalid.graphql", "validate_required_arguments/fixtures/missing-argument-on-linked-field.invalid.expected", input, expected);
}

#[test]
fn missing_argument_on_linked_field_on_abstract_type_invalid() {
    let input = include_str!("validate_required_arguments/fixtures/missing-argument-on-linked-field-on-abstract-type.invalid.graphql");
    let expected = include_str!("validate_required_arguments/fixtures/missing-argument-on-linked-field-on-abstract-type.invalid.expected");
    test_fixture(transform_fixture, "missing-argument-on-linked-field-on-abstract-type.invalid.graphql", "validate_required_arguments/fixtures/missing-argument-on-linked-field-on-abstract-type.invalid.expected", input, expected);
}
