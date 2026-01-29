/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<517598dad58115fe478729b087af3fff>>
 */

mod catch_directive_codegen;

use catch_directive_codegen::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn catch_directive() {
    let input = include_str!("catch_directive_codegen/fixtures/catch_directive.graphql");
    let expected = include_str!("catch_directive_codegen/fixtures/catch_directive.expected");
    test_fixture(transform_fixture, file!(), "catch_directive.graphql", "catch_directive_codegen/fixtures/catch_directive.expected", input, expected).await;
}

#[tokio::test]
async fn catch_directive_aliased_inline_fragment() {
    let input = include_str!("catch_directive_codegen/fixtures/catch_directive_aliased_inline_fragment.graphql");
    let expected = include_str!("catch_directive_codegen/fixtures/catch_directive_aliased_inline_fragment.expected");
    test_fixture(transform_fixture, file!(), "catch_directive_aliased_inline_fragment.graphql", "catch_directive_codegen/fixtures/catch_directive_aliased_inline_fragment.expected", input, expected).await;
}

#[tokio::test]
async fn catch_directive_aliased_inline_fragment_no_condition() {
    let input = include_str!("catch_directive_codegen/fixtures/catch_directive_aliased_inline_fragment_no_condition.graphql");
    let expected = include_str!("catch_directive_codegen/fixtures/catch_directive_aliased_inline_fragment_no_condition.expected");
    test_fixture(transform_fixture, file!(), "catch_directive_aliased_inline_fragment_no_condition.graphql", "catch_directive_codegen/fixtures/catch_directive_aliased_inline_fragment_no_condition.expected", input, expected).await;
}

#[tokio::test]
async fn catch_directive_fragment() {
    let input = include_str!("catch_directive_codegen/fixtures/catch_directive_fragment.graphql");
    let expected = include_str!("catch_directive_codegen/fixtures/catch_directive_fragment.expected");
    test_fixture(transform_fixture, file!(), "catch_directive_fragment.graphql", "catch_directive_codegen/fixtures/catch_directive_fragment.expected", input, expected).await;
}

#[tokio::test]
async fn catch_directive_linked_child_has_to_result() {
    let input = include_str!("catch_directive_codegen/fixtures/catch_directive_linked_child_has_to_result.graphql");
    let expected = include_str!("catch_directive_codegen/fixtures/catch_directive_linked_child_has_to_result.expected");
    test_fixture(transform_fixture, file!(), "catch_directive_linked_child_has_to_result.graphql", "catch_directive_codegen/fixtures/catch_directive_linked_child_has_to_result.expected", input, expected).await;
}

#[tokio::test]
async fn catch_directive_linked_to_result() {
    let input = include_str!("catch_directive_codegen/fixtures/catch_directive_linked_to_result.graphql");
    let expected = include_str!("catch_directive_codegen/fixtures/catch_directive_linked_to_result.expected");
    test_fixture(transform_fixture, file!(), "catch_directive_linked_to_result.graphql", "catch_directive_codegen/fixtures/catch_directive_linked_to_result.expected", input, expected).await;
}

#[tokio::test]
async fn catch_directive_nested_catch() {
    let input = include_str!("catch_directive_codegen/fixtures/catch_directive_nested_catch.graphql");
    let expected = include_str!("catch_directive_codegen/fixtures/catch_directive_nested_catch.expected");
    test_fixture(transform_fixture, file!(), "catch_directive_nested_catch.graphql", "catch_directive_codegen/fixtures/catch_directive_nested_catch.expected", input, expected).await;
}

#[tokio::test]
async fn catch_directive_nested_linked_different_to() {
    let input = include_str!("catch_directive_codegen/fixtures/catch_directive_nested_linked_different_to.graphql");
    let expected = include_str!("catch_directive_codegen/fixtures/catch_directive_nested_linked_different_to.expected");
    test_fixture(transform_fixture, file!(), "catch_directive_nested_linked_different_to.graphql", "catch_directive_codegen/fixtures/catch_directive_nested_linked_different_to.expected", input, expected).await;
}

#[tokio::test]
async fn catch_directive_nested_linked_with_other_fields() {
    let input = include_str!("catch_directive_codegen/fixtures/catch_directive_nested_linked_with_other_fields.graphql");
    let expected = include_str!("catch_directive_codegen/fixtures/catch_directive_nested_linked_with_other_fields.expected");
    test_fixture(transform_fixture, file!(), "catch_directive_nested_linked_with_other_fields.graphql", "catch_directive_codegen/fixtures/catch_directive_nested_linked_with_other_fields.expected", input, expected).await;
}

#[tokio::test]
async fn catch_directive_no_args() {
    let input = include_str!("catch_directive_codegen/fixtures/catch_directive_no_args.graphql");
    let expected = include_str!("catch_directive_codegen/fixtures/catch_directive_no_args.expected");
    test_fixture(transform_fixture, file!(), "catch_directive_no_args.graphql", "catch_directive_codegen/fixtures/catch_directive_no_args.expected", input, expected).await;
}

#[tokio::test]
async fn catch_directive_null_arg() {
    let input = include_str!("catch_directive_codegen/fixtures/catch_directive_null_arg.graphql");
    let expected = include_str!("catch_directive_codegen/fixtures/catch_directive_null_arg.expected");
    test_fixture(transform_fixture, file!(), "catch_directive_null_arg.graphql", "catch_directive_codegen/fixtures/catch_directive_null_arg.expected", input, expected).await;
}

#[tokio::test]
async fn catch_directive_on_query() {
    let input = include_str!("catch_directive_codegen/fixtures/catch_directive_on_query.graphql");
    let expected = include_str!("catch_directive_codegen/fixtures/catch_directive_on_query.expected");
    test_fixture(transform_fixture, file!(), "catch_directive_on_query.graphql", "catch_directive_codegen/fixtures/catch_directive_on_query.expected", input, expected).await;
}
