/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<0d8f664c9f33657447efa42b809639de>>
 */

mod updatable_directive;

use updatable_directive::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn assignable_fragment_spread_not_subtype_invalid() {
    let input = include_str!("updatable_directive/fixtures/assignable-fragment-spread-not-subtype.invalid.graphql");
    let expected = include_str!("updatable_directive/fixtures/assignable-fragment-spread-not-subtype.invalid.expected");
    test_fixture(transform_fixture, "assignable-fragment-spread-not-subtype.invalid.graphql", "updatable_directive/fixtures/assignable-fragment-spread-not-subtype.invalid.expected", input, expected);
}

#[test]
fn assignable_fragment_spreads() {
    let input = include_str!("updatable_directive/fixtures/assignable-fragment-spreads.graphql");
    let expected = include_str!("updatable_directive/fixtures/assignable-fragment-spreads.expected");
    test_fixture(transform_fixture, "assignable-fragment-spreads.graphql", "updatable_directive/fixtures/assignable-fragment-spreads.expected", input, expected);
}

#[test]
fn directive_fragment_spread_invalid() {
    let input = include_str!("updatable_directive/fixtures/directive-fragment-spread.invalid.graphql");
    let expected = include_str!("updatable_directive/fixtures/directive-fragment-spread.invalid.expected");
    test_fixture(transform_fixture, "directive-fragment-spread.invalid.graphql", "updatable_directive/fixtures/directive-fragment-spread.invalid.expected", input, expected);
}

#[test]
fn directive_inline_fragment_invalid() {
    let input = include_str!("updatable_directive/fixtures/directive-inline-fragment.invalid.graphql");
    let expected = include_str!("updatable_directive/fixtures/directive-inline-fragment.invalid.expected");
    test_fixture(transform_fixture, "directive-inline-fragment.invalid.graphql", "updatable_directive/fixtures/directive-inline-fragment.invalid.expected", input, expected);
}

#[test]
fn directive_linked_field_invalid() {
    let input = include_str!("updatable_directive/fixtures/directive-linked-field.invalid.graphql");
    let expected = include_str!("updatable_directive/fixtures/directive-linked-field.invalid.expected");
    test_fixture(transform_fixture, "directive-linked-field.invalid.graphql", "updatable_directive/fixtures/directive-linked-field.invalid.expected", input, expected);
}

#[test]
fn directive_query_invalid() {
    let input = include_str!("updatable_directive/fixtures/directive-query.invalid.graphql");
    let expected = include_str!("updatable_directive/fixtures/directive-query.invalid.expected");
    test_fixture(transform_fixture, "directive-query.invalid.graphql", "updatable_directive/fixtures/directive-query.invalid.expected", input, expected);
}

#[test]
fn directive_scalar_field_invalid() {
    let input = include_str!("updatable_directive/fixtures/directive-scalar-field.invalid.graphql");
    let expected = include_str!("updatable_directive/fixtures/directive-scalar-field.invalid.expected");
    test_fixture(transform_fixture, "directive-scalar-field.invalid.graphql", "updatable_directive/fixtures/directive-scalar-field.invalid.expected", input, expected);
}

#[test]
fn doubly_nested_fragment_spread_invalid() {
    let input = include_str!("updatable_directive/fixtures/doubly-nested-fragment-spread.invalid.graphql");
    let expected = include_str!("updatable_directive/fixtures/doubly-nested-fragment-spread.invalid.expected");
    test_fixture(transform_fixture, "doubly-nested-fragment-spread.invalid.graphql", "updatable_directive/fixtures/doubly-nested-fragment-spread.invalid.expected", input, expected);
}

#[test]
fn include_invalid() {
    let input = include_str!("updatable_directive/fixtures/include.invalid.graphql");
    let expected = include_str!("updatable_directive/fixtures/include.invalid.expected");
    test_fixture(transform_fixture, "include.invalid.graphql", "updatable_directive/fixtures/include.invalid.expected", input, expected);
}

#[test]
fn inline_fragment() {
    let input = include_str!("updatable_directive/fixtures/inline-fragment.graphql");
    let expected = include_str!("updatable_directive/fixtures/inline-fragment.expected");
    test_fixture(transform_fixture, "inline-fragment.graphql", "updatable_directive/fixtures/inline-fragment.expected", input, expected);
}

#[test]
fn inline_fragment_concrete_type_to_concrete_type_invalid() {
    let input = include_str!("updatable_directive/fixtures/inline-fragment-concrete-type-to-concrete-type.invalid.graphql");
    let expected = include_str!("updatable_directive/fixtures/inline-fragment-concrete-type-to-concrete-type.invalid.expected");
    test_fixture(transform_fixture, "inline-fragment-concrete-type-to-concrete-type.invalid.graphql", "updatable_directive/fixtures/inline-fragment-concrete-type-to-concrete-type.invalid.expected", input, expected);
}

#[test]
fn inline_fragment_concrete_type_to_interface_invalid() {
    let input = include_str!("updatable_directive/fixtures/inline-fragment-concrete-type-to-interface.invalid.graphql");
    let expected = include_str!("updatable_directive/fixtures/inline-fragment-concrete-type-to-interface.invalid.expected");
    test_fixture(transform_fixture, "inline-fragment-concrete-type-to-interface.invalid.graphql", "updatable_directive/fixtures/inline-fragment-concrete-type-to-interface.invalid.expected", input, expected);
}

#[test]
fn inline_fragment_interface_to_interface_invalid() {
    let input = include_str!("updatable_directive/fixtures/inline-fragment-interface-to-interface.invalid.graphql");
    let expected = include_str!("updatable_directive/fixtures/inline-fragment-interface-to-interface.invalid.expected");
    test_fixture(transform_fixture, "inline-fragment-interface-to-interface.invalid.graphql", "updatable_directive/fixtures/inline-fragment-interface-to-interface.invalid.expected", input, expected);
}

#[test]
fn inline_fragment_redundant_invalid() {
    let input = include_str!("updatable_directive/fixtures/inline-fragment-redundant.invalid.graphql");
    let expected = include_str!("updatable_directive/fixtures/inline-fragment-redundant.invalid.expected");
    test_fixture(transform_fixture, "inline-fragment-redundant.invalid.graphql", "updatable_directive/fixtures/inline-fragment-redundant.invalid.expected", input, expected);
}

#[test]
fn non_assignable_fragment_spreads_invalid() {
    let input = include_str!("updatable_directive/fixtures/non-assignable-fragment-spreads.invalid.graphql");
    let expected = include_str!("updatable_directive/fixtures/non-assignable-fragment-spreads.invalid.expected");
    test_fixture(transform_fixture, "non-assignable-fragment-spreads.invalid.graphql", "updatable_directive/fixtures/non-assignable-fragment-spreads.invalid.expected", input, expected);
}

#[test]
fn skip_invalid() {
    let input = include_str!("updatable_directive/fixtures/skip.invalid.graphql");
    let expected = include_str!("updatable_directive/fixtures/skip.invalid.expected");
    test_fixture(transform_fixture, "skip.invalid.graphql", "updatable_directive/fixtures/skip.invalid.expected", input, expected);
}

#[test]
fn type_narrowing() {
    let input = include_str!("updatable_directive/fixtures/type-narrowing.graphql");
    let expected = include_str!("updatable_directive/fixtures/type-narrowing.expected");
    test_fixture(transform_fixture, "type-narrowing.graphql", "updatable_directive/fixtures/type-narrowing.expected", input, expected);
}
