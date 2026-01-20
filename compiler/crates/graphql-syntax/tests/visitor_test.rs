/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<0000000000000000000000000000000000>>
 */

mod visitor;

use visitor::transform_fixture;
use visitor::transform_schema_fixture;
use fixture_tests::test_fixture;

// Executable document tests

#[tokio::test]
async fn kitchen_sink() {
    let input = include_str!("visitor/fixtures/kitchen_sink.graphql");
    let expected = include_str!("visitor/fixtures/kitchen_sink.expected");
    test_fixture(transform_fixture, file!(), "kitchen_sink.graphql", "visitor/fixtures/kitchen_sink.expected", input, expected).await;
}

#[tokio::test]
async fn nested_fragments() {
    let input = include_str!("visitor/fixtures/nested_fragments.graphql");
    let expected = include_str!("visitor/fixtures/nested_fragments.expected");
    test_fixture(transform_fixture, file!(), "nested_fragments.graphql", "visitor/fixtures/nested_fragments.expected", input, expected).await;
}

#[tokio::test]
async fn variable_definitions() {
    let input = include_str!("visitor/fixtures/variable_definitions.graphql");
    let expected = include_str!("visitor/fixtures/variable_definitions.expected");
    test_fixture(transform_fixture, file!(), "variable_definitions.graphql", "visitor/fixtures/variable_definitions.expected", input, expected).await;
}

// Schema document tests

#[tokio::test]
async fn schema_kitchen_sink() {
    let input = include_str!("visitor/fixtures/schema_kitchen_sink.graphql");
    let expected = include_str!("visitor/fixtures/schema_kitchen_sink.expected");
    test_fixture(transform_schema_fixture, file!(), "schema_kitchen_sink.graphql", "visitor/fixtures/schema_kitchen_sink.expected", input, expected).await;
}

#[tokio::test]
async fn schema_with_directives() {
    let input = include_str!("visitor/fixtures/schema_with_directives.graphql");
    let expected = include_str!("visitor/fixtures/schema_with_directives.expected");
    test_fixture(transform_schema_fixture, file!(), "schema_with_directives.graphql", "visitor/fixtures/schema_with_directives.expected", input, expected).await;
}

#[tokio::test]
async fn schema_extensions() {
    let input = include_str!("visitor/fixtures/schema_extensions.graphql");
    let expected = include_str!("visitor/fixtures/schema_extensions.expected");
    test_fixture(transform_schema_fixture, file!(), "schema_extensions.graphql", "visitor/fixtures/schema_extensions.expected", input, expected).await;
}
