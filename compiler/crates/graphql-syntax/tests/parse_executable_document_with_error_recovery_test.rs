/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<88d37ff7b1c29682fe64409a2914c1b1>>
 */

mod parse_executable_document_with_error_recovery;

use parse_executable_document_with_error_recovery::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn argument_missing_identifier() {
    let input = include_str!("parse_executable_document_with_error_recovery/fixtures/argument-missing-identifier.graphql");
    let expected = include_str!("parse_executable_document_with_error_recovery/fixtures/argument-missing-identifier.expected");
    test_fixture(transform_fixture, file!(), "argument-missing-identifier.graphql", "parse_executable_document_with_error_recovery/fixtures/argument-missing-identifier.expected", input, expected).await;
}

#[tokio::test]
async fn argument_missing_identifier_2() {
    let input = include_str!("parse_executable_document_with_error_recovery/fixtures/argument-missing-identifier-2.grahql");
    let expected = include_str!("parse_executable_document_with_error_recovery/fixtures/argument-missing-identifier-2.expected");
    test_fixture(transform_fixture, file!(), "argument-missing-identifier-2.grahql", "parse_executable_document_with_error_recovery/fixtures/argument-missing-identifier-2.expected", input, expected).await;
}

#[tokio::test]
async fn argument_missing_value() {
    let input = include_str!("parse_executable_document_with_error_recovery/fixtures/argument-missing-value.graphql");
    let expected = include_str!("parse_executable_document_with_error_recovery/fixtures/argument-missing-value.expected");
    test_fixture(transform_fixture, file!(), "argument-missing-value.graphql", "parse_executable_document_with_error_recovery/fixtures/argument-missing-value.expected", input, expected).await;
}

#[tokio::test]
async fn argument_missing_value_2() {
    let input = include_str!("parse_executable_document_with_error_recovery/fixtures/argument-missing-value-2.graphql");
    let expected = include_str!("parse_executable_document_with_error_recovery/fixtures/argument-missing-value-2.expected");
    test_fixture(transform_fixture, file!(), "argument-missing-value-2.graphql", "parse_executable_document_with_error_recovery/fixtures/argument-missing-value-2.expected", input, expected).await;
}

#[tokio::test]
async fn argument_name_only() {
    let input = include_str!("parse_executable_document_with_error_recovery/fixtures/argument-name-only.graphql");
    let expected = include_str!("parse_executable_document_with_error_recovery/fixtures/argument-name-only.expected");
    test_fixture(transform_fixture, file!(), "argument-name-only.graphql", "parse_executable_document_with_error_recovery/fixtures/argument-name-only.expected", input, expected).await;
}

#[tokio::test]
async fn argument_name_only_2() {
    let input = include_str!("parse_executable_document_with_error_recovery/fixtures/argument-name-only-2.graphql");
    let expected = include_str!("parse_executable_document_with_error_recovery/fixtures/argument-name-only-2.expected");
    test_fixture(transform_fixture, file!(), "argument-name-only-2.graphql", "parse_executable_document_with_error_recovery/fixtures/argument-name-only-2.expected", input, expected).await;
}

#[tokio::test]
async fn argument_value_only() {
    let input = include_str!("parse_executable_document_with_error_recovery/fixtures/argument-value-only.graphql");
    let expected = include_str!("parse_executable_document_with_error_recovery/fixtures/argument-value-only.expected");
    test_fixture(transform_fixture, file!(), "argument-value-only.graphql", "parse_executable_document_with_error_recovery/fixtures/argument-value-only.expected", input, expected).await;
}

#[tokio::test]
async fn argument_value_only_2() {
    let input = include_str!("parse_executable_document_with_error_recovery/fixtures/argument-value-only-2.graphql");
    let expected = include_str!("parse_executable_document_with_error_recovery/fixtures/argument-value-only-2.expected");
    test_fixture(transform_fixture, file!(), "argument-value-only-2.graphql", "parse_executable_document_with_error_recovery/fixtures/argument-value-only-2.expected", input, expected).await;
}

