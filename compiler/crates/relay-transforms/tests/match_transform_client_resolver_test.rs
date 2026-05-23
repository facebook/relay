/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<404cf24591ee65445c318f7c7156bc93>>
 */

mod match_transform_client_resolver;

use match_transform_client_resolver::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn client_3d_module_on_concrete_parent_type_invalid() {
    let input = include_str!("match_transform_client_resolver/fixtures/client-3D-module-on-concrete-parent-type.invalid.graphql");
    let expected = include_str!("match_transform_client_resolver/fixtures/client-3D-module-on-concrete-parent-type.invalid.expected");
    test_fixture(transform_fixture, file!(), "client-3D-module-on-concrete-parent-type.invalid.graphql", "match_transform_client_resolver/fixtures/client-3D-module-on-concrete-parent-type.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn client_3d_module_on_interface_parent_type() {
    let input = include_str!("match_transform_client_resolver/fixtures/client-3D-module-on-interface-parent-type.graphql");
    let expected = include_str!("match_transform_client_resolver/fixtures/client-3D-module-on-interface-parent-type.expected");
    test_fixture(transform_fixture, file!(), "client-3D-module-on-interface-parent-type.graphql", "match_transform_client_resolver/fixtures/client-3D-module-on-interface-parent-type.expected", input, expected).await;
}

#[tokio::test]
async fn client_3d_module_on_union_parent_type() {
    let input = include_str!("match_transform_client_resolver/fixtures/client-3D-module-on-union-parent-type.graphql");
    let expected = include_str!("match_transform_client_resolver/fixtures/client-3D-module-on-union-parent-type.expected");
    test_fixture(transform_fixture, file!(), "client-3D-module-on-union-parent-type.graphql", "match_transform_client_resolver/fixtures/client-3D-module-on-union-parent-type.expected", input, expected).await;
}

#[tokio::test]
async fn client_and_server_3d_fragments() {
    let input = include_str!("match_transform_client_resolver/fixtures/client-and-server-3D-fragments.graphql");
    let expected = include_str!("match_transform_client_resolver/fixtures/client-and-server-3D-fragments.expected");
    test_fixture(transform_fixture, file!(), "client-and-server-3D-fragments.graphql", "match_transform_client_resolver/fixtures/client-and-server-3D-fragments.expected", input, expected).await;
}

#[tokio::test]
async fn mixed_server_and_client_concrete_types_invalid() {
    let input = include_str!("match_transform_client_resolver/fixtures/mixed-server-and-client-concrete-types.invalid.graphql");
    let expected = include_str!("match_transform_client_resolver/fixtures/mixed-server-and-client-concrete-types.invalid.expected");
    test_fixture(transform_fixture, file!(), "mixed-server-and-client-concrete-types.invalid.graphql", "match_transform_client_resolver/fixtures/mixed-server-and-client-concrete-types.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn server_3d_match_on_interface() {
    let input = include_str!("match_transform_client_resolver/fixtures/server-3D-match-on-interface.graphql");
    let expected = include_str!("match_transform_client_resolver/fixtures/server-3D-match-on-interface.expected");
    test_fixture(transform_fixture, file!(), "server-3D-match-on-interface.graphql", "match_transform_client_resolver/fixtures/server-3D-match-on-interface.expected", input, expected).await;
}

#[tokio::test]
async fn server_3d_match_on_union() {
    let input = include_str!("match_transform_client_resolver/fixtures/server-3D-match-on-union.graphql");
    let expected = include_str!("match_transform_client_resolver/fixtures/server-3D-match-on-union.expected");
    test_fixture(transform_fixture, file!(), "server-3D-match-on-union.graphql", "match_transform_client_resolver/fixtures/server-3D-match-on-union.expected", input, expected).await;
}
