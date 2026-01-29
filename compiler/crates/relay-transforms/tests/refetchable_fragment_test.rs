/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b5ce6ba653f419089b892dcdd3b4b32d>>
 */

mod refetchable_fragment;

use refetchable_fragment::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn fragment_on_interface_which_implementations_implement_node() {
    let input = include_str!("refetchable_fragment/fixtures/fragment-on-interface-which-implementations-implement-node.graphql");
    let expected = include_str!("refetchable_fragment/fixtures/fragment-on-interface-which-implementations-implement-node.expected");
    test_fixture(transform_fixture, file!(), "fragment-on-interface-which-implementations-implement-node.graphql", "refetchable_fragment/fixtures/fragment-on-interface-which-implementations-implement-node.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_on_interface_which_implementations_not_implement_node_invalid() {
    let input = include_str!("refetchable_fragment/fixtures/fragment-on-interface-which-implementations-not-implement-node.invalid.graphql");
    let expected = include_str!("refetchable_fragment/fixtures/fragment-on-interface-which-implementations-not-implement-node.invalid.expected");
    test_fixture(transform_fixture, file!(), "fragment-on-interface-which-implementations-not-implement-node.invalid.graphql", "refetchable_fragment/fixtures/fragment-on-interface-which-implementations-not-implement-node.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_on_interface_without_id() {
    let input = include_str!("refetchable_fragment/fixtures/fragment-on-interface-without-id.graphql");
    let expected = include_str!("refetchable_fragment/fixtures/fragment-on-interface-without-id.expected");
    test_fixture(transform_fixture, file!(), "fragment-on-interface-without-id.graphql", "refetchable_fragment/fixtures/fragment-on-interface-without-id.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_on_interface_without_implementations_invalid() {
    let input = include_str!("refetchable_fragment/fixtures/fragment-on-interface-without-implementations.invalid.graphql");
    let expected = include_str!("refetchable_fragment/fixtures/fragment-on-interface-without-implementations.invalid.expected");
    test_fixture(transform_fixture, file!(), "fragment-on-interface-without-implementations.invalid.graphql", "refetchable_fragment/fixtures/fragment-on-interface-without-implementations.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_on_node_interface() {
    let input = include_str!("refetchable_fragment/fixtures/fragment-on-node-interface.graphql");
    let expected = include_str!("refetchable_fragment/fixtures/fragment-on-node-interface.expected");
    test_fixture(transform_fixture, file!(), "fragment-on-node-interface.graphql", "refetchable_fragment/fixtures/fragment-on-node-interface.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_on_node_interface_without_id() {
    let input = include_str!("refetchable_fragment/fixtures/fragment-on-node-interface-without-id.graphql");
    let expected = include_str!("refetchable_fragment/fixtures/fragment-on-node-interface-without-id.expected");
    test_fixture(transform_fixture, file!(), "fragment-on-node-interface-without-id.graphql", "refetchable_fragment/fixtures/fragment-on-node-interface-without-id.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_on_node_with_id_argument_used_invalid() {
    let input = include_str!("refetchable_fragment/fixtures/fragment-on-node-with-id-argument-used.invalid.graphql");
    let expected = include_str!("refetchable_fragment/fixtures/fragment-on-node-with-id-argument-used.invalid.expected");
    test_fixture(transform_fixture, file!(), "fragment-on-node-with-id-argument-used.invalid.graphql", "refetchable_fragment/fixtures/fragment-on-node-with-id-argument-used.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_on_non_node_fetchable_type() {
    let input = include_str!("refetchable_fragment/fixtures/fragment-on-non-node-fetchable-type.graphql");
    let expected = include_str!("refetchable_fragment/fixtures/fragment-on-non-node-fetchable-type.expected");
    test_fixture(transform_fixture, file!(), "fragment-on-non-node-fetchable-type.graphql", "refetchable_fragment/fixtures/fragment-on-non-node-fetchable-type.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_on_non_node_fetchable_type_with_token_field() {
    let input = include_str!("refetchable_fragment/fixtures/fragment-on-non-node-fetchable-type-with-token-field.graphql");
    let expected = include_str!("refetchable_fragment/fixtures/fragment-on-non-node-fetchable-type-with-token-field.expected");
    test_fixture(transform_fixture, file!(), "fragment-on-non-node-fetchable-type-with-token-field.graphql", "refetchable_fragment/fixtures/fragment-on-non-node-fetchable-type-with-token-field.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_on_object_implementing_node_interface() {
    let input = include_str!("refetchable_fragment/fixtures/fragment-on-object-implementing-node-interface.graphql");
    let expected = include_str!("refetchable_fragment/fixtures/fragment-on-object-implementing-node-interface.expected");
    test_fixture(transform_fixture, file!(), "fragment-on-object-implementing-node-interface.graphql", "refetchable_fragment/fixtures/fragment-on-object-implementing-node-interface.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_on_object_implementing_node_interface_with_alias_id() {
    let input = include_str!("refetchable_fragment/fixtures/fragment-on-object-implementing-node-interface-with-alias-id.graphql");
    let expected = include_str!("refetchable_fragment/fixtures/fragment-on-object-implementing-node-interface-with-alias-id.expected");
    test_fixture(transform_fixture, file!(), "fragment-on-object-implementing-node-interface-with-alias-id.graphql", "refetchable_fragment/fixtures/fragment-on-object-implementing-node-interface-with-alias-id.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_on_query() {
    let input = include_str!("refetchable_fragment/fixtures/fragment-on-query.graphql");
    let expected = include_str!("refetchable_fragment/fixtures/fragment-on-query.expected");
    test_fixture(transform_fixture, file!(), "fragment-on-query.graphql", "refetchable_fragment/fixtures/fragment-on-query.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_on_query_with_cycle() {
    let input = include_str!("refetchable_fragment/fixtures/fragment-on-query-with-cycle.graphql");
    let expected = include_str!("refetchable_fragment/fixtures/fragment-on-query-with-cycle.expected");
    test_fixture(transform_fixture, file!(), "fragment-on-query-with-cycle.graphql", "refetchable_fragment/fixtures/fragment-on-query-with-cycle.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_on_query_without_query_name_invalid() {
    let input = include_str!("refetchable_fragment/fixtures/fragment-on-query-without-query-name.invalid.graphql");
    let expected = include_str!("refetchable_fragment/fixtures/fragment-on-query-without-query-name.invalid.expected");
    test_fixture(transform_fixture, file!(), "fragment-on-query-without-query-name.invalid.graphql", "refetchable_fragment/fixtures/fragment-on-query-without-query-name.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_on_viewer() {
    let input = include_str!("refetchable_fragment/fixtures/fragment-on-viewer.graphql");
    let expected = include_str!("refetchable_fragment/fixtures/fragment-on-viewer.expected");
    test_fixture(transform_fixture, file!(), "fragment-on-viewer.graphql", "refetchable_fragment/fixtures/fragment-on-viewer.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_with_args_on_object_implementing_node_interface() {
    let input = include_str!("refetchable_fragment/fixtures/fragment-with-args-on-object-implementing-node-interface.graphql");
    let expected = include_str!("refetchable_fragment/fixtures/fragment-with-args-on-object-implementing-node-interface.expected");
    test_fixture(transform_fixture, file!(), "fragment-with-args-on-object-implementing-node-interface.graphql", "refetchable_fragment/fixtures/fragment-with-args-on-object-implementing-node-interface.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_with_args_on_query() {
    let input = include_str!("refetchable_fragment/fixtures/fragment-with-args-on-query.graphql");
    let expected = include_str!("refetchable_fragment/fixtures/fragment-with-args-on-query.expected");
    test_fixture(transform_fixture, file!(), "fragment-with-args-on-query.graphql", "refetchable_fragment/fixtures/fragment-with-args-on-query.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_with_args_on_viewer() {
    let input = include_str!("refetchable_fragment/fixtures/fragment-with-args-on-viewer.graphql");
    let expected = include_str!("refetchable_fragment/fixtures/fragment-with-args-on-viewer.expected");
    test_fixture(transform_fixture, file!(), "fragment-with-args-on-viewer.graphql", "refetchable_fragment/fixtures/fragment-with-args-on-viewer.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_with_relay_plural_invalid() {
    let input = include_str!("refetchable_fragment/fixtures/fragment-with-relay-plural.invalid.graphql");
    let expected = include_str!("refetchable_fragment/fixtures/fragment-with-relay-plural.invalid.expected");
    test_fixture(transform_fixture, file!(), "fragment-with-relay-plural.invalid.graphql", "refetchable_fragment/fixtures/fragment-with-relay-plural.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn refetchable_fragment_with_connection() {
    let input = include_str!("refetchable_fragment/fixtures/refetchable-fragment-with-connection.graphql");
    let expected = include_str!("refetchable_fragment/fixtures/refetchable-fragment-with-connection.expected");
    test_fixture(transform_fixture, file!(), "refetchable-fragment-with-connection.graphql", "refetchable_fragment/fixtures/refetchable-fragment-with-connection.expected", input, expected).await;
}

#[tokio::test]
async fn refetchable_fragment_with_connection_bidirectional() {
    let input = include_str!("refetchable_fragment/fixtures/refetchable-fragment-with-connection-bidirectional.graphql");
    let expected = include_str!("refetchable_fragment/fixtures/refetchable-fragment-with-connection-bidirectional.expected");
    test_fixture(transform_fixture, file!(), "refetchable-fragment-with-connection-bidirectional.graphql", "refetchable_fragment/fixtures/refetchable-fragment-with-connection-bidirectional.expected", input, expected).await;
}

#[tokio::test]
async fn refetchable_fragment_with_connection_literal_count_invalid() {
    let input = include_str!("refetchable_fragment/fixtures/refetchable-fragment-with-connection-literal-count.invalid.graphql");
    let expected = include_str!("refetchable_fragment/fixtures/refetchable-fragment-with-connection-literal-count.invalid.expected");
    test_fixture(transform_fixture, file!(), "refetchable-fragment-with-connection-literal-count.invalid.graphql", "refetchable_fragment/fixtures/refetchable-fragment-with-connection-literal-count.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn refetchable_fragment_with_connection_no_cursor_invalid() {
    let input = include_str!("refetchable_fragment/fixtures/refetchable-fragment-with-connection-no-cursor.invalid.graphql");
    let expected = include_str!("refetchable_fragment/fixtures/refetchable-fragment-with-connection-no-cursor.invalid.expected");
    test_fixture(transform_fixture, file!(), "refetchable-fragment-with-connection-no-cursor.invalid.graphql", "refetchable_fragment/fixtures/refetchable-fragment-with-connection-no-cursor.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn refetchable_fragment_with_connection_unstable_path_invalid() {
    let input = include_str!("refetchable_fragment/fixtures/refetchable-fragment-with-connection-unstable-path.invalid.graphql");
    let expected = include_str!("refetchable_fragment/fixtures/refetchable-fragment-with-connection-unstable-path.invalid.expected");
    test_fixture(transform_fixture, file!(), "refetchable-fragment-with-connection-unstable-path.invalid.graphql", "refetchable_fragment/fixtures/refetchable-fragment-with-connection-unstable-path.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn refetchable_fragment_with_connection_with_catch() {
    let input = include_str!("refetchable_fragment/fixtures/refetchable-fragment-with-connection-with-catch.graphql");
    let expected = include_str!("refetchable_fragment/fixtures/refetchable-fragment-with-connection-with-catch.expected");
    test_fixture(transform_fixture, file!(), "refetchable-fragment-with-connection-with-catch.graphql", "refetchable_fragment/fixtures/refetchable-fragment-with-connection-with-catch.expected", input, expected).await;
}

#[tokio::test]
async fn refetchable_fragment_with_connection_with_catch_to_null() {
    let input = include_str!("refetchable_fragment/fixtures/refetchable-fragment-with-connection-with-catch-to-null.graphql");
    let expected = include_str!("refetchable_fragment/fixtures/refetchable-fragment-with-connection-with-catch-to-null.expected");
    test_fixture(transform_fixture, file!(), "refetchable-fragment-with-connection-with-catch-to-null.graphql", "refetchable_fragment/fixtures/refetchable-fragment-with-connection-with-catch-to-null.expected", input, expected).await;
}

#[tokio::test]
async fn refetchable_fragment_with_connection_with_stream() {
    let input = include_str!("refetchable_fragment/fixtures/refetchable-fragment-with-connection-with-stream.graphql");
    let expected = include_str!("refetchable_fragment/fixtures/refetchable-fragment-with-connection-with-stream.expected");
    test_fixture(transform_fixture, file!(), "refetchable-fragment-with-connection-with-stream.graphql", "refetchable_fragment/fixtures/refetchable-fragment-with-connection-with-stream.expected", input, expected).await;
}

#[tokio::test]
async fn refetchable_interface() {
    let input = include_str!("refetchable_fragment/fixtures/refetchable-interface.graphql");
    let expected = include_str!("refetchable_fragment/fixtures/refetchable-interface.expected");
    test_fixture(transform_fixture, file!(), "refetchable-interface.graphql", "refetchable_fragment/fixtures/refetchable-interface.expected", input, expected).await;
}

#[tokio::test]
async fn refetchable_interface_all_implementing_types_impl_node() {
    let input = include_str!("refetchable_fragment/fixtures/refetchable-interface-all-implementing-types-impl-node.graphql");
    let expected = include_str!("refetchable_fragment/fixtures/refetchable-interface-all-implementing-types-impl-node.expected");
    test_fixture(transform_fixture, file!(), "refetchable-interface-all-implementing-types-impl-node.graphql", "refetchable_fragment/fixtures/refetchable-interface-all-implementing-types-impl-node.expected", input, expected).await;
}

#[tokio::test]
async fn refetchable_interface_but_no_implementing_types() {
    let input = include_str!("refetchable_fragment/fixtures/refetchable-interface-but-no-implementing-types.graphql");
    let expected = include_str!("refetchable_fragment/fixtures/refetchable-interface-but-no-implementing-types.expected");
    test_fixture(transform_fixture, file!(), "refetchable-interface-but-no-implementing-types.graphql", "refetchable_fragment/fixtures/refetchable-interface-but-no-implementing-types.expected", input, expected).await;
}

#[tokio::test]
async fn refetchable_interface_some_types_impl_node() {
    let input = include_str!("refetchable_fragment/fixtures/refetchable-interface-some-types-impl-node.graphql");
    let expected = include_str!("refetchable_fragment/fixtures/refetchable-interface-some-types-impl-node.expected");
    test_fixture(transform_fixture, file!(), "refetchable-interface-some-types-impl-node.graphql", "refetchable_fragment/fixtures/refetchable-interface-some-types-impl-node.expected", input, expected).await;
}
