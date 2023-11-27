/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<1a87e4dd8afcddaaad9bfe4324a07ce6>>
 */

mod match_transform_local;

use match_transform_local::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn module_on_field_without_js() {
    let input = include_str!("match_transform_local/fixtures/module-on-field-without-js.graphql");
    let expected = include_str!("match_transform_local/fixtures/module-on-field-without-js.expected");
    test_fixture(transform_fixture, file!(), "module-on-field-without-js.graphql", "match_transform_local/fixtures/module-on-field-without-js.expected", input, expected).await;
}

#[tokio::test]
async fn module_without_match() {
    let input = include_str!("match_transform_local/fixtures/module-without-match.graphql");
    let expected = include_str!("match_transform_local/fixtures/module-without-match.expected");
    test_fixture(transform_fixture, file!(), "module-without-match.graphql", "match_transform_local/fixtures/module-without-match.expected", input, expected).await;
}
