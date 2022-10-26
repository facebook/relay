/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<d7f6b07657a47f42fd7e757781d23210>>
 */

mod required_directive_codegen;

use required_directive_codegen::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn required_directive() {
    let input = include_str!("required_directive_codegen/fixtures/required_directive.graphql");
    let expected = include_str!("required_directive_codegen/fixtures/required_directive.expected");
    test_fixture(transform_fixture, "required_directive.graphql", "required_directive_codegen/fixtures/required_directive.expected", input, expected);
}

#[test]
fn required_linked_field() {
    let input = include_str!("required_directive_codegen/fixtures/required_linked_field.graphql");
    let expected = include_str!("required_directive_codegen/fixtures/required_linked_field.expected");
    test_fixture(transform_fixture, "required_linked_field.graphql", "required_directive_codegen/fixtures/required_linked_field.expected", input, expected);
}
