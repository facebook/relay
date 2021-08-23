/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<93d8b8cb92f7864bb6af641319f0f65d>>
 */

mod parse;

use parse::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn argument_complex_object_invalid() {
    let input = include_str!("parse/fixtures/argument-complex-object.invalid.graphql");
    let expected = include_str!("parse/fixtures/argument-complex-object.invalid.expected");
    test_fixture(transform_fixture, "argument-complex-object.invalid.graphql", "parse/fixtures/argument-complex-object.invalid.expected", input, expected);
}

#[test]
fn argument_definitions_invalid() {
    let input = include_str!("parse/fixtures/argument_definitions.invalid.graphql");
    let expected = include_str!("parse/fixtures/argument_definitions.invalid.expected");
    test_fixture(transform_fixture, "argument_definitions.invalid.graphql", "parse/fixtures/argument_definitions.invalid.expected", input, expected);
}

#[test]
fn complex_object_with_missing_fields_invalid() {
    let input = include_str!("parse/fixtures/complex-object-with-missing-fields.invalid.graphql");
    let expected = include_str!("parse/fixtures/complex-object-with-missing-fields.invalid.expected");
    test_fixture(transform_fixture, "complex-object-with-missing-fields.invalid.graphql", "parse/fixtures/complex-object-with-missing-fields.invalid.expected", input, expected);
}

#[test]
fn directive_generic() {
    let input = include_str!("parse/fixtures/directive-generic.graphql");
    let expected = include_str!("parse/fixtures/directive-generic.expected");
    test_fixture(transform_fixture, "directive-generic.graphql", "parse/fixtures/directive-generic.expected", input, expected);
}

#[test]
fn directive_include() {
    let input = include_str!("parse/fixtures/directive-include.graphql");
    let expected = include_str!("parse/fixtures/directive-include.expected");
    test_fixture(transform_fixture, "directive-include.graphql", "parse/fixtures/directive-include.expected", input, expected);
}

#[test]
fn directive_match_on_fragment_invalid() {
    let input = include_str!("parse/fixtures/directive-match-on-fragment.invalid.graphql");
    let expected = include_str!("parse/fixtures/directive-match-on-fragment.invalid.expected");
    test_fixture(transform_fixture, "directive-match-on-fragment.invalid.graphql", "parse/fixtures/directive-match-on-fragment.invalid.expected", input, expected);
}

#[test]
fn directive_missing_required_argument_invalid() {
    let input = include_str!("parse/fixtures/directive_missing_required_argument.invalid.graphql");
    let expected = include_str!("parse/fixtures/directive_missing_required_argument.invalid.expected");
    test_fixture(transform_fixture, "directive_missing_required_argument.invalid.graphql", "parse/fixtures/directive_missing_required_argument.invalid.expected", input, expected);
}

#[test]
fn directive_module_match_on_query_invalid() {
    let input = include_str!("parse/fixtures/directive-module-match-on-query.invalid.graphql");
    let expected = include_str!("parse/fixtures/directive-module-match-on-query.invalid.expected");
    test_fixture(transform_fixture, "directive-module-match-on-query.invalid.graphql", "parse/fixtures/directive-module-match-on-query.invalid.expected", input, expected);
}

#[test]
fn directive_module_on_field_invalid() {
    let input = include_str!("parse/fixtures/directive-module-on-field.invalid.graphql");
    let expected = include_str!("parse/fixtures/directive-module-on-field.invalid.expected");
    test_fixture(transform_fixture, "directive-module-on-field.invalid.graphql", "parse/fixtures/directive-module-on-field.invalid.expected", input, expected);
}

#[test]
fn directive_unknown_argument_invalid() {
    let input = include_str!("parse/fixtures/directive-unknown-argument.invalid.graphql");
    let expected = include_str!("parse/fixtures/directive-unknown-argument.invalid.expected");
    test_fixture(transform_fixture, "directive-unknown-argument.invalid.graphql", "parse/fixtures/directive-unknown-argument.invalid.expected", input, expected);
}

