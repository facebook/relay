// @generated SignedSource<<a60416ae2e6ab7dea59da3c3da781539>>

mod operation_printer;

use operation_printer::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn multiple_queries_with_same_fragment() {
    let input = include_str!("operation_printer/fixtures/multiple-queries-with-same-fragment.graphql");
    let expected = include_str!("operation_printer/fixtures/multiple-queries-with-same-fragment.expected");
    test_fixture(transform_fixture, "multiple-queries-with-same-fragment.graphql", "operation_printer/fixtures/multiple-queries-with-same-fragment.expected", input, expected);
}

#[test]
fn query_with_fragment_spreads() {
    let input = include_str!("operation_printer/fixtures/query-with-fragment-spreads.graphql");
    let expected = include_str!("operation_printer/fixtures/query-with-fragment-spreads.expected");
    test_fixture(transform_fixture, "query-with-fragment-spreads.graphql", "operation_printer/fixtures/query-with-fragment-spreads.expected", input, expected);
}

#[test]
fn query_with_nested_fragment_srpeads() {
    let input = include_str!("operation_printer/fixtures/query-with-nested-fragment-srpeads.graphql");
    let expected = include_str!("operation_printer/fixtures/query-with-nested-fragment-srpeads.expected");
    test_fixture(transform_fixture, "query-with-nested-fragment-srpeads.graphql", "operation_printer/fixtures/query-with-nested-fragment-srpeads.expected", input, expected);
}
