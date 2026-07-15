/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<5f4d5fc2789a565839ddba7e497e7939>>
 */

mod validate_selection_conflict;

use validate_selection_conflict::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn concrete_types_scalar_type_conflict_invalid() {
    let input = include_str!("validate_selection_conflict/fixtures/concrete-types-scalar-type-conflict.invalid.graphql");
    let expected = include_str!("validate_selection_conflict/fixtures/concrete-types-scalar-type-conflict.invalid.expected");
    test_fixture(transform_fixture, file!(), "concrete-types-scalar-type-conflict.invalid.graphql", "validate_selection_conflict/fixtures/concrete-types-scalar-type-conflict.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn concrete_types_with_nested_abstract() {
    let input = include_str!("validate_selection_conflict/fixtures/concrete-types-with-nested-abstract.graphql");
    let expected = include_str!("validate_selection_conflict/fixtures/concrete-types-with-nested-abstract.expected");
    test_fixture(transform_fixture, file!(), "concrete-types-with-nested-abstract.graphql", "validate_selection_conflict/fixtures/concrete-types-with-nested-abstract.expected", input, expected).await;
}

#[tokio::test]
async fn cross_validation_nested_arg_conflict_invalid() {
    let input = include_str!("validate_selection_conflict/fixtures/cross-validation-nested-arg-conflict.invalid.graphql");
    let expected = include_str!("validate_selection_conflict/fixtures/cross-validation-nested-arg-conflict.invalid.expected");
    test_fixture(transform_fixture, file!(), "cross-validation-nested-arg-conflict.invalid.graphql", "validate_selection_conflict/fixtures/cross-validation-nested-arg-conflict.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn cross_validation_nested_linked_fields() {
    let input = include_str!("validate_selection_conflict/fixtures/cross-validation-nested-linked-fields.graphql");
    let expected = include_str!("validate_selection_conflict/fixtures/cross-validation-nested-linked-fields.expected");
    test_fixture(transform_fixture, file!(), "cross-validation-nested-linked-fields.graphql", "validate_selection_conflict/fixtures/cross-validation-nested-linked-fields.expected", input, expected).await;
}

#[tokio::test]
async fn field_names_still_conflict_in_aliased_fragment() {
    let input = include_str!("validate_selection_conflict/fixtures/field_names_still_conflict_in_aliased_fragment.graphql");
    let expected = include_str!("validate_selection_conflict/fixtures/field_names_still_conflict_in_aliased_fragment.expected");
    test_fixture(transform_fixture, file!(), "field_names_still_conflict_in_aliased_fragment.graphql", "validate_selection_conflict/fixtures/field_names_still_conflict_in_aliased_fragment.expected", input, expected).await;
}

#[tokio::test]
async fn linked_field_compatible_nested_subselections() {
    let input = include_str!("validate_selection_conflict/fixtures/linked-field-compatible-nested-subselections.graphql");
    let expected = include_str!("validate_selection_conflict/fixtures/linked-field-compatible-nested-subselections.expected");
    test_fixture(transform_fixture, file!(), "linked-field-compatible-nested-subselections.graphql", "validate_selection_conflict/fixtures/linked-field-compatible-nested-subselections.expected", input, expected).await;
}

#[tokio::test]
async fn linked_field_deeply_nested_compatible() {
    let input = include_str!("validate_selection_conflict/fixtures/linked-field-deeply-nested-compatible.graphql");
    let expected = include_str!("validate_selection_conflict/fixtures/linked-field-deeply-nested-compatible.expected");
    test_fixture(transform_fixture, file!(), "linked-field-deeply-nested-compatible.graphql", "validate_selection_conflict/fixtures/linked-field-deeply-nested-compatible.expected", input, expected).await;
}

#[tokio::test]
async fn linked_field_deeply_nested_conflict() {
    let input = include_str!("validate_selection_conflict/fixtures/linked-field-deeply-nested-conflict.graphql");
    let expected = include_str!("validate_selection_conflict/fixtures/linked-field-deeply-nested-conflict.expected");
    test_fixture(transform_fixture, file!(), "linked-field-deeply-nested-conflict.graphql", "validate_selection_conflict/fixtures/linked-field-deeply-nested-conflict.expected", input, expected).await;
}

#[tokio::test]
async fn linked_field_nested_conflict_through_spreads() {
    let input = include_str!("validate_selection_conflict/fixtures/linked-field-nested-conflict-through-spreads.graphql");
    let expected = include_str!("validate_selection_conflict/fixtures/linked-field-nested-conflict-through-spreads.expected");
    test_fixture(transform_fixture, file!(), "linked-field-nested-conflict-through-spreads.graphql", "validate_selection_conflict/fixtures/linked-field-nested-conflict-through-spreads.expected", input, expected).await;
}

#[tokio::test]
async fn many_concrete_types_same_key() {
    let input = include_str!("validate_selection_conflict/fixtures/many-concrete-types-same-key.graphql");
    let expected = include_str!("validate_selection_conflict/fixtures/many-concrete-types-same-key.expected");
    test_fixture(transform_fixture, file!(), "many-concrete-types-same-key.graphql", "validate_selection_conflict/fixtures/many-concrete-types-same-key.expected", input, expected).await;
}

#[tokio::test]
async fn multiple_alias_conflicts_across_independent_fragments_invalid() {
    let input = include_str!("validate_selection_conflict/fixtures/multiple-alias-conflicts-across-independent-fragments.invalid.graphql");
    let expected = include_str!("validate_selection_conflict/fixtures/multiple-alias-conflicts-across-independent-fragments.invalid.expected");
    test_fixture(transform_fixture, file!(), "multiple-alias-conflicts-across-independent-fragments.invalid.graphql", "validate_selection_conflict/fixtures/multiple-alias-conflicts-across-independent-fragments.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn multiple_conflicts_across_independent_fragments_invalid() {
    let input = include_str!("validate_selection_conflict/fixtures/multiple-conflicts-across-independent-fragments.invalid.graphql");
    let expected = include_str!("validate_selection_conflict/fixtures/multiple-conflicts-across-independent-fragments.invalid.expected");
    test_fixture(transform_fixture, file!(), "multiple-conflicts-across-independent-fragments.invalid.graphql", "validate_selection_conflict/fixtures/multiple-conflicts-across-independent-fragments.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn multiple_match_conflicts_across_fragments_invalid() {
    let input = include_str!("validate_selection_conflict/fixtures/multiple-match-conflicts-across-fragments.invalid.graphql");
    let expected = include_str!("validate_selection_conflict/fixtures/multiple-match-conflicts-across-fragments.invalid.expected");
    test_fixture(transform_fixture, file!(), "multiple-match-conflicts-across-fragments.invalid.graphql", "validate_selection_conflict/fixtures/multiple-match-conflicts-across-fragments.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_value() {
    let input = include_str!("validate_selection_conflict/fixtures/relay_resolver_value.graphql");
    let expected = include_str!("validate_selection_conflict/fixtures/relay_resolver_value.expected");
    test_fixture(transform_fixture, file!(), "relay_resolver_value.graphql", "validate_selection_conflict/fixtures/relay_resolver_value.expected", input, expected).await;
}

#[tokio::test]
async fn same_alias_list_non_list() {
    let input = include_str!("validate_selection_conflict/fixtures/same-alias-list-non-list.graphql");
    let expected = include_str!("validate_selection_conflict/fixtures/same-alias-list-non-list.expected");
    test_fixture(transform_fixture, file!(), "same-alias-list-non-list.graphql", "validate_selection_conflict/fixtures/same-alias-list-non-list.expected", input, expected).await;
}

#[tokio::test]
async fn same_alias_nested() {
    let input = include_str!("validate_selection_conflict/fixtures/same-alias-nested.graphql");
    let expected = include_str!("validate_selection_conflict/fixtures/same-alias-nested.expected");
    test_fixture(transform_fixture, file!(), "same-alias-nested.graphql", "validate_selection_conflict/fixtures/same-alias-nested.expected", input, expected).await;
}

#[tokio::test]
async fn same_alias_nested_mutually_exclusive() {
    let input = include_str!("validate_selection_conflict/fixtures/same-alias-nested-mutually-exclusive.graphql");
    let expected = include_str!("validate_selection_conflict/fixtures/same-alias-nested-mutually-exclusive.expected");
    test_fixture(transform_fixture, file!(), "same-alias-nested-mutually-exclusive.graphql", "validate_selection_conflict/fixtures/same-alias-nested-mutually-exclusive.expected", input, expected).await;
}

#[tokio::test]
async fn same_alias_on_different_types() {
    let input = include_str!("validate_selection_conflict/fixtures/same-alias-on-different-types.graphql");
    let expected = include_str!("validate_selection_conflict/fixtures/same-alias-on-different-types.expected");
    test_fixture(transform_fixture, file!(), "same-alias-on-different-types.graphql", "validate_selection_conflict/fixtures/same-alias-on-different-types.expected", input, expected).await;
}

#[tokio::test]
async fn same_alias_on_different_types_inline_fragments() {
    let input = include_str!("validate_selection_conflict/fixtures/same-alias-on-different-types-inline-fragments.graphql");
    let expected = include_str!("validate_selection_conflict/fixtures/same-alias-on-different-types-inline-fragments.expected");
    test_fixture(transform_fixture, file!(), "same-alias-on-different-types-inline-fragments.graphql", "validate_selection_conflict/fixtures/same-alias-on-different-types-inline-fragments.expected", input, expected).await;
}

#[tokio::test]
async fn same_alias_under_different_inline_fragments() {
    let input = include_str!("validate_selection_conflict/fixtures/same-alias-under-different-inline-fragments.graphql");
    let expected = include_str!("validate_selection_conflict/fixtures/same-alias-under-different-inline-fragments.expected");
    test_fixture(transform_fixture, file!(), "same-alias-under-different-inline-fragments.graphql", "validate_selection_conflict/fixtures/same-alias-under-different-inline-fragments.expected", input, expected).await;
}

#[tokio::test]
async fn same_alias_under_duplicated_linked_field() {
    let input = include_str!("validate_selection_conflict/fixtures/same-alias-under-duplicated-linked-field.graphql");
    let expected = include_str!("validate_selection_conflict/fixtures/same-alias-under-duplicated-linked-field.expected");
    test_fixture(transform_fixture, file!(), "same-alias-under-duplicated-linked-field.graphql", "validate_selection_conflict/fixtures/same-alias-under-duplicated-linked-field.expected", input, expected).await;
}

#[tokio::test]
async fn same_field_multiple_type_conditions_valid() {
    let input = include_str!("validate_selection_conflict/fixtures/same-field-multiple-type-conditions-valid.graphql");
    let expected = include_str!("validate_selection_conflict/fixtures/same-field-multiple-type-conditions-valid.expected");
    test_fixture(transform_fixture, file!(), "same-field-multiple-type-conditions-valid.graphql", "validate_selection_conflict/fixtures/same-field-multiple-type-conditions-valid.expected", input, expected).await;
}

#[tokio::test]
async fn same_field_with_different_match_across_fragments_invalid() {
    let input = include_str!("validate_selection_conflict/fixtures/same-field-with-different-match-across-fragments.invalid.graphql");
    let expected = include_str!("validate_selection_conflict/fixtures/same-field-with-different-match-across-fragments.invalid.expected");
    test_fixture(transform_fixture, file!(), "same-field-with-different-match-across-fragments.invalid.graphql", "validate_selection_conflict/fixtures/same-field-with-different-match-across-fragments.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn same_field_with_different_match_across_fragments_no_supported_invalid() {
    let input = include_str!("validate_selection_conflict/fixtures/same-field-with-different-match-across-fragments-no-supported.invalid.graphql");
    let expected = include_str!("validate_selection_conflict/fixtures/same-field-with-different-match-across-fragments-no-supported.invalid.expected");
    test_fixture(transform_fixture, file!(), "same-field-with-different-match-across-fragments-no-supported.invalid.graphql", "validate_selection_conflict/fixtures/same-field-with-different-match-across-fragments-no-supported.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn same_field_with_same_match_across_fragments() {
    let input = include_str!("validate_selection_conflict/fixtures/same-field-with-same-match-across-fragments.graphql");
    let expected = include_str!("validate_selection_conflict/fixtures/same-field-with-same-match-across-fragments.expected");
    test_fixture(transform_fixture, file!(), "same-field-with-same-match-across-fragments.graphql", "validate_selection_conflict/fixtures/same-field-with-same-match-across-fragments.expected", input, expected).await;
}

#[tokio::test]
async fn same_field_with_same_match_across_fragments_no_supported() {
    let input = include_str!("validate_selection_conflict/fixtures/same-field-with-same-match-across-fragments-no-supported.graphql");
    let expected = include_str!("validate_selection_conflict/fixtures/same-field-with-same-match-across-fragments-no-supported.expected");
    test_fixture(transform_fixture, file!(), "same-field-with-same-match-across-fragments-no-supported.graphql", "validate_selection_conflict/fixtures/same-field-with-same-match-across-fragments-no-supported.expected", input, expected).await;
}
