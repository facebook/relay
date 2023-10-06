/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b92e818e9a3cf703711f64b459b67c1a>>
 */

mod required_directive_codegen;

use required_directive_codegen::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn required_directive() {
    let input = include_str!("required_directive_codegen/fixtures/required_directive.graphql");
    let expected = include_str!("required_directive_codegen/fixtures/required_directive.expected");
    test_fixture(transform_fixture, "required_directive.graphql", "required_directive_codegen/fixtures/required_directive.expected", input, expected).await;
}

#[tokio::test]
async fn required_linked_field() {
    let input = include_str!("required_directive_codegen/fixtures/required_linked_field.graphql");
    let expected = include_str!("required_directive_codegen/fixtures/required_linked_field.expected");
    test_fixture(transform_fixture, "required_linked_field.graphql", "required_directive_codegen/fixtures/required_linked_field.expected", input, expected).await;
}
