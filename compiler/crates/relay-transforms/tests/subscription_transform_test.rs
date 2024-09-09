/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<3a17316c91cd48a125d5dee9541ceac1>>
 */

mod subscription_transform;

use subscription_transform::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn subscription_transform() {
    let input = include_str!("subscription_transform/fixtures/subscription_transform.graphql");
    let expected = include_str!("subscription_transform/fixtures/subscription_transform.expected");
    test_fixture(transform_fixture, file!(), "subscription_transform.graphql", "subscription_transform/fixtures/subscription_transform.expected", input, expected).await;
}

#[tokio::test]
async fn subscription_transform_noop_no_js_field() {
    let input = include_str!("subscription_transform/fixtures/subscription_transform_noop_no_js_field.graphql");
    let expected = include_str!("subscription_transform/fixtures/subscription_transform_noop_no_js_field.expected");
    test_fixture(transform_fixture, file!(), "subscription_transform_noop_no_js_field.graphql", "subscription_transform/fixtures/subscription_transform_noop_no_js_field.expected", input, expected).await;
}

#[tokio::test]
async fn subscription_transform_noop_no_spread() {
    let input = include_str!("subscription_transform/fixtures/subscription_transform_noop_no_spread.graphql");
    let expected = include_str!("subscription_transform/fixtures/subscription_transform_noop_no_spread.expected");
    test_fixture(transform_fixture, file!(), "subscription_transform_noop_no_spread.graphql", "subscription_transform/fixtures/subscription_transform_noop_no_spread.expected", input, expected).await;
}

#[tokio::test]
async fn subscription_transform_noop_two_selections() {
    let input = include_str!("subscription_transform/fixtures/subscription_transform_noop_two_selections.graphql");
    let expected = include_str!("subscription_transform/fixtures/subscription_transform_noop_two_selections.expected");
    test_fixture(transform_fixture, file!(), "subscription_transform_noop_two_selections.graphql", "subscription_transform/fixtures/subscription_transform_noop_two_selections.expected", input, expected).await;
}
