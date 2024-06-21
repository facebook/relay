/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<5a6476f3b75666c15c6b256baace7519>>
 */

mod defer_stream;

use defer_stream::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn fragment_with_defer() {
    let input = include_str!("defer_stream/fixtures/fragment-with-defer.graphql");
    let expected = include_str!("defer_stream/fixtures/fragment-with-defer.expected");
    test_fixture(transform_fixture, file!(), "fragment-with-defer.graphql", "defer_stream/fixtures/fragment-with-defer.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_with_defer_arguments() {
    let input = include_str!("defer_stream/fixtures/fragment-with-defer-arguments.graphql");
    let expected = include_str!("defer_stream/fixtures/fragment-with-defer-arguments.expected");
    test_fixture(transform_fixture, file!(), "fragment-with-defer-arguments.graphql", "defer_stream/fixtures/fragment-with-defer-arguments.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_with_defer_default_label() {
    let input = include_str!("defer_stream/fixtures/fragment-with-defer-default-label.graphql");
    let expected = include_str!("defer_stream/fixtures/fragment-with-defer-default-label.expected");
    test_fixture(transform_fixture, file!(), "fragment-with-defer-default-label.graphql", "defer_stream/fixtures/fragment-with-defer-default-label.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_with_defer_duplicate_label_invalid() {
    let input = include_str!("defer_stream/fixtures/fragment-with-defer-duplicate-label.invalid.graphql");
    let expected = include_str!("defer_stream/fixtures/fragment-with-defer-duplicate-label.invalid.expected");
    test_fixture(transform_fixture, file!(), "fragment-with-defer-duplicate-label.invalid.graphql", "defer_stream/fixtures/fragment-with-defer-duplicate-label.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_with_defer_if_arg() {
    let input = include_str!("defer_stream/fixtures/fragment-with-defer-if-arg.graphql");
    let expected = include_str!("defer_stream/fixtures/fragment-with-defer-if-arg.expected");
    test_fixture(transform_fixture, file!(), "fragment-with-defer-if-arg.graphql", "defer_stream/fixtures/fragment-with-defer-if-arg.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_with_defer_if_false() {
    let input = include_str!("defer_stream/fixtures/fragment-with-defer-if-false.graphql");
    let expected = include_str!("defer_stream/fixtures/fragment-with-defer-if-false.expected");
    test_fixture(transform_fixture, file!(), "fragment-with-defer-if-false.graphql", "defer_stream/fixtures/fragment-with-defer-if-false.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_with_defer_statically_disabled() {
    let input = include_str!("defer_stream/fixtures/fragment-with-defer-statically-disabled.graphql");
    let expected = include_str!("defer_stream/fixtures/fragment-with-defer-statically-disabled.expected");
    test_fixture(transform_fixture, file!(), "fragment-with-defer-statically-disabled.graphql", "defer_stream/fixtures/fragment-with-defer-statically-disabled.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_with_stream() {
    let input = include_str!("defer_stream/fixtures/fragment-with-stream.graphql");
    let expected = include_str!("defer_stream/fixtures/fragment-with-stream.expected");
    test_fixture(transform_fixture, file!(), "fragment-with-stream.graphql", "defer_stream/fixtures/fragment-with-stream.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_with_stream_default_label() {
    let input = include_str!("defer_stream/fixtures/fragment-with-stream-default-label.graphql");
    let expected = include_str!("defer_stream/fixtures/fragment-with-stream-default-label.expected");
    test_fixture(transform_fixture, file!(), "fragment-with-stream-default-label.graphql", "defer_stream/fixtures/fragment-with-stream-default-label.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_with_stream_duplicate_label_invalid() {
    let input = include_str!("defer_stream/fixtures/fragment-with-stream-duplicate-label.invalid.graphql");
    let expected = include_str!("defer_stream/fixtures/fragment-with-stream-duplicate-label.invalid.expected");
    test_fixture(transform_fixture, file!(), "fragment-with-stream-duplicate-label.invalid.graphql", "defer_stream/fixtures/fragment-with-stream-duplicate-label.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_with_stream_if_arg() {
    let input = include_str!("defer_stream/fixtures/fragment-with-stream-if-arg.graphql");
    let expected = include_str!("defer_stream/fixtures/fragment-with-stream-if-arg.expected");
    test_fixture(transform_fixture, file!(), "fragment-with-stream-if-arg.graphql", "defer_stream/fixtures/fragment-with-stream-if-arg.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_with_stream_initial_count_arg() {
    let input = include_str!("defer_stream/fixtures/fragment-with-stream-initial-count-arg.graphql");
    let expected = include_str!("defer_stream/fixtures/fragment-with-stream-initial-count-arg.expected");
    test_fixture(transform_fixture, file!(), "fragment-with-stream-initial-count-arg.graphql", "defer_stream/fixtures/fragment-with-stream-initial-count-arg.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_with_stream_missing_initial_count_arg_invalid() {
    let input = include_str!("defer_stream/fixtures/fragment-with-stream-missing-initial-count-arg.invalid.graphql");
    let expected = include_str!("defer_stream/fixtures/fragment-with-stream-missing-initial-count-arg.invalid.expected");
    test_fixture(transform_fixture, file!(), "fragment-with-stream-missing-initial-count-arg.invalid.graphql", "defer_stream/fixtures/fragment-with-stream-missing-initial-count-arg.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_with_stream_on_scalar_field_invalid() {
    let input = include_str!("defer_stream/fixtures/fragment-with-stream-on-scalar-field.invalid.graphql");
    let expected = include_str!("defer_stream/fixtures/fragment-with-stream-on-scalar-field.invalid.expected");
    test_fixture(transform_fixture, file!(), "fragment-with-stream-on-scalar-field.invalid.graphql", "defer_stream/fixtures/fragment-with-stream-on-scalar-field.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_with_stream_statically_disabled() {
    let input = include_str!("defer_stream/fixtures/fragment-with-stream-statically-disabled.graphql");
    let expected = include_str!("defer_stream/fixtures/fragment-with-stream-statically-disabled.expected");
    test_fixture(transform_fixture, file!(), "fragment-with-stream-statically-disabled.graphql", "defer_stream/fixtures/fragment-with-stream-statically-disabled.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_with_stream_use_customized_batch_arg() {
    let input = include_str!("defer_stream/fixtures/fragment-with-stream-use_customized_batch-arg.graphql");
    let expected = include_str!("defer_stream/fixtures/fragment-with-stream-use_customized_batch-arg.expected");
    test_fixture(transform_fixture, file!(), "fragment-with-stream-use_customized_batch-arg.graphql", "defer_stream/fixtures/fragment-with-stream-use_customized_batch-arg.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_with_stream_variable_label_invalid() {
    let input = include_str!("defer_stream/fixtures/fragment-with-stream-variable-label.invalid.graphql");
    let expected = include_str!("defer_stream/fixtures/fragment-with-stream-variable-label.invalid.expected");
    test_fixture(transform_fixture, file!(), "fragment-with-stream-variable-label.invalid.graphql", "defer_stream/fixtures/fragment-with-stream-variable-label.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_with_variable_label_invalid() {
    let input = include_str!("defer_stream/fixtures/fragment-with-variable-label.invalid.graphql");
    let expected = include_str!("defer_stream/fixtures/fragment-with-variable-label.invalid.expected");
    test_fixture(transform_fixture, file!(), "fragment-with-variable-label.invalid.graphql", "defer_stream/fixtures/fragment-with-variable-label.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn inline_fragment_with_defer_invalid() {
    let input = include_str!("defer_stream/fixtures/inline-fragment-with-defer.invalid.graphql");
    let expected = include_str!("defer_stream/fixtures/inline-fragment-with-defer.invalid.expected");
    test_fixture(transform_fixture, file!(), "inline-fragment-with-defer.invalid.graphql", "defer_stream/fixtures/inline-fragment-with-defer.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn query_with_defer() {
    let input = include_str!("defer_stream/fixtures/query-with-defer.graphql");
    let expected = include_str!("defer_stream/fixtures/query-with-defer.expected");
    test_fixture(transform_fixture, file!(), "query-with-defer.graphql", "defer_stream/fixtures/query-with-defer.expected", input, expected).await;
}

#[tokio::test]
async fn query_with_stream() {
    let input = include_str!("defer_stream/fixtures/query-with-stream.graphql");
    let expected = include_str!("defer_stream/fixtures/query-with-stream.expected");
    test_fixture(transform_fixture, file!(), "query-with-stream.graphql", "defer_stream/fixtures/query-with-stream.expected", input, expected).await;
}

#[tokio::test]
async fn stream_invalid() {
    let input = include_str!("defer_stream/fixtures/stream.invalid.graphql");
    let expected = include_str!("defer_stream/fixtures/stream.invalid.expected");
    test_fixture(transform_fixture, file!(), "stream.invalid.graphql", "defer_stream/fixtures/stream.invalid.expected", input, expected).await;
}