#[test]
fn directive_wrong_argument_type_invalid() {
    let input = include_str!("parse/fixtures/directive_wrong_argument_type.invalid.graphql");
    let expected = include_str!("parse/fixtures/directive_wrong_argument_type.invalid.expected");
    test_fixture(transform_fixture, "directive_wrong_argument_type.invalid.graphql", "parse/fixtures/directive_wrong_argument_type.invalid.expected", input, expected);
}

#[test]
fn duplicate_arguments_invalid() {
    let input = include_str!("parse/fixtures/duplicate_arguments.invalid.graphql");
    let expected = include_str!("parse/fixtures/duplicate_arguments.invalid.expected");
    test_fixture(transform_fixture, "duplicate_arguments.invalid.graphql", "parse/fixtures/duplicate_arguments.invalid.expected", input, expected);
}

#[test]
fn duplicate_variables_invalid() {
    let input = include_str!("parse/fixtures/duplicate_variables_invalid.graphql");
    let expected = include_str!("parse/fixtures/duplicate_variables_invalid.expected");
    test_fixture(transform_fixture, "duplicate_variables_invalid.graphql", "parse/fixtures/duplicate_variables_invalid.expected", input, expected);
}

#[test]
fn enum_values() {
    let input = include_str!("parse/fixtures/enum-values.graphql");
    let expected = include_str!("parse/fixtures/enum-values.expected");
    test_fixture(transform_fixture, "enum-values.graphql", "parse/fixtures/enum-values.expected", input, expected);
}

#[test]
fn enum_values_invalid() {
    let input = include_str!("parse/fixtures/enum-values.invalid.graphql");
    let expected = include_str!("parse/fixtures/enum-values.invalid.expected");
    test_fixture(transform_fixture, "enum-values.invalid.graphql", "parse/fixtures/enum-values.invalid.expected", input, expected);
}

#[test]
fn fetch_token_with_arguments_invalid() {
    let input = include_str!("parse/fixtures/fetch_token_with_arguments.invalid.graphql");
    let expected = include_str!("parse/fixtures/fetch_token_with_arguments.invalid.expected");
    test_fixture(transform_fixture, "fetch_token_with_arguments.invalid.graphql", "parse/fixtures/fetch_token_with_arguments.invalid.expected", input, expected);
}

#[test]
fn field_argument_missing_required_invalid() {
    let input = include_str!("parse/fixtures/field_argument_missing_required.invalid.graphql");
    let expected = include_str!("parse/fixtures/field_argument_missing_required.invalid.expected");
    test_fixture(transform_fixture, "field_argument_missing_required.invalid.graphql", "parse/fixtures/field_argument_missing_required.invalid.expected", input, expected);
}

#[test]
fn field_argument_unknown_invalid() {
    let input = include_str!("parse/fixtures/field_argument_unknown.invalid.graphql");
    let expected = include_str!("parse/fixtures/field_argument_unknown.invalid.expected");
    test_fixture(transform_fixture, "field_argument_unknown.invalid.graphql", "parse/fixtures/field_argument_unknown.invalid.expected", input, expected);
}

#[test]
fn field_argument_wrong_type_invalid() {
    let input = include_str!("parse/fixtures/field_argument_wrong_type.invalid.graphql");
    let expected = include_str!("parse/fixtures/field_argument_wrong_type.invalid.expected");
    test_fixture(transform_fixture, "field_argument_wrong_type.invalid.graphql", "parse/fixtures/field_argument_wrong_type.invalid.expected", input, expected);
}

#[test]
fn field_arguments() {
    let input = include_str!("parse/fixtures/field-arguments.graphql");
    let expected = include_str!("parse/fixtures/field-arguments.expected");
    test_fixture(transform_fixture, "field-arguments.graphql", "parse/fixtures/field-arguments.expected", input, expected);
}

