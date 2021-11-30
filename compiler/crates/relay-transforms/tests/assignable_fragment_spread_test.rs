/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b3d585621820c00ca77687861b6780f7>>
 */

mod assignable_fragment_spread;

use assignable_fragment_spread::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn abstract_assignable_fragment_spread_on_concrete_type() {
    let input = include_str!("assignable_fragment_spread/fixtures/abstract-assignable-fragment-spread-on-concrete-type.graphql");
    let expected = include_str!("assignable_fragment_spread/fixtures/abstract-assignable-fragment-spread-on-concrete-type.expected");
    test_fixture(transform_fixture, "abstract-assignable-fragment-spread-on-concrete-type.graphql", "assignable_fragment_spread/fixtures/abstract-assignable-fragment-spread-on-concrete-type.expected", input, expected);
}

#[test]
fn abstract_assignable_fragment_spread_on_different_abstract_type() {
    let input = include_str!("assignable_fragment_spread/fixtures/abstract-assignable-fragment-spread-on-different-abstract-type.graphql");
    let expected = include_str!("assignable_fragment_spread/fixtures/abstract-assignable-fragment-spread-on-different-abstract-type.expected");
    test_fixture(transform_fixture, "abstract-assignable-fragment-spread-on-different-abstract-type.graphql", "assignable_fragment_spread/fixtures/abstract-assignable-fragment-spread-on-different-abstract-type.expected", input, expected);
}

#[test]
fn abstract_assignable_fragment_spread_on_matching_abstract_type() {
    let input = include_str!("assignable_fragment_spread/fixtures/abstract-assignable-fragment-spread-on-matching-abstract-type.graphql");
    let expected = include_str!("assignable_fragment_spread/fixtures/abstract-assignable-fragment-spread-on-matching-abstract-type.expected");
    test_fixture(transform_fixture, "abstract-assignable-fragment-spread-on-matching-abstract-type.graphql", "assignable_fragment_spread/fixtures/abstract-assignable-fragment-spread-on-matching-abstract-type.expected", input, expected);
}

#[test]
fn assignable_fragment_spread_with_directives_invalid() {
    let input = include_str!("assignable_fragment_spread/fixtures/assignable-fragment-spread-with-directives.invalid.graphql");
    let expected = include_str!("assignable_fragment_spread/fixtures/assignable-fragment-spread-with-directives.invalid.expected");
    test_fixture(transform_fixture, "assignable-fragment-spread-with-directives.invalid.graphql", "assignable_fragment_spread/fixtures/assignable-fragment-spread-with-directives.invalid.expected", input, expected);
}

#[test]
fn assignable_fragment_spread_within_inline_fragment_and_linked_field() {
    let input = include_str!("assignable_fragment_spread/fixtures/assignable-fragment-spread-within-inline-fragment-and-linked-field.graphql");
    let expected = include_str!("assignable_fragment_spread/fixtures/assignable-fragment-spread-within-inline-fragment-and-linked-field.expected");
    test_fixture(transform_fixture, "assignable-fragment-spread-within-inline-fragment-and-linked-field.graphql", "assignable_fragment_spread/fixtures/assignable-fragment-spread-within-inline-fragment-and-linked-field.expected", input, expected);
}

#[test]
fn assignable_fragment_spread_within_inline_fragment_invalid() {
    let input = include_str!("assignable_fragment_spread/fixtures/assignable-fragment-spread-within-inline-fragment.invalid.graphql");
    let expected = include_str!("assignable_fragment_spread/fixtures/assignable-fragment-spread-within-inline-fragment.invalid.expected");
    test_fixture(transform_fixture, "assignable-fragment-spread-within-inline-fragment.invalid.graphql", "assignable_fragment_spread/fixtures/assignable-fragment-spread-within-inline-fragment.invalid.expected", input, expected);
}

#[test]
fn assignable_fragment_spread_within_skipped_inline_fragment_invalid() {
    let input = include_str!("assignable_fragment_spread/fixtures/assignable-fragment-spread-within-skipped-inline-fragment.invalid.graphql");
    let expected = include_str!("assignable_fragment_spread/fixtures/assignable-fragment-spread-within-skipped-inline-fragment.invalid.expected");
    test_fixture(transform_fixture, "assignable-fragment-spread-within-skipped-inline-fragment.invalid.graphql", "assignable_fragment_spread/fixtures/assignable-fragment-spread-within-skipped-inline-fragment.invalid.expected", input, expected);
}

#[test]
fn concrete_assignable_fragment_spread_on_abstract_type() {
    let input = include_str!("assignable_fragment_spread/fixtures/concrete-assignable-fragment-spread-on-abstract-type.graphql");
    let expected = include_str!("assignable_fragment_spread/fixtures/concrete-assignable-fragment-spread-on-abstract-type.expected");
    test_fixture(transform_fixture, "concrete-assignable-fragment-spread-on-abstract-type.graphql", "assignable_fragment_spread/fixtures/concrete-assignable-fragment-spread-on-abstract-type.expected", input, expected);
}

#[test]
fn concrete_assignable_fragment_spread_on_matching_concrete_type() {
    let input = include_str!("assignable_fragment_spread/fixtures/concrete-assignable-fragment-spread-on-matching-concrete-type.graphql");
    let expected = include_str!("assignable_fragment_spread/fixtures/concrete-assignable-fragment-spread-on-matching-concrete-type.expected");
    test_fixture(transform_fixture, "concrete-assignable-fragment-spread-on-matching-concrete-type.graphql", "assignable_fragment_spread/fixtures/concrete-assignable-fragment-spread-on-matching-concrete-type.expected", input, expected);
}

#[test]
fn included_assignable_fragment_spread_invalid() {
    let input = include_str!("assignable_fragment_spread/fixtures/included-assignable-fragment-spread.invalid.graphql");
    let expected = include_str!("assignable_fragment_spread/fixtures/included-assignable-fragment-spread.invalid.expected");
    test_fixture(transform_fixture, "included-assignable-fragment-spread.invalid.graphql", "assignable_fragment_spread/fixtures/included-assignable-fragment-spread.invalid.expected", input, expected);
}

#[test]
fn skipped_assignable_fragment_spread_invalid() {
    let input = include_str!("assignable_fragment_spread/fixtures/skipped-assignable-fragment-spread.invalid.graphql");
    let expected = include_str!("assignable_fragment_spread/fixtures/skipped-assignable-fragment-spread.invalid.expected");
    test_fixture(transform_fixture, "skipped-assignable-fragment-spread.invalid.graphql", "assignable_fragment_spread/fixtures/skipped-assignable-fragment-spread.invalid.expected", input, expected);
}
