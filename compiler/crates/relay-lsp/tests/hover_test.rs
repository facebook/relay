/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<2a5269fa3ea1048fa6da2b874df81539>>
 */

mod hover;

use hover::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn directive() {
    let input = include_str!("hover/fixtures/directive.graphql");
    let expected = include_str!("hover/fixtures/directive.expected");
    test_fixture(transform_fixture, file!(), "directive.graphql", "hover/fixtures/directive.expected", input, expected).await;
}

#[tokio::test]
async fn directive_argument_definitions() {
    let input = include_str!("hover/fixtures/directive_argument_definitions.graphql");
    let expected = include_str!("hover/fixtures/directive_argument_definitions.expected");
    test_fixture(transform_fixture, file!(), "directive_argument_definitions.graphql", "hover/fixtures/directive_argument_definitions.expected", input, expected).await;
}

#[tokio::test]
async fn directive_arguments() {
    let input = include_str!("hover/fixtures/directive_arguments.graphql");
    let expected = include_str!("hover/fixtures/directive_arguments.expected");
    test_fixture(transform_fixture, file!(), "directive_arguments.graphql", "hover/fixtures/directive_arguments.expected", input, expected).await;
}

#[tokio::test]
async fn double_underscore_id_field() {
    let input = include_str!("hover/fixtures/double_underscore_id_field.graphql");
    let expected = include_str!("hover/fixtures/double_underscore_id_field.expected");
    test_fixture(transform_fixture, file!(), "double_underscore_id_field.graphql", "hover/fixtures/double_underscore_id_field.expected", input, expected).await;
}

#[tokio::test]
async fn double_underscore_typename_field() {
    let input = include_str!("hover/fixtures/double_underscore_typename_field.graphql");
    let expected = include_str!("hover/fixtures/double_underscore_typename_field.expected");
    test_fixture(transform_fixture, file!(), "double_underscore_typename_field.graphql", "hover/fixtures/double_underscore_typename_field.expected", input, expected).await;
}

#[tokio::test]
async fn field_argument() {
    let input = include_str!("hover/fixtures/field_argument.graphql");
    let expected = include_str!("hover/fixtures/field_argument.expected");
    test_fixture(transform_fixture, file!(), "field_argument.graphql", "hover/fixtures/field_argument.expected", input, expected).await;
}

#[tokio::test]
async fn field_argument_boolean() {
    let input = include_str!("hover/fixtures/field_argument_boolean.graphql");
    let expected = include_str!("hover/fixtures/field_argument_boolean.expected");
    test_fixture(transform_fixture, file!(), "field_argument_boolean.graphql", "hover/fixtures/field_argument_boolean.expected", input, expected).await;
}

#[tokio::test]
async fn field_argument_enum_value() {
    let input = include_str!("hover/fixtures/field_argument_enum_value.graphql");
    let expected = include_str!("hover/fixtures/field_argument_enum_value.expected");
    test_fixture(transform_fixture, file!(), "field_argument_enum_value.graphql", "hover/fixtures/field_argument_enum_value.expected", input, expected).await;
}

#[tokio::test]
async fn field_argument_float() {
    let input = include_str!("hover/fixtures/field_argument_float.graphql");
    let expected = include_str!("hover/fixtures/field_argument_float.expected");
    test_fixture(transform_fixture, file!(), "field_argument_float.graphql", "hover/fixtures/field_argument_float.expected", input, expected).await;
}

#[tokio::test]
async fn field_argument_variable() {
    let input = include_str!("hover/fixtures/field_argument_variable.graphql");
    let expected = include_str!("hover/fixtures/field_argument_variable.expected");
    test_fixture(transform_fixture, file!(), "field_argument_variable.graphql", "hover/fixtures/field_argument_variable.expected", input, expected).await;
}

