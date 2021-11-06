/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<f001d7337b3bebb17ec17597864ea108>>
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
