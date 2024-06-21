/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<181f8435539d1237e4b620d14a79c100>>
 */

mod fragment_alias_directive;

use fragment_alias_directive::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn alias_on_abstract_type() {
    let input = include_str!("fragment_alias_directive/fixtures/alias_on_abstract_type.graphql");
    let expected = include_str!("fragment_alias_directive/fixtures/alias_on_abstract_type.expected");
    test_fixture(transform_fixture, "alias_on_abstract_type.graphql", "fragment_alias_directive/fixtures/alias_on_abstract_type.expected", input, expected);
}

#[test]
fn alias_on_named_fragment() {
    let input = include_str!("fragment_alias_directive/fixtures/alias_on_named_fragment.graphql");
    let expected = include_str!("fragment_alias_directive/fixtures/alias_on_named_fragment.expected");
    test_fixture(transform_fixture, "alias_on_named_fragment.graphql", "fragment_alias_directive/fixtures/alias_on_named_fragment.expected", input, expected);
}

#[test]
fn aliased_inline_fragment() {
    let input = include_str!("fragment_alias_directive/fixtures/aliased_inline_fragment.graphql");
    let expected = include_str!("fragment_alias_directive/fixtures/aliased_inline_fragment.expected");
    test_fixture(transform_fixture, "aliased_inline_fragment.graphql", "fragment_alias_directive/fixtures/aliased_inline_fragment.expected", input, expected);
}

#[test]
fn aliased_inline_fragment_without_type_condition() {
    let input = include_str!("fragment_alias_directive/fixtures/aliased_inline_fragment_without_type_condition.graphql");
    let expected = include_str!("fragment_alias_directive/fixtures/aliased_inline_fragment_without_type_condition.expected");
    test_fixture(transform_fixture, "aliased_inline_fragment_without_type_condition.graphql", "fragment_alias_directive/fixtures/aliased_inline_fragment_without_type_condition.expected", input, expected);
}

#[test]
fn default_alias_on_fragment_spread() {
    let input = include_str!("fragment_alias_directive/fixtures/default_alias_on_fragment_spread.graphql");
    let expected = include_str!("fragment_alias_directive/fixtures/default_alias_on_fragment_spread.expected");
    test_fixture(transform_fixture, "default_alias_on_fragment_spread.graphql", "fragment_alias_directive/fixtures/default_alias_on_fragment_spread.expected", input, expected);
}

#[test]
fn default_alias_on_inline_fragment() {
    let input = include_str!("fragment_alias_directive/fixtures/default_alias_on_inline_fragment.graphql");
    let expected = include_str!("fragment_alias_directive/fixtures/default_alias_on_inline_fragment.expected");
    test_fixture(transform_fixture, "default_alias_on_inline_fragment.graphql", "fragment_alias_directive/fixtures/default_alias_on_inline_fragment.expected", input, expected);
}

#[test]
fn default_alias_on_inline_fragment_without_type_invalid() {
    let input = include_str!("fragment_alias_directive/fixtures/default_alias_on_inline_fragment_without_type.invalid.graphql");
    let expected = include_str!("fragment_alias_directive/fixtures/default_alias_on_inline_fragment_without_type.invalid.expected");
    test_fixture(transform_fixture, "default_alias_on_inline_fragment_without_type.invalid.graphql", "fragment_alias_directive/fixtures/default_alias_on_inline_fragment_without_type.invalid.expected", input, expected);
}
