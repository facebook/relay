/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<3a29526cf45905aef6f25f5ab7fcf58c>>
 */

mod print;

use print::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn basic_arg_defs() {
    let input = include_str!("print/fixtures/basic_arg_defs.graphql");
    let expected = include_str!("print/fixtures/basic_arg_defs.expected");
    test_fixture(transform_fixture, "basic_arg_defs.graphql", "print/fixtures/basic_arg_defs.expected", input, expected);
}

#[test]
fn basic_directives() {
    let input = include_str!("print/fixtures/basic_directives.graphql");
    let expected = include_str!("print/fixtures/basic_directives.expected");
    test_fixture(transform_fixture, "basic_directives.graphql", "print/fixtures/basic_directives.expected", input, expected);
}

#[test]
fn basic_fragment() {
    let input = include_str!("print/fixtures/basic_fragment.graphql");
    let expected = include_str!("print/fixtures/basic_fragment.expected");
    test_fixture(transform_fixture, "basic_fragment.graphql", "print/fixtures/basic_fragment.expected", input, expected);
}

#[test]
fn basic_inline_fragments() {
    let input = include_str!("print/fixtures/basic_inline_fragments.graphql");
    let expected = include_str!("print/fixtures/basic_inline_fragments.expected");
    test_fixture(transform_fixture, "basic_inline_fragments.graphql", "print/fixtures/basic_inline_fragments.expected", input, expected);
}

#[test]
fn basic_list_object_values() {
    let input = include_str!("print/fixtures/basic_list_object_values.graphql");
    let expected = include_str!("print/fixtures/basic_list_object_values.expected");
    test_fixture(transform_fixture, "basic_list_object_values.graphql", "print/fixtures/basic_list_object_values.expected", input, expected);
}

#[test]
fn basic_query() {
    let input = include_str!("print/fixtures/basic_query.graphql");
    let expected = include_str!("print/fixtures/basic_query.expected");
    test_fixture(transform_fixture, "basic_query.graphql", "print/fixtures/basic_query.expected", input, expected);
}

#[test]
fn basic_var_defs() {
    let input = include_str!("print/fixtures/basic_var_defs.graphql");
    let expected = include_str!("print/fixtures/basic_var_defs.expected");
    test_fixture(transform_fixture, "basic_var_defs.graphql", "print/fixtures/basic_var_defs.expected", input, expected);
}

#[test]
fn conditions() {
    let input = include_str!("print/fixtures/conditions.graphql");
    let expected = include_str!("print/fixtures/conditions.expected");
    test_fixture(transform_fixture, "conditions.graphql", "print/fixtures/conditions.expected", input, expected);
}

#[test]
fn empty_args() {
    let input = include_str!("print/fixtures/empty_args.graphql");
    let expected = include_str!("print/fixtures/empty_args.expected");
    test_fixture(transform_fixture, "empty_args.graphql", "print/fixtures/empty_args.expected", input, expected);
}

#[test]
fn kitchen_sink() {
    let input = include_str!("print/fixtures/kitchen-sink.graphql");
    let expected = include_str!("print/fixtures/kitchen-sink.expected");
    test_fixture(transform_fixture, "kitchen-sink.graphql", "print/fixtures/kitchen-sink.expected", input, expected);
}

#[test]
fn nested_conditions() {
    let input = include_str!("print/fixtures/nested_conditions.graphql");
    let expected = include_str!("print/fixtures/nested_conditions.expected");
    test_fixture(transform_fixture, "nested_conditions.graphql", "print/fixtures/nested_conditions.expected", input, expected);
}

#[test]
fn single_value_array_of_objects() {
    let input = include_str!("print/fixtures/single-value-array-of-objects.graphql");
    let expected = include_str!("print/fixtures/single-value-array-of-objects.expected");
    test_fixture(transform_fixture, "single-value-array-of-objects.graphql", "print/fixtures/single-value-array-of-objects.expected", input, expected);
}

#[test]
fn string_enum_arg_invalid() {
    let input = include_str!("print/fixtures/string-enum-arg.invalid.graphql");
    let expected = include_str!("print/fixtures/string-enum-arg.invalid.expected");
    test_fixture(transform_fixture, "string-enum-arg.invalid.graphql", "print/fixtures/string-enum-arg.invalid.expected", input, expected);
}

#[test]
fn string_enum_fragment_arg() {
    let input = include_str!("print/fixtures/string-enum-fragment-arg.graphql");
    let expected = include_str!("print/fixtures/string-enum-fragment-arg.expected");
    test_fixture(transform_fixture, "string-enum-fragment-arg.graphql", "print/fixtures/string-enum-fragment-arg.expected", input, expected);
}

#[test]
fn string_enum_fragment_arg_with_complex_input() {
    let input = include_str!("print/fixtures/string-enum-fragment-arg-with-complex-input.graphql");
    let expected = include_str!("print/fixtures/string-enum-fragment-arg-with-complex-input.expected");
    test_fixture(transform_fixture, "string-enum-fragment-arg-with-complex-input.graphql", "print/fixtures/string-enum-fragment-arg-with-complex-input.expected", input, expected);
}

#[test]
fn unknown_enum_arg_invalid() {
    let input = include_str!("print/fixtures/unknown-enum-arg.invalid.graphql");
    let expected = include_str!("print/fixtures/unknown-enum-arg.invalid.expected");
    test_fixture(transform_fixture, "unknown-enum-arg.invalid.graphql", "print/fixtures/unknown-enum-arg.invalid.expected", input, expected);
}
