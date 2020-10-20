// @generated SignedSource<<eb8a402d004252a43122e7a9ccf5c076>>

mod inline_data_fragment;

use inline_data_fragment::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn recursive() {
    let input = include_str!("inline_data_fragment/fixtures/recursive.graphql");
    let expected = include_str!("inline_data_fragment/fixtures/recursive.expected");
    test_fixture(transform_fixture, "recursive.graphql", "inline_data_fragment/fixtures/recursive.expected", input, expected);
}

#[test]
fn variables_invalid() {
    let input = include_str!("inline_data_fragment/fixtures/variables.invalid.graphql");
    let expected = include_str!("inline_data_fragment/fixtures/variables.invalid.expected");
    test_fixture(transform_fixture, "variables.invalid.graphql", "inline_data_fragment/fixtures/variables.invalid.expected", input, expected);
}
