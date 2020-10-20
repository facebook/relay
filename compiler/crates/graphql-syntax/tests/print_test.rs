// @generated SignedSource<<bade607e12e3613ab1587388e460cbd2>>

mod print;

use print::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn schema() {
    let input = include_str!("print/fixtures/schema.graphql");
    let expected = include_str!("print/fixtures/schema.expected");
    test_fixture(transform_fixture, "schema.graphql", "print/fixtures/schema.expected", input, expected);
}
