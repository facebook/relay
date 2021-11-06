/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<dadb433ab0708d4d2a8e7bd25c6a1c92>>
 */

mod subscription_transform;

use subscription_transform::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn subscription_transform() {
    let input = include_str!("subscription_transform/fixtures/subscription_transform.graphql");
    let expected = include_str!("subscription_transform/fixtures/subscription_transform.expected");
    test_fixture(transform_fixture, "subscription_transform.graphql", "subscription_transform/fixtures/subscription_transform.expected", input, expected);
}

#[test]
fn subscription_transform_noop_no_js_field() {
    let input = include_str!("subscription_transform/fixtures/subscription_transform_noop_no_js_field.graphql");
    let expected = include_str!("subscription_transform/fixtures/subscription_transform_noop_no_js_field.expected");
    test_fixture(transform_fixture, "subscription_transform_noop_no_js_field.graphql", "subscription_transform/fixtures/subscription_transform_noop_no_js_field.expected", input, expected);
}

#[test]
fn subscription_transform_noop_no_spread() {
    let input = include_str!("subscription_transform/fixtures/subscription_transform_noop_no_spread.graphql");
    let expected = include_str!("subscription_transform/fixtures/subscription_transform_noop_no_spread.expected");
    test_fixture(transform_fixture, "subscription_transform_noop_no_spread.graphql", "subscription_transform/fixtures/subscription_transform_noop_no_spread.expected", input, expected);
}

#[test]
fn subscription_transform_noop_two_selections() {
    let input = include_str!("subscription_transform/fixtures/subscription_transform_noop_two_selections.graphql");
    let expected = include_str!("subscription_transform/fixtures/subscription_transform_noop_two_selections.expected");
    test_fixture(transform_fixture, "subscription_transform_noop_two_selections.graphql", "subscription_transform/fixtures/subscription_transform_noop_two_selections.expected", input, expected);
}
