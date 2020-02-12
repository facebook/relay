// @generated SignedSource<<4b9b772191dd8d40c7cb1a4239acad70>>

mod generate_typename;

use generate_typename::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn type_name_does_not_exist() {
    let input = include_str!("generate_typename/fixtures/type-name-does-not-exist.graphql");
    let expected = include_str!("generate_typename/fixtures/type-name-does-not-exist.expected");
    test_fixture(transform_fixture, "type-name-does-not-exist.graphql", "generate_typename/fixtures/type-name-does-not-exist.expected", input, expected);
}

#[test]
fn type_name_exists() {
    let input = include_str!("generate_typename/fixtures/type-name-exists.graphql");
    let expected = include_str!("generate_typename/fixtures/type-name-exists.expected");
    test_fixture(transform_fixture, "type-name-exists.graphql", "generate_typename/fixtures/type-name-exists.expected", input, expected);
}
