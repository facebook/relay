// @generated SignedSource<<1a2ef3a79394d9b2c48234e0cc17b0d9>>

mod relay_test_operation;

use relay_test_operation::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn mutation() {
    let input = include_str!("relay_test_operation/fixtures/mutation.graphql");
    let expected = include_str!("relay_test_operation/fixtures/mutation.expected");
    test_fixture(transform_fixture, "mutation.graphql", "relay_test_operation/fixtures/mutation.expected", input, expected);
}

#[test]
fn query_with_enums() {
    let input = include_str!("relay_test_operation/fixtures/query-with-enums.graphql");
    let expected = include_str!("relay_test_operation/fixtures/query-with-enums.expected");
    test_fixture(transform_fixture, "query-with-enums.graphql", "relay_test_operation/fixtures/query-with-enums.expected", input, expected);
}

#[test]
fn simple_query() {
    let input = include_str!("relay_test_operation/fixtures/simple-query.graphql");
    let expected = include_str!("relay_test_operation/fixtures/simple-query.expected");
    test_fixture(transform_fixture, "simple-query.graphql", "relay_test_operation/fixtures/simple-query.expected", input, expected);
}

#[test]
fn subscription() {
    let input = include_str!("relay_test_operation/fixtures/subscription.graphql");
    let expected = include_str!("relay_test_operation/fixtures/subscription.expected");
    test_fixture(transform_fixture, "subscription.graphql", "relay_test_operation/fixtures/subscription.expected", input, expected);
}
