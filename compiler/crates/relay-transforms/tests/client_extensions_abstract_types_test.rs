/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<3d2f11178076ec66072479878618fb48>>
 */

mod client_extensions_abstract_types;

use client_extensions_abstract_types::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn fragment_spread_on_client_interface() {
    let input = include_str!("client_extensions_abstract_types/fixtures/fragment_spread_on_client_interface.graphql");
    let expected = include_str!("client_extensions_abstract_types/fixtures/fragment_spread_on_client_interface.expected");
    test_fixture(transform_fixture, file!(), "fragment_spread_on_client_interface.graphql", "client_extensions_abstract_types/fixtures/fragment_spread_on_client_interface.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_spread_on_client_interface_transitively() {
    let input = include_str!("client_extensions_abstract_types/fixtures/fragment_spread_on_client_interface_transitively.graphql");
    let expected = include_str!("client_extensions_abstract_types/fixtures/fragment_spread_on_client_interface_transitively.expected");
    test_fixture(transform_fixture, file!(), "fragment_spread_on_client_interface_transitively.graphql", "client_extensions_abstract_types/fixtures/fragment_spread_on_client_interface_transitively.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_spread_on_client_union() {
    let input = include_str!("client_extensions_abstract_types/fixtures/fragment_spread_on_client_union.graphql");
    let expected = include_str!("client_extensions_abstract_types/fixtures/fragment_spread_on_client_union.expected");
    test_fixture(transform_fixture, file!(), "fragment_spread_on_client_union.graphql", "client_extensions_abstract_types/fixtures/fragment_spread_on_client_union.expected", input, expected).await;
}

#[tokio::test]
async fn inline_fragment_on_client_interface() {
    let input = include_str!("client_extensions_abstract_types/fixtures/inline_fragment_on_client_interface.graphql");
    let expected = include_str!("client_extensions_abstract_types/fixtures/inline_fragment_on_client_interface.expected");
    test_fixture(transform_fixture, file!(), "inline_fragment_on_client_interface.graphql", "client_extensions_abstract_types/fixtures/inline_fragment_on_client_interface.expected", input, expected).await;
}
