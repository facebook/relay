// @generated SignedSource<<54413bf29ddbaf28b678923848f27fa1>>

mod generate_preloadable_metadata;

use generate_preloadable_metadata::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn valid_documents() {
    let input = include_str!("generate_preloadable_metadata/fixtures/valid-documents.graphql");
    let expected = include_str!("generate_preloadable_metadata/fixtures/valid-documents.expected");
    test_fixture(transform_fixture, "valid-documents.graphql", "generate_preloadable_metadata/fixtures/valid-documents.expected", input, expected);
}
