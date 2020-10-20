// @generated SignedSource<<958d6eea05e8137c7da17490e2bc59dc>>

mod relay_early_flush;

use relay_early_flush::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn query_with_relay_early_flush() {
    let input = include_str!("relay_early_flush/fixtures/query-with-relay-early-flush.graphql");
    let expected = include_str!("relay_early_flush/fixtures/query-with-relay-early-flush.expected");
    test_fixture(transform_fixture, "query-with-relay-early-flush.graphql", "relay_early_flush/fixtures/query-with-relay-early-flush.expected", input, expected);
}