#[test]
fn fixme_fat_interface_on_union() {
    let input = include_str!("parse/fixtures/fixme_fat_interface_on_union.graphql");
    let expected = include_str!("parse/fixtures/fixme_fat_interface_on_union.expected");
    test_fixture(transform_fixture, "fixme_fat_interface_on_union.graphql", "parse/fixtures/fixme_fat_interface_on_union.expected", input, expected);
}

#[test]
fn fixme_fat_interface_on_union_invalid() {
    let input = include_str!("parse/fixtures/fixme_fat_interface_on_union.invalid.graphql");
    let expected = include_str!("parse/fixtures/fixme_fat_interface_on_union.invalid.expected");
    test_fixture(transform_fixture, "fixme_fat_interface_on_union.invalid.graphql", "parse/fixtures/fixme_fat_interface_on_union.invalid.expected", input, expected);
}

#[test]
fn fragment_spread_on_wrong_type_invalid() {
    let input = include_str!("parse/fixtures/fragment-spread-on-wrong-type.invalid.graphql");
    let expected = include_str!("parse/fixtures/fragment-spread-on-wrong-type.invalid.expected");
    test_fixture(transform_fixture, "fragment-spread-on-wrong-type.invalid.graphql", "parse/fixtures/fragment-spread-on-wrong-type.invalid.expected", input, expected);
}

#[test]
fn fragment_spread_within_wrong_parent_type_invalid() {
    let input = include_str!("parse/fixtures/fragment-spread-within-wrong-parent-type.invalid.graphql");
    let expected = include_str!("parse/fixtures/fragment-spread-within-wrong-parent-type.invalid.expected");
    test_fixture(transform_fixture, "fragment-spread-within-wrong-parent-type.invalid.graphql", "parse/fixtures/fragment-spread-within-wrong-parent-type.invalid.expected", input, expected);
}

#[test]
fn fragment_with_argument_type_invalid() {
    let input = include_str!("parse/fixtures/fragment-with-argument-type.invalid.graphql");
    let expected = include_str!("parse/fixtures/fragment-with-argument-type.invalid.expected");
    test_fixture(transform_fixture, "fragment-with-argument-type.invalid.graphql", "parse/fixtures/fragment-with-argument-type.invalid.expected", input, expected);
}

#[test]
fn fragment_with_argument_type_syntax_error_invalid() {
    let input = include_str!("parse/fixtures/fragment-with-argument-type-syntax-error.invalid.graphql");
    let expected = include_str!("parse/fixtures/fragment-with-argument-type-syntax-error.invalid.expected");
    test_fixture(transform_fixture, "fragment-with-argument-type-syntax-error.invalid.graphql", "parse/fixtures/fragment-with-argument-type-syntax-error.invalid.expected", input, expected);
}

#[test]
fn fragment_with_arguments() {
    let input = include_str!("parse/fixtures/fragment-with-arguments.graphql");
    let expected = include_str!("parse/fixtures/fragment-with-arguments.expected");
    test_fixture(transform_fixture, "fragment-with-arguments.graphql", "parse/fixtures/fragment-with-arguments.expected", input, expected);
}

#[test]
fn fragment_with_arguments_defaulting() {
    let input = include_str!("parse/fixtures/fragment_with_arguments_defaulting.graphql");
    let expected = include_str!("parse/fixtures/fragment_with_arguments_defaulting.expected");
    test_fixture(transform_fixture, "fragment_with_arguments_defaulting.graphql", "parse/fixtures/fragment_with_arguments_defaulting.expected", input, expected);
}

#[test]
fn fragment_with_arguments_duplicate_invalid() {
    let input = include_str!("parse/fixtures/fragment-with-arguments-duplicate.invalid.graphql");
    let expected = include_str!("parse/fixtures/fragment-with-arguments-duplicate.invalid.expected");
    test_fixture(transform_fixture, "fragment-with-arguments-duplicate.invalid.graphql", "parse/fixtures/fragment-with-arguments-duplicate.invalid.expected", input, expected);
}

