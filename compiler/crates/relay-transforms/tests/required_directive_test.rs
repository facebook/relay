/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<9451681e094b93c699f497dc592cf35f>>
 */

mod required_directive;

use required_directive::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn action_argument_omitted_invalid() {
    let input = include_str!("required_directive/fixtures/action-argument-omitted.invalid.graphql");
    let expected = include_str!("required_directive/fixtures/action-argument-omitted.invalid.expected");
    test_fixture(transform_fixture, file!(), "action-argument-omitted.invalid.graphql", "required_directive/fixtures/action-argument-omitted.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn conflicting_required_status_across_aliased_inline_fragments() {
    let input = include_str!("required_directive/fixtures/conflicting-required-status-across-aliased-inline-fragments.graphql");
    let expected = include_str!("required_directive/fixtures/conflicting-required-status-across-aliased-inline-fragments.expected");
    test_fixture(transform_fixture, file!(), "conflicting-required-status-across-aliased-inline-fragments.graphql", "required_directive/fixtures/conflicting-required-status-across-aliased-inline-fragments.expected", input, expected).await;
}

#[tokio::test]
async fn dangerous_throw_can_nest_in_throw() {
    let input = include_str!("required_directive/fixtures/dangerous-throw-can-nest-in-throw.graphql");
    let expected = include_str!("required_directive/fixtures/dangerous-throw-can-nest-in-throw.expected");
    test_fixture(transform_fixture, file!(), "dangerous-throw-can-nest-in-throw.graphql", "required_directive/fixtures/dangerous-throw-can-nest-in-throw.expected", input, expected).await;
}

#[tokio::test]
async fn dangerously_throw_on_non_nullable_field_invalid() {
    let input = include_str!("required_directive/fixtures/dangerously-throw-on-non-nullable-field.invalid.graphql");
    let expected = include_str!("required_directive/fixtures/dangerously-throw-on-non-nullable-field.invalid.expected");
    test_fixture(transform_fixture, file!(), "dangerously-throw-on-non-nullable-field.invalid.graphql", "required_directive/fixtures/dangerously-throw-on-non-nullable-field.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn dangerously_throw_on_nullable_field_valid() {
    let input = include_str!("required_directive/fixtures/dangerously-throw-on-nullable-field-valid.graphql");
    let expected = include_str!("required_directive/fixtures/dangerously-throw-on-nullable-field-valid.expected");
    test_fixture(transform_fixture, file!(), "dangerously-throw-on-nullable-field-valid.graphql", "required_directive/fixtures/dangerously-throw-on-nullable-field-valid.expected", input, expected).await;
}

#[tokio::test]
async fn dangerously_throw_on_schema_non_null_field_invalid() {
    let input = include_str!("required_directive/fixtures/dangerously-throw-on-schema-non-null-field.invalid.graphql");
    let expected = include_str!("required_directive/fixtures/dangerously-throw-on-schema-non-null-field.invalid.expected");
    test_fixture(transform_fixture, file!(), "dangerously-throw-on-schema-non-null-field.invalid.graphql", "required_directive/fixtures/dangerously-throw-on-schema-non-null-field.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn dangerously_throw_on_semantic_non_null_field_invalid() {
    let input = include_str!("required_directive/fixtures/dangerously-throw-on-semantic-non-null-field.invalid.graphql");
    let expected = include_str!("required_directive/fixtures/dangerously-throw-on-semantic-non-null-field.invalid.expected");
    test_fixture(transform_fixture, file!(), "dangerously-throw-on-semantic-non-null-field.invalid.graphql", "required_directive/fixtures/dangerously-throw-on-semantic-non-null-field.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn dangerously_throw_on_semantic_nullable_field() {
    let input = include_str!("required_directive/fixtures/dangerously-throw-on-semantic-nullable-field.graphql");
    let expected = include_str!("required_directive/fixtures/dangerously-throw-on-semantic-nullable-field.expected");
    test_fixture(transform_fixture, file!(), "dangerously-throw-on-semantic-nullable-field.graphql", "required_directive/fixtures/dangerously-throw-on-semantic-nullable-field.expected", input, expected).await;
}

#[tokio::test]
async fn duplicate_field_different_actions_invalid() {
    let input = include_str!("required_directive/fixtures/duplicate-field-different-actions.invalid.graphql");
    let expected = include_str!("required_directive/fixtures/duplicate-field-different-actions.invalid.expected");
    test_fixture(transform_fixture, file!(), "duplicate-field-different-actions.invalid.graphql", "required_directive/fixtures/duplicate-field-different-actions.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn duplicate_field_include_directive_invalid() {
    let input = include_str!("required_directive/fixtures/duplicate-field-include-directive.invalid.graphql");
    let expected = include_str!("required_directive/fixtures/duplicate-field-include-directive.invalid.expected");
    test_fixture(transform_fixture, file!(), "duplicate-field-include-directive.invalid.graphql", "required_directive/fixtures/duplicate-field-include-directive.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn duplicate_field_invalid() {
    let input = include_str!("required_directive/fixtures/duplicate-field.invalid.graphql");
    let expected = include_str!("required_directive/fixtures/duplicate-field.invalid.expected");
    test_fixture(transform_fixture, file!(), "duplicate-field.invalid.graphql", "required_directive/fixtures/duplicate-field.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn duplicate_field_nullable_parent_invalid() {
    let input = include_str!("required_directive/fixtures/duplicate-field-nullable-parent.invalid.graphql");
    let expected = include_str!("required_directive/fixtures/duplicate-field-nullable-parent.invalid.expected");
    test_fixture(transform_fixture, file!(), "duplicate-field-nullable-parent.invalid.graphql", "required_directive/fixtures/duplicate-field-nullable-parent.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn duplicate_field_nullable_parent_missing_first_invalid() {
    let input = include_str!("required_directive/fixtures/duplicate-field-nullable-parent-missing-first.invalid.graphql");
    let expected = include_str!("required_directive/fixtures/duplicate-field-nullable-parent-missing-first.invalid.expected");
    test_fixture(transform_fixture, file!(), "duplicate-field-nullable-parent-missing-first.invalid.graphql", "required_directive/fixtures/duplicate-field-nullable-parent-missing-first.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn duplicate_field_ussage_alias() {
    let input = include_str!("required_directive/fixtures/duplicate-field-ussage-alias.graphql");
    let expected = include_str!("required_directive/fixtures/duplicate-field-ussage-alias.expected");
    test_fixture(transform_fixture, file!(), "duplicate-field-ussage-alias.graphql", "required_directive/fixtures/duplicate-field-ussage-alias.expected", input, expected).await;
}

#[tokio::test]
async fn duplicate_linked_field_different_actions_invalid() {
    let input = include_str!("required_directive/fixtures/duplicate-linked-field-different-actions.invalid.graphql");
    let expected = include_str!("required_directive/fixtures/duplicate-linked-field-different-actions.invalid.expected");
    test_fixture(transform_fixture, file!(), "duplicate-linked-field-different-actions.invalid.graphql", "required_directive/fixtures/duplicate-linked-field-different-actions.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn duplicate_linked_field_nullable_parent_invalid() {
    let input = include_str!("required_directive/fixtures/duplicate-linked-field-nullable-parent.invalid.graphql");
    let expected = include_str!("required_directive/fixtures/duplicate-linked-field-nullable-parent.invalid.expected");
    test_fixture(transform_fixture, file!(), "duplicate-linked-field-nullable-parent.invalid.graphql", "required_directive/fixtures/duplicate-linked-field-nullable-parent.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn fragments_are_isolated() {
    let input = include_str!("required_directive/fixtures/fragments-are-isolated.graphql");
    let expected = include_str!("required_directive/fixtures/fragments-are-isolated.expected");
    test_fixture(transform_fixture, file!(), "fragments-are-isolated.graphql", "required_directive/fixtures/fragments-are-isolated.expected", input, expected).await;
}

#[tokio::test]
async fn inline_directive_invalid() {
    let input = include_str!("required_directive/fixtures/inline-directive.invalid.graphql");
    let expected = include_str!("required_directive/fixtures/inline-directive.invalid.expected");
    test_fixture(transform_fixture, file!(), "inline-directive.invalid.graphql", "required_directive/fixtures/inline-directive.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn inline_fragment_on_concrete_in_interface_invalid() {
    let input = include_str!("required_directive/fixtures/inline-fragment-on-concrete-in-interface.invalid.graphql");
    let expected = include_str!("required_directive/fixtures/inline-fragment-on-concrete-in-interface.invalid.expected");
    test_fixture(transform_fixture, file!(), "inline-fragment-on-concrete-in-interface.invalid.graphql", "required_directive/fixtures/inline-fragment-on-concrete-in-interface.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn inline_fragment_on_interface_in_concrete_invalid() {
    let input = include_str!("required_directive/fixtures/inline-fragment-on-interface-in-concrete.invalid.graphql");
    let expected = include_str!("required_directive/fixtures/inline-fragment-on-interface-in-concrete.invalid.expected");
    test_fixture(transform_fixture, file!(), "inline-fragment-on-interface-in-concrete.invalid.graphql", "required_directive/fixtures/inline-fragment-on-interface-in-concrete.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn inline_fragment_on_interface_invalid() {
    let input = include_str!("required_directive/fixtures/inline-fragment-on-interface.invalid.graphql");
    let expected = include_str!("required_directive/fixtures/inline-fragment-on-interface.invalid.expected");
    test_fixture(transform_fixture, file!(), "inline-fragment-on-interface.invalid.graphql", "required_directive/fixtures/inline-fragment-on-interface.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn inline_fragment_on_interface_with_linked_field_invalid() {
    let input = include_str!("required_directive/fixtures/inline-fragment-on-interface-with-linked-field.invalid.graphql");
    let expected = include_str!("required_directive/fixtures/inline-fragment-on-interface-with-linked-field.invalid.expected");
    test_fixture(transform_fixture, file!(), "inline-fragment-on-interface-with-linked-field.invalid.graphql", "required_directive/fixtures/inline-fragment-on-interface-with-linked-field.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn inline_fragment_on_interface_within_linked_field() {
    let input = include_str!("required_directive/fixtures/inline-fragment-on-interface-within-linked-field.graphql");
    let expected = include_str!("required_directive/fixtures/inline-fragment-on-interface-within-linked-field.expected");
    test_fixture(transform_fixture, file!(), "inline-fragment-on-interface-within-linked-field.graphql", "required_directive/fixtures/inline-fragment-on-interface-within-linked-field.expected", input, expected).await;
}

#[tokio::test]
async fn inline_fragment_on_union_invalid() {
    let input = include_str!("required_directive/fixtures/inline-fragment-on-union.invalid.graphql");
    let expected = include_str!("required_directive/fixtures/inline-fragment-on-union.invalid.expected");
    test_fixture(transform_fixture, file!(), "inline-fragment-on-union.invalid.graphql", "required_directive/fixtures/inline-fragment-on-union.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn linked_field_log() {
    let input = include_str!("required_directive/fixtures/linked-field-log.graphql");
    let expected = include_str!("required_directive/fixtures/linked-field-log.expected");
    test_fixture(transform_fixture, file!(), "linked-field-log.graphql", "required_directive/fixtures/linked-field-log.expected", input, expected).await;
}

#[tokio::test]
async fn linked_field_no_log() {
    let input = include_str!("required_directive/fixtures/linked-field-no-log.graphql");
    let expected = include_str!("required_directive/fixtures/linked-field-no-log.expected");
    test_fixture(transform_fixture, file!(), "linked-field-no-log.graphql", "required_directive/fixtures/linked-field-no-log.expected", input, expected).await;
}

#[tokio::test]
async fn linked_field_throw() {
    let input = include_str!("required_directive/fixtures/linked-field-throw.graphql");
    let expected = include_str!("required_directive/fixtures/linked-field-throw.expected");
    test_fixture(transform_fixture, file!(), "linked-field-throw.graphql", "required_directive/fixtures/linked-field-throw.expected", input, expected).await;
}

#[tokio::test]
async fn log_action_bubble_to_throw_invalid() {
    let input = include_str!("required_directive/fixtures/log-action-bubble-to-throw.invalid.graphql");
    let expected = include_str!("required_directive/fixtures/log-action-bubble-to-throw.invalid.expected");
    test_fixture(transform_fixture, file!(), "log-action-bubble-to-throw.invalid.graphql", "required_directive/fixtures/log-action-bubble-to-throw.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn multiple_required_fields_invalid() {
    let input = include_str!("required_directive/fixtures/multiple-required-fields.invalid.graphql");
    let expected = include_str!("required_directive/fixtures/multiple-required-fields.invalid.expected");
    test_fixture(transform_fixture, file!(), "multiple-required-fields.invalid.graphql", "required_directive/fixtures/multiple-required-fields.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn none_action_bubble_to_log_across_inline_fragment_invalid() {
    let input = include_str!("required_directive/fixtures/none-action-bubble-to-log-across-inline-fragment.invalid.graphql");
    let expected = include_str!("required_directive/fixtures/none-action-bubble-to-log-across-inline-fragment.invalid.expected");
    test_fixture(transform_fixture, file!(), "none-action-bubble-to-log-across-inline-fragment.invalid.graphql", "required_directive/fixtures/none-action-bubble-to-log-across-inline-fragment.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn none_action_bubble_to_log_invalid() {
    let input = include_str!("required_directive/fixtures/none-action-bubble-to-log.invalid.graphql");
    let expected = include_str!("required_directive/fixtures/none-action-bubble-to-log.invalid.expected");
    test_fixture(transform_fixture, file!(), "none-action-bubble-to-log.invalid.graphql", "required_directive/fixtures/none-action-bubble-to-log.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn none_action_bubble_to_throw_invalid() {
    let input = include_str!("required_directive/fixtures/none-action-bubble-to-throw.invalid.graphql");
    let expected = include_str!("required_directive/fixtures/none-action-bubble-to-throw.invalid.expected");
    test_fixture(transform_fixture, file!(), "none-action-bubble-to-throw.invalid.graphql", "required_directive/fixtures/none-action-bubble-to-throw.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn required_paths() {
    let input = include_str!("required_directive/fixtures/required-paths.graphql");
    let expected = include_str!("required_directive/fixtures/required-paths.expected");
    test_fixture(transform_fixture, file!(), "required-paths.graphql", "required_directive/fixtures/required-paths.expected", input, expected).await;
}

#[tokio::test]
async fn required_with_different_actions_invalid() {
    let input = include_str!("required_directive/fixtures/required-with-different-actions.invalid.graphql");
    let expected = include_str!("required_directive/fixtures/required-with-different-actions.invalid.expected");
    test_fixture(transform_fixture, file!(), "required-with-different-actions.invalid.graphql", "required_directive/fixtures/required-with-different-actions.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn scalar_field_log() {
    let input = include_str!("required_directive/fixtures/scalar-field-log.graphql");
    let expected = include_str!("required_directive/fixtures/scalar-field-log.expected");
    test_fixture(transform_fixture, file!(), "scalar-field-log.graphql", "required_directive/fixtures/scalar-field-log.expected", input, expected).await;
}

#[tokio::test]
async fn scalar_field_no_log() {
    let input = include_str!("required_directive/fixtures/scalar-field-no-log.graphql");
    let expected = include_str!("required_directive/fixtures/scalar-field-no-log.expected");
    test_fixture(transform_fixture, file!(), "scalar-field-no-log.graphql", "required_directive/fixtures/scalar-field-no-log.expected", input, expected).await;
}

#[tokio::test]
async fn scalar_field_throw() {
    let input = include_str!("required_directive/fixtures/scalar-field-throw.graphql");
    let expected = include_str!("required_directive/fixtures/scalar-field-throw.expected");
    test_fixture(transform_fixture, file!(), "scalar-field-throw.graphql", "required_directive/fixtures/scalar-field-throw.expected", input, expected).await;
}

#[tokio::test]
async fn throw_on_semantic_non_null_field_enabled() {
    let input = include_str!("required_directive/fixtures/throw-on-semantic-non-null-field-enabled.graphql");
    let expected = include_str!("required_directive/fixtures/throw-on-semantic-non-null-field-enabled.expected");
    test_fixture(transform_fixture, file!(), "throw-on-semantic-non-null-field-enabled.graphql", "required_directive/fixtures/throw-on-semantic-non-null-field-enabled.expected", input, expected).await;
}

#[tokio::test]
async fn throw_on_semantic_nullable_field_enabled_invalid() {
    let input = include_str!("required_directive/fixtures/throw-on-semantic-nullable-field-enabled.invalid.graphql");
    let expected = include_str!("required_directive/fixtures/throw-on-semantic-nullable-field-enabled.invalid.expected");
    test_fixture(transform_fixture, file!(), "throw-on-semantic-nullable-field-enabled.invalid.graphql", "required_directive/fixtures/throw-on-semantic-nullable-field-enabled.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn throw_with_autofix_invalid() {
    let input = include_str!("required_directive/fixtures/throw-with-autofix.invalid.graphql");
    let expected = include_str!("required_directive/fixtures/throw-with-autofix.invalid.expected");
    test_fixture(transform_fixture, file!(), "throw-with-autofix.invalid.graphql", "required_directive/fixtures/throw-with-autofix.invalid.expected", input, expected).await;
}
