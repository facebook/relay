/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

mod hoist_query_selections;

use hoist_query_selections::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn basic_hoist() {
    let input = include_str!("hoist_query_selections/fixtures/basic_hoist.graphql");
    let expected = include_str!("hoist_query_selections/fixtures/basic_hoist.expected");
    test_fixture(transform_fixture, file!(), "basic_hoist.graphql", "hoist_query_selections/fixtures/basic_hoist.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_hoist() {
    let input = include_str!("hoist_query_selections/fixtures/fragment_hoist.graphql");
    let expected = include_str!("hoist_query_selections/fixtures/fragment_hoist.expected");
    test_fixture(transform_fixture, file!(), "fragment_hoist.graphql", "hoist_query_selections/fixtures/fragment_hoist.expected", input, expected).await;
}

#[tokio::test]
async fn multiple_query_selections() {
    let input = include_str!("hoist_query_selections/fixtures/multiple_query_selections.graphql");
    let expected = include_str!("hoist_query_selections/fixtures/multiple_query_selections.expected");
    test_fixture(transform_fixture, file!(), "multiple_query_selections.graphql", "hoist_query_selections/fixtures/multiple_query_selections.expected", input, expected).await;
}

#[tokio::test]
async fn conditional_hoist() {
    let input = include_str!("hoist_query_selections/fixtures/conditional_hoist.graphql");
    let expected = include_str!("hoist_query_selections/fixtures/conditional_hoist.expected");
    test_fixture(transform_fixture, file!(), "conditional_hoist.graphql", "hoist_query_selections/fixtures/conditional_hoist.expected", input, expected).await;
}

#[tokio::test]
async fn no_query_selections() {
    let input = include_str!("hoist_query_selections/fixtures/no_query_selections.graphql");
    let expected = include_str!("hoist_query_selections/fixtures/no_query_selections.expected");
    test_fixture(transform_fixture, file!(), "no_query_selections.graphql", "hoist_query_selections/fixtures/no_query_selections.expected", input, expected).await;
}

#[tokio::test]
async fn skip_on_query_field() {
    let input = include_str!("hoist_query_selections/fixtures/skip_on_query_field.graphql");
    let expected = include_str!("hoist_query_selections/fixtures/skip_on_query_field.expected");
    test_fixture(transform_fixture, file!(), "skip_on_query_field.graphql", "hoist_query_selections/fixtures/skip_on_query_field.expected", input, expected).await;
}

#[tokio::test]
async fn nested_conditions() {
    let input = include_str!("hoist_query_selections/fixtures/nested_conditions.graphql");
    let expected = include_str!("hoist_query_selections/fixtures/nested_conditions.expected");
    test_fixture(transform_fixture, file!(), "nested_conditions.graphql", "hoist_query_selections/fixtures/nested_conditions.expected", input, expected).await;
}

#[tokio::test]
async fn conditional_fragment_with_query_field() {
    let input = include_str!("hoist_query_selections/fixtures/conditional_fragment_with_query_field.graphql");
    let expected = include_str!("hoist_query_selections/fixtures/conditional_fragment_with_query_field.expected");
    test_fixture(transform_fixture, file!(), "conditional_fragment_with_query_field.graphql", "hoist_query_selections/fixtures/conditional_fragment_with_query_field.expected", input, expected).await;
}

#[tokio::test]
async fn conditional_inside_query_field() {
    let input = include_str!("hoist_query_selections/fixtures/conditional_inside_query_field.graphql");
    let expected = include_str!("hoist_query_selections/fixtures/conditional_inside_query_field.expected");
    test_fixture(transform_fixture, file!(), "conditional_inside_query_field.graphql", "hoist_query_selections/fixtures/conditional_inside_query_field.expected", input, expected).await;
}

#[tokio::test]
async fn mutation_error() {
    let input = include_str!("hoist_query_selections/fixtures/mutation_error.graphql");
    let expected = include_str!("hoist_query_selections/fixtures/mutation_error.expected");
    test_fixture(transform_fixture, file!(), "mutation_error.graphql", "hoist_query_selections/fixtures/mutation_error.expected", input, expected).await;
}
