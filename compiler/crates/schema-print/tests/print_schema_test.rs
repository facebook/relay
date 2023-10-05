/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<7e3cc8dc7e8627acf6d5a38887537efb>>
 */

mod print_schema;

use print_schema::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn kitchen_sink() {
    let input = include_str!("print_schema/fixtures/kitchen-sink.graphql");
    let expected = include_str!("print_schema/fixtures/kitchen-sink.expected");
    test_fixture(transform_fixture, "kitchen-sink.graphql", "print_schema/fixtures/kitchen-sink.expected", input, expected).await;
}

#[tokio::test]
async fn no_schema() {
    let input = include_str!("print_schema/fixtures/no-schema.graphql");
    let expected = include_str!("print_schema/fixtures/no-schema.expected");
    test_fixture(transform_fixture, "no-schema.graphql", "print_schema/fixtures/no-schema.expected", input, expected).await;
}
