/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<d7c419edac2dcee7d4dc274f8de5e31e>>
 */

mod print_schema_in_parallel;

use fixture_tests::test_fixture;
use print_schema_in_parallel::transform_fixture;

#[tokio::test]
async fn kitchen_sink() {
    let input = include_str!("print_schema_in_parallel/fixtures/kitchen-sink.graphql");
    let expected = include_str!("print_schema_in_parallel/fixtures/kitchen-sink.expected");
    test_fixture(transform_fixture, file!(), "kitchen-sink.graphql", "print_schema_in_parallel/fixtures/kitchen-sink.expected", input, expected).await;
}

#[tokio::test]
async fn no_schema() {
    let input = include_str!("print_schema_in_parallel/fixtures/no-schema.graphql");
    let expected = include_str!("print_schema_in_parallel/fixtures/no-schema.expected");
    test_fixture(transform_fixture, file!(), "no-schema.graphql", "print_schema_in_parallel/fixtures/no-schema.expected", input, expected).await;
}