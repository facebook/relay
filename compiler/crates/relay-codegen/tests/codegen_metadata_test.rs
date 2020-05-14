// @generated SignedSource<<386f10185b41da1e52b2f13d628c771d>>

mod codegen_metadata;

use codegen_metadata::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn simple_query() {
    let input = include_str!("codegen_metadata/fixtures/simple-query.graphql");
    let expected = include_str!("codegen_metadata/fixtures/simple-query.expected");
    test_fixture(transform_fixture, "simple-query.graphql", "codegen_metadata/fixtures/simple-query.expected", input, expected);
}
