// @generated SignedSource<<cf3fce8e023099de5e87ffebc1c4e233>>

mod flatten;

use flatten::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn flatten_transform() {
    let input = include_str!("flatten/fixtures/flatten-transform.graphql");
    let expected = include_str!("flatten/fixtures/flatten-transform.expected");
    test_fixture(transform_fixture, "flatten-transform.graphql", "flatten/fixtures/flatten-transform.expected", input, expected);
}

#[test]
fn flattens_inline_inside_condition() {
    let input = include_str!("flatten/fixtures/flattens-inline-inside-condition.graphql");
    let expected = include_str!("flatten/fixtures/flattens-inline-inside-condition.expected");
    test_fixture(transform_fixture, "flattens-inline-inside-condition.graphql", "flatten/fixtures/flattens-inline-inside-condition.expected", input, expected);
}

#[test]
fn flattens_inside_plural() {
    let input = include_str!("flatten/fixtures/flattens-inside-plural.graphql");
    let expected = include_str!("flatten/fixtures/flattens-inside-plural.expected");
    test_fixture(transform_fixture, "flattens-inside-plural.graphql", "flatten/fixtures/flattens-inside-plural.expected", input, expected);
}

#[test]
fn flattens_matching_fragment_types() {
    let input = include_str!("flatten/fixtures/flattens-matching-fragment-types.graphql");
    let expected = include_str!("flatten/fixtures/flattens-matching-fragment-types.expected");
    test_fixture(transform_fixture, "flattens-matching-fragment-types.graphql", "flatten/fixtures/flattens-matching-fragment-types.expected", input, expected);
}

#[test]
fn linked_handle_field() {
    let input = include_str!("flatten/fixtures/linked-handle-field.graphql");
    let expected = include_str!("flatten/fixtures/linked-handle-field.expected");
    test_fixture(transform_fixture, "linked-handle-field.graphql", "flatten/fixtures/linked-handle-field.expected", input, expected);
}

#[test]
fn match_field() {
    let input = include_str!("flatten/fixtures/match-field.graphql");
    let expected = include_str!("flatten/fixtures/match-field.expected");
    test_fixture(transform_fixture, "match-field.graphql", "flatten/fixtures/match-field.expected", input, expected);
}

#[test]
fn match_field_overlap() {
    let input = include_str!("flatten/fixtures/match-field-overlap.graphql");
    let expected = include_str!("flatten/fixtures/match-field-overlap.expected");
    test_fixture(transform_fixture, "match-field-overlap.graphql", "flatten/fixtures/match-field-overlap.expected", input, expected);
}

#[test]
fn scalar_handle_field() {
    let input = include_str!("flatten/fixtures/scalar-handle-field.graphql");
    let expected = include_str!("flatten/fixtures/scalar-handle-field.expected");
    test_fixture(transform_fixture, "scalar-handle-field.graphql", "flatten/fixtures/scalar-handle-field.expected", input, expected);
}