#[tokio::test]
async fn field_with_arguments() {
    let input = include_str!("hover/fixtures/field_with_arguments.graphql");
    let expected = include_str!("hover/fixtures/field_with_arguments.expected");
    test_fixture(transform_fixture, file!(), "field_with_arguments.graphql", "hover/fixtures/field_with_arguments.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_definition_name() {
    let input = include_str!("hover/fixtures/fragment_definition_name.graphql");
    let expected = include_str!("hover/fixtures/fragment_definition_name.expected");
    test_fixture(transform_fixture, file!(), "fragment_definition_name.graphql", "hover/fixtures/fragment_definition_name.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_definition_type_condition() {
    let input = include_str!("hover/fixtures/fragment_definition_type_condition.graphql");
    let expected = include_str!("hover/fixtures/fragment_definition_type_condition.expected");
    test_fixture(transform_fixture, file!(), "fragment_definition_type_condition.graphql", "hover/fixtures/fragment_definition_type_condition.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_spread() {
    let input = include_str!("hover/fixtures/fragment_spread.graphql");
    let expected = include_str!("hover/fixtures/fragment_spread.expected");
    test_fixture(transform_fixture, file!(), "fragment_spread.graphql", "hover/fixtures/fragment_spread.expected", input, expected).await;
}

#[tokio::test]
async fn inline_fragment() {
    let input = include_str!("hover/fixtures/inline_fragment.graphql");
    let expected = include_str!("hover/fixtures/inline_fragment.expected");
    test_fixture(transform_fixture, file!(), "inline_fragment.graphql", "hover/fixtures/inline_fragment.expected", input, expected).await;
}

#[tokio::test]
async fn linked_field() {
    let input = include_str!("hover/fixtures/linked_field.graphql");
    let expected = include_str!("hover/fixtures/linked_field.expected");
    test_fixture(transform_fixture, file!(), "linked_field.graphql", "hover/fixtures/linked_field.expected", input, expected).await;
}

#[tokio::test]
async fn linked_field_deeply_nested() {
    let input = include_str!("hover/fixtures/linked_field_deeply_nested.graphql");
    let expected = include_str!("hover/fixtures/linked_field_deeply_nested.expected");
    test_fixture(transform_fixture, file!(), "linked_field_deeply_nested.graphql", "hover/fixtures/linked_field_deeply_nested.expected", input, expected).await;
}

#[tokio::test]
async fn linked_field_nested() {
    let input = include_str!("hover/fixtures/linked_field_nested.graphql");
    let expected = include_str!("hover/fixtures/linked_field_nested.expected");
    test_fixture(transform_fixture, file!(), "linked_field_nested.graphql", "hover/fixtures/linked_field_nested.expected", input, expected).await;
}

#[tokio::test]
async fn scalar_field_from_client_schema_extension() {
    let input = include_str!("hover/fixtures/scalar_field_from_client_schema_extension.graphql");
    let expected = include_str!("hover/fixtures/scalar_field_from_client_schema_extension.expected");
    test_fixture(transform_fixture, file!(), "scalar_field_from_client_schema_extension.graphql", "hover/fixtures/scalar_field_from_client_schema_extension.expected", input, expected).await;
}

#[tokio::test]
async fn scalar_field_from_relay_resolver() {
    let input = include_str!("hover/fixtures/scalar_field_from_relay_resolver.graphql");
    let expected = include_str!("hover/fixtures/scalar_field_from_relay_resolver.expected");
    test_fixture(transform_fixture, file!(), "scalar_field_from_relay_resolver.graphql", "hover/fixtures/scalar_field_from_relay_resolver.expected", input, expected).await;
}

#[tokio::test]
async fn scalar_field_with_description() {
    let input = include_str!("hover/fixtures/scalar_field_with_description.graphql");
    let expected = include_str!("hover/fixtures/scalar_field_with_description.expected");
    test_fixture(transform_fixture, file!(), "scalar_field_with_description.graphql", "hover/fixtures/scalar_field_with_description.expected", input, expected).await;
}

#[tokio::test]
async fn variable_definition() {
    let input = include_str!("hover/fixtures/variable_definition.graphql");
    let expected = include_str!("hover/fixtures/variable_definition.expected");
    test_fixture(transform_fixture, file!(), "variable_definition.graphql", "hover/fixtures/variable_definition.expected", input, expected).await;
}

#[tokio::test]
async fn variable_definition_with_default() {
    let input = include_str!("hover/fixtures/variable_definition_with_default.graphql");
    let expected = include_str!("hover/fixtures/variable_definition_with_default.expected");
    test_fixture(transform_fixture, file!(), "variable_definition_with_default.graphql", "hover/fixtures/variable_definition_with_default.expected", input, expected).await;
}

#[tokio::test]
async fn whitespace_after_query_selection() {
    let input = include_str!("hover/fixtures/whitespace_after_query_selection.graphql");
    let expected = include_str!("hover/fixtures/whitespace_after_query_selection.expected");
    test_fixture(transform_fixture, file!(), "whitespace_after_query_selection.graphql", "hover/fixtures/whitespace_after_query_selection.expected", input, expected).await;
}

#[tokio::test]
async fn whitespace_within_linked_field_selection() {
    let input = include_str!("hover/fixtures/whitespace_within_linked_field_selection.graphql");
    let expected = include_str!("hover/fixtures/whitespace_within_linked_field_selection.expected");
    test_fixture(transform_fixture, file!(), "whitespace_within_linked_field_selection.graphql", "hover/fixtures/whitespace_within_linked_field_selection.expected", input, expected).await;
}
