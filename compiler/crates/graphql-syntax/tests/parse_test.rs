// @generated SignedSource<<d68d2efe1c607ccb8ea31ffe921e03e7>>

mod parse;

use parse::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn incorrect_variable_name_invalid() {
    let input = include_str!("parse/fixtures/incorrect_variable_name.invalid.graphql");
    let expected = include_str!("parse/fixtures/incorrect_variable_name.invalid.expected");
    test_fixture(transform_fixture, "incorrect_variable_name.invalid.graphql", "parse/fixtures/incorrect_variable_name.invalid.expected", input, expected);
}

#[test]
fn invalid_number() {
    let input = include_str!("parse/fixtures/invalid_number.graphql");
    let expected = include_str!("parse/fixtures/invalid_number.expected");
    test_fixture(transform_fixture, "invalid_number.graphql", "parse/fixtures/invalid_number.expected", input, expected);
}

#[test]
fn keyword_as_name() {
    let input = include_str!("parse/fixtures/keyword_as_name.graphql");
    let expected = include_str!("parse/fixtures/keyword_as_name.expected");
    test_fixture(transform_fixture, "keyword_as_name.graphql", "parse/fixtures/keyword_as_name.expected", input, expected);
}

#[test]
fn kitchen_sink() {
    let input = include_str!("parse/fixtures/kitchen-sink.graphql");
    let expected = include_str!("parse/fixtures/kitchen-sink.expected");
    test_fixture(transform_fixture, "kitchen-sink.graphql", "parse/fixtures/kitchen-sink.expected", input, expected);
}

#[test]
fn list_of_enum() {
    let input = include_str!("parse/fixtures/list_of_enum.graphql");
    let expected = include_str!("parse/fixtures/list_of_enum.expected");
    test_fixture(transform_fixture, "list_of_enum.graphql", "parse/fixtures/list_of_enum.expected", input, expected);
}

#[test]
fn missing_zero_on_float_invalid() {
    let input = include_str!("parse/fixtures/missing_zero_on_float.invalid.graphql");
    let expected = include_str!("parse/fixtures/missing_zero_on_float.invalid.expected");
    test_fixture(transform_fixture, "missing_zero_on_float.invalid.graphql", "parse/fixtures/missing_zero_on_float.invalid.expected", input, expected);
}

#[test]
fn multiple_parse_errors_invalid() {
    let input = include_str!("parse/fixtures/multiple_parse_errors.invalid.graphql");
    let expected = include_str!("parse/fixtures/multiple_parse_errors.invalid.expected");
    test_fixture(transform_fixture, "multiple_parse_errors.invalid.graphql", "parse/fixtures/multiple_parse_errors.invalid.expected", input, expected);
}

#[test]
fn space_in_variable() {
    let input = include_str!("parse/fixtures/space_in_variable.graphql");
    let expected = include_str!("parse/fixtures/space_in_variable.expected");
    test_fixture(transform_fixture, "space_in_variable.graphql", "parse/fixtures/space_in_variable.expected", input, expected);
}

#[test]
fn unterminated_string_invalid() {
    let input = include_str!("parse/fixtures/unterminated_string.invalid.graphql");
    let expected = include_str!("parse/fixtures/unterminated_string.invalid.expected");
    test_fixture(transform_fixture, "unterminated_string.invalid.graphql", "parse/fixtures/unterminated_string.invalid.expected", input, expected);
}
