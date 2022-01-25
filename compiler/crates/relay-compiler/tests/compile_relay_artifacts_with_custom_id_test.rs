/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<029b71da6b224936e7ca559c10f51c93>>
 */

mod compile_relay_artifacts_with_custom_id;

use compile_relay_artifacts_with_custom_id::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn fragment_on_node_interface() {
    let input = include_str!("compile_relay_artifacts_with_custom_id/fixtures/fragment-on-node-interface.graphql");
    let expected = include_str!("compile_relay_artifacts_with_custom_id/fixtures/fragment-on-node-interface.expected");
    test_fixture(transform_fixture, "fragment-on-node-interface.graphql", "compile_relay_artifacts_with_custom_id/fixtures/fragment-on-node-interface.expected", input, expected);
}

#[test]
fn fragment_on_object_implementing_node_interface() {
    let input = include_str!("compile_relay_artifacts_with_custom_id/fixtures/fragment-on-object-implementing-node-interface.graphql");
    let expected = include_str!("compile_relay_artifacts_with_custom_id/fixtures/fragment-on-object-implementing-node-interface.expected");
    test_fixture(transform_fixture, "fragment-on-object-implementing-node-interface.graphql", "compile_relay_artifacts_with_custom_id/fixtures/fragment-on-object-implementing-node-interface.expected", input, expected);
}

#[test]
fn fragment_on_query() {
    let input = include_str!("compile_relay_artifacts_with_custom_id/fixtures/fragment-on-query.graphql");
    let expected = include_str!("compile_relay_artifacts_with_custom_id/fixtures/fragment-on-query.expected");
    test_fixture(transform_fixture, "fragment-on-query.graphql", "compile_relay_artifacts_with_custom_id/fixtures/fragment-on-query.expected", input, expected);
}

#[test]
fn fragment_on_query_with_cycle_invalid() {
    let input = include_str!("compile_relay_artifacts_with_custom_id/fixtures/fragment-on-query-with-cycle.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts_with_custom_id/fixtures/fragment-on-query-with-cycle.invalid.expected");
    test_fixture(transform_fixture, "fragment-on-query-with-cycle.invalid.graphql", "compile_relay_artifacts_with_custom_id/fixtures/fragment-on-query-with-cycle.invalid.expected", input, expected);
}

#[test]
fn fragment_on_viewer() {
    let input = include_str!("compile_relay_artifacts_with_custom_id/fixtures/fragment-on-viewer.graphql");
    let expected = include_str!("compile_relay_artifacts_with_custom_id/fixtures/fragment-on-viewer.expected");
    test_fixture(transform_fixture, "fragment-on-viewer.graphql", "compile_relay_artifacts_with_custom_id/fixtures/fragment-on-viewer.expected", input, expected);
}

#[test]
fn id_as_alias_invalid() {
    let input = include_str!("compile_relay_artifacts_with_custom_id/fixtures/id-as-alias.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts_with_custom_id/fixtures/id-as-alias.invalid.expected");
    test_fixture(transform_fixture, "id-as-alias.invalid.graphql", "compile_relay_artifacts_with_custom_id/fixtures/id-as-alias.invalid.expected", input, expected);
}

#[test]
fn kitchen_sink() {
    let input = include_str!("compile_relay_artifacts_with_custom_id/fixtures/kitchen-sink.graphql");
    let expected = include_str!("compile_relay_artifacts_with_custom_id/fixtures/kitchen-sink.expected");
    test_fixture(transform_fixture, "kitchen-sink.graphql", "compile_relay_artifacts_with_custom_id/fixtures/kitchen-sink.expected", input, expected);
}

#[test]
fn refetchable_conflict_with_operation_invalid() {
    let input = include_str!("compile_relay_artifacts_with_custom_id/fixtures/refetchable_conflict_with_operation.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts_with_custom_id/fixtures/refetchable_conflict_with_operation.invalid.expected");
    test_fixture(transform_fixture, "refetchable_conflict_with_operation.invalid.graphql", "compile_relay_artifacts_with_custom_id/fixtures/refetchable_conflict_with_operation.invalid.expected", input, expected);
}

