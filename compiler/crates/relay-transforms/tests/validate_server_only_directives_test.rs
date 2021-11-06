/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<f65f558a58db04cdd6570d0c7165a0f5>>
 */

mod validate_server_only_directives;

use validate_server_only_directives::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn fragment_with_client_fileds_inside_valid_fragments() {
    let input = include_str!("validate_server_only_directives/fixtures/fragment-with-client-fileds-inside-valid-fragments.graphql");
    let expected = include_str!("validate_server_only_directives/fixtures/fragment-with-client-fileds-inside-valid-fragments.expected");
    test_fixture(transform_fixture, "fragment-with-client-fileds-inside-valid-fragments.graphql", "validate_server_only_directives/fixtures/fragment-with-client-fileds-inside-valid-fragments.expected", input, expected);
}

#[test]
fn fragment_with_defer_on_client_invalid() {
    let input = include_str!("validate_server_only_directives/fixtures/fragment-with-defer-on-client.invalid.graphql");
    let expected = include_str!("validate_server_only_directives/fixtures/fragment-with-defer-on-client.invalid.expected");
    test_fixture(transform_fixture, "fragment-with-defer-on-client.invalid.graphql", "validate_server_only_directives/fixtures/fragment-with-defer-on-client.invalid.expected", input, expected);
}

#[test]
fn fragment_with_defer_on_fragment_with_only_client_fields_invalid() {
    let input = include_str!("validate_server_only_directives/fixtures/fragment-with-defer-on-fragment-with-only-client-fields.invalid.graphql");
    let expected = include_str!("validate_server_only_directives/fixtures/fragment-with-defer-on-fragment-with-only-client-fields.invalid.expected");
    test_fixture(transform_fixture, "fragment-with-defer-on-fragment-with-only-client-fields.invalid.graphql", "validate_server_only_directives/fixtures/fragment-with-defer-on-fragment-with-only-client-fields.invalid.expected", input, expected);
}

#[test]
fn fragment_with_stream_child_of_client_invalid() {
    let input = include_str!("validate_server_only_directives/fixtures/fragment-with-stream-child-of-client.invalid.graphql");
    let expected = include_str!("validate_server_only_directives/fixtures/fragment-with-stream-child-of-client.invalid.expected");
    test_fixture(transform_fixture, "fragment-with-stream-child-of-client.invalid.graphql", "validate_server_only_directives/fixtures/fragment-with-stream-child-of-client.invalid.expected", input, expected);
}

#[test]
fn fragment_with_stream_on_client_invalid() {
    let input = include_str!("validate_server_only_directives/fixtures/fragment-with-stream-on-client.invalid.graphql");
    let expected = include_str!("validate_server_only_directives/fixtures/fragment-with-stream-on-client.invalid.expected");
    test_fixture(transform_fixture, "fragment-with-stream-on-client.invalid.graphql", "validate_server_only_directives/fixtures/fragment-with-stream-on-client.invalid.expected", input, expected);
}

#[test]
fn match_() {
    let input = include_str!("validate_server_only_directives/fixtures/match_.graphql");
    let expected = include_str!("validate_server_only_directives/fixtures/match_.expected");
    test_fixture(transform_fixture, "match_.graphql", "validate_server_only_directives/fixtures/match_.expected", input, expected);
}

#[test]
fn module_on_child_of_client() {
    let input = include_str!("validate_server_only_directives/fixtures/module-on-child-of-client.graphql");
    let expected = include_str!("validate_server_only_directives/fixtures/module-on-child-of-client.expected");
    test_fixture(transform_fixture, "module-on-child-of-client.graphql", "validate_server_only_directives/fixtures/module-on-child-of-client.expected", input, expected);
}

#[test]
fn module_on_child_of_client_in_fragment() {
    let input = include_str!("validate_server_only_directives/fixtures/module-on-child-of-client-in-fragment.graphql");
    let expected = include_str!("validate_server_only_directives/fixtures/module-on-child-of-client-in-fragment.expected");
    test_fixture(transform_fixture, "module-on-child-of-client-in-fragment.graphql", "validate_server_only_directives/fixtures/module-on-child-of-client-in-fragment.expected", input, expected);
}

#[test]
fn nested_fragment_with_defer() {
    let input = include_str!("validate_server_only_directives/fixtures/nested-fragment-with-defer.graphql");
    let expected = include_str!("validate_server_only_directives/fixtures/nested-fragment-with-defer.expected");
    test_fixture(transform_fixture, "nested-fragment-with-defer.graphql", "validate_server_only_directives/fixtures/nested-fragment-with-defer.expected", input, expected);
}

#[test]
fn stream_connection_on_client_invalid() {
    let input = include_str!("validate_server_only_directives/fixtures/stream-connection-on-client.invalid.graphql");
    let expected = include_str!("validate_server_only_directives/fixtures/stream-connection-on-client.invalid.expected");
    test_fixture(transform_fixture, "stream-connection-on-client.invalid.graphql", "validate_server_only_directives/fixtures/stream-connection-on-client.invalid.expected", input, expected);
}
