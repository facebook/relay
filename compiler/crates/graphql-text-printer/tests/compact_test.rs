/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<481acea758e645152bb6410ebadfb27c>>
 */

mod compact;

use compact::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn basic_directives() {
    let input = include_str!("compact/fixtures/basic_directives.graphql");
    let expected = include_str!("compact/fixtures/basic_directives.expected");
    test_fixture(transform_fixture, file!(), "basic_directives.graphql", "compact/fixtures/basic_directives.expected", input, expected).await;
}

#[tokio::test]
async fn basic_query() {
    let input = include_str!("compact/fixtures/basic_query.graphql");
    let expected = include_str!("compact/fixtures/basic_query.expected");
    test_fixture(transform_fixture, file!(), "basic_query.graphql", "compact/fixtures/basic_query.expected", input, expected).await;
}

#[tokio::test]
async fn basic_var_defs() {
    let input = include_str!("compact/fixtures/basic_var_defs.graphql");
    let expected = include_str!("compact/fixtures/basic_var_defs.expected");
    test_fixture(transform_fixture, file!(), "basic_var_defs.graphql", "compact/fixtures/basic_var_defs.expected", input, expected).await;
}

#[tokio::test]
async fn compact_test() {
    let input = include_str!("compact/fixtures/compact_test.graphql");
    let expected = include_str!("compact/fixtures/compact_test.expected");
    test_fixture(transform_fixture, file!(), "compact_test.graphql", "compact/fixtures/compact_test.expected", input, expected).await;
}

#[tokio::test]
async fn empty_args() {
    let input = include_str!("compact/fixtures/empty_args.graphql");
    let expected = include_str!("compact/fixtures/empty_args.expected");
    test_fixture(transform_fixture, file!(), "empty_args.graphql", "compact/fixtures/empty_args.expected", input, expected).await;
}

#[tokio::test]
async fn kitchen_sink() {
    let input = include_str!("compact/fixtures/kitchen-sink.graphql");
    let expected = include_str!("compact/fixtures/kitchen-sink.expected");
    test_fixture(transform_fixture, file!(), "kitchen-sink.graphql", "compact/fixtures/kitchen-sink.expected", input, expected).await;
}

#[tokio::test]
async fn single_value_array_of_objects() {
    let input = include_str!("compact/fixtures/single-value-array-of-objects.graphql");
    let expected = include_str!("compact/fixtures/single-value-array-of-objects.expected");
    test_fixture(transform_fixture, file!(), "single-value-array-of-objects.graphql", "compact/fixtures/single-value-array-of-objects.expected", input, expected).await;
}
