/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<caafbf6cc546eaff56e3bf378a475e26>>
 */

mod extract;

use extract::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn arguments() {
    let input = include_str!("extract/fixtures/arguments.js");
    let expected = include_str!("extract/fixtures/arguments.expected");
    test_fixture(transform_fixture, file!(), "arguments.js", "extract/fixtures/arguments.expected", input, expected).await;
}

#[tokio::test]
async fn functions_unsupported() {
    let input = include_str!("extract/fixtures/functions.unsupported.js");
    let expected = include_str!("extract/fixtures/functions.unsupported.expected");
    test_fixture(transform_fixture, file!(), "functions.unsupported.js", "extract/fixtures/functions.unsupported.expected", input, expected).await;
}

#[tokio::test]
async fn generics() {
    let input = include_str!("extract/fixtures/generics.js");
    let expected = include_str!("extract/fixtures/generics.expected");
    test_fixture(transform_fixture, file!(), "generics.js", "extract/fixtures/generics.expected", input, expected).await;
}

#[tokio::test]
async fn plural_optional() {
    let input = include_str!("extract/fixtures/plural-optional.js");
    let expected = include_str!("extract/fixtures/plural-optional.expected");
    test_fixture(transform_fixture, file!(), "plural-optional.js", "extract/fixtures/plural-optional.expected", input, expected).await;
}

#[tokio::test]
async fn primitives() {
    let input = include_str!("extract/fixtures/primitives.js");
    let expected = include_str!("extract/fixtures/primitives.expected");
    test_fixture(transform_fixture, file!(), "primitives.js", "extract/fixtures/primitives.expected", input, expected).await;
}
