// @generated SignedSource<<dc42bfad5dea121e92be975964566316>>

mod skip_unused_variables;

use skip_unused_variables::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn kitchen_sink() {
    let input = include_str!("skip_unused_variables/fixtures/kitchen-sink.graphql");
    let expected = include_str!("skip_unused_variables/fixtures/kitchen-sink.expected");
    test_fixture(transform_fixture, "kitchen-sink.graphql", "skip_unused_variables/fixtures/kitchen-sink.expected", input, expected);
}
