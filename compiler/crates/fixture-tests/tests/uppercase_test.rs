/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<243baf95062016610d80387505b888e9>>
 */

mod uppercase;

use uppercase::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn hello() {
    let input = include_str!("uppercase/fixtures/hello.txt");
    let expected = include_str!("uppercase/fixtures/hello.expected");
    test_fixture(transform_fixture, "hello.txt", "uppercase/fixtures/hello.expected", input, expected).await;
}

#[tokio::test]
async fn world() {
    let input = include_str!("uppercase/fixtures/world.txt");
    let expected = include_str!("uppercase/fixtures/world.expected");
    test_fixture(transform_fixture, "world.txt", "uppercase/fixtures/world.expected", input, expected).await;
}
