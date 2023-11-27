/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<1202650c9e42a6b47175ff4550f58ab5>>
 */

mod defer_stream;

use defer_stream::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn fragment_with_defer_default_label() {
    let input = include_str!("defer_stream/fixtures/fragment-with-defer-default-label.graphql");
    let expected = include_str!("defer_stream/fixtures/fragment-with-defer-default-label.expected");
    test_fixture(transform_fixture, file!(), "fragment-with-defer-default-label.graphql", "defer_stream/fixtures/fragment-with-defer-default-label.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_with_stream_default_label() {
    let input = include_str!("defer_stream/fixtures/fragment-with-stream-default-label.graphql");
    let expected = include_str!("defer_stream/fixtures/fragment-with-stream-default-label.expected");
    test_fixture(transform_fixture, file!(), "fragment-with-stream-default-label.graphql", "defer_stream/fixtures/fragment-with-stream-default-label.expected", input, expected).await;
}
