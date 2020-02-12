// @generated SignedSource<<05c83dcedf0870b222e79764be55acb9>>

mod ast;

use ast::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn base_definitions() {
    let input = include_str!("ast/fixtures/base-definitions.graphql");
    let expected = include_str!("ast/fixtures/base-definitions.expected");
    test_fixture(transform_fixture, "base-definitions.graphql", "ast/fixtures/base-definitions.expected", input, expected);
}

#[test]
fn definitions_only() {
    let input = include_str!("ast/fixtures/definitions-only.graphql");
    let expected = include_str!("ast/fixtures/definitions-only.expected");
    test_fixture(transform_fixture, "definitions-only.graphql", "ast/fixtures/definitions-only.expected", input, expected);
}

#[test]
fn multiple_base_definitions() {
    let input = include_str!("ast/fixtures/multiple-base-definitions.graphql");
    let expected = include_str!("ast/fixtures/multiple-base-definitions.expected");
    test_fixture(transform_fixture, "multiple-base-definitions.graphql", "ast/fixtures/multiple-base-definitions.expected", input, expected);
}
