// @generated SignedSource<<7a164b0654a6cab3fd67eb6d9fe0aa0d>>

mod generate_subscription_name_metadata;

use generate_subscription_name_metadata::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn conditional_root_invalid() {
    let input = include_str!("generate_subscription_name_metadata/fixtures/conditional-root.invalid.graphql");
    let expected = include_str!("generate_subscription_name_metadata/fixtures/conditional-root.invalid.expected");
    test_fixture(transform_fixture, "conditional-root.invalid.graphql", "generate_subscription_name_metadata/fixtures/conditional-root.invalid.expected", input, expected);
}

#[test]
fn invalid_documents() {
    let input = include_str!("generate_subscription_name_metadata/fixtures/invalid-documents.graphql");
    let expected = include_str!("generate_subscription_name_metadata/fixtures/invalid-documents.expected");
    test_fixture(transform_fixture, "invalid-documents.graphql", "generate_subscription_name_metadata/fixtures/invalid-documents.expected", input, expected);
}

#[test]
fn valid_documents() {
    let input = include_str!("generate_subscription_name_metadata/fixtures/valid-documents.graphql");
    let expected = include_str!("generate_subscription_name_metadata/fixtures/valid-documents.expected");
    test_fixture(transform_fixture, "valid-documents.graphql", "generate_subscription_name_metadata/fixtures/valid-documents.expected", input, expected);
}
