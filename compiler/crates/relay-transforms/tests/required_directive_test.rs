/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b5dd0c663db7f9f90c3352ccfe3d02b1>>
 */

mod required_directive;

use required_directive::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn action_argument_omitted_invalid() {
    let input = include_str!("required_directive/fixtures/action-argument-omitted.invalid.graphql");
    let expected = include_str!("required_directive/fixtures/action-argument-omitted.invalid.expected");
    test_fixture(transform_fixture, "action-argument-omitted.invalid.graphql", "required_directive/fixtures/action-argument-omitted.invalid.expected", input, expected);
}

#[test]
fn duplicate_field_different_actions_invalid() {
    let input = include_str!("required_directive/fixtures/duplicate-field-different-actions.invalid.graphql");
    let expected = include_str!("required_directive/fixtures/duplicate-field-different-actions.invalid.expected");
    test_fixture(transform_fixture, "duplicate-field-different-actions.invalid.graphql", "required_directive/fixtures/duplicate-field-different-actions.invalid.expected", input, expected);
}

#[test]
fn duplicate_field_include_directive_invalid() {
    let input = include_str!("required_directive/fixtures/duplicate-field-include-directive.invalid.graphql");
    let expected = include_str!("required_directive/fixtures/duplicate-field-include-directive.invalid.expected");
    test_fixture(transform_fixture, "duplicate-field-include-directive.invalid.graphql", "required_directive/fixtures/duplicate-field-include-directive.invalid.expected", input, expected);
}

#[test]
fn duplicate_field_invalid() {
    let input = include_str!("required_directive/fixtures/duplicate-field.invalid.graphql");
    let expected = include_str!("required_directive/fixtures/duplicate-field.invalid.expected");
    test_fixture(transform_fixture, "duplicate-field.invalid.graphql", "required_directive/fixtures/duplicate-field.invalid.expected", input, expected);
}

#[test]
fn duplicate_field_nullable_parent_invalid() {
    let input = include_str!("required_directive/fixtures/duplicate-field-nullable-parent.invalid.graphql");
    let expected = include_str!("required_directive/fixtures/duplicate-field-nullable-parent.invalid.expected");
    test_fixture(transform_fixture, "duplicate-field-nullable-parent.invalid.graphql", "required_directive/fixtures/duplicate-field-nullable-parent.invalid.expected", input, expected);
}

#[test]
fn duplicate_field_nullable_parent_missing_first_invalid() {
    let input = include_str!("required_directive/fixtures/duplicate-field-nullable-parent-missing-first.invalid.graphql");
    let expected = include_str!("required_directive/fixtures/duplicate-field-nullable-parent-missing-first.invalid.expected");
    test_fixture(transform_fixture, "duplicate-field-nullable-parent-missing-first.invalid.graphql", "required_directive/fixtures/duplicate-field-nullable-parent-missing-first.invalid.expected", input, expected);
}

#[test]
fn duplicate_field_ussage_alias() {
    let input = include_str!("required_directive/fixtures/duplicate-field-ussage-alias.graphql");
    let expected = include_str!("required_directive/fixtures/duplicate-field-ussage-alias.expected");
    test_fixture(transform_fixture, "duplicate-field-ussage-alias.graphql", "required_directive/fixtures/duplicate-field-ussage-alias.expected", input, expected);
}

#[test]
fn duplicate_linked_field_different_actions_invalid() {
    let input = include_str!("required_directive/fixtures/duplicate-linked-field-different-actions.invalid.graphql");
    let expected = include_str!("required_directive/fixtures/duplicate-linked-field-different-actions.invalid.expected");
    test_fixture(transform_fixture, "duplicate-linked-field-different-actions.invalid.graphql", "required_directive/fixtures/duplicate-linked-field-different-actions.invalid.expected", input, expected);
}

#[test]
fn duplicate_linked_field_nullable_parent_invalid() {
    let input = include_str!("required_directive/fixtures/duplicate-linked-field-nullable-parent.invalid.graphql");
    let expected = include_str!("required_directive/fixtures/duplicate-linked-field-nullable-parent.invalid.expected");
    test_fixture(transform_fixture, "duplicate-linked-field-nullable-parent.invalid.graphql", "required_directive/fixtures/duplicate-linked-field-nullable-parent.invalid.expected", input, expected);
}

#[test]
fn fragments_are_isolated() {
    let input = include_str!("required_directive/fixtures/fragments-are-isolated.graphql");
    let expected = include_str!("required_directive/fixtures/fragments-are-isolated.expected");
    test_fixture(transform_fixture, "fragments-are-isolated.graphql", "required_directive/fixtures/fragments-are-isolated.expected", input, expected);
}

