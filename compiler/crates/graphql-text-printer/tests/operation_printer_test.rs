/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<984b72363f1562fb67037c5a7b76f244>>
 */

mod operation_printer;

use operation_printer::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn field_arguments() {
    let input = include_str!("operation_printer/fixtures/field-arguments.graphql");
    let expected = include_str!("operation_printer/fixtures/field-arguments.expected");
    test_fixture(transform_fixture, file!(), "field-arguments.graphql", "operation_printer/fixtures/field-arguments.expected", input, expected).await;
}

#[tokio::test]
async fn multiple_queries_with_same_fragment() {
    let input = include_str!("operation_printer/fixtures/multiple-queries-with-same-fragment.graphql");
    let expected = include_str!("operation_printer/fixtures/multiple-queries-with-same-fragment.expected");
    test_fixture(transform_fixture, file!(), "multiple-queries-with-same-fragment.graphql", "operation_printer/fixtures/multiple-queries-with-same-fragment.expected", input, expected).await;
}

#[tokio::test]
async fn query_variables() {
    let input = include_str!("operation_printer/fixtures/query-variables.graphql");
    let expected = include_str!("operation_printer/fixtures/query-variables.expected");
    test_fixture(transform_fixture, file!(), "query-variables.graphql", "operation_printer/fixtures/query-variables.expected", input, expected).await;
}

#[tokio::test]
async fn query_with_fragment_spreads() {
    let input = include_str!("operation_printer/fixtures/query-with-fragment-spreads.graphql");
    let expected = include_str!("operation_printer/fixtures/query-with-fragment-spreads.expected");
    test_fixture(transform_fixture, file!(), "query-with-fragment-spreads.graphql", "operation_printer/fixtures/query-with-fragment-spreads.expected", input, expected).await;
}

#[tokio::test]
async fn query_with_nested_fragment_srpeads() {
    let input = include_str!("operation_printer/fixtures/query-with-nested-fragment-srpeads.graphql");
    let expected = include_str!("operation_printer/fixtures/query-with-nested-fragment-srpeads.expected");
    test_fixture(transform_fixture, file!(), "query-with-nested-fragment-srpeads.graphql", "operation_printer/fixtures/query-with-nested-fragment-srpeads.expected", input, expected).await;
}
