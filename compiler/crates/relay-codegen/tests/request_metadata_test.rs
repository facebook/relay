// @generated SignedSource<<945c5215b26404a1c2f29dfc86b79911>>

mod request_metadata;

use request_metadata::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn valid_documents() {
    let input = include_str!("request_metadata/fixtures/valid-documents.graphql");
    let expected = include_str!("request_metadata/fixtures/valid-documents.expected");
    test_fixture(transform_fixture, "valid-documents.graphql", "request_metadata/fixtures/valid-documents.expected", input, expected);
}
