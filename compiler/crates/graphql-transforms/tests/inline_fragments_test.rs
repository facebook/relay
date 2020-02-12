// @generated SignedSource<<9bc6cfd8a7845af0280e35c8f7d2c8ca>>

mod inline_fragments;

use inline_fragments::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn inlines_nested_fragments() {
    let input = include_str!("inline_fragments/fixtures/inlines-nested-fragments.graphql");
    let expected = include_str!("inline_fragments/fixtures/inlines-nested-fragments.expected");
    test_fixture(transform_fixture, "inlines-nested-fragments.graphql", "inline_fragments/fixtures/inlines-nested-fragments.expected", input, expected);
}
