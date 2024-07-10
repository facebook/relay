/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<52305c15753efb60305d9e0b604d36f3>>
 */

mod validate_selection_conflict;

use validate_selection_conflict::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn field_names_still_conflict_in_aliased_fragment() {
    let input = include_str!("validate_selection_conflict/fixtures/field_names_still_conflict_in_aliased_fragment.graphql");
    let expected = include_str!("validate_selection_conflict/fixtures/field_names_still_conflict_in_aliased_fragment.expected");
    test_fixture(transform_fixture, file!(), "field_names_still_conflict_in_aliased_fragment.graphql", "validate_selection_conflict/fixtures/field_names_still_conflict_in_aliased_fragment.expected", input, expected).await;
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
