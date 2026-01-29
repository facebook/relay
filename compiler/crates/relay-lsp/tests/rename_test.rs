/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<5b89214376a83bb1303b10019c567b47>>
 */

mod rename;

use rename::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn rename_fragment_argument_from_arguments_directive_on_fragment_spread_within() {
    let input = include_str!("rename/fixtures/rename_fragment_argument_from_arguments_directive_on_fragment_spread_within.graphql");
    let expected = include_str!("rename/fixtures/rename_fragment_argument_from_arguments_directive_on_fragment_spread_within.expected");
    test_fixture(transform_fixture, file!(), "rename_fragment_argument_from_arguments_directive_on_fragment_spread_within.graphql", "rename/fixtures/rename_fragment_argument_from_arguments_directive_on_fragment_spread_within.expected", input, expected).await;
}

#[tokio::test]
async fn rename_fragment_argument_from_definition() {
    let input = include_str!("rename/fixtures/rename_fragment_argument_from_definition.graphql");
    let expected = include_str!("rename/fixtures/rename_fragment_argument_from_definition.expected");
    test_fixture(transform_fixture, file!(), "rename_fragment_argument_from_definition.graphql", "rename/fixtures/rename_fragment_argument_from_definition.expected", input, expected).await;
}

#[tokio::test]
async fn rename_fragment_argument_from_fragment_spread() {
    let input = include_str!("rename/fixtures/rename_fragment_argument_from_fragment_spread.graphql");
    let expected = include_str!("rename/fixtures/rename_fragment_argument_from_fragment_spread.expected");
    test_fixture(transform_fixture, file!(), "rename_fragment_argument_from_fragment_spread.graphql", "rename/fixtures/rename_fragment_argument_from_fragment_spread.expected", input, expected).await;
}

#[tokio::test]
async fn rename_fragment_argument_from_within_fragment() {
    let input = include_str!("rename/fixtures/rename_fragment_argument_from_within_fragment.graphql");
    let expected = include_str!("rename/fixtures/rename_fragment_argument_from_within_fragment.expected");
    test_fixture(transform_fixture, file!(), "rename_fragment_argument_from_within_fragment.graphql", "rename/fixtures/rename_fragment_argument_from_within_fragment.expected", input, expected).await;
}

#[tokio::test]
async fn rename_fragment_argument_only_for_specific_fragment() {
    let input = include_str!("rename/fixtures/rename_fragment_argument_only_for_specific_fragment.graphql");
    let expected = include_str!("rename/fixtures/rename_fragment_argument_only_for_specific_fragment.expected");
    test_fixture(transform_fixture, file!(), "rename_fragment_argument_only_for_specific_fragment.graphql", "rename/fixtures/rename_fragment_argument_only_for_specific_fragment.expected", input, expected).await;
}

#[tokio::test]
async fn rename_fragment_from_definition() {
    let input = include_str!("rename/fixtures/rename_fragment_from_definition.graphql");
    let expected = include_str!("rename/fixtures/rename_fragment_from_definition.expected");
    test_fixture(transform_fixture, file!(), "rename_fragment_from_definition.graphql", "rename/fixtures/rename_fragment_from_definition.expected", input, expected).await;
}

#[tokio::test]
async fn rename_fragment_from_spread() {
    let input = include_str!("rename/fixtures/rename_fragment_from_spread.graphql");
    let expected = include_str!("rename/fixtures/rename_fragment_from_spread.expected");
    test_fixture(transform_fixture, file!(), "rename_fragment_from_spread.graphql", "rename/fixtures/rename_fragment_from_spread.expected", input, expected).await;
}

#[tokio::test]
async fn rename_fragment_variable_from_definition() {
    let input = include_str!("rename/fixtures/rename_fragment_variable_from_definition.graphql");
    let expected = include_str!("rename/fixtures/rename_fragment_variable_from_definition.expected");
    test_fixture(transform_fixture, file!(), "rename_fragment_variable_from_definition.graphql", "rename/fixtures/rename_fragment_variable_from_definition.expected", input, expected).await;
}

#[tokio::test]
async fn rename_fragment_variable_from_fragment_spread() {
    let input = include_str!("rename/fixtures/rename_fragment_variable_from_fragment_spread.graphql");
    let expected = include_str!("rename/fixtures/rename_fragment_variable_from_fragment_spread.expected");
    test_fixture(transform_fixture, file!(), "rename_fragment_variable_from_fragment_spread.graphql", "rename/fixtures/rename_fragment_variable_from_fragment_spread.expected", input, expected).await;
}

#[tokio::test]
async fn rename_fragment_variable_from_within_fragment() {
    let input = include_str!("rename/fixtures/rename_fragment_variable_from_within_fragment.graphql");
    let expected = include_str!("rename/fixtures/rename_fragment_variable_from_within_fragment.expected");
    test_fixture(transform_fixture, file!(), "rename_fragment_variable_from_within_fragment.graphql", "rename/fixtures/rename_fragment_variable_from_within_fragment.expected", input, expected).await;
}

#[tokio::test]
async fn rename_fragment_variable_only_for_specific_fragment() {
    let input = include_str!("rename/fixtures/rename_fragment_variable_only_for_specific_fragment.graphql");
    let expected = include_str!("rename/fixtures/rename_fragment_variable_only_for_specific_fragment.expected");
    test_fixture(transform_fixture, file!(), "rename_fragment_variable_only_for_specific_fragment.graphql", "rename/fixtures/rename_fragment_variable_only_for_specific_fragment.expected", input, expected).await;
}

#[tokio::test]
async fn rename_operation() {
    let input = include_str!("rename/fixtures/rename_operation.graphql");
    let expected = include_str!("rename/fixtures/rename_operation.expected");
    test_fixture(transform_fixture, file!(), "rename_operation.graphql", "rename/fixtures/rename_operation.expected", input, expected).await;
}

#[tokio::test]
async fn rename_variable_from_definition() {
    let input = include_str!("rename/fixtures/rename_variable_from_definition.graphql");
    let expected = include_str!("rename/fixtures/rename_variable_from_definition.expected");
    test_fixture(transform_fixture, file!(), "rename_variable_from_definition.graphql", "rename/fixtures/rename_variable_from_definition.expected", input, expected).await;
}

#[tokio::test]
async fn rename_variable_from_usage() {
    let input = include_str!("rename/fixtures/rename_variable_from_usage.graphql");
    let expected = include_str!("rename/fixtures/rename_variable_from_usage.expected");
    test_fixture(transform_fixture, file!(), "rename_variable_from_usage.graphql", "rename/fixtures/rename_variable_from_usage.expected", input, expected).await;
}

#[tokio::test]
async fn rename_variable_only_for_specific_operation() {
    let input = include_str!("rename/fixtures/rename_variable_only_for_specific_operation.graphql");
    let expected = include_str!("rename/fixtures/rename_variable_only_for_specific_operation.expected");
    test_fixture(transform_fixture, file!(), "rename_variable_only_for_specific_operation.graphql", "rename/fixtures/rename_variable_only_for_specific_operation.expected", input, expected).await;
}

#[tokio::test]
async fn rename_variable_without_definition_invalid() {
    let input = include_str!("rename/fixtures/rename_variable_without_definition.invalid.graphql");
    let expected = include_str!("rename/fixtures/rename_variable_without_definition.invalid.expected");
    test_fixture(transform_fixture, file!(), "rename_variable_without_definition.invalid.graphql", "rename/fixtures/rename_variable_without_definition.invalid.expected", input, expected).await;
}