#[test]
fn fragment_with_arguments_incorrect_nullability_invalid() {
    let input = include_str!("parse/fixtures/fragment_with_arguments_incorrect_nullability.invalid.graphql");
    let expected = include_str!("parse/fixtures/fragment_with_arguments_incorrect_nullability.invalid.expected");
    test_fixture(transform_fixture, "fragment_with_arguments_incorrect_nullability.invalid.graphql", "parse/fixtures/fragment_with_arguments_incorrect_nullability.invalid.expected", input, expected);
}

#[test]
fn fragment_with_arguments_invalid_type_invalid() {
    let input = include_str!("parse/fixtures/fragment-with-arguments-invalid-type.invalid.graphql");
    let expected = include_str!("parse/fixtures/fragment-with-arguments-invalid-type.invalid.expected");
    test_fixture(transform_fixture, "fragment-with-arguments-invalid-type.invalid.graphql", "parse/fixtures/fragment-with-arguments-invalid-type.invalid.expected", input, expected);
}

#[test]
fn fragment_with_literal_arguments() {
    let input = include_str!("parse/fixtures/fragment-with-literal-arguments.graphql");
    let expected = include_str!("parse/fixtures/fragment-with-literal-arguments.expected");
    test_fixture(transform_fixture, "fragment-with-literal-arguments.graphql", "parse/fixtures/fragment-with-literal-arguments.expected", input, expected);
}

#[test]
fn fragment_with_literal_enum_arguments() {
    let input = include_str!("parse/fixtures/fragment-with-literal-enum-arguments.graphql");
    let expected = include_str!("parse/fixtures/fragment-with-literal-enum-arguments.expected");
    test_fixture(transform_fixture, "fragment-with-literal-enum-arguments.graphql", "parse/fixtures/fragment-with-literal-enum-arguments.expected", input, expected);
}

#[test]
fn fragment_with_literal_enum_arguments_into_enum_list() {
    let input = include_str!("parse/fixtures/fragment-with-literal-enum-arguments-into-enum-list.graphql");
    let expected = include_str!("parse/fixtures/fragment-with-literal-enum-arguments-into-enum-list.expected");
    test_fixture(transform_fixture, "fragment-with-literal-enum-arguments-into-enum-list.graphql", "parse/fixtures/fragment-with-literal-enum-arguments-into-enum-list.expected", input, expected);
}

#[test]
fn fragment_with_literal_enum_arguments_into_enum_list_indirect_invalid() {
    let input = include_str!("parse/fixtures/fragment-with-literal-enum-arguments-into-enum-list-indirect.invalid.graphql");
    let expected = include_str!("parse/fixtures/fragment-with-literal-enum-arguments-into-enum-list-indirect.invalid.expected");
    test_fixture(transform_fixture, "fragment-with-literal-enum-arguments-into-enum-list-indirect.invalid.graphql", "parse/fixtures/fragment-with-literal-enum-arguments-into-enum-list-indirect.invalid.expected", input, expected);
}

#[test]
fn fragment_with_literal_enum_list_arguments() {
    let input = include_str!("parse/fixtures/fragment-with-literal-enum-list-arguments.graphql");
    let expected = include_str!("parse/fixtures/fragment-with-literal-enum-list-arguments.expected");
    test_fixture(transform_fixture, "fragment-with-literal-enum-list-arguments.graphql", "parse/fixtures/fragment-with-literal-enum-list-arguments.expected", input, expected);
}

#[test]
fn fragment_with_literal_object_arguments() {
    let input = include_str!("parse/fixtures/fragment-with-literal-object-arguments.graphql");
    let expected = include_str!("parse/fixtures/fragment-with-literal-object-arguments.expected");
    test_fixture(transform_fixture, "fragment-with-literal-object-arguments.graphql", "parse/fixtures/fragment-with-literal-object-arguments.expected", input, expected);
}