#[test]
fn refetchable_conflict_with_refetchable_invalid() {
    let input = include_str!("compile_relay_artifacts_with_custom_id/fixtures/refetchable_conflict_with_refetchable.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts_with_custom_id/fixtures/refetchable_conflict_with_refetchable.invalid.expected");
    test_fixture(transform_fixture, "refetchable_conflict_with_refetchable.invalid.graphql", "compile_relay_artifacts_with_custom_id/fixtures/refetchable_conflict_with_refetchable.invalid.expected", input, expected);
}

#[test]
fn refetchable_connection() {
    let input = include_str!("compile_relay_artifacts_with_custom_id/fixtures/refetchable-connection.graphql");
    let expected = include_str!("compile_relay_artifacts_with_custom_id/fixtures/refetchable-connection.expected");
    test_fixture(transform_fixture, "refetchable-connection.graphql", "compile_relay_artifacts_with_custom_id/fixtures/refetchable-connection.expected", input, expected);
}

#[test]
fn refetchable_fragment_on_node_with_missing_id() {
    let input = include_str!("compile_relay_artifacts_with_custom_id/fixtures/refetchable-fragment-on-node-with-missing-id.graphql");
    let expected = include_str!("compile_relay_artifacts_with_custom_id/fixtures/refetchable-fragment-on-node-with-missing-id.expected");
    test_fixture(transform_fixture, "refetchable-fragment-on-node-with-missing-id.graphql", "compile_relay_artifacts_with_custom_id/fixtures/refetchable-fragment-on-node-with-missing-id.expected", input, expected);
}

#[test]
fn refetchable_with_arguments_conflicting_invalid() {
    let input = include_str!("compile_relay_artifacts_with_custom_id/fixtures/refetchable-with-arguments-conflicting.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts_with_custom_id/fixtures/refetchable-with-arguments-conflicting.invalid.expected");
    test_fixture(transform_fixture, "refetchable-with-arguments-conflicting.invalid.graphql", "compile_relay_artifacts_with_custom_id/fixtures/refetchable-with-arguments-conflicting.invalid.expected", input, expected);
}

#[test]
fn refetchable_with_arguments_invalid() {
    let input = include_str!("compile_relay_artifacts_with_custom_id/fixtures/refetchable-with-arguments.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts_with_custom_id/fixtures/refetchable-with-arguments.invalid.expected");
    test_fixture(transform_fixture, "refetchable-with-arguments.invalid.graphql", "compile_relay_artifacts_with_custom_id/fixtures/refetchable-with-arguments.invalid.expected", input, expected);
}

#[test]
fn relay_client_id_field() {
    let input = include_str!("compile_relay_artifacts_with_custom_id/fixtures/relay-client-id-field.graphql");
    let expected = include_str!("compile_relay_artifacts_with_custom_id/fixtures/relay-client-id-field.expected");
    test_fixture(transform_fixture, "relay-client-id-field.graphql", "compile_relay_artifacts_with_custom_id/fixtures/relay-client-id-field.expected", input, expected);
}

#[test]
fn unions() {
    let input = include_str!("compile_relay_artifacts_with_custom_id/fixtures/unions.graphql");
    let expected = include_str!("compile_relay_artifacts_with_custom_id/fixtures/unions.expected");
    test_fixture(transform_fixture, "unions.graphql", "compile_relay_artifacts_with_custom_id/fixtures/unions.expected", input, expected);
}

#[test]
fn viewer_query() {
    let input = include_str!("compile_relay_artifacts_with_custom_id/fixtures/viewer-query.graphql");
    let expected = include_str!("compile_relay_artifacts_with_custom_id/fixtures/viewer-query.expected");
    test_fixture(transform_fixture, "viewer-query.graphql", "compile_relay_artifacts_with_custom_id/fixtures/viewer-query.expected", input, expected);
}
