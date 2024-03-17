/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<823286f8733a4925af9a58997f2b03a6>>
 */

mod mask;

use mask::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn mask_mixed_null() {
    let input = include_str!("mask/fixtures/mask-mixed-null.graphql");
    let expected = include_str!("mask/fixtures/mask-mixed-null.expected");
    test_fixture(transform_fixture, file!(), "mask-mixed-null.graphql", "mask/fixtures/mask-mixed-null.expected", input, expected).await;
}

#[tokio::test]
async fn relay_mask_transform() {
    let input = include_str!("mask/fixtures/relay-mask-transform.graphql");
    let expected = include_str!("mask/fixtures/relay-mask-transform.expected");
    test_fixture(transform_fixture, file!(), "relay-mask-transform.graphql", "mask/fixtures/relay-mask-transform.expected", input, expected).await;
}
