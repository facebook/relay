/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<ba74a13601724e7f5a7d471becb16ed9>>
 */

mod provided_variable_fragment_transform;

use provided_variable_fragment_transform::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn anon_fragment_spread() {
    let input = include_str!("provided_variable_fragment_transform/fixtures/anon_fragment_spread.graphql");
    let expected = include_str!("provided_variable_fragment_transform/fixtures/anon_fragment_spread.expected");
    test_fixture(transform_fixture, file!(), "anon_fragment_spread.graphql", "provided_variable_fragment_transform/fixtures/anon_fragment_spread.expected", input, expected).await;
}

#[tokio::test]
async fn conflict_warn_infrequent_definitions() {
    let input = include_str!("provided_variable_fragment_transform/fixtures/conflict_warn_infrequent_definitions.graphql");
    let expected = include_str!("provided_variable_fragment_transform/fixtures/conflict_warn_infrequent_definitions.expected");
    test_fixture(transform_fixture, file!(), "conflict_warn_infrequent_definitions.graphql", "provided_variable_fragment_transform/fixtures/conflict_warn_infrequent_definitions.expected", input, expected).await;
}

#[tokio::test]
async fn conflicting_modules_invalid() {
    let input = include_str!("provided_variable_fragment_transform/fixtures/conflicting_modules_invalid.graphql");
    let expected = include_str!("provided_variable_fragment_transform/fixtures/conflicting_modules_invalid.expected");
    test_fixture(transform_fixture, file!(), "conflicting_modules_invalid.graphql", "provided_variable_fragment_transform/fixtures/conflicting_modules_invalid.expected", input, expected).await;
}

#[tokio::test]
async fn conflicting_types_invalid() {
    let input = include_str!("provided_variable_fragment_transform/fixtures/conflicting_types_invalid.graphql");
    let expected = include_str!("provided_variable_fragment_transform/fixtures/conflicting_types_invalid.expected");
    test_fixture(transform_fixture, file!(), "conflicting_types_invalid.graphql", "provided_variable_fragment_transform/fixtures/conflicting_types_invalid.expected", input, expected).await;
}

#[tokio::test]
async fn multiple_fragments() {
    let input = include_str!("provided_variable_fragment_transform/fixtures/multiple_fragments.graphql");
    let expected = include_str!("provided_variable_fragment_transform/fixtures/multiple_fragments.expected");
    test_fixture(transform_fixture, file!(), "multiple_fragments.graphql", "provided_variable_fragment_transform/fixtures/multiple_fragments.expected", input, expected).await;
}

#[tokio::test]
async fn rename_provided_variables() {
    let input = include_str!("provided_variable_fragment_transform/fixtures/rename_provided_variables.graphql");
    let expected = include_str!("provided_variable_fragment_transform/fixtures/rename_provided_variables.expected");
    test_fixture(transform_fixture, file!(), "rename_provided_variables.graphql", "provided_variable_fragment_transform/fixtures/rename_provided_variables.expected", input, expected).await;
}

#[tokio::test]
async fn single_fragment() {
    let input = include_str!("provided_variable_fragment_transform/fixtures/single_fragment.graphql");
    let expected = include_str!("provided_variable_fragment_transform/fixtures/single_fragment.expected");
    test_fixture(transform_fixture, file!(), "single_fragment.graphql", "provided_variable_fragment_transform/fixtures/single_fragment.expected", input, expected).await;
}
