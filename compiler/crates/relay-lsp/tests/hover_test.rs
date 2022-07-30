/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<6daa50c6d4e1f509314b7c28a29bf686>>
 */

mod hover;

use hover::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn fragment_definition_name() {
    let input = include_str!("hover/fixtures/fragment_definition_name.graphql");
    let expected = include_str!("hover/fixtures/fragment_definition_name.expected");
    test_fixture(transform_fixture, "fragment_definition_name.graphql", "hover/fixtures/fragment_definition_name.expected", input, expected);
}

#[test]
fn fragment_spread() {
    let input = include_str!("hover/fixtures/fragment_spread.graphql");
    let expected = include_str!("hover/fixtures/fragment_spread.expected");
    test_fixture(transform_fixture, "fragment_spread.graphql", "hover/fixtures/fragment_spread.expected", input, expected);
}

#[test]
fn scalar_field_from_client_schema_extension() {
    let input = include_str!("hover/fixtures/scalar_field_from_client_schema_extension.graphql");
    let expected = include_str!("hover/fixtures/scalar_field_from_client_schema_extension.expected");
    test_fixture(transform_fixture, "scalar_field_from_client_schema_extension.graphql", "hover/fixtures/scalar_field_from_client_schema_extension.expected", input, expected);
}

#[test]
fn scalar_field_from_relay_resolver() {
    let input = include_str!("hover/fixtures/scalar_field_from_relay_resolver.graphql");
    let expected = include_str!("hover/fixtures/scalar_field_from_relay_resolver.expected");
    test_fixture(transform_fixture, "scalar_field_from_relay_resolver.graphql", "hover/fixtures/scalar_field_from_relay_resolver.expected", input, expected);
}

#[test]
fn scalar_field_with_description() {
    let input = include_str!("hover/fixtures/scalar_field_with_description.graphql");
    let expected = include_str!("hover/fixtures/scalar_field_with_description.expected");
    test_fixture(transform_fixture, "scalar_field_with_description.graphql", "hover/fixtures/scalar_field_with_description.expected", input, expected);
}

#[test]
fn whitespace_after_query_selection() {
    let input = include_str!("hover/fixtures/whitespace_after_query_selection.graphql");
    let expected = include_str!("hover/fixtures/whitespace_after_query_selection.expected");
    test_fixture(transform_fixture, "whitespace_after_query_selection.graphql", "hover/fixtures/whitespace_after_query_selection.expected", input, expected);
}

#[test]
fn whitespace_within_linked_field_selection() {
    let input = include_str!("hover/fixtures/whitespace_within_linked_field_selection.graphql");
    let expected = include_str!("hover/fixtures/whitespace_within_linked_field_selection.expected");
    test_fixture(transform_fixture, "whitespace_within_linked_field_selection.graphql", "hover/fixtures/whitespace_within_linked_field_selection.expected", input, expected);
}
