// @generated SignedSource<<09bd688f1aade23919f04a8f057ee460>>

mod json_codegen;

use json_codegen::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn kitchen_sink() {
    let input = include_str!("json_codegen/fixtures/kitchen-sink.graphql");
    let expected = include_str!("json_codegen/fixtures/kitchen-sink.expected");
    test_fixture(transform_fixture, "kitchen-sink.graphql", "json_codegen/fixtures/kitchen-sink.expected", input, expected);
}

#[test]
fn stable_literals() {
    let input = include_str!("json_codegen/fixtures/stable-literals.graphql");
    let expected = include_str!("json_codegen/fixtures/stable-literals.expected");
    test_fixture(transform_fixture, "stable-literals.graphql", "json_codegen/fixtures/stable-literals.expected", input, expected);
}
