/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<e9cd88a52254146722f6183799c1cc92>>
 */

mod skip_client_extensions;

use skip_client_extensions::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn client_conditions() {
    let input = include_str!("skip_client_extensions/fixtures/client-conditions.graphql");
    let expected = include_str!("skip_client_extensions/fixtures/client-conditions.expected");
    test_fixture(transform_fixture, "client-conditions.graphql", "skip_client_extensions/fixtures/client-conditions.expected", input, expected).await;
}

#[tokio::test]
async fn client_directives() {
    let input = include_str!("skip_client_extensions/fixtures/client-directives.graphql");
    let expected = include_str!("skip_client_extensions/fixtures/client-directives.expected");
    test_fixture(transform_fixture, "client-directives.graphql", "skip_client_extensions/fixtures/client-directives.expected", input, expected).await;
}

#[tokio::test]
async fn client_fields_in_inline_fragments() {
    let input = include_str!("skip_client_extensions/fixtures/client-fields-in-inline-fragments.graphql");
    let expected = include_str!("skip_client_extensions/fixtures/client-fields-in-inline-fragments.expected");
    test_fixture(transform_fixture, "client-fields-in-inline-fragments.graphql", "skip_client_extensions/fixtures/client-fields-in-inline-fragments.expected", input, expected).await;
}

#[tokio::test]
async fn client_fields_of_client_type() {
    let input = include_str!("skip_client_extensions/fixtures/client-fields-of-client-type.graphql");
    let expected = include_str!("skip_client_extensions/fixtures/client-fields-of-client-type.expected");
    test_fixture(transform_fixture, "client-fields-of-client-type.graphql", "skip_client_extensions/fixtures/client-fields-of-client-type.expected", input, expected).await;
}

#[tokio::test]
async fn client_fields_on_roots() {
    let input = include_str!("skip_client_extensions/fixtures/client-fields-on-roots.graphql");
    let expected = include_str!("skip_client_extensions/fixtures/client-fields-on-roots.expected");
    test_fixture(transform_fixture, "client-fields-on-roots.graphql", "skip_client_extensions/fixtures/client-fields-on-roots.expected", input, expected).await;
}

#[tokio::test]
async fn client_fragment_spreads() {
    let input = include_str!("skip_client_extensions/fixtures/client-fragment-spreads.graphql");
    let expected = include_str!("skip_client_extensions/fixtures/client-fragment-spreads.expected");
    test_fixture(transform_fixture, "client-fragment-spreads.graphql", "skip_client_extensions/fixtures/client-fragment-spreads.expected", input, expected).await;
}

#[tokio::test]
async fn client_fragment_spreads_in_query() {
    let input = include_str!("skip_client_extensions/fixtures/client-fragment-spreads-in-query.graphql");
    let expected = include_str!("skip_client_extensions/fixtures/client-fragment-spreads-in-query.expected");
    test_fixture(transform_fixture, "client-fragment-spreads-in-query.graphql", "skip_client_extensions/fixtures/client-fragment-spreads-in-query.expected", input, expected).await;
}

#[tokio::test]
async fn client_inline_fragments() {
    let input = include_str!("skip_client_extensions/fixtures/client-inline-fragments.graphql");
    let expected = include_str!("skip_client_extensions/fixtures/client-inline-fragments.expected");
    test_fixture(transform_fixture, "client-inline-fragments.graphql", "skip_client_extensions/fixtures/client-inline-fragments.expected", input, expected).await;
}

#[tokio::test]
async fn client_inline_fragments_in_query() {
    let input = include_str!("skip_client_extensions/fixtures/client-inline-fragments-in-query.graphql");
    let expected = include_str!("skip_client_extensions/fixtures/client-inline-fragments-in-query.expected");
    test_fixture(transform_fixture, "client-inline-fragments-in-query.graphql", "skip_client_extensions/fixtures/client-inline-fragments-in-query.expected", input, expected).await;
}

#[tokio::test]
async fn client_linked_fields() {
    let input = include_str!("skip_client_extensions/fixtures/client-linked-fields.graphql");
    let expected = include_str!("skip_client_extensions/fixtures/client-linked-fields.expected");
    test_fixture(transform_fixture, "client-linked-fields.graphql", "skip_client_extensions/fixtures/client-linked-fields.expected", input, expected).await;
}

#[tokio::test]
async fn client_scalar_fields() {
    let input = include_str!("skip_client_extensions/fixtures/client-scalar-fields.graphql");
    let expected = include_str!("skip_client_extensions/fixtures/client-scalar-fields.expected");
    test_fixture(transform_fixture, "client-scalar-fields.graphql", "skip_client_extensions/fixtures/client-scalar-fields.expected", input, expected).await;
}

#[tokio::test]
async fn query_with_only_client_fields() {
    let input = include_str!("skip_client_extensions/fixtures/query-with-only-client-fields.graphql");
    let expected = include_str!("skip_client_extensions/fixtures/query-with-only-client-fields.expected");
    test_fixture(transform_fixture, "query-with-only-client-fields.graphql", "skip_client_extensions/fixtures/query-with-only-client-fields.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_metadata() {
    let input = include_str!("skip_client_extensions/fixtures/relay-resolver-metadata.graphql");
    let expected = include_str!("skip_client_extensions/fixtures/relay-resolver-metadata.expected");
    test_fixture(transform_fixture, "relay-resolver-metadata.graphql", "skip_client_extensions/fixtures/relay-resolver-metadata.expected", input, expected).await;
}

#[tokio::test]
async fn sibling_client_selections() {
    let input = include_str!("skip_client_extensions/fixtures/sibling-client-selections.graphql");
    let expected = include_str!("skip_client_extensions/fixtures/sibling-client-selections.expected");
    test_fixture(transform_fixture, "sibling-client-selections.graphql", "skip_client_extensions/fixtures/sibling-client-selections.expected", input, expected).await;
}