#[test]
fn fragment_with_literal_object_list_arguments() {
    let input = include_str!("parse/fixtures/fragment-with-literal-object-list-arguments.graphql");
    let expected = include_str!("parse/fixtures/fragment-with-literal-object-list-arguments.expected");
    test_fixture(transform_fixture, "fragment-with-literal-object-list-arguments.graphql", "parse/fixtures/fragment-with-literal-object-list-arguments.expected", input, expected);
}

#[test]
fn fragment_with_undefined_literal_arguments_invalid() {
    let input = include_str!("parse/fixtures/fragment-with-undefined-literal-arguments.invalid.graphql");
    let expected = include_str!("parse/fixtures/fragment-with-undefined-literal-arguments.invalid.expected");
    test_fixture(transform_fixture, "fragment-with-undefined-literal-arguments.invalid.graphql", "parse/fixtures/fragment-with-undefined-literal-arguments.invalid.expected", input, expected);
}

#[test]
fn fragment_with_undefined_variable_arguments_invalid() {
    let input = include_str!("parse/fixtures/fragment-with-undefined-variable-arguments.invalid.graphql");
    let expected = include_str!("parse/fixtures/fragment-with-undefined-variable-arguments.invalid.expected");
    test_fixture(transform_fixture, "fragment-with-undefined-variable-arguments.invalid.graphql", "parse/fixtures/fragment-with-undefined-variable-arguments.invalid.expected", input, expected);
}

#[test]
fn fragment_with_unnecessary_unchecked_arguments_invalid() {
    let input = include_str!("parse/fixtures/fragment-with-unnecessary-unchecked-arguments.invalid.graphql");
    let expected = include_str!("parse/fixtures/fragment-with-unnecessary-unchecked-arguments.invalid.expected");
    test_fixture(transform_fixture, "fragment-with-unnecessary-unchecked-arguments.invalid.graphql", "parse/fixtures/fragment-with-unnecessary-unchecked-arguments.invalid.expected", input, expected);
}

#[test]
fn fragment_with_variable_definitions_syntax() {
    let input = include_str!("parse/fixtures/fragment-with-variable-definitions-syntax.graphql");
    let expected = include_str!("parse/fixtures/fragment-with-variable-definitions-syntax.expected");
    test_fixture(transform_fixture, "fragment-with-variable-definitions-syntax.graphql", "parse/fixtures/fragment-with-variable-definitions-syntax.expected", input, expected);
}

#[test]
fn fragment_with_variable_definitions_syntax_and_argdefs_invalid() {
    let input = include_str!("parse/fixtures/fragment-with-variable-definitions-syntax-and-argdefs.invalid.graphql");
    let expected = include_str!("parse/fixtures/fragment-with-variable-definitions-syntax-and-argdefs.invalid.expected");
    test_fixture(transform_fixture, "fragment-with-variable-definitions-syntax-and-argdefs.invalid.graphql", "parse/fixtures/fragment-with-variable-definitions-syntax-and-argdefs.invalid.expected", input, expected);
}

#[test]
fn inline_fragment_on_wrong_type_invalid() {
    let input = include_str!("parse/fixtures/inline-fragment-on-wrong-type.invalid.graphql");
    let expected = include_str!("parse/fixtures/inline-fragment-on-wrong-type.invalid.expected");
    test_fixture(transform_fixture, "inline-fragment-on-wrong-type.invalid.graphql", "parse/fixtures/inline-fragment-on-wrong-type.invalid.expected", input, expected);
}

#[test]
fn inline_fragment_with_invalid_type() {
    let input = include_str!("parse/fixtures/inline-fragment-with-invalid-type.graphql");
    let expected = include_str!("parse/fixtures/inline-fragment-with-invalid-type.expected");
    test_fixture(transform_fixture, "inline-fragment-with-invalid-type.graphql", "parse/fixtures/inline-fragment-with-invalid-type.expected", input, expected);
}