#[test]
fn inline_directive_invalid() {
    let input = include_str!("required_directive/fixtures/inline-directive.invalid.graphql");
    let expected = include_str!("required_directive/fixtures/inline-directive.invalid.expected");
    test_fixture(transform_fixture, "inline-directive.invalid.graphql", "required_directive/fixtures/inline-directive.invalid.expected", input, expected);
}

#[test]
fn inline_fragment_on_concrete_in_interface_invalid() {
    let input = include_str!("required_directive/fixtures/inline-fragment-on-concrete-in-interface.invalid.graphql");
    let expected = include_str!("required_directive/fixtures/inline-fragment-on-concrete-in-interface.invalid.expected");
    test_fixture(transform_fixture, "inline-fragment-on-concrete-in-interface.invalid.graphql", "required_directive/fixtures/inline-fragment-on-concrete-in-interface.invalid.expected", input, expected);
}

#[test]
fn inline_fragment_on_interface_in_concrete_invalid() {
    let input = include_str!("required_directive/fixtures/inline-fragment-on-interface-in-concrete.invalid.graphql");
    let expected = include_str!("required_directive/fixtures/inline-fragment-on-interface-in-concrete.invalid.expected");
    test_fixture(transform_fixture, "inline-fragment-on-interface-in-concrete.invalid.graphql", "required_directive/fixtures/inline-fragment-on-interface-in-concrete.invalid.expected", input, expected);
}

#[test]
fn inline_fragment_on_interface_invalid() {
    let input = include_str!("required_directive/fixtures/inline-fragment-on-interface.invalid.graphql");
    let expected = include_str!("required_directive/fixtures/inline-fragment-on-interface.invalid.expected");
    test_fixture(transform_fixture, "inline-fragment-on-interface.invalid.graphql", "required_directive/fixtures/inline-fragment-on-interface.invalid.expected", input, expected);
}

#[test]
fn inline_fragment_on_interface_with_linked_field_invalid() {
    let input = include_str!("required_directive/fixtures/inline-fragment-on-interface-with-linked-field.invalid.graphql");
    let expected = include_str!("required_directive/fixtures/inline-fragment-on-interface-with-linked-field.invalid.expected");
    test_fixture(transform_fixture, "inline-fragment-on-interface-with-linked-field.invalid.graphql", "required_directive/fixtures/inline-fragment-on-interface-with-linked-field.invalid.expected", input, expected);
}

#[test]
fn inline_fragment_on_interface_within_linked_field() {
    let input = include_str!("required_directive/fixtures/inline-fragment-on-interface-within-linked-field.graphql");
    let expected = include_str!("required_directive/fixtures/inline-fragment-on-interface-within-linked-field.expected");
    test_fixture(transform_fixture, "inline-fragment-on-interface-within-linked-field.graphql", "required_directive/fixtures/inline-fragment-on-interface-within-linked-field.expected", input, expected);
}

#[test]
fn inline_fragment_on_union_invalid() {
    let input = include_str!("required_directive/fixtures/inline-fragment-on-union.invalid.graphql");
    let expected = include_str!("required_directive/fixtures/inline-fragment-on-union.invalid.expected");
    test_fixture(transform_fixture, "inline-fragment-on-union.invalid.graphql", "required_directive/fixtures/inline-fragment-on-union.invalid.expected", input, expected);
}

#[test]
fn linked_field_log() {
    let input = include_str!("required_directive/fixtures/linked-field-log.graphql");
    let expected = include_str!("required_directive/fixtures/linked-field-log.expected");
    test_fixture(transform_fixture, "linked-field-log.graphql", "required_directive/fixtures/linked-field-log.expected", input, expected);
}

#[test]
fn linked_field_no_log() {
    let input = include_str!("required_directive/fixtures/linked-field-no-log.graphql");
    let expected = include_str!("required_directive/fixtures/linked-field-no-log.expected");
    test_fixture(transform_fixture, "linked-field-no-log.graphql", "required_directive/fixtures/linked-field-no-log.expected", input, expected);
}

#[test]
fn linked_field_throw() {
    let input = include_str!("required_directive/fixtures/linked-field-throw.graphql");
    let expected = include_str!("required_directive/fixtures/linked-field-throw.expected");
    test_fixture(transform_fixture, "linked-field-throw.graphql", "required_directive/fixtures/linked-field-throw.expected", input, expected);
}

