/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<708e29f86e0dd17944c1f5367368da39>>
 */

mod print_ast;

use print_ast::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn basic_arg_defs() {
    let input = include_str!("print_ast/fixtures/basic_arg_defs.graphql");
    let expected = include_str!("print_ast/fixtures/basic_arg_defs.expected");
    test_fixture(transform_fixture, file!(), "basic_arg_defs.graphql", "print_ast/fixtures/basic_arg_defs.expected", input, expected).await;
}

#[tokio::test]
async fn basic_arg_defs_type() {
    let input = include_str!("print_ast/fixtures/basic_arg_defs_type.graphql");
    let expected = include_str!("print_ast/fixtures/basic_arg_defs_type.expected");
    test_fixture(transform_fixture, file!(), "basic_arg_defs_type.graphql", "print_ast/fixtures/basic_arg_defs_type.expected", input, expected).await;
}

#[tokio::test]
async fn basic_directives() {
    let input = include_str!("print_ast/fixtures/basic_directives.graphql");
    let expected = include_str!("print_ast/fixtures/basic_directives.expected");
    test_fixture(transform_fixture, file!(), "basic_directives.graphql", "print_ast/fixtures/basic_directives.expected", input, expected).await;
}

#[tokio::test]
async fn basic_fragment() {
    let input = include_str!("print_ast/fixtures/basic_fragment.graphql");
    let expected = include_str!("print_ast/fixtures/basic_fragment.expected");
    test_fixture(transform_fixture, file!(), "basic_fragment.graphql", "print_ast/fixtures/basic_fragment.expected", input, expected).await;
}

#[tokio::test]
async fn basic_inline_fragments() {
    let input = include_str!("print_ast/fixtures/basic_inline_fragments.graphql");
    let expected = include_str!("print_ast/fixtures/basic_inline_fragments.expected");
    test_fixture(transform_fixture, file!(), "basic_inline_fragments.graphql", "print_ast/fixtures/basic_inline_fragments.expected", input, expected).await;
}

#[tokio::test]
async fn basic_list_object_values() {
    let input = include_str!("print_ast/fixtures/basic_list_object_values.graphql");
    let expected = include_str!("print_ast/fixtures/basic_list_object_values.expected");
    test_fixture(transform_fixture, file!(), "basic_list_object_values.graphql", "print_ast/fixtures/basic_list_object_values.expected", input, expected).await;
}

#[tokio::test]
async fn basic_query() {
    let input = include_str!("print_ast/fixtures/basic_query.graphql");
    let expected = include_str!("print_ast/fixtures/basic_query.expected");
    test_fixture(transform_fixture, file!(), "basic_query.graphql", "print_ast/fixtures/basic_query.expected", input, expected).await;
}

#[tokio::test]
async fn basic_query_with_float() {
    let input = include_str!("print_ast/fixtures/basic_query_with_float.graphql");
    let expected = include_str!("print_ast/fixtures/basic_query_with_float.expected");
    test_fixture(transform_fixture, file!(), "basic_query_with_float.graphql", "print_ast/fixtures/basic_query_with_float.expected", input, expected).await;
}

#[tokio::test]
async fn basic_var_defs() {
    let input = include_str!("print_ast/fixtures/basic_var_defs.graphql");
    let expected = include_str!("print_ast/fixtures/basic_var_defs.expected");
    test_fixture(transform_fixture, file!(), "basic_var_defs.graphql", "print_ast/fixtures/basic_var_defs.expected", input, expected).await;
}

#[tokio::test]
async fn basic_var_defs_with_directives() {
    let input = include_str!("print_ast/fixtures/basic_var_defs_with_directives.graphql");
    let expected = include_str!("print_ast/fixtures/basic_var_defs_with_directives.expected");
    test_fixture(transform_fixture, file!(), "basic_var_defs_with_directives.graphql", "print_ast/fixtures/basic_var_defs_with_directives.expected", input, expected).await;
}

