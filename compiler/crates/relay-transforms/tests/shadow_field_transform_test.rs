/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<daa5a9cdcca69861444bc257f4aca1aa>>
 */

mod shadow_field_transform;

use shadow_field_transform::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn shadow_field_basic() {
    let input = include_str!("shadow_field_transform/fixtures/shadow_field_basic.graphql");
    let expected = include_str!("shadow_field_transform/fixtures/shadow_field_basic.expected");
    test_fixture(transform_fixture, file!(), "shadow_field_basic.graphql", "shadow_field_transform/fixtures/shadow_field_basic.expected", input, expected).await;
}

#[tokio::test]
async fn shadow_field_linked_field() {
    let input = include_str!("shadow_field_transform/fixtures/shadow_field_linked_field.graphql");
    let expected = include_str!("shadow_field_transform/fixtures/shadow_field_linked_field.expected");
    test_fixture(transform_fixture, file!(), "shadow_field_linked_field.graphql", "shadow_field_transform/fixtures/shadow_field_linked_field.expected", input, expected).await;
}
