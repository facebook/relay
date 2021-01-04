/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<7b96fe6b7c985d489bc7e1a0b1615c8a>>
 */

mod print_ast;

use print_ast::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn basic_arg_defs() {
    let input = include_str!("print_ast/fixtures/basic_arg_defs.graphql");
    let expected = include_str!("print_ast/fixtures/basic_arg_defs.expected");
    test_fixture(transform_fixture, "basic_arg_defs.graphql", "print_ast/fixtures/basic_arg_defs.expected", input, expected);
}

#[test]
fn basic_arg_defs_type() {
    let input = include_str!("print_ast/fixtures/basic_arg_defs_type.graphql");
    let expected = include_str!("print_ast/fixtures/basic_arg_defs_type.expected");
    test_fixture(transform_fixture, "basic_arg_defs_type.graphql", "print_ast/fixtures/basic_arg_defs_type.expected", input, expected);
}

#[test]
fn basic_directives() {
    let input = include_str!("print_ast/fixtures/basic_directives.graphql");
    let expected = include_str!("print_ast/fixtures/basic_directives.expected");
    test_fixture(transform_fixture, "basic_directives.graphql", "print_ast/fixtures/basic_directives.expected", input, expected);
}

#[test]
fn basic_fragment() {
    let input = include_str!("print_ast/fixtures/basic_fragment.graphql");
    let expected = include_str!("print_ast/fixtures/basic_fragment.expected");
    test_fixture(transform_fixture, "basic_fragment.graphql", "print_ast/fixtures/basic_fragment.expected", input, expected);
}

#[test]
fn basic_inline_fragments() {
    let input = include_str!("print_ast/fixtures/basic_inline_fragments.graphql");
    let expected = include_str!("print_ast/fixtures/basic_inline_fragments.expected");
    test_fixture(transform_fixture, "basic_inline_fragments.graphql", "print_ast/fixtures/basic_inline_fragments.expected", input, expected);
}

#[test]
fn basic_list_object_values() {
    let input = include_str!("print_ast/fixtures/basic_list_object_values.graphql");
    let expected = include_str!("print_ast/fixtures/basic_list_object_values.expected");
    test_fixture(transform_fixture, "basic_list_object_values.graphql", "print_ast/fixtures/basic_list_object_values.expected", input, expected);
}

#[test]
fn basic_query() {
    let input = include_str!("print_ast/fixtures/basic_query.graphql");
    let expected = include_str!("print_ast/fixtures/basic_query.expected");
    test_fixture(transform_fixture, "basic_query.graphql", "print_ast/fixtures/basic_query.expected", input, expected);
}

#[test]
fn basic_query_with_float() {
    let input = include_str!("print_ast/fixtures/basic_query_with_float.graphql");
    let expected = include_str!("print_ast/fixtures/basic_query_with_float.expected");
    test_fixture(transform_fixture, "basic_query_with_float.graphql", "print_ast/fixtures/basic_query_with_float.expected", input, expected);
}

#[test]
fn basic_var_defs() {
    let input = include_str!("print_ast/fixtures/basic_var_defs.graphql");
    let expected = include_str!("print_ast/fixtures/basic_var_defs.expected");
    test_fixture(transform_fixture, "basic_var_defs.graphql", "print_ast/fixtures/basic_var_defs.expected", input, expected);
}

#[test]
fn conditions() {
    let input = include_str!("print_ast/fixtures/conditions.graphql");
    let expected = include_str!("print_ast/fixtures/conditions.expected");
    test_fixture(transform_fixture, "conditions.graphql", "print_ast/fixtures/conditions.expected", input, expected);
}

#[test]
fn empty_args() {
    let input = include_str!("print_ast/fixtures/empty_args.graphql");
    let expected = include_str!("print_ast/fixtures/empty_args.expected");
    test_fixture(transform_fixture, "empty_args.graphql", "print_ast/fixtures/empty_args.expected", input, expected);
}

#[test]
fn kitchen_sink() {
    let input = include_str!("print_ast/fixtures/kitchen-sink.graphql");
    let expected = include_str!("print_ast/fixtures/kitchen-sink.expected");
    test_fixture(transform_fixture, "kitchen-sink.graphql", "print_ast/fixtures/kitchen-sink.expected", input, expected);
}

#[test]
fn lowercase_enum_fragment_arg() {
    let input = include_str!("print_ast/fixtures/lowercase-enum-fragment-arg.graphql");
    let expected = include_str!("print_ast/fixtures/lowercase-enum-fragment-arg.expected");
    test_fixture(transform_fixture, "lowercase-enum-fragment-arg.graphql", "print_ast/fixtures/lowercase-enum-fragment-arg.expected", input, expected);
}

#[test]
fn nested_conditions() {
    let input = include_str!("print_ast/fixtures/nested_conditions.graphql");
    let expected = include_str!("print_ast/fixtures/nested_conditions.expected");
    test_fixture(transform_fixture, "nested_conditions.graphql", "print_ast/fixtures/nested_conditions.expected", input, expected);
}

#[test]
fn single_value_array_of_objects() {
    let input = include_str!("print_ast/fixtures/single-value-array-of-objects.graphql");
    let expected = include_str!("print_ast/fixtures/single-value-array-of-objects.expected");
    test_fixture(transform_fixture, "single-value-array-of-objects.graphql", "print_ast/fixtures/single-value-array-of-objects.expected", input, expected);
}

#[test]
fn string_enum_arg_invalid() {
    let input = include_str!("print_ast/fixtures/string-enum-arg.invalid.graphql");
    let expected = include_str!("print_ast/fixtures/string-enum-arg.invalid.expected");
    test_fixture(transform_fixture, "string-enum-arg.invalid.graphql", "print_ast/fixtures/string-enum-arg.invalid.expected", input, expected);
}

#[test]
fn string_enum_fragment_arg() {
    let input = include_str!("print_ast/fixtures/string-enum-fragment-arg.graphql");
    let expected = include_str!("print_ast/fixtures/string-enum-fragment-arg.expected");
    test_fixture(transform_fixture, "string-enum-fragment-arg.graphql", "print_ast/fixtures/string-enum-fragment-arg.expected", input, expected);
}

#[test]
fn string_enum_fragment_arg_with_complex_input() {
    let input = include_str!("print_ast/fixtures/string-enum-fragment-arg-with-complex-input.graphql");
    let expected = include_str!("print_ast/fixtures/string-enum-fragment-arg-with-complex-input.expected");
    test_fixture(transform_fixture, "string-enum-fragment-arg-with-complex-input.graphql", "print_ast/fixtures/string-enum-fragment-arg-with-complex-input.expected", input, expected);
}

#[test]
fn unknown_enum_arg_invalid() {
    let input = include_str!("print_ast/fixtures/unknown-enum-arg.invalid.graphql");
    let expected = include_str!("print_ast/fixtures/unknown-enum-arg.invalid.expected");
    test_fixture(transform_fixture, "unknown-enum-arg.invalid.graphql", "print_ast/fixtures/unknown-enum-arg.invalid.expected", input, expected);
}
