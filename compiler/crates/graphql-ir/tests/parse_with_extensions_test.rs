/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<624dd9ddfecfe569df689202ad63347c>>
 */

mod parse_with_extensions;

use parse_with_extensions::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn client_fields() {
    let input = include_str!("parse_with_extensions/fixtures/client-fields.graphql");
    let expected = include_str!("parse_with_extensions/fixtures/client-fields.expected");
    test_fixture(transform_fixture, file!(), "client-fields.graphql", "parse_with_extensions/fixtures/client-fields.expected", input, expected).await;
}

#[tokio::test]
async fn client_fields_invalid() {
    let input = include_str!("parse_with_extensions/fixtures/client-fields.invalid.graphql");
    let expected = include_str!("parse_with_extensions/fixtures/client-fields.invalid.expected");
    test_fixture(transform_fixture, file!(), "client-fields.invalid.graphql", "parse_with_extensions/fixtures/client-fields.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn custom_scalar_directive_arg_invalid() {
    let input = include_str!("parse_with_extensions/fixtures/custom_scalar_directive_arg.invalid.graphql");
    let expected = include_str!("parse_with_extensions/fixtures/custom_scalar_directive_arg.invalid.expected");
    test_fixture(transform_fixture, file!(), "custom_scalar_directive_arg.invalid.graphql", "parse_with_extensions/fixtures/custom_scalar_directive_arg.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn custom_scalar_directive_arg_variable() {
    let input = include_str!("parse_with_extensions/fixtures/custom_scalar_directive_arg_variable.graphql");
    let expected = include_str!("parse_with_extensions/fixtures/custom_scalar_directive_arg_variable.expected");
    test_fixture(transform_fixture, file!(), "custom_scalar_directive_arg_variable.graphql", "parse_with_extensions/fixtures/custom_scalar_directive_arg_variable.expected", input, expected).await;
}

#[tokio::test]
async fn custom_scalar_list_literal_arg_invalid() {
    let input = include_str!("parse_with_extensions/fixtures/custom_scalar_list_literal_arg.invalid.graphql");
    let expected = include_str!("parse_with_extensions/fixtures/custom_scalar_list_literal_arg.invalid.expected");
    test_fixture(transform_fixture, file!(), "custom_scalar_list_literal_arg.invalid.graphql", "parse_with_extensions/fixtures/custom_scalar_list_literal_arg.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn custom_scalar_list_mixed_arg_invalid() {
    let input = include_str!("parse_with_extensions/fixtures/custom_scalar_list_mixed_arg.invalid.graphql");
    let expected = include_str!("parse_with_extensions/fixtures/custom_scalar_list_mixed_arg.invalid.expected");
    test_fixture(transform_fixture, file!(), "custom_scalar_list_mixed_arg.invalid.graphql", "parse_with_extensions/fixtures/custom_scalar_list_mixed_arg.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn custom_scalar_list_other_literal_args_invalid() {
    let input = include_str!("parse_with_extensions/fixtures/custom_scalar_list_other_literal_args.invalid.graphql");
    let expected = include_str!("parse_with_extensions/fixtures/custom_scalar_list_other_literal_args.invalid.expected");
    test_fixture(transform_fixture, file!(), "custom_scalar_list_other_literal_args.invalid.graphql", "parse_with_extensions/fixtures/custom_scalar_list_other_literal_args.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn custom_scalar_literal_arg_invalid() {
    let input = include_str!("parse_with_extensions/fixtures/custom_scalar_literal_arg.invalid.graphql");
    let expected = include_str!("parse_with_extensions/fixtures/custom_scalar_literal_arg.invalid.expected");
    test_fixture(transform_fixture, file!(), "custom_scalar_literal_arg.invalid.graphql", "parse_with_extensions/fixtures/custom_scalar_literal_arg.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn custom_scalar_literal_arg_nested_invalid() {
    let input = include_str!("parse_with_extensions/fixtures/custom_scalar_literal_arg_nested.invalid.graphql");
    let expected = include_str!("parse_with_extensions/fixtures/custom_scalar_literal_arg_nested.invalid.expected");
    test_fixture(transform_fixture, file!(), "custom_scalar_literal_arg_nested.invalid.graphql", "parse_with_extensions/fixtures/custom_scalar_literal_arg_nested.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn custom_scalar_object_literal_arg_invalid() {
    let input = include_str!("parse_with_extensions/fixtures/custom_scalar_object_literal_arg.invalid.graphql");
    let expected = include_str!("parse_with_extensions/fixtures/custom_scalar_object_literal_arg.invalid.expected");
    test_fixture(transform_fixture, file!(), "custom_scalar_object_literal_arg.invalid.graphql", "parse_with_extensions/fixtures/custom_scalar_object_literal_arg.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn custom_scalar_other_literal_args_invalid() {
    let input = include_str!("parse_with_extensions/fixtures/custom_scalar_other_literal_args.invalid.graphql");
    let expected = include_str!("parse_with_extensions/fixtures/custom_scalar_other_literal_args.invalid.expected");
    test_fixture(transform_fixture, file!(), "custom_scalar_other_literal_args.invalid.graphql", "parse_with_extensions/fixtures/custom_scalar_other_literal_args.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn custom_scalar_variable_arg() {
    let input = include_str!("parse_with_extensions/fixtures/custom_scalar_variable_arg.graphql");
    let expected = include_str!("parse_with_extensions/fixtures/custom_scalar_variable_arg.expected");
    test_fixture(transform_fixture, file!(), "custom_scalar_variable_arg.graphql", "parse_with_extensions/fixtures/custom_scalar_variable_arg.expected", input, expected).await;
}

#[tokio::test]
async fn custom_scalar_variable_default_arg_invalid() {
    let input = include_str!("parse_with_extensions/fixtures/custom_scalar_variable_default_arg.invalid.graphql");
    let expected = include_str!("parse_with_extensions/fixtures/custom_scalar_variable_default_arg.invalid.expected");
    test_fixture(transform_fixture, file!(), "custom_scalar_variable_default_arg.invalid.graphql", "parse_with_extensions/fixtures/custom_scalar_variable_default_arg.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn custom_server_scalar_literal_args_invalid() {
    let input = include_str!("parse_with_extensions/fixtures/custom_server_scalar_literal_args.invalid.graphql");
    let expected = include_str!("parse_with_extensions/fixtures/custom_server_scalar_literal_args.invalid.expected");
    test_fixture(transform_fixture, file!(), "custom_server_scalar_literal_args.invalid.graphql", "parse_with_extensions/fixtures/custom_server_scalar_literal_args.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn list_of_custom_scalar_literal_arg_invalid() {
    let input = include_str!("parse_with_extensions/fixtures/list_of_custom_scalar_literal_arg.invalid.graphql");
    let expected = include_str!("parse_with_extensions/fixtures/list_of_custom_scalar_literal_arg.invalid.expected");
    test_fixture(transform_fixture, file!(), "list_of_custom_scalar_literal_arg.invalid.graphql", "parse_with_extensions/fixtures/list_of_custom_scalar_literal_arg.invalid.expected", input, expected).await;
}