#[test]
fn log_action_bubble_to_throw_invalid() {
    let input = include_str!("required_directive/fixtures/log-action-bubble-to-throw.invalid.graphql");
    let expected = include_str!("required_directive/fixtures/log-action-bubble-to-throw.invalid.expected");
    test_fixture(transform_fixture, "log-action-bubble-to-throw.invalid.graphql", "required_directive/fixtures/log-action-bubble-to-throw.invalid.expected", input, expected);
}

#[test]
fn multiple_required_fields_invalid() {
    let input = include_str!("required_directive/fixtures/multiple-required-fields.invalid.graphql");
    let expected = include_str!("required_directive/fixtures/multiple-required-fields.invalid.expected");
    test_fixture(transform_fixture, "multiple-required-fields.invalid.graphql", "required_directive/fixtures/multiple-required-fields.invalid.expected", input, expected);
}

#[test]
fn none_action_bubble_to_log_across_inline_fragment_invalid() {
    let input = include_str!("required_directive/fixtures/none-action-bubble-to-log-across-inline-fragment.invalid.graphql");
    let expected = include_str!("required_directive/fixtures/none-action-bubble-to-log-across-inline-fragment.invalid.expected");
    test_fixture(transform_fixture, "none-action-bubble-to-log-across-inline-fragment.invalid.graphql", "required_directive/fixtures/none-action-bubble-to-log-across-inline-fragment.invalid.expected", input, expected);
}

#[test]
fn none_action_bubble_to_log_invalid() {
    let input = include_str!("required_directive/fixtures/none-action-bubble-to-log.invalid.graphql");
    let expected = include_str!("required_directive/fixtures/none-action-bubble-to-log.invalid.expected");
    test_fixture(transform_fixture, "none-action-bubble-to-log.invalid.graphql", "required_directive/fixtures/none-action-bubble-to-log.invalid.expected", input, expected);
}

#[test]
fn none_action_bubble_to_throw_invalid() {
    let input = include_str!("required_directive/fixtures/none-action-bubble-to-throw.invalid.graphql");
    let expected = include_str!("required_directive/fixtures/none-action-bubble-to-throw.invalid.expected");
    test_fixture(transform_fixture, "none-action-bubble-to-throw.invalid.graphql", "required_directive/fixtures/none-action-bubble-to-throw.invalid.expected", input, expected);
}

#[test]
fn required_dynamic_arg_invalid() {
    let input = include_str!("required_directive/fixtures/required-dynamic-arg.invalid.graphql");
    let expected = include_str!("required_directive/fixtures/required-dynamic-arg.invalid.expected");
    test_fixture(transform_fixture, "required-dynamic-arg.invalid.graphql", "required_directive/fixtures/required-dynamic-arg.invalid.expected", input, expected);
}

#[test]
fn required_paths() {
    let input = include_str!("required_directive/fixtures/required-paths.graphql");
    let expected = include_str!("required_directive/fixtures/required-paths.expected");
    test_fixture(transform_fixture, "required-paths.graphql", "required_directive/fixtures/required-paths.expected", input, expected);
}

#[test]
fn required_with_different_actions_invalid() {
    let input = include_str!("required_directive/fixtures/required-with-different-actions.invalid.graphql");
    let expected = include_str!("required_directive/fixtures/required-with-different-actions.invalid.expected");
    test_fixture(transform_fixture, "required-with-different-actions.invalid.graphql", "required_directive/fixtures/required-with-different-actions.invalid.expected", input, expected);
}

#[test]
fn scalar_field_log() {
    let input = include_str!("required_directive/fixtures/scalar-field-log.graphql");
    let expected = include_str!("required_directive/fixtures/scalar-field-log.expected");
    test_fixture(transform_fixture, "scalar-field-log.graphql", "required_directive/fixtures/scalar-field-log.expected", input, expected);
}

#[test]
fn scalar_field_no_log() {
    let input = include_str!("required_directive/fixtures/scalar-field-no-log.graphql");
    let expected = include_str!("required_directive/fixtures/scalar-field-no-log.expected");
    test_fixture(transform_fixture, "scalar-field-no-log.graphql", "required_directive/fixtures/scalar-field-no-log.expected", input, expected);
}

#[test]
fn scalar_field_throw() {
    let input = include_str!("required_directive/fixtures/scalar-field-throw.graphql");
    let expected = include_str!("required_directive/fixtures/scalar-field-throw.expected");
    test_fixture(transform_fixture, "scalar-field-throw.graphql", "required_directive/fixtures/scalar-field-throw.expected", input, expected);
}
