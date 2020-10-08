// @generated SignedSource<<8b5811fb68ab2dec3e74463ff65df5c5>>

mod sort_selections;

use sort_selections::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn sort_selections_transform() {
    let input = include_str!("sort_selections/fixtures/sort-selections-transform.graphql");
    let expected = include_str!("sort_selections/fixtures/sort-selections-transform.expected");
    test_fixture(transform_fixture, "sort-selections-transform.graphql", "sort_selections/fixtures/sort-selections-transform.expected", input, expected);
}
