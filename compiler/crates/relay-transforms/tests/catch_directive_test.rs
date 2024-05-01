/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<e2f734240659da6636b942f9c208764f>>
 */

mod catch_directive;

use catch_directive::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn catch_usage_invalid() {
    let input = include_str!("catch_directive/fixtures/catch-usage.invalid.graphql");
    let expected = include_str!("catch_directive/fixtures/catch-usage.invalid.expected");
    test_fixture(transform_fixture, file!(), "catch-usage.invalid.graphql", "catch_directive/fixtures/catch-usage.invalid.expected", input, expected).await;
}