#[test]
fn inline_fragment_within_invalid_inline_fragment_grandparent_invalid() {
    let input = include_str!("parse/fixtures/inline-fragment-within-invalid-inline-fragment-grandparent.invalid.graphql");
    let expected = include_str!("parse/fixtures/inline-fragment-within-invalid-inline-fragment-grandparent.invalid.expected");
    test_fixture(transform_fixture, "inline-fragment-within-invalid-inline-fragment-grandparent.invalid.graphql", "parse/fixtures/inline-fragment-within-invalid-inline-fragment-grandparent.invalid.expected", input, expected);
}

#[test]
fn inline_fragment_within_linked_field_and_wrong_inline_fragment_invalid() {
    let input = include_str!("parse/fixtures/inline-fragment-within-linked-field-and-wrong-inline-fragment.invalid.graphql");
    let expected = include_str!("parse/fixtures/inline-fragment-within-linked-field-and-wrong-inline-fragment.invalid.expected");
    test_fixture(transform_fixture, "inline-fragment-within-linked-field-and-wrong-inline-fragment.invalid.graphql", "parse/fixtures/inline-fragment-within-linked-field-and-wrong-inline-fragment.invalid.expected", input, expected);
}

#[test]
fn inline_fragment_within_wrong_parent_type_invalid() {
    let input = include_str!("parse/fixtures/inline-fragment-within-wrong-parent-type.invalid.graphql");
    let expected = include_str!("parse/fixtures/inline-fragment-within-wrong-parent-type.invalid.expected");
    test_fixture(transform_fixture, "inline-fragment-within-wrong-parent-type.invalid.graphql", "parse/fixtures/inline-fragment-within-wrong-parent-type.invalid.expected", input, expected);
}

#[test]
fn inline_untyped_fragment() {
    let input = include_str!("parse/fixtures/inline-untyped-fragment.graphql");
    let expected = include_str!("parse/fixtures/inline-untyped-fragment.expected");
    test_fixture(transform_fixture, "inline-untyped-fragment.graphql", "parse/fixtures/inline-untyped-fragment.expected", input, expected);
}

#[test]
fn invalid_argument_type_invalid() {
    let input = include_str!("parse/fixtures/invalid-argument-type.invalid.graphql");
    let expected = include_str!("parse/fixtures/invalid-argument-type.invalid.expected");
    test_fixture(transform_fixture, "invalid-argument-type.invalid.graphql", "parse/fixtures/invalid-argument-type.invalid.expected", input, expected);
}

#[test]
fn linked_field_with_no_selection_invalid() {
    let input = include_str!("parse/fixtures/linked-field-with-no-selection.invalid.graphql");
    let expected = include_str!("parse/fixtures/linked-field-with-no-selection.invalid.expected");
    test_fixture(transform_fixture, "linked-field-with-no-selection.invalid.graphql", "parse/fixtures/linked-field-with-no-selection.invalid.expected", input, expected);
}

#[test]
fn linked_handle_field() {
    let input = include_str!("parse/fixtures/linked-handle-field.graphql");
    let expected = include_str!("parse/fixtures/linked-handle-field.expected");
    test_fixture(transform_fixture, "linked-handle-field.graphql", "parse/fixtures/linked-handle-field.expected", input, expected);
}

#[test]
fn linked_handle_field_with_filters() {
    let input = include_str!("parse/fixtures/linked-handle-field-with-filters.graphql");
    let expected = include_str!("parse/fixtures/linked-handle-field-with-filters.expected");
    test_fixture(transform_fixture, "linked-handle-field-with-filters.graphql", "parse/fixtures/linked-handle-field-with-filters.expected", input, expected);
}

#[test]
fn linked_handle_field_with_key() {
    let input = include_str!("parse/fixtures/linked-handle-field-with-key.graphql");
    let expected = include_str!("parse/fixtures/linked-handle-field-with-key.expected");
    test_fixture(transform_fixture, "linked-handle-field-with-key.graphql", "parse/fixtures/linked-handle-field-with-key.expected", input, expected);
}

#[test]
fn linked_handle_filter() {
    let input = include_str!("parse/fixtures/linked-handle-filter.graphql");
    let expected = include_str!("parse/fixtures/linked-handle-filter.expected");
    test_fixture(transform_fixture, "linked-handle-filter.graphql", "parse/fixtures/linked-handle-filter.expected", input, expected);
}

