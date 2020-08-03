// @generated SignedSource<<dc28006987a64eabbcb35e523aa4f723>>

mod parse;

use parse::transform_fixture;
use fixture_tests::test_fixture;

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
fn multiple_parse_errors_invalid() {
    let input = include_str!("parse/fixtures/multiple_parse_errors.invalid.graphql");
    let expected = include_str!("parse/fixtures/multiple_parse_errors.invalid.expected");
    test_fixture(transform_fixture, "multiple_parse_errors.invalid.graphql", "parse/fixtures/multiple_parse_errors.invalid.expected", input, expected);
}

#[test]
fn unterminated_string_invalid() {
    let input = include_str!("parse/fixtures/unterminated_string.invalid.graphql");
    let expected = include_str!("parse/fixtures/unterminated_string.invalid.expected");
    test_fixture(transform_fixture, "unterminated_string.invalid.graphql", "parse/fixtures/unterminated_string.invalid.expected", input, expected);
}
