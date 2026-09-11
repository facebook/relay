/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<37d02700df2f6f83255b814c77355c67>>
 */

mod throw_on_field_error_directive_codegen;

use throw_on_field_error_directive_codegen::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn throw_on_field_error_fragment_directive() {
    let input = include_str!("throw_on_field_error_directive_codegen/fixtures/throw_on_field_error_fragment_directive.graphql");
    let expected = include_str!("throw_on_field_error_directive_codegen/fixtures/throw_on_field_error_fragment_directive.expected");
    test_fixture(transform_fixture, file!(), "throw_on_field_error_fragment_directive.graphql", "throw_on_field_error_directive_codegen/fixtures/throw_on_field_error_fragment_directive.expected", input, expected).await;
}

#[tokio::test]
async fn throw_on_field_error_query_directive() {
    let input = include_str!("throw_on_field_error_directive_codegen/fixtures/throw_on_field_error_query_directive.graphql");
    let expected = include_str!("throw_on_field_error_directive_codegen/fixtures/throw_on_field_error_query_directive.expected");
    test_fixture(transform_fixture, file!(), "throw_on_field_error_query_directive.graphql", "throw_on_field_error_directive_codegen/fixtures/throw_on_field_error_query_directive.expected", input, expected).await;
}
