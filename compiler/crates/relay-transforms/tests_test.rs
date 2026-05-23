/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<73ada0307ce67a6a7d4cbb9f7d6a8b0d>>
 */

mod tests;

use tests::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn aliases_in_different_aliased_inline_fragments_dont_conflitc() {
    let input = include_str!("tests/fixtures/aliases_in_different_aliased_inline_fragments_dont_conflitc.graphql");
    let expected = include_str!("tests/fixtures/aliases_in_different_aliased_inline_fragments_dont_conflitc.expected");
    test_fixture(transform_fixture, file!(), "aliases_in_different_aliased_inline_fragments_dont_conflitc.graphql", "tests/fixtures/aliases_in_different_aliased_inline_fragments_dont_conflitc.expected", input, expected).await;
}

#[tokio::test]
async fn default_inline_fragment_alias_conflicts_with_field() {
    let input = include_str!("tests/fixtures/default_inline_fragment_alias_conflicts_with_field.graphql");
    let expected = include_str!("tests/fixtures/default_inline_fragment_alias_conflicts_with_field.expected");
    test_fixture(transform_fixture, file!(), "default_inline_fragment_alias_conflicts_with_field.graphql", "tests/fixtures/default_inline_fragment_alias_conflicts_with_field.expected", input, expected).await;
}

#[tokio::test]
async fn default_named_fragment_alias_conflicts_with_field() {
    let input = include_str!("tests/fixtures/default_named_fragment_alias_conflicts_with_field.graphql");
    let expected = include_str!("tests/fixtures/default_named_fragment_alias_conflicts_with_field.expected");
    test_fixture(transform_fixture, file!(), "default_named_fragment_alias_conflicts_with_field.graphql", "tests/fixtures/default_named_fragment_alias_conflicts_with_field.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_alias_name_conflicts_with_field() {
    let input = include_str!("tests/fixtures/fragment_alias_name_conflicts_with_field.graphql");
    let expected = include_str!("tests/fixtures/fragment_alias_name_conflicts_with_field.expected");
    test_fixture(transform_fixture, file!(), "fragment_alias_name_conflicts_with_field.graphql", "tests/fixtures/fragment_alias_name_conflicts_with_field.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_alias_name_conflicts_with_field_in_inline_fragment() {
    let input = include_str!("tests/fixtures/fragment_alias_name_conflicts_with_field_in_inline_fragment.graphql");
    let expected = include_str!("tests/fixtures/fragment_alias_name_conflicts_with_field_in_inline_fragment.expected");
    test_fixture(transform_fixture, file!(), "fragment_alias_name_conflicts_with_field_in_inline_fragment.graphql", "tests/fixtures/fragment_alias_name_conflicts_with_field_in_inline_fragment.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_alias_name_conflicts_with_other_fragment_alias() {
    let input = include_str!("tests/fixtures/fragment_alias_name_conflicts_with_other_fragment_alias.graphql");
    let expected = include_str!("tests/fixtures/fragment_alias_name_conflicts_with_other_fragment_alias.expected");
    test_fixture(transform_fixture, file!(), "fragment_alias_name_conflicts_with_other_fragment_alias.graphql", "tests/fixtures/fragment_alias_name_conflicts_with_other_fragment_alias.expected", input, expected).await;
}