#[tokio::test]
async fn argument_value_only_3() {
    let input = include_str!("parse_executable_document_with_error_recovery/fixtures/argument-value-only-3.grahql");
    let expected = include_str!("parse_executable_document_with_error_recovery/fixtures/argument-value-only-3.expected");
    test_fixture(transform_fixture, file!(), "argument-value-only-3.grahql", "parse_executable_document_with_error_recovery/fixtures/argument-value-only-3.expected", input, expected).await;
}

#[tokio::test]
async fn argument_without_closing_paren() {
    let input = include_str!("parse_executable_document_with_error_recovery/fixtures/argument-without-closing-paren.graphql");
    let expected = include_str!("parse_executable_document_with_error_recovery/fixtures/argument-without-closing-paren.expected");
    test_fixture(transform_fixture, file!(), "argument-without-closing-paren.graphql", "parse_executable_document_with_error_recovery/fixtures/argument-without-closing-paren.expected", input, expected).await;
}

#[tokio::test]
async fn directive_without_name() {
    let input = include_str!("parse_executable_document_with_error_recovery/fixtures/directive-without-name.graphql");
    let expected = include_str!("parse_executable_document_with_error_recovery/fixtures/directive-without-name.expected");
    test_fixture(transform_fixture, file!(), "directive-without-name.graphql", "parse_executable_document_with_error_recovery/fixtures/directive-without-name.expected", input, expected).await;
}

#[tokio::test]
async fn empty_argument_list() {
    let input = include_str!("parse_executable_document_with_error_recovery/fixtures/empty-argument-list.graphql");
    let expected = include_str!("parse_executable_document_with_error_recovery/fixtures/empty-argument-list.expected");
    test_fixture(transform_fixture, file!(), "empty-argument-list.graphql", "parse_executable_document_with_error_recovery/fixtures/empty-argument-list.expected", input, expected).await;
}

#[tokio::test]
async fn empty_linked_field() {
    let input = include_str!("parse_executable_document_with_error_recovery/fixtures/empty-linked-field.graphql");
    let expected = include_str!("parse_executable_document_with_error_recovery/fixtures/empty-linked-field.expected");
    test_fixture(transform_fixture, file!(), "empty-linked-field.graphql", "parse_executable_document_with_error_recovery/fixtures/empty-linked-field.expected", input, expected).await;
}

#[tokio::test]
async fn inline_fragment_without_selection() {
    let input = include_str!("parse_executable_document_with_error_recovery/fixtures/inline-fragment-without-selection.graphql");
    let expected = include_str!("parse_executable_document_with_error_recovery/fixtures/inline-fragment-without-selection.expected");
    test_fixture(transform_fixture, file!(), "inline-fragment-without-selection.graphql", "parse_executable_document_with_error_recovery/fixtures/inline-fragment-without-selection.expected", input, expected).await;
}

#[tokio::test]
async fn type_in_argument_value() {
    let input = include_str!("parse_executable_document_with_error_recovery/fixtures/type-in-argument-value.graphql");
    let expected = include_str!("parse_executable_document_with_error_recovery/fixtures/type-in-argument-value.expected");
    test_fixture(transform_fixture, file!(), "type-in-argument-value.graphql", "parse_executable_document_with_error_recovery/fixtures/type-in-argument-value.expected", input, expected).await;
}

#[tokio::test]
async fn variable_definition_with_directive() {
    let input = include_str!("parse_executable_document_with_error_recovery/fixtures/variable-definition-with-directive.graphql");
    let expected = include_str!("parse_executable_document_with_error_recovery/fixtures/variable-definition-with-directive.expected");
    test_fixture(transform_fixture, file!(), "variable-definition-with-directive.graphql", "parse_executable_document_with_error_recovery/fixtures/variable-definition-with-directive.expected", input, expected).await;
}
