// @generated SignedSource<<254e20d8e5de581adeff295be76667ca>>

mod validate_connections;

use validate_connections::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn connection_invalid_type_invalid() {
    let input = include_str!("validate_connections/fixtures/connection-invalid-type.invalid.graphql");
    let expected = include_str!("validate_connections/fixtures/connection-invalid-type.invalid.expected");
    test_fixture(transform_fixture, "connection-invalid-type.invalid.graphql", "validate_connections/fixtures/connection-invalid-type.invalid.expected", input, expected);
}

#[test]
fn connection_missing_edges_selection() {
    let input = include_str!("validate_connections/fixtures/connection-missing-edges-selection.graphql");
    let expected = include_str!("validate_connections/fixtures/connection-missing-edges-selection.expected");
    test_fixture(transform_fixture, "connection-missing-edges-selection.graphql", "validate_connections/fixtures/connection-missing-edges-selection.expected", input, expected);
}

#[test]
fn connection_missing_first_arg_invalid() {
    let input = include_str!("validate_connections/fixtures/connection-missing-first-arg.invalid.graphql");
    let expected = include_str!("validate_connections/fixtures/connection-missing-first-arg.invalid.expected");
    test_fixture(transform_fixture, "connection-missing-first-arg.invalid.graphql", "validate_connections/fixtures/connection-missing-first-arg.invalid.expected", input, expected);
}

#[test]
fn connection_with_aliased_edges_page_info() {
    let input = include_str!("validate_connections/fixtures/connection-with-aliased-edges-page-info.graphql");
    let expected = include_str!("validate_connections/fixtures/connection-with-aliased-edges-page-info.expected");
    test_fixture(transform_fixture, "connection-with-aliased-edges-page-info.graphql", "validate_connections/fixtures/connection-with-aliased-edges-page-info.expected", input, expected);
}
