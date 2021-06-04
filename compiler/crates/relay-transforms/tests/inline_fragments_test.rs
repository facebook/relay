/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<a607e7ff72c3802a6591da6bfbe97c87>>
 */

mod inline_fragments;

use inline_fragments::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn inlines_nested_fragments() {
    let input = include_str!("inline_fragments/fixtures/inlines-nested-fragments.graphql");
    let expected = include_str!("inline_fragments/fixtures/inlines-nested-fragments.expected");
    test_fixture(transform_fixture, "inlines-nested-fragments.graphql", "inline_fragments/fixtures/inlines-nested-fragments.expected", input, expected);
}

#[test]
fn inlines_with_directive() {
    let input = include_str!("inline_fragments/fixtures/inlines-with-directive.graphql");
    let expected = include_str!("inline_fragments/fixtures/inlines-with-directive.expected");
    test_fixture(transform_fixture, "inlines-with-directive.graphql", "inline_fragments/fixtures/inlines-with-directive.expected", input, expected);
}
