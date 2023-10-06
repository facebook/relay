/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<6ee0c0b1903ff9915b858c3c4a9cf6a5>>
 */

mod print;

use print::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn schema() {
    let input = include_str!("print/fixtures/schema.graphql");
    let expected = include_str!("print/fixtures/schema.expected");
    test_fixture(transform_fixture, "schema.graphql", "print/fixtures/schema.expected", input, expected).await;
}
