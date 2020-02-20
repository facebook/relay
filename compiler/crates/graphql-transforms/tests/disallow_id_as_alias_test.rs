// @generated SignedSource<<b0fcfc8f773dbaf3e6afad8bbec696a0>>

mod disallow_id_as_alias;

use disallow_id_as_alias::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn id_alias() {
    let input = include_str!("disallow_id_as_alias/fixtures/id-alias.graphql");
    let expected = include_str!("disallow_id_as_alias/fixtures/id-alias.expected");
    test_fixture(transform_fixture, "id-alias.graphql", "disallow_id_as_alias/fixtures/id-alias.expected", input, expected);
}

#[test]
fn id_alias_with_errors() {
    let input = include_str!("disallow_id_as_alias/fixtures/id-alias-with-errors.graphql");
    let expected = include_str!("disallow_id_as_alias/fixtures/id-alias-with-errors.expected");
    test_fixture(transform_fixture, "id-alias-with-errors.graphql", "disallow_id_as_alias/fixtures/id-alias-with-errors.expected", input, expected);
}
