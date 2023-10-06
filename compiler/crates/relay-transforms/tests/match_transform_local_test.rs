/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<ee8f5eb7708960663dcf395974e3a9bd>>
 */

mod match_transform_local;

use match_transform_local::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn module_on_field_without_js() {
    let input = include_str!("match_transform_local/fixtures/module-on-field-without-js.graphql");
    let expected = include_str!("match_transform_local/fixtures/module-on-field-without-js.expected");
    test_fixture(transform_fixture, "module-on-field-without-js.graphql", "match_transform_local/fixtures/module-on-field-without-js.expected", input, expected).await;
}

#[tokio::test]
async fn module_without_match() {
    let input = include_str!("match_transform_local/fixtures/module-without-match.graphql");
    let expected = include_str!("match_transform_local/fixtures/module-without-match.expected");
    test_fixture(transform_fixture, "module-without-match.graphql", "match_transform_local/fixtures/module-without-match.expected", input, expected).await;
}
