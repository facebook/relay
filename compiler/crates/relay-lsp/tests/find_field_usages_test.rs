/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<1ca9d7eb11468f905882356aaeae390b>>
 */

mod find_field_usages;

use find_field_usages::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn find_subtype() {
    let input = include_str!("find_field_usages/fixtures/find_subtype.graphql");
    let expected = include_str!("find_field_usages/fixtures/find_subtype.expected");
    test_fixture(transform_fixture, "find_subtype.graphql", "find_field_usages/fixtures/find_subtype.expected", input, expected);
}

#[test]
fn find_supertype() {
    let input = include_str!("find_field_usages/fixtures/find_supertype.graphql");
    let expected = include_str!("find_field_usages/fixtures/find_supertype.expected");
    test_fixture(transform_fixture, "find_supertype.graphql", "find_field_usages/fixtures/find_supertype.expected", input, expected);
}

#[test]
fn fragment_field() {
    let input = include_str!("find_field_usages/fixtures/fragment_field.graphql");
    let expected = include_str!("find_field_usages/fixtures/fragment_field.expected");
    test_fixture(transform_fixture, "fragment_field.graphql", "find_field_usages/fixtures/fragment_field.expected", input, expected);
}

#[test]
fn fragment_field_nomatch() {
    let input = include_str!("find_field_usages/fixtures/fragment_field.nomatch.graphql");
    let expected = include_str!("find_field_usages/fixtures/fragment_field.nomatch.expected");
    test_fixture(transform_fixture, "fragment_field.nomatch.graphql", "find_field_usages/fixtures/fragment_field.nomatch.expected", input, expected);
}

#[test]
fn inline_fragment() {
    let input = include_str!("find_field_usages/fixtures/inline_fragment.graphql");
    let expected = include_str!("find_field_usages/fixtures/inline_fragment.expected");
    test_fixture(transform_fixture, "inline_fragment.graphql", "find_field_usages/fixtures/inline_fragment.expected", input, expected);
}

#[test]
fn inline_fragment_also_matches_outer_type() {
    let input = include_str!("find_field_usages/fixtures/inline_fragment_also_matches_outer_type.graphql");
    let expected = include_str!("find_field_usages/fixtures/inline_fragment_also_matches_outer_type.expected");
    test_fixture(transform_fixture, "inline_fragment_also_matches_outer_type.graphql", "find_field_usages/fixtures/inline_fragment_also_matches_outer_type.expected", input, expected);
}

#[test]
fn linked_field() {
    let input = include_str!("find_field_usages/fixtures/linked_field.graphql");
    let expected = include_str!("find_field_usages/fixtures/linked_field.expected");
    test_fixture(transform_fixture, "linked_field.graphql", "find_field_usages/fixtures/linked_field.expected", input, expected);
}

#[test]
fn linked_field_nomatch() {
    let input = include_str!("find_field_usages/fixtures/linked_field.nomatch.graphql");
    let expected = include_str!("find_field_usages/fixtures/linked_field.nomatch.expected");
    test_fixture(transform_fixture, "linked_field.nomatch.graphql", "find_field_usages/fixtures/linked_field.nomatch.expected", input, expected);
}

#[test]
fn multiple_matches() {
    let input = include_str!("find_field_usages/fixtures/multiple_matches.graphql");
    let expected = include_str!("find_field_usages/fixtures/multiple_matches.expected");
    test_fixture(transform_fixture, "multiple_matches.graphql", "find_field_usages/fixtures/multiple_matches.expected", input, expected);
}

#[test]
fn query_field() {
    let input = include_str!("find_field_usages/fixtures/query_field.graphql");
    let expected = include_str!("find_field_usages/fixtures/query_field.expected");
    test_fixture(transform_fixture, "query_field.graphql", "find_field_usages/fixtures/query_field.expected", input, expected);
}