#[test]
fn list_argument() {
    let input = include_str!("parse/fixtures/list-argument.graphql");
    let expected = include_str!("parse/fixtures/list-argument.expected");
    test_fixture(transform_fixture, "list-argument.graphql", "parse/fixtures/list-argument.expected", input, expected);
}

#[test]
fn list_argument_complex_object() {
    let input = include_str!("parse/fixtures/list-argument-complex-object.graphql");
    let expected = include_str!("parse/fixtures/list-argument-complex-object.expected");
    test_fixture(transform_fixture, "list-argument-complex-object.graphql", "parse/fixtures/list-argument-complex-object.expected", input, expected);
}

#[test]
fn list_of_enums() {
    let input = include_str!("parse/fixtures/list-of-enums.graphql");
    let expected = include_str!("parse/fixtures/list-of-enums.expected");
    test_fixture(transform_fixture, "list-of-enums.graphql", "parse/fixtures/list-of-enums.expected", input, expected);
}

#[test]
fn literal_list_argument() {
    let input = include_str!("parse/fixtures/literal-list-argument.graphql");
    let expected = include_str!("parse/fixtures/literal-list-argument.expected");
    test_fixture(transform_fixture, "literal-list-argument.graphql", "parse/fixtures/literal-list-argument.expected", input, expected);
}

#[test]
fn literal_list_argument_invalid() {
    let input = include_str!("parse/fixtures/literal-list-argument.invalid.graphql");
    let expected = include_str!("parse/fixtures/literal-list-argument.invalid.expected");
    test_fixture(transform_fixture, "literal-list-argument.invalid.graphql", "parse/fixtures/literal-list-argument.invalid.expected", input, expected);
}

#[test]
fn literal_object_argument() {
    let input = include_str!("parse/fixtures/literal-object-argument.graphql");
    let expected = include_str!("parse/fixtures/literal-object-argument.expected");
    test_fixture(transform_fixture, "literal-object-argument.graphql", "parse/fixtures/literal-object-argument.expected", input, expected);
}

#[test]
fn literal_object_argument_invalid() {
    let input = include_str!("parse/fixtures/literal-object-argument.invalid.graphql");
    let expected = include_str!("parse/fixtures/literal-object-argument.invalid.expected");
    test_fixture(transform_fixture, "literal-object-argument.invalid.graphql", "parse/fixtures/literal-object-argument.invalid.expected", input, expected);
}

#[test]
fn null_values() {
    let input = include_str!("parse/fixtures/null-values.graphql");
    let expected = include_str!("parse/fixtures/null-values.expected");
    test_fixture(transform_fixture, "null-values.graphql", "parse/fixtures/null-values.expected", input, expected);
}

#[test]
fn null_values_invalid() {
    let input = include_str!("parse/fixtures/null-values.invalid.graphql");
    let expected = include_str!("parse/fixtures/null-values.invalid.expected");
    test_fixture(transform_fixture, "null-values.invalid.graphql", "parse/fixtures/null-values.invalid.expected", input, expected);
}

#[test]
fn object_argument() {
    let input = include_str!("parse/fixtures/object-argument.graphql");
    let expected = include_str!("parse/fixtures/object-argument.expected");
    test_fixture(transform_fixture, "object-argument.graphql", "parse/fixtures/object-argument.expected", input, expected);
}

#[test]
fn query_with_argument_invalid() {
    let input = include_str!("parse/fixtures/query-with-argument.invalid.graphql");
    let expected = include_str!("parse/fixtures/query-with-argument.invalid.expected");
    test_fixture(transform_fixture, "query-with-argument.invalid.graphql", "parse/fixtures/query-with-argument.invalid.expected", input, expected);
}

