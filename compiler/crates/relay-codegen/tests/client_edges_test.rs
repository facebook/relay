/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<17be59a0febb7a8c222a6467ab3e92fb>>
 */

mod client_edges;

use client_edges::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn client_edge_backed_by_resolver() {
    let input = include_str!("client_edges/fixtures/client-edge-backed-by-resolver.graphql");
    let expected = include_str!("client_edges/fixtures/client-edge-backed-by-resolver.expected");
    test_fixture(transform_fixture, "client-edge-backed-by-resolver.graphql", "client_edges/fixtures/client-edge-backed-by-resolver.expected", input, expected);
}
