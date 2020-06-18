// @generated SignedSource<<cdc54d10bbf339527e4d7141307070d0>>

mod generate_preloadable_metadata;

use generate_preloadable_metadata::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn invalid_document() {
    let input = include_str!("generate_preloadable_metadata/fixtures/invalid-document.graphql");
    let expected = include_str!("generate_preloadable_metadata/fixtures/invalid-document.expected");
    test_fixture(transform_fixture, "invalid-document.graphql", "generate_preloadable_metadata/fixtures/invalid-document.expected", input, expected);
}

#[test]
fn valid_documents() {
    let input = include_str!("generate_preloadable_metadata/fixtures/valid-documents.graphql");
    let expected = include_str!("generate_preloadable_metadata/fixtures/valid-documents.expected");
    test_fixture(transform_fixture, "valid-documents.graphql", "generate_preloadable_metadata/fixtures/valid-documents.expected", input, expected);
}
