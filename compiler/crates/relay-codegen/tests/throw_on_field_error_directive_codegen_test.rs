/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<aea344e4694feacdac36a9b485015e07>>
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
async fn throw_on_field_error_mutation_directive() {
    let input = include_str!("throw_on_field_error_directive_codegen/fixtures/throw_on_field_error_mutation_directive.graphql");
    let expected = include_str!("throw_on_field_error_directive_codegen/fixtures/throw_on_field_error_mutation_directive.expected");
    test_fixture(transform_fixture, file!(), "throw_on_field_error_mutation_directive.graphql", "throw_on_field_error_directive_codegen/fixtures/throw_on_field_error_mutation_directive.expected", input, expected).await;
}
