/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<3d46ef5fd2e2fa8fcf424214d11318aa>>
 */

mod inline_fragments;

use inline_fragments::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn inlines_nested_fragments() {
    let input = include_str!("inline_fragments/fixtures/inlines-nested-fragments.graphql");
    let expected = include_str!("inline_fragments/fixtures/inlines-nested-fragments.expected");
    test_fixture(transform_fixture, "inlines-nested-fragments.graphql", "inline_fragments/fixtures/inlines-nested-fragments.expected", input, expected).await;
}

#[tokio::test]
async fn inlines_with_directive() {
    let input = include_str!("inline_fragments/fixtures/inlines-with-directive.graphql");
    let expected = include_str!("inline_fragments/fixtures/inlines-with-directive.expected");
    test_fixture(transform_fixture, "inlines-with-directive.graphql", "inline_fragments/fixtures/inlines-with-directive.expected", input, expected).await;
}
