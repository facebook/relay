/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<a1018732a92bc179bc2c4babcd6da58b>>
 */

mod updatable_fragment_spread;

use updatable_fragment_spread::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn updatable_fragment_spread_abstract_in_concrete() {
    let input = include_str!("updatable_fragment_spread/fixtures/updatable_fragment_spread_abstract_in_concrete.graphql");
    let expected = include_str!("updatable_fragment_spread/fixtures/updatable_fragment_spread_abstract_in_concrete.expected");
    test_fixture(transform_fixture, file!(), "updatable_fragment_spread_abstract_in_concrete.graphql", "updatable_fragment_spread/fixtures/updatable_fragment_spread_abstract_in_concrete.expected", input, expected).await;
}

#[tokio::test]
async fn updatable_fragment_spread_abstract_in_different_non_extending_abstract_invalid() {
    let input = include_str!("updatable_fragment_spread/fixtures/updatable_fragment_spread_abstract_in_different_non_extending_abstract.invalid.graphql");
    let expected = include_str!("updatable_fragment_spread/fixtures/updatable_fragment_spread_abstract_in_different_non_extending_abstract.invalid.expected");
    test_fixture(transform_fixture, file!(), "updatable_fragment_spread_abstract_in_different_non_extending_abstract.invalid.graphql", "updatable_fragment_spread/fixtures/updatable_fragment_spread_abstract_in_different_non_extending_abstract.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn updatable_fragment_spread_abstract_in_same_abstract() {
    let input = include_str!("updatable_fragment_spread/fixtures/updatable_fragment_spread_abstract_in_same_abstract.graphql");
    let expected = include_str!("updatable_fragment_spread/fixtures/updatable_fragment_spread_abstract_in_same_abstract.expected");
    test_fixture(transform_fixture, file!(), "updatable_fragment_spread_abstract_in_same_abstract.graphql", "updatable_fragment_spread/fixtures/updatable_fragment_spread_abstract_in_same_abstract.expected", input, expected).await;
}

#[tokio::test]
async fn updatable_fragment_spread_concrete_in_different_concrete_invalid() {
    let input = include_str!("updatable_fragment_spread/fixtures/updatable_fragment_spread_concrete_in_different_concrete.invalid.graphql");
    let expected = include_str!("updatable_fragment_spread/fixtures/updatable_fragment_spread_concrete_in_different_concrete.invalid.expected");
    test_fixture(transform_fixture, file!(), "updatable_fragment_spread_concrete_in_different_concrete.invalid.graphql", "updatable_fragment_spread/fixtures/updatable_fragment_spread_concrete_in_different_concrete.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn updatable_fragment_spread_concrete_in_matching_abstract_invalid() {
    let input = include_str!("updatable_fragment_spread/fixtures/updatable_fragment_spread_concrete_in_matching_abstract.invalid.graphql");
    let expected = include_str!("updatable_fragment_spread/fixtures/updatable_fragment_spread_concrete_in_matching_abstract.invalid.expected");
    test_fixture(transform_fixture, file!(), "updatable_fragment_spread_concrete_in_matching_abstract.invalid.graphql", "updatable_fragment_spread/fixtures/updatable_fragment_spread_concrete_in_matching_abstract.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn updatable_fragment_spread_concrete_in_non_matching_abstract_invalid() {
    let input = include_str!("updatable_fragment_spread/fixtures/updatable_fragment_spread_concrete_in_non_matching_abstract.invalid.graphql");
    let expected = include_str!("updatable_fragment_spread/fixtures/updatable_fragment_spread_concrete_in_non_matching_abstract.invalid.expected");
    test_fixture(transform_fixture, file!(), "updatable_fragment_spread_concrete_in_non_matching_abstract.invalid.graphql", "updatable_fragment_spread/fixtures/updatable_fragment_spread_concrete_in_non_matching_abstract.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn updatable_fragment_spread_concrete_in_same_concrete() {
    let input = include_str!("updatable_fragment_spread/fixtures/updatable_fragment_spread_concrete_in_same_concrete.graphql");
    let expected = include_str!("updatable_fragment_spread/fixtures/updatable_fragment_spread_concrete_in_same_concrete.expected");
    test_fixture(transform_fixture, file!(), "updatable_fragment_spread_concrete_in_same_concrete.graphql", "updatable_fragment_spread/fixtures/updatable_fragment_spread_concrete_in_same_concrete.expected", input, expected).await;
}

#[tokio::test]
async fn updatable_fragment_spread_in_condition_invalid() {
    let input = include_str!("updatable_fragment_spread/fixtures/updatable_fragment_spread_in_condition.invalid.graphql");
    let expected = include_str!("updatable_fragment_spread/fixtures/updatable_fragment_spread_in_condition.invalid.expected");
    test_fixture(transform_fixture, file!(), "updatable_fragment_spread_in_condition.invalid.graphql", "updatable_fragment_spread/fixtures/updatable_fragment_spread_in_condition.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn updatable_fragment_spread_in_inline_fragment() {
    let input = include_str!("updatable_fragment_spread/fixtures/updatable_fragment_spread_in_inline_fragment.graphql");
    let expected = include_str!("updatable_fragment_spread/fixtures/updatable_fragment_spread_in_inline_fragment.expected");
    test_fixture(transform_fixture, file!(), "updatable_fragment_spread_in_inline_fragment.graphql", "updatable_fragment_spread/fixtures/updatable_fragment_spread_in_inline_fragment.expected", input, expected).await;
}

#[tokio::test]
async fn updatable_fragment_spread_in_inline_fragment_other_selections_abstract_type_condition_invalid() {
    let input = include_str!("updatable_fragment_spread/fixtures/updatable_fragment_spread_in_inline_fragment_other_selections_abstract_type_condition.invalid.graphql");
    let expected = include_str!("updatable_fragment_spread/fixtures/updatable_fragment_spread_in_inline_fragment_other_selections_abstract_type_condition.invalid.expected");
    test_fixture(transform_fixture, file!(), "updatable_fragment_spread_in_inline_fragment_other_selections_abstract_type_condition.invalid.graphql", "updatable_fragment_spread/fixtures/updatable_fragment_spread_in_inline_fragment_other_selections_abstract_type_condition.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn updatable_fragment_spread_in_inline_fragment_other_selections_no_typename_invalid() {
    let input = include_str!("updatable_fragment_spread/fixtures/updatable_fragment_spread_in_inline_fragment_other_selections_no_typename.invalid.graphql");
    let expected = include_str!("updatable_fragment_spread/fixtures/updatable_fragment_spread_in_inline_fragment_other_selections_no_typename.invalid.expected");
    test_fixture(transform_fixture, file!(), "updatable_fragment_spread_in_inline_fragment_other_selections_no_typename.invalid.graphql", "updatable_fragment_spread/fixtures/updatable_fragment_spread_in_inline_fragment_other_selections_no_typename.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn updatable_fragment_spread_in_inline_fragment_other_selections_redundant_type_condition_invalid() {
    let input = include_str!("updatable_fragment_spread/fixtures/updatable_fragment_spread_in_inline_fragment_other_selections_redundant_type_condition.invalid.graphql");
    let expected = include_str!("updatable_fragment_spread/fixtures/updatable_fragment_spread_in_inline_fragment_other_selections_redundant_type_condition.invalid.expected");
    test_fixture(transform_fixture, file!(), "updatable_fragment_spread_in_inline_fragment_other_selections_redundant_type_condition.invalid.graphql", "updatable_fragment_spread/fixtures/updatable_fragment_spread_in_inline_fragment_other_selections_redundant_type_condition.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn updatable_fragment_spread_in_inline_fragment_other_selections_typename_with_alias_invalid() {
    let input = include_str!("updatable_fragment_spread/fixtures/updatable_fragment_spread_in_inline_fragment_other_selections_typename_with_alias.invalid.graphql");
    let expected = include_str!("updatable_fragment_spread/fixtures/updatable_fragment_spread_in_inline_fragment_other_selections_typename_with_alias.invalid.expected");
    test_fixture(transform_fixture, file!(), "updatable_fragment_spread_in_inline_fragment_other_selections_typename_with_alias.invalid.graphql", "updatable_fragment_spread/fixtures/updatable_fragment_spread_in_inline_fragment_other_selections_typename_with_alias.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn updatable_fragment_spread_in_inline_fragment_other_selections_typename_with_condition_invalid() {
    let input = include_str!("updatable_fragment_spread/fixtures/updatable_fragment_spread_in_inline_fragment_other_selections_typename_with_condition.invalid.graphql");
    let expected = include_str!("updatable_fragment_spread/fixtures/updatable_fragment_spread_in_inline_fragment_other_selections_typename_with_condition.invalid.expected");
    test_fixture(transform_fixture, file!(), "updatable_fragment_spread_in_inline_fragment_other_selections_typename_with_condition.invalid.graphql", "updatable_fragment_spread/fixtures/updatable_fragment_spread_in_inline_fragment_other_selections_typename_with_condition.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn updatable_fragment_spread_in_inline_fragment_other_selections_typename_with_directives_invalid() {
    let input = include_str!("updatable_fragment_spread/fixtures/updatable_fragment_spread_in_inline_fragment_other_selections_typename_with_directives.invalid.graphql");
    let expected = include_str!("updatable_fragment_spread/fixtures/updatable_fragment_spread_in_inline_fragment_other_selections_typename_with_directives.invalid.expected");
    test_fixture(transform_fixture, file!(), "updatable_fragment_spread_in_inline_fragment_other_selections_typename_with_directives.invalid.graphql", "updatable_fragment_spread/fixtures/updatable_fragment_spread_in_inline_fragment_other_selections_typename_with_directives.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn updatable_fragment_spread_in_inline_fragment_other_selections_with_fragment_spread_directives() {
    let input = include_str!("updatable_fragment_spread/fixtures/updatable_fragment_spread_in_inline_fragment_other_selections_with_fragment_spread_directives.graphql");
    let expected = include_str!("updatable_fragment_spread/fixtures/updatable_fragment_spread_in_inline_fragment_other_selections_with_fragment_spread_directives.expected");
    test_fixture(transform_fixture, file!(), "updatable_fragment_spread_in_inline_fragment_other_selections_with_fragment_spread_directives.graphql", "updatable_fragment_spread/fixtures/updatable_fragment_spread_in_inline_fragment_other_selections_with_fragment_spread_directives.expected", input, expected).await;
}

#[tokio::test]
async fn updatable_fragment_spread_in_inline_fragment_other_selections_wrong_type_invalid_1() {
    let input = include_str!("updatable_fragment_spread/fixtures/updatable_fragment_spread_in_inline_fragment_other_selections_wrong_type.invalid_1.graphql");
    let expected = include_str!("updatable_fragment_spread/fixtures/updatable_fragment_spread_in_inline_fragment_other_selections_wrong_type.invalid_1.expected");
    test_fixture(transform_fixture, file!(), "updatable_fragment_spread_in_inline_fragment_other_selections_wrong_type.invalid_1.graphql", "updatable_fragment_spread/fixtures/updatable_fragment_spread_in_inline_fragment_other_selections_wrong_type.invalid_1.expected", input, expected).await;
}

#[tokio::test]
async fn updatable_fragment_spread_in_inline_fragment_other_selections_wrong_type_invalid_2() {
    let input = include_str!("updatable_fragment_spread/fixtures/updatable_fragment_spread_in_inline_fragment_other_selections_wrong_type.invalid_2.graphql");
    let expected = include_str!("updatable_fragment_spread/fixtures/updatable_fragment_spread_in_inline_fragment_other_selections_wrong_type.invalid_2.expected");
    test_fixture(transform_fixture, file!(), "updatable_fragment_spread_in_inline_fragment_other_selections_wrong_type.invalid_2.graphql", "updatable_fragment_spread/fixtures/updatable_fragment_spread_in_inline_fragment_other_selections_wrong_type.invalid_2.expected", input, expected).await;
}

#[tokio::test]
async fn updatable_fragment_spread_in_inline_fragment_other_selections_wrong_type_invalid_3() {
    let input = include_str!("updatable_fragment_spread/fixtures/updatable_fragment_spread_in_inline_fragment_other_selections_wrong_type.invalid_3.graphql");
    let expected = include_str!("updatable_fragment_spread/fixtures/updatable_fragment_spread_in_inline_fragment_other_selections_wrong_type.invalid_3.expected");
    test_fixture(transform_fixture, file!(), "updatable_fragment_spread_in_inline_fragment_other_selections_wrong_type.invalid_3.graphql", "updatable_fragment_spread/fixtures/updatable_fragment_spread_in_inline_fragment_other_selections_wrong_type.invalid_3.expected", input, expected).await;
}

#[tokio::test]
async fn updatable_fragment_spread_in_inline_fragment_other_selections_wrong_type_invalid_4() {
    let input = include_str!("updatable_fragment_spread/fixtures/updatable_fragment_spread_in_inline_fragment_other_selections_wrong_type.invalid_4.graphql");
    let expected = include_str!("updatable_fragment_spread/fixtures/updatable_fragment_spread_in_inline_fragment_other_selections_wrong_type.invalid_4.expected");
    test_fixture(transform_fixture, file!(), "updatable_fragment_spread_in_inline_fragment_other_selections_wrong_type.invalid_4.graphql", "updatable_fragment_spread/fixtures/updatable_fragment_spread_in_inline_fragment_other_selections_wrong_type.invalid_4.expected", input, expected).await;
}

#[tokio::test]
async fn updatable_fragment_spread_in_inline_fragment_with_abstract_type_condition_invalid() {
    let input = include_str!("updatable_fragment_spread/fixtures/updatable_fragment_spread_in_inline_fragment_with_abstract_type_condition.invalid.graphql");
    let expected = include_str!("updatable_fragment_spread/fixtures/updatable_fragment_spread_in_inline_fragment_with_abstract_type_condition.invalid.expected");
    test_fixture(transform_fixture, file!(), "updatable_fragment_spread_in_inline_fragment_with_abstract_type_condition.invalid.graphql", "updatable_fragment_spread/fixtures/updatable_fragment_spread_in_inline_fragment_with_abstract_type_condition.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn updatable_fragment_spread_in_inline_fragment_without_typename_invalid() {
    let input = include_str!("updatable_fragment_spread/fixtures/updatable_fragment_spread_in_inline_fragment_without_typename.invalid.graphql");
    let expected = include_str!("updatable_fragment_spread/fixtures/updatable_fragment_spread_in_inline_fragment_without_typename.invalid.expected");
    test_fixture(transform_fixture, file!(), "updatable_fragment_spread_in_inline_fragment_without_typename.invalid.graphql", "updatable_fragment_spread/fixtures/updatable_fragment_spread_in_inline_fragment_without_typename.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn updatable_fragment_spread_top_level_invalid() {
    let input = include_str!("updatable_fragment_spread/fixtures/updatable_fragment_spread_top_level.invalid.graphql");
    let expected = include_str!("updatable_fragment_spread/fixtures/updatable_fragment_spread_top_level.invalid.expected");
    test_fixture(transform_fixture, file!(), "updatable_fragment_spread_top_level.invalid.graphql", "updatable_fragment_spread/fixtures/updatable_fragment_spread_top_level.invalid.expected", input, expected).await;
}
