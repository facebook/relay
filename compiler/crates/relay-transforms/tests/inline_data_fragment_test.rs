/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<238b6fdb89e0e9b03d9470ea14326584>>
 */

mod inline_data_fragment;

use inline_data_fragment::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn alias() {
    let input = include_str!("inline_data_fragment/fixtures/alias.graphql");
    let expected = include_str!("inline_data_fragment/fixtures/alias.expected");
    test_fixture(transform_fixture, file!(), "alias.graphql", "inline_data_fragment/fixtures/alias.expected", input, expected).await;
}

#[tokio::test]
async fn dangerously_unaliased() {
    let input = include_str!("inline_data_fragment/fixtures/dangerously_unaliased.graphql");
    let expected = include_str!("inline_data_fragment/fixtures/dangerously_unaliased.expected");
    test_fixture(transform_fixture, file!(), "dangerously_unaliased.graphql", "inline_data_fragment/fixtures/dangerously_unaliased.expected", input, expected).await;
}

#[tokio::test]
async fn recursive() {
    let input = include_str!("inline_data_fragment/fixtures/recursive.graphql");
    let expected = include_str!("inline_data_fragment/fixtures/recursive.expected");
    test_fixture(transform_fixture, file!(), "recursive.graphql", "inline_data_fragment/fixtures/recursive.expected", input, expected).await;
}

#[tokio::test]
async fn variables() {
    let input = include_str!("inline_data_fragment/fixtures/variables.graphql");
    let expected = include_str!("inline_data_fragment/fixtures/variables.expected");
    test_fixture(transform_fixture, file!(), "variables.graphql", "inline_data_fragment/fixtures/variables.expected", input, expected).await;
}
