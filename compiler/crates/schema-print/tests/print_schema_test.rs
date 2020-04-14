// @generated SignedSource<<8a288a5752e17c88ffcf5b7919df9767>>

mod print_schema;

use print_schema::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn kitchen_sink() {
    let input = include_str!("print_schema/fixtures/kitchen-sink.graphql");
    let expected = include_str!("print_schema/fixtures/kitchen-sink.expected");
    test_fixture(transform_fixture, "kitchen-sink.graphql", "print_schema/fixtures/kitchen-sink.expected", input, expected);
}
