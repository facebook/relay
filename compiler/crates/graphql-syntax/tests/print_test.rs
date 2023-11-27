/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<a888d20dda7d424f68b6991c6c471874>>
 */

mod print;

use print::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn schema() {
    let input = include_str!("print/fixtures/schema.graphql");
    let expected = include_str!("print/fixtures/schema.expected");
    test_fixture(transform_fixture, file!(), "schema.graphql", "print/fixtures/schema.expected", input, expected).await;
}
