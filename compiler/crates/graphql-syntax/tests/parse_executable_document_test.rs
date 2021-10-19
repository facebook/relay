/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<4f8b953b54af49cae4e1d41163e10f0e>>
 */

mod parse_executable_document;

use parse_executable_document::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn block_string() {
    let input = include_str!("parse_executable_document/fixtures/block_string.graphql");
    let expected = include_str!("parse_executable_document/fixtures/block_string.expected");
    test_fixture(transform_fixture, "block_string.graphql", "parse_executable_document/fixtures/block_string.expected", input, expected);
}

#[test]
fn incorrect_variable_name_invalid() {
    let input = include_str!("parse_executable_document/fixtures/incorrect_variable_name.invalid.graphql");
    let expected = include_str!("parse_executable_document/fixtures/incorrect_variable_name.invalid.expected");
    test_fixture(transform_fixture, "incorrect_variable_name.invalid.graphql", "parse_executable_document/fixtures/incorrect_variable_name.invalid.expected", input, expected);
}

#[test]
fn invalid_number() {
    let input = include_str!("parse_executable_document/fixtures/invalid_number.graphql");
    let expected = include_str!("parse_executable_document/fixtures/invalid_number.expected");
    test_fixture(transform_fixture, "invalid_number.graphql", "parse_executable_document/fixtures/invalid_number.expected", input, expected);
}

#[test]
fn keyword_as_name() {
    let input = include_str!("parse_executable_document/fixtures/keyword_as_name.graphql");
    let expected = include_str!("parse_executable_document/fixtures/keyword_as_name.expected");
    test_fixture(transform_fixture, "keyword_as_name.graphql", "parse_executable_document/fixtures/keyword_as_name.expected", input, expected);
}

#[test]
fn kitchen_sink() {
    let input = include_str!("parse_executable_document/fixtures/kitchen-sink.graphql");
    let expected = include_str!("parse_executable_document/fixtures/kitchen-sink.expected");
    test_fixture(transform_fixture, "kitchen-sink.graphql", "parse_executable_document/fixtures/kitchen-sink.expected", input, expected);
}

#[test]
fn list_of_enum() {
    let input = include_str!("parse_executable_document/fixtures/list_of_enum.graphql");
    let expected = include_str!("parse_executable_document/fixtures/list_of_enum.expected");
    test_fixture(transform_fixture, "list_of_enum.graphql", "parse_executable_document/fixtures/list_of_enum.expected", input, expected);
}

#[test]
fn missing_zero_on_float_invalid() {
    let input = include_str!("parse_executable_document/fixtures/missing_zero_on_float.invalid.graphql");
    let expected = include_str!("parse_executable_document/fixtures/missing_zero_on_float.invalid.expected");
    test_fixture(transform_fixture, "missing_zero_on_float.invalid.graphql", "parse_executable_document/fixtures/missing_zero_on_float.invalid.expected", input, expected);
}

#[test]
fn multiple_parse_errors_invalid() {
    let input = include_str!("parse_executable_document/fixtures/multiple_parse_errors.invalid.graphql");
    let expected = include_str!("parse_executable_document/fixtures/multiple_parse_errors.invalid.expected");
    test_fixture(transform_fixture, "multiple_parse_errors.invalid.graphql", "parse_executable_document/fixtures/multiple_parse_errors.invalid.expected", input, expected);
}

#[test]
fn space_in_variable() {
    let input = include_str!("parse_executable_document/fixtures/space_in_variable.graphql");
    let expected = include_str!("parse_executable_document/fixtures/space_in_variable.expected");
    test_fixture(transform_fixture, "space_in_variable.graphql", "parse_executable_document/fixtures/space_in_variable.expected", input, expected);
}

#[test]
fn unterminated_string_invalid() {
    let input = include_str!("parse_executable_document/fixtures/unterminated_string.invalid.graphql");
    let expected = include_str!("parse_executable_document/fixtures/unterminated_string.invalid.expected");
    test_fixture(transform_fixture, "unterminated_string.invalid.graphql", "parse_executable_document/fixtures/unterminated_string.invalid.expected", input, expected);
}
