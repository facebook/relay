/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<10aec15bb433a1562ff46edfa72808b3>>
 */

mod client_extensions;

use client_extensions::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn client_conditions() {
    let input = include_str!("client_extensions/fixtures/client-conditions.graphql");
    let expected = include_str!("client_extensions/fixtures/client-conditions.expected");
    test_fixture(transform_fixture, "client-conditions.graphql", "client_extensions/fixtures/client-conditions.expected", input, expected).await;
}

#[tokio::test]
async fn client_fields_in_inline_fragments() {
    let input = include_str!("client_extensions/fixtures/client-fields-in-inline-fragments.graphql");
    let expected = include_str!("client_extensions/fixtures/client-fields-in-inline-fragments.expected");
    test_fixture(transform_fixture, "client-fields-in-inline-fragments.graphql", "client_extensions/fixtures/client-fields-in-inline-fragments.expected", input, expected).await;
}

#[tokio::test]
async fn client_fields_of_client_type() {
    let input = include_str!("client_extensions/fixtures/client-fields-of-client-type.graphql");
    let expected = include_str!("client_extensions/fixtures/client-fields-of-client-type.expected");
    test_fixture(transform_fixture, "client-fields-of-client-type.graphql", "client_extensions/fixtures/client-fields-of-client-type.expected", input, expected).await;
}

#[tokio::test]
async fn client_fields_on_roots() {
    let input = include_str!("client_extensions/fixtures/client-fields-on-roots.graphql");
    let expected = include_str!("client_extensions/fixtures/client-fields-on-roots.expected");
    test_fixture(transform_fixture, "client-fields-on-roots.graphql", "client_extensions/fixtures/client-fields-on-roots.expected", input, expected).await;
}

#[tokio::test]
async fn client_linked_fields() {
    let input = include_str!("client_extensions/fixtures/client-linked-fields.graphql");
    let expected = include_str!("client_extensions/fixtures/client-linked-fields.expected");
    test_fixture(transform_fixture, "client-linked-fields.graphql", "client_extensions/fixtures/client-linked-fields.expected", input, expected).await;
}

#[tokio::test]
async fn client_scalar_fields() {
    let input = include_str!("client_extensions/fixtures/client-scalar-fields.graphql");
    let expected = include_str!("client_extensions/fixtures/client-scalar-fields.expected");
    test_fixture(transform_fixture, "client-scalar-fields.graphql", "client_extensions/fixtures/client-scalar-fields.expected", input, expected).await;
}

#[tokio::test]
async fn sibling_client_selections() {
    let input = include_str!("client_extensions/fixtures/sibling-client-selections.graphql");
    let expected = include_str!("client_extensions/fixtures/sibling-client-selections.expected");
    test_fixture(transform_fixture, "sibling-client-selections.graphql", "client_extensions/fixtures/sibling-client-selections.expected", input, expected).await;
}
