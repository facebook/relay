/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<e779a3c82aab3df8d15ef5462a13009b>>
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
