// @generated SignedSource<<007dc8f3e99f11bdfc34d85c14aeb575>>

mod ir;

use ir::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn base_definitions_change_fragment() {
    let input = include_str!("ir/fixtures/base-definitions-change-fragment.graphql");
    let expected = include_str!("ir/fixtures/base-definitions-change-fragment.expected");
    test_fixture(transform_fixture, "base-definitions-change-fragment.graphql", "ir/fixtures/base-definitions-change-fragment.expected", input, expected);
}

#[test]
fn base_definitions_change_fragment2() {
    let input = include_str!("ir/fixtures/base-definitions-change-fragment2.graphql");
    let expected = include_str!("ir/fixtures/base-definitions-change-fragment2.expected");
    test_fixture(transform_fixture, "base-definitions-change-fragment2.graphql", "ir/fixtures/base-definitions-change-fragment2.expected", input, expected);
}

#[test]
fn base_definitions_change_query() {
    let input = include_str!("ir/fixtures/base-definitions-change-query.graphql");
    let expected = include_str!("ir/fixtures/base-definitions-change-query.expected");
    test_fixture(transform_fixture, "base-definitions-change-query.graphql", "ir/fixtures/base-definitions-change-query.expected", input, expected);
}

#[test]
fn definitions_only_change_fragment() {
    let input = include_str!("ir/fixtures/definitions-only-change-fragment.graphql");
    let expected = include_str!("ir/fixtures/definitions-only-change-fragment.expected");
    test_fixture(transform_fixture, "definitions-only-change-fragment.graphql", "ir/fixtures/definitions-only-change-fragment.expected", input, expected);
}

#[test]
fn definitions_only_change_query() {
    let input = include_str!("ir/fixtures/definitions-only-change-query.graphql");
    let expected = include_str!("ir/fixtures/definitions-only-change-query.expected");
    test_fixture(transform_fixture, "definitions-only-change-query.graphql", "ir/fixtures/definitions-only-change-query.expected", input, expected);
}

#[test]
fn definitions_only_no_change() {
    let input = include_str!("ir/fixtures/definitions-only-no-change.graphql");
    let expected = include_str!("ir/fixtures/definitions-only-no-change.expected");
    test_fixture(transform_fixture, "definitions-only-no-change.graphql", "ir/fixtures/definitions-only-no-change.expected", input, expected);
}
