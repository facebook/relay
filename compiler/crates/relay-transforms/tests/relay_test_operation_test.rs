/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<a38fba3d81114c6708ecab5cfdb3c230>>
 */

mod relay_test_operation;

use relay_test_operation::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn prod_query_invalid() {
    let input = include_str!("relay_test_operation/fixtures/prod_query.invalid.graphql");
    let expected = include_str!("relay_test_operation/fixtures/prod_query.invalid.expected");
    test_fixture(transform_fixture, file!(), "prod_query.invalid.graphql", "relay_test_operation/fixtures/prod_query.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn prod_query_with_argument() {
    let input = include_str!("relay_test_operation/fixtures/prod_query_with_argument.graphql");
    let expected = include_str!("relay_test_operation/fixtures/prod_query_with_argument.expected");
    test_fixture(transform_fixture, file!(), "prod_query_with_argument.graphql", "relay_test_operation/fixtures/prod_query_with_argument.expected", input, expected).await;
}

#[tokio::test]
async fn prod_query_with_argument_invalid() {
    let input = include_str!("relay_test_operation/fixtures/prod_query_with_argument.invalid.graphql");
    let expected = include_str!("relay_test_operation/fixtures/prod_query_with_argument.invalid.expected");
    test_fixture(transform_fixture, file!(), "prod_query_with_argument.invalid.graphql", "relay_test_operation/fixtures/prod_query_with_argument.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn test_client_fields_query() {
    let input = include_str!("relay_test_operation/fixtures/test_client_fields_query.graphql");
    let expected = include_str!("relay_test_operation/fixtures/test_client_fields_query.expected");
    test_fixture(transform_fixture, file!(), "test_client_fields_query.graphql", "relay_test_operation/fixtures/test_client_fields_query.expected", input, expected).await;
}

#[tokio::test]
async fn test_query_with_enums() {
    let input = include_str!("relay_test_operation/fixtures/test_query_with_enums.graphql");
    let expected = include_str!("relay_test_operation/fixtures/test_query_with_enums.expected");
    test_fixture(transform_fixture, file!(), "test_query_with_enums.graphql", "relay_test_operation/fixtures/test_query_with_enums.expected", input, expected).await;
}

#[tokio::test]
async fn test_simple_query() {
    let input = include_str!("relay_test_operation/fixtures/test_simple_query.graphql");
    let expected = include_str!("relay_test_operation/fixtures/test_simple_query.expected");
    test_fixture(transform_fixture, file!(), "test_simple_query.graphql", "relay_test_operation/fixtures/test_simple_query.expected", input, expected).await;
}
