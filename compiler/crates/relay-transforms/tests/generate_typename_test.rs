/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<8459432821418914ae65bda3f9c9dec3>>
 */

mod generate_typename;

use generate_typename::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn type_name_does_not_exist() {
    let input = include_str!("generate_typename/fixtures/type-name-does-not-exist.graphql");
    let expected = include_str!("generate_typename/fixtures/type-name-does-not-exist.expected");
    test_fixture(transform_fixture, file!(), "type-name-does-not-exist.graphql", "generate_typename/fixtures/type-name-does-not-exist.expected", input, expected).await;
}

#[tokio::test]
async fn type_name_exists() {
    let input = include_str!("generate_typename/fixtures/type-name-exists.graphql");
    let expected = include_str!("generate_typename/fixtures/type-name-exists.expected");
    test_fixture(transform_fixture, file!(), "type-name-exists.graphql", "generate_typename/fixtures/type-name-exists.expected", input, expected).await;
}
