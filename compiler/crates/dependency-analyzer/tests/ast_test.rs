/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<babc00644f7a5af63db116b0832972ff>>
 */

mod ast;

use ast::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn base_definitions() {
    let input = include_str!("ast/fixtures/base-definitions.graphql");
    let expected = include_str!("ast/fixtures/base-definitions.expected");
    test_fixture(transform_fixture, file!(), "base-definitions.graphql", "ast/fixtures/base-definitions.expected", input, expected).await;
}

#[tokio::test]
async fn definitions_only() {
    let input = include_str!("ast/fixtures/definitions-only.graphql");
    let expected = include_str!("ast/fixtures/definitions-only.expected");
    test_fixture(transform_fixture, file!(), "definitions-only.graphql", "ast/fixtures/definitions-only.expected", input, expected).await;
}

#[tokio::test]
async fn missing_fragments() {
    let input = include_str!("ast/fixtures/missing-fragments.graphql");
    let expected = include_str!("ast/fixtures/missing-fragments.expected");
    test_fixture(transform_fixture, file!(), "missing-fragments.graphql", "ast/fixtures/missing-fragments.expected", input, expected).await;
}

#[tokio::test]
async fn multiple_base_definitions() {
    let input = include_str!("ast/fixtures/multiple-base-definitions.graphql");
    let expected = include_str!("ast/fixtures/multiple-base-definitions.expected");
    test_fixture(transform_fixture, file!(), "multiple-base-definitions.graphql", "ast/fixtures/multiple-base-definitions.expected", input, expected).await;
}
