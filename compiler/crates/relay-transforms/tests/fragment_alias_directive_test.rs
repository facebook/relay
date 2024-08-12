/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b3ad5f451c81e311e6efe57ead61c409>>
 */

mod fragment_alias_directive;

use fragment_alias_directive::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn alias_as_empty_string_invalid() {
    let input = include_str!("fragment_alias_directive/fixtures/alias_as_empty_string.invalid.graphql");
    let expected = include_str!("fragment_alias_directive/fixtures/alias_as_empty_string.invalid.expected");
    test_fixture(transform_fixture, file!(), "alias_as_empty_string.invalid.graphql", "fragment_alias_directive/fixtures/alias_as_empty_string.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn alias_not_required_on_module_fragments() {
    let input = include_str!("fragment_alias_directive/fixtures/alias_not_required_on_module_fragments.graphql");
    let expected = include_str!("fragment_alias_directive/fixtures/alias_not_required_on_module_fragments.expected");
    test_fixture(transform_fixture, file!(), "alias_not_required_on_module_fragments.graphql", "fragment_alias_directive/fixtures/alias_not_required_on_module_fragments.expected", input, expected).await;
}

#[tokio::test]
async fn alias_not_required_within_aliased_refined_inline_fragment() {
    let input = include_str!("fragment_alias_directive/fixtures/alias_not_required_within_aliased_refined_inline_fragment.graphql");
    let expected = include_str!("fragment_alias_directive/fixtures/alias_not_required_within_aliased_refined_inline_fragment.expected");
    test_fixture(transform_fixture, file!(), "alias_not_required_within_aliased_refined_inline_fragment.graphql", "fragment_alias_directive/fixtures/alias_not_required_within_aliased_refined_inline_fragment.expected", input, expected).await;
}

#[tokio::test]
async fn alias_on_abstract_type() {
    let input = include_str!("fragment_alias_directive/fixtures/alias_on_abstract_type.graphql");
    let expected = include_str!("fragment_alias_directive/fixtures/alias_on_abstract_type.expected");
    test_fixture(transform_fixture, file!(), "alias_on_abstract_type.graphql", "fragment_alias_directive/fixtures/alias_on_abstract_type.expected", input, expected).await;
}

#[tokio::test]
async fn alias_on_named_fragment() {
    let input = include_str!("fragment_alias_directive/fixtures/alias_on_named_fragment.graphql");
    let expected = include_str!("fragment_alias_directive/fixtures/alias_on_named_fragment.expected");
    test_fixture(transform_fixture, file!(), "alias_on_named_fragment.graphql", "fragment_alias_directive/fixtures/alias_on_named_fragment.expected", input, expected).await;
}

#[tokio::test]
async fn alias_on_spread_of_plural_fragment_invalid() {
    let input = include_str!("fragment_alias_directive/fixtures/alias_on_spread_of_plural_fragment.invalid.graphql");
    let expected = include_str!("fragment_alias_directive/fixtures/alias_on_spread_of_plural_fragment.invalid.expected");
    test_fixture(transform_fixture, file!(), "alias_on_spread_of_plural_fragment.invalid.graphql", "fragment_alias_directive/fixtures/alias_on_spread_of_plural_fragment.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn alias_required_within_refined_inline_fragment_invalid() {
    let input = include_str!("fragment_alias_directive/fixtures/alias_required_within_refined_inline_fragment.invalid.graphql");
    let expected = include_str!("fragment_alias_directive/fixtures/alias_required_within_refined_inline_fragment.invalid.expected");
    test_fixture(transform_fixture, file!(), "alias_required_within_refined_inline_fragment.invalid.graphql", "fragment_alias_directive/fixtures/alias_required_within_refined_inline_fragment.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn aliased_inline_fragment() {
    let input = include_str!("fragment_alias_directive/fixtures/aliased_inline_fragment.graphql");
    let expected = include_str!("fragment_alias_directive/fixtures/aliased_inline_fragment.expected");
    test_fixture(transform_fixture, file!(), "aliased_inline_fragment.graphql", "fragment_alias_directive/fixtures/aliased_inline_fragment.expected", input, expected).await;
}

#[tokio::test]
async fn aliased_inline_fragment_without_type_condition() {
    let input = include_str!("fragment_alias_directive/fixtures/aliased_inline_fragment_without_type_condition.graphql");
    let expected = include_str!("fragment_alias_directive/fixtures/aliased_inline_fragment_without_type_condition.expected");
    test_fixture(transform_fixture, file!(), "aliased_inline_fragment_without_type_condition.graphql", "fragment_alias_directive/fixtures/aliased_inline_fragment_without_type_condition.expected", input, expected).await;
}

#[tokio::test]
async fn default_alias_on_fragment_spread() {
    let input = include_str!("fragment_alias_directive/fixtures/default_alias_on_fragment_spread.graphql");
    let expected = include_str!("fragment_alias_directive/fixtures/default_alias_on_fragment_spread.expected");
    test_fixture(transform_fixture, file!(), "default_alias_on_fragment_spread.graphql", "fragment_alias_directive/fixtures/default_alias_on_fragment_spread.expected", input, expected).await;
}

#[tokio::test]
async fn default_alias_on_inline_fragment() {
    let input = include_str!("fragment_alias_directive/fixtures/default_alias_on_inline_fragment.graphql");
    let expected = include_str!("fragment_alias_directive/fixtures/default_alias_on_inline_fragment.expected");
    test_fixture(transform_fixture, file!(), "default_alias_on_inline_fragment.graphql", "fragment_alias_directive/fixtures/default_alias_on_inline_fragment.expected", input, expected).await;
}

#[tokio::test]
async fn default_alias_on_inline_fragment_without_type_invalid() {
    let input = include_str!("fragment_alias_directive/fixtures/default_alias_on_inline_fragment_without_type.invalid.graphql");
    let expected = include_str!("fragment_alias_directive/fixtures/default_alias_on_inline_fragment_without_type.invalid.expected");
    test_fixture(transform_fixture, file!(), "default_alias_on_inline_fragment_without_type.invalid.graphql", "fragment_alias_directive/fixtures/default_alias_on_inline_fragment_without_type.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_spread_into_supertype_without_alias_invalid() {
    let input = include_str!("fragment_alias_directive/fixtures/fragment_spread_into_supertype_without_alias.invalid.graphql");
    let expected = include_str!("fragment_alias_directive/fixtures/fragment_spread_into_supertype_without_alias.invalid.expected");
    test_fixture(transform_fixture, file!(), "fragment_spread_into_supertype_without_alias.invalid.graphql", "fragment_alias_directive/fixtures/fragment_spread_into_supertype_without_alias.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_spread_into_supertype_without_alias_suppressed() {
    let input = include_str!("fragment_alias_directive/fixtures/fragment_spread_into_supertype_without_alias_suppressed.graphql");
    let expected = include_str!("fragment_alias_directive/fixtures/fragment_spread_into_supertype_without_alias_suppressed.expected");
    test_fixture(transform_fixture, file!(), "fragment_spread_into_supertype_without_alias_suppressed.graphql", "fragment_alias_directive/fixtures/fragment_spread_into_supertype_without_alias_suppressed.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_spread_within_skip_inline_fragment_without_alias_invalid() {
    let input = include_str!("fragment_alias_directive/fixtures/fragment_spread_within_skip_inline_fragment_without_alias.invalid.graphql");
    let expected = include_str!("fragment_alias_directive/fixtures/fragment_spread_within_skip_inline_fragment_without_alias.invalid.expected");
    test_fixture(transform_fixture, file!(), "fragment_spread_within_skip_inline_fragment_without_alias.invalid.graphql", "fragment_alias_directive/fixtures/fragment_spread_within_skip_inline_fragment_without_alias.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn inline_fragment_spread_into_supertype_without_alias() {
    let input = include_str!("fragment_alias_directive/fixtures/inline_fragment_spread_into_supertype_without_alias.graphql");
    let expected = include_str!("fragment_alias_directive/fixtures/inline_fragment_spread_into_supertype_without_alias.expected");
    test_fixture(transform_fixture, file!(), "inline_fragment_spread_into_supertype_without_alias.graphql", "fragment_alias_directive/fixtures/inline_fragment_spread_into_supertype_without_alias.expected", input, expected).await;
}

#[tokio::test]
async fn skip_fragment_spread_without_alias_invalid() {
    let input = include_str!("fragment_alias_directive/fixtures/skip_fragment_spread_without_alias.invalid.graphql");
    let expected = include_str!("fragment_alias_directive/fixtures/skip_fragment_spread_without_alias.invalid.expected");
    test_fixture(transform_fixture, file!(), "skip_fragment_spread_without_alias.invalid.graphql", "fragment_alias_directive/fixtures/skip_fragment_spread_without_alias.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn skip_fragment_spread_without_alias_suppressed() {
    let input = include_str!("fragment_alias_directive/fixtures/skip_fragment_spread_without_alias_suppressed.graphql");
    let expected = include_str!("fragment_alias_directive/fixtures/skip_fragment_spread_without_alias_suppressed.expected");
    test_fixture(transform_fixture, file!(), "skip_fragment_spread_without_alias_suppressed.graphql", "fragment_alias_directive/fixtures/skip_fragment_spread_without_alias_suppressed.expected", input, expected).await;
}

#[tokio::test]
async fn skip_inline_fragment_without_alias() {
    let input = include_str!("fragment_alias_directive/fixtures/skip_inline_fragment_without_alias.graphql");
    let expected = include_str!("fragment_alias_directive/fixtures/skip_inline_fragment_without_alias.expected");
    test_fixture(transform_fixture, file!(), "skip_inline_fragment_without_alias.graphql", "fragment_alias_directive/fixtures/skip_inline_fragment_without_alias.expected", input, expected).await;
}
