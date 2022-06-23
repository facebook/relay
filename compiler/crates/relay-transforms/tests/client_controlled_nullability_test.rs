/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<8914757a97502301f867649d5763bb0b>>
 */

mod client_controlled_nullability;

use client_controlled_nullability::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn conflicting_required_status_across_aliased_inline_fragments() {
    let input = include_str!("client_controlled_nullability/fixtures/conflicting-required-status-across-aliased-inline-fragments.graphql");
    let expected = include_str!("client_controlled_nullability/fixtures/conflicting-required-status-across-aliased-inline-fragments.expected");
    test_fixture(transform_fixture, "conflicting-required-status-across-aliased-inline-fragments.graphql", "client_controlled_nullability/fixtures/conflicting-required-status-across-aliased-inline-fragments.expected", input, expected);
}

#[test]
fn duplicate_field_ussage_alias_invalid() {
    let input = include_str!("client_controlled_nullability/fixtures/duplicate-field-ussage-alias.invalid.graphql");
    let expected = include_str!("client_controlled_nullability/fixtures/duplicate-field-ussage-alias.invalid.expected");
    test_fixture(transform_fixture, "duplicate-field-ussage-alias.invalid.graphql", "client_controlled_nullability/fixtures/duplicate-field-ussage-alias.invalid.expected", input, expected);
}

#[test]
fn fragments_are_isolated() {
    let input = include_str!("client_controlled_nullability/fixtures/fragments-are-isolated.graphql");
    let expected = include_str!("client_controlled_nullability/fixtures/fragments-are-isolated.expected");
    test_fixture(transform_fixture, "fragments-are-isolated.graphql", "client_controlled_nullability/fixtures/fragments-are-isolated.expected", input, expected);
}

#[test]
fn inline_fragment_on_interface_within_linked_field() {
    let input = include_str!("client_controlled_nullability/fixtures/inline-fragment-on-interface-within-linked-field.graphql");
    let expected = include_str!("client_controlled_nullability/fixtures/inline-fragment-on-interface-within-linked-field.expected");
    test_fixture(transform_fixture, "inline-fragment-on-interface-within-linked-field.graphql", "client_controlled_nullability/fixtures/inline-fragment-on-interface-within-linked-field.expected", input, expected);
}

#[test]
fn linked_field_log() {
    let input = include_str!("client_controlled_nullability/fixtures/linked-field-log.graphql");
    let expected = include_str!("client_controlled_nullability/fixtures/linked-field-log.expected");
    test_fixture(transform_fixture, "linked-field-log.graphql", "client_controlled_nullability/fixtures/linked-field-log.expected", input, expected);
}

#[test]
fn linked_field_no_log() {
    let input = include_str!("client_controlled_nullability/fixtures/linked-field-no-log.graphql");
    let expected = include_str!("client_controlled_nullability/fixtures/linked-field-no-log.expected");
    test_fixture(transform_fixture, "linked-field-no-log.graphql", "client_controlled_nullability/fixtures/linked-field-no-log.expected", input, expected);
}

#[test]
fn linked_field_throw() {
    let input = include_str!("client_controlled_nullability/fixtures/linked-field-throw.graphql");
    let expected = include_str!("client_controlled_nullability/fixtures/linked-field-throw.expected");
    test_fixture(transform_fixture, "linked-field-throw.graphql", "client_controlled_nullability/fixtures/linked-field-throw.expected", input, expected);
}

#[test]
fn multiple_required_fields_invalid() {
    let input = include_str!("client_controlled_nullability/fixtures/multiple-required-fields.invalid.graphql");
    let expected = include_str!("client_controlled_nullability/fixtures/multiple-required-fields.invalid.expected");
    test_fixture(transform_fixture, "multiple-required-fields.invalid.graphql", "client_controlled_nullability/fixtures/multiple-required-fields.invalid.expected", input, expected);
}

#[test]
fn none_bubbles_to_throw() {
    let input = include_str!("client_controlled_nullability/fixtures/none-bubbles-to-throw.graphql");
    let expected = include_str!("client_controlled_nullability/fixtures/none-bubbles-to-throw.expected");
    test_fixture(transform_fixture, "none-bubbles-to-throw.graphql", "client_controlled_nullability/fixtures/none-bubbles-to-throw.expected", input, expected);
}

#[test]
fn required_paths() {
    let input = include_str!("client_controlled_nullability/fixtures/required-paths.graphql");
    let expected = include_str!("client_controlled_nullability/fixtures/required-paths.expected");
    test_fixture(transform_fixture, "required-paths.graphql", "client_controlled_nullability/fixtures/required-paths.expected", input, expected);
}

#[test]
fn scalar_field_log() {
    let input = include_str!("client_controlled_nullability/fixtures/scalar-field-log.graphql");
    let expected = include_str!("client_controlled_nullability/fixtures/scalar-field-log.expected");
    test_fixture(transform_fixture, "scalar-field-log.graphql", "client_controlled_nullability/fixtures/scalar-field-log.expected", input, expected);
}

#[test]
fn scalar_field_no_log() {
    let input = include_str!("client_controlled_nullability/fixtures/scalar-field-no-log.graphql");
    let expected = include_str!("client_controlled_nullability/fixtures/scalar-field-no-log.expected");
    test_fixture(transform_fixture, "scalar-field-no-log.graphql", "client_controlled_nullability/fixtures/scalar-field-no-log.expected", input, expected);
}

#[test]
fn scalar_field_throw() {
    let input = include_str!("client_controlled_nullability/fixtures/scalar-field-throw.graphql");
    let expected = include_str!("client_controlled_nullability/fixtures/scalar-field-throw.expected");
    test_fixture(transform_fixture, "scalar-field-throw.graphql", "client_controlled_nullability/fixtures/scalar-field-throw.expected", input, expected);
}

#[test]
fn throw_deeply_within_none_alias_workaround() {
    let input = include_str!("client_controlled_nullability/fixtures/throw-deeply-within-none-alias-workaround.graphql");
    let expected = include_str!("client_controlled_nullability/fixtures/throw-deeply-within-none-alias-workaround.expected");
    test_fixture(transform_fixture, "throw-deeply-within-none-alias-workaround.graphql", "client_controlled_nullability/fixtures/throw-deeply-within-none-alias-workaround.expected", input, expected);
}

#[test]
fn throw_deeply_within_none_invalid() {
    let input = include_str!("client_controlled_nullability/fixtures/throw-deeply-within-none.invalid.graphql");
    let expected = include_str!("client_controlled_nullability/fixtures/throw-deeply-within-none.invalid.expected");
    test_fixture(transform_fixture, "throw-deeply-within-none.invalid.graphql", "client_controlled_nullability/fixtures/throw-deeply-within-none.invalid.expected", input, expected);
}

#[test]
fn throw_within_none_invalid() {
    let input = include_str!("client_controlled_nullability/fixtures/throw-within-none.invalid.graphql");
    let expected = include_str!("client_controlled_nullability/fixtures/throw-within-none.invalid.expected");
    test_fixture(transform_fixture, "throw-within-none.invalid.graphql", "client_controlled_nullability/fixtures/throw-within-none.invalid.expected", input, expected);
}
