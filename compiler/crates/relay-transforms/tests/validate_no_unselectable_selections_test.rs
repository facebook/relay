/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<82ae09fce8803e956efea1b568733995>>
 */

mod validate_no_unselectable_selections;

use validate_no_unselectable_selections::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn multiple_unselectables_invalid() {
    let input = include_str!("validate_no_unselectable_selections/fixtures/multiple-unselectables.invalid.graphql");
    let expected = include_str!("validate_no_unselectable_selections/fixtures/multiple-unselectables.invalid.expected");
    test_fixture(transform_fixture, "multiple-unselectables.invalid.graphql", "validate_no_unselectable_selections/fixtures/multiple-unselectables.invalid.expected", input, expected);
}

#[test]
fn unselectable_linked_field_invalid() {
    let input = include_str!("validate_no_unselectable_selections/fixtures/unselectable-linked-field.invalid.graphql");
    let expected = include_str!("validate_no_unselectable_selections/fixtures/unselectable-linked-field.invalid.expected");
    test_fixture(transform_fixture, "unselectable-linked-field.invalid.graphql", "validate_no_unselectable_selections/fixtures/unselectable-linked-field.invalid.expected", input, expected);
}

#[test]
fn unselectable_scalar_invalid() {
    let input = include_str!("validate_no_unselectable_selections/fixtures/unselectable-scalar.invalid.graphql");
    let expected = include_str!("validate_no_unselectable_selections/fixtures/unselectable-scalar.invalid.expected");
    test_fixture(transform_fixture, "unselectable-scalar.invalid.graphql", "validate_no_unselectable_selections/fixtures/unselectable-scalar.invalid.expected", input, expected);
}

#[test]
fn valid_selection() {
    let input = include_str!("validate_no_unselectable_selections/fixtures/valid-selection.graphql");
    let expected = include_str!("validate_no_unselectable_selections/fixtures/valid-selection.expected");
    test_fixture(transform_fixture, "valid-selection.graphql", "validate_no_unselectable_selections/fixtures/valid-selection.expected", input, expected);
}
