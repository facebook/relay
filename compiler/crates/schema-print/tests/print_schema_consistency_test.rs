/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<1ea4c9b9d9ecb24b74dc2dceda61180d>>
 */

mod print_schema_consistency;

use print_schema_consistency::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn kitchen_sink() {
    let input = include_str!("print_schema_consistency/fixtures/kitchen-sink.graphql");
    let expected = include_str!("print_schema_consistency/fixtures/kitchen-sink.expected");
    test_fixture(transform_fixture, file!(), "kitchen-sink.graphql", "print_schema_consistency/fixtures/kitchen-sink.expected", input, expected).await;
}

#[tokio::test]
async fn no_schema() {
    let input = include_str!("print_schema_consistency/fixtures/no-schema.graphql");
    let expected = include_str!("print_schema_consistency/fixtures/no-schema.expected");
    test_fixture(transform_fixture, file!(), "no-schema.graphql", "print_schema_consistency/fixtures/no-schema.expected", input, expected).await;
}
