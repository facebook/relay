/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<9a35afd125f7a2bbdee5bdb73d9c90f2>>
 */

mod client_extensions;

use client_extensions::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn client_conditions() {
    let input = include_str!("client_extensions/fixtures/client-conditions.graphql");
    let expected = include_str!("client_extensions/fixtures/client-conditions.expected");
    test_fixture(transform_fixture, "client-conditions.graphql", "client_extensions/fixtures/client-conditions.expected", input, expected);
}

#[test]
fn client_fields_in_inline_fragments() {
    let input = include_str!("client_extensions/fixtures/client-fields-in-inline-fragments.graphql");
    let expected = include_str!("client_extensions/fixtures/client-fields-in-inline-fragments.expected");
    test_fixture(transform_fixture, "client-fields-in-inline-fragments.graphql", "client_extensions/fixtures/client-fields-in-inline-fragments.expected", input, expected);
}

#[test]
fn client_fields_on_roots() {
    let input = include_str!("client_extensions/fixtures/client-fields-on-roots.graphql");
    let expected = include_str!("client_extensions/fixtures/client-fields-on-roots.expected");
    test_fixture(transform_fixture, "client-fields-on-roots.graphql", "client_extensions/fixtures/client-fields-on-roots.expected", input, expected);
}

#[test]
fn sibling_client_selections() {
    let input = include_str!("client_extensions/fixtures/sibling-client-selections.graphql");
    let expected = include_str!("client_extensions/fixtures/sibling-client-selections.expected");
    test_fixture(transform_fixture, "sibling-client-selections.graphql", "client_extensions/fixtures/sibling-client-selections.expected", input, expected);
}
