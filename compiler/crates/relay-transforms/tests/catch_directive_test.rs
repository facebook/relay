/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<0d778869d5fcb87fca920468356d4acc>>
 */

mod catch_directive;

use catch_directive::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn catch_usage() {
    let input = include_str!("catch_directive/fixtures/catch-usage.graphql");
    let expected = include_str!("catch_directive/fixtures/catch-usage.expected");
    test_fixture(transform_fixture, file!(), "catch-usage.graphql", "catch_directive/fixtures/catch-usage.expected", input, expected).await;
}
