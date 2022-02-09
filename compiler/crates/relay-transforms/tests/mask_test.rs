/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<06cfcd9a6d5345cf8fba25d3382362fa>>
 */

mod mask;

use mask::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn mask_mixed_null() {
    let input = include_str!("mask/fixtures/mask-mixed-null.graphql");
    let expected = include_str!("mask/fixtures/mask-mixed-null.expected");
    test_fixture(transform_fixture, "mask-mixed-null.graphql", "mask/fixtures/mask-mixed-null.expected", input, expected);
}

#[test]
fn relay_mask_transform() {
    let input = include_str!("mask/fixtures/relay-mask-transform.graphql");
    let expected = include_str!("mask/fixtures/relay-mask-transform.expected");
    test_fixture(transform_fixture, "relay-mask-transform.graphql", "mask/fixtures/relay-mask-transform.expected", input, expected);
}