#[test]
fn scalar_field_with_selection() {
    let input = include_str!("parse/fixtures/scalar-field-with-selection.graphql");
    let expected = include_str!("parse/fixtures/scalar-field-with-selection.expected");
    test_fixture(transform_fixture, "scalar-field-with-selection.graphql", "parse/fixtures/scalar-field-with-selection.expected", input, expected);
}

#[test]
fn scalar_handle_field() {
    let input = include_str!("parse/fixtures/scalar-handle-field.graphql");
    let expected = include_str!("parse/fixtures/scalar-handle-field.expected");
    test_fixture(transform_fixture, "scalar-handle-field.graphql", "parse/fixtures/scalar-handle-field.expected", input, expected);
}

#[test]
fn simple_fragment() {
    let input = include_str!("parse/fixtures/simple-fragment.graphql");
    let expected = include_str!("parse/fixtures/simple-fragment.expected");
    test_fixture(transform_fixture, "simple-fragment.graphql", "parse/fixtures/simple-fragment.expected", input, expected);
}

#[test]
fn simple_query() {
    let input = include_str!("parse/fixtures/simple-query.graphql");
    let expected = include_str!("parse/fixtures/simple-query.expected");
    test_fixture(transform_fixture, "simple-query.graphql", "parse/fixtures/simple-query.expected", input, expected);
}

#[test]
fn subscription_with_multiple_selections_invalid() {
    let input = include_str!("parse/fixtures/subscription-with-multiple-selections.invalid.graphql");
    let expected = include_str!("parse/fixtures/subscription-with-multiple-selections.invalid.expected");
    test_fixture(transform_fixture, "subscription-with-multiple-selections.invalid.graphql", "parse/fixtures/subscription-with-multiple-selections.invalid.expected", input, expected);
}

#[test]
fn typename_with_arguments_invalid() {
    let input = include_str!("parse/fixtures/typename_with_arguments.invalid.graphql");
    let expected = include_str!("parse/fixtures/typename_with_arguments.invalid.expected");
    test_fixture(transform_fixture, "typename_with_arguments.invalid.graphql", "parse/fixtures/typename_with_arguments.invalid.expected", input, expected);
}

#[test]
fn undefined_fragment_invalid() {
    let input = include_str!("parse/fixtures/undefined-fragment.invalid.graphql");
    let expected = include_str!("parse/fixtures/undefined-fragment.invalid.expected");
    test_fixture(transform_fixture, "undefined-fragment.invalid.graphql", "parse/fixtures/undefined-fragment.invalid.expected", input, expected);
}

#[test]
fn undefined_type_invalid() {
    let input = include_str!("parse/fixtures/undefined-type.invalid.graphql");
    let expected = include_str!("parse/fixtures/undefined-type.invalid.expected");
    test_fixture(transform_fixture, "undefined-type.invalid.graphql", "parse/fixtures/undefined-type.invalid.expected", input, expected);
}

#[test]
fn unknown_field_invalid() {
    let input = include_str!("parse/fixtures/unknown_field.invalid.graphql");
    let expected = include_str!("parse/fixtures/unknown_field.invalid.expected");
    test_fixture(transform_fixture, "unknown_field.invalid.graphql", "parse/fixtures/unknown_field.invalid.expected", input, expected);
}

#[test]
fn unknown_fragment_type_invalid() {
    let input = include_str!("parse/fixtures/unknown-fragment-type.invalid.graphql");
    let expected = include_str!("parse/fixtures/unknown-fragment-type.invalid.expected");
    test_fixture(transform_fixture, "unknown-fragment-type.invalid.graphql", "parse/fixtures/unknown-fragment-type.invalid.expected", input, expected);
}

#[test]
fn unknown_fragment_type_suggestions_invalid() {
    let input = include_str!("parse/fixtures/unknown-fragment-type-suggestions.invalid.graphql");
    let expected = include_str!("parse/fixtures/unknown-fragment-type-suggestions.invalid.expected");
    test_fixture(transform_fixture, "unknown-fragment-type-suggestions.invalid.graphql", "parse/fixtures/unknown-fragment-type-suggestions.invalid.expected", input, expected);
}
