/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<2be2d03ad0abd59a3759d6b5cbf7e6e5>>
 */

mod json_codegen;

use json_codegen::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn kitchen_sink() {
    let input = include_str!("json_codegen/fixtures/kitchen-sink.graphql");
    let expected = include_str!("json_codegen/fixtures/kitchen-sink.expected");
    test_fixture(transform_fixture, "kitchen-sink.graphql", "json_codegen/fixtures/kitchen-sink.expected", input, expected).await;
}

#[tokio::test]
async fn stable_literals() {
    let input = include_str!("json_codegen/fixtures/stable-literals.graphql");
    let expected = include_str!("json_codegen/fixtures/stable-literals.expected");
    test_fixture(transform_fixture, "stable-literals.graphql", "json_codegen/fixtures/stable-literals.expected", input, expected).await;
}