#[tokio::test]
async fn conditions() {
    let input = include_str!("print_ast/fixtures/conditions.graphql");
    let expected = include_str!("print_ast/fixtures/conditions.expected");
    test_fixture(transform_fixture, file!(), "conditions.graphql", "print_ast/fixtures/conditions.expected", input, expected).await;
}

#[tokio::test]
async fn empty_args() {
    let input = include_str!("print_ast/fixtures/empty_args.graphql");
    let expected = include_str!("print_ast/fixtures/empty_args.expected");
    test_fixture(transform_fixture, file!(), "empty_args.graphql", "print_ast/fixtures/empty_args.expected", input, expected).await;
}

#[tokio::test]
async fn kitchen_sink() {
    let input = include_str!("print_ast/fixtures/kitchen-sink.graphql");
    let expected = include_str!("print_ast/fixtures/kitchen-sink.expected");
    test_fixture(transform_fixture, file!(), "kitchen-sink.graphql", "print_ast/fixtures/kitchen-sink.expected", input, expected).await;
}

#[tokio::test]
async fn lowercase_enum_fragment_arg() {
    let input = include_str!("print_ast/fixtures/lowercase-enum-fragment-arg.graphql");
    let expected = include_str!("print_ast/fixtures/lowercase-enum-fragment-arg.expected");
    test_fixture(transform_fixture, file!(), "lowercase-enum-fragment-arg.graphql", "print_ast/fixtures/lowercase-enum-fragment-arg.expected", input, expected).await;
}

#[tokio::test]
async fn nested_conditions() {
    let input = include_str!("print_ast/fixtures/nested_conditions.graphql");
    let expected = include_str!("print_ast/fixtures/nested_conditions.expected");
    test_fixture(transform_fixture, file!(), "nested_conditions.graphql", "print_ast/fixtures/nested_conditions.expected", input, expected).await;
}

#[tokio::test]
async fn single_value_array_of_objects() {
    let input = include_str!("print_ast/fixtures/single-value-array-of-objects.graphql");
    let expected = include_str!("print_ast/fixtures/single-value-array-of-objects.expected");
    test_fixture(transform_fixture, file!(), "single-value-array-of-objects.graphql", "print_ast/fixtures/single-value-array-of-objects.expected", input, expected).await;
}

#[tokio::test]
async fn string_enum_arg_invalid() {
    let input = include_str!("print_ast/fixtures/string-enum-arg.invalid.graphql");
    let expected = include_str!("print_ast/fixtures/string-enum-arg.invalid.expected");
    test_fixture(transform_fixture, file!(), "string-enum-arg.invalid.graphql", "print_ast/fixtures/string-enum-arg.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn string_enum_fragment_arg() {
    let input = include_str!("print_ast/fixtures/string-enum-fragment-arg.graphql");
    let expected = include_str!("print_ast/fixtures/string-enum-fragment-arg.expected");
    test_fixture(transform_fixture, file!(), "string-enum-fragment-arg.graphql", "print_ast/fixtures/string-enum-fragment-arg.expected", input, expected).await;
}

#[tokio::test]
async fn string_enum_fragment_arg_with_complex_input() {
    let input = include_str!("print_ast/fixtures/string-enum-fragment-arg-with-complex-input.graphql");
    let expected = include_str!("print_ast/fixtures/string-enum-fragment-arg-with-complex-input.expected");
    test_fixture(transform_fixture, file!(), "string-enum-fragment-arg-with-complex-input.graphql", "print_ast/fixtures/string-enum-fragment-arg-with-complex-input.expected", input, expected).await;
}

#[tokio::test]
async fn unknown_enum_arg_invalid() {
    let input = include_str!("print_ast/fixtures/unknown-enum-arg.invalid.graphql");
    let expected = include_str!("print_ast/fixtures/unknown-enum-arg.invalid.expected");
    test_fixture(transform_fixture, file!(), "unknown-enum-arg.invalid.graphql", "print_ast/fixtures/unknown-enum-arg.invalid.expected", input, expected).await;
}
