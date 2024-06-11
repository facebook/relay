/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<aa9836218131c429df53f4fbbeacafad>>
 */

mod print_schema;

use print_schema::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn kitchen_sink() {
    let input = include_str!("print_schema/fixtures/kitchen-sink.graphql");
    let expected = include_str!("print_schema/fixtures/kitchen-sink.expected");
    test_fixture(transform_fixture, file!(), "kitchen-sink.graphql", "print_schema/fixtures/kitchen-sink.expected", input, expected).await;
}

#[tokio::test]
async fn no_schema() {
    let input = include_str!("print_schema/fixtures/no-schema.graphql");
    let expected = include_str!("print_schema/fixtures/no-schema.expected");
    test_fixture(transform_fixture, file!(), "no-schema.graphql", "print_schema/fixtures/no-schema.expected", input, expected).await;
}
