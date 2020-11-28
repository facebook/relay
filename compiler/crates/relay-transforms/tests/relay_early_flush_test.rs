/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<69abb1a6bc9c1c54ce6e9be197cda04c>>
 */

mod relay_early_flush;

use relay_early_flush::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn query_with_relay_early_flush() {
    let input = include_str!("relay_early_flush/fixtures/query-with-relay-early-flush.graphql");
    let expected = include_str!("relay_early_flush/fixtures/query-with-relay-early-flush.expected");
    test_fixture(transform_fixture, "query-with-relay-early-flush.graphql", "relay_early_flush/fixtures/query-with-relay-early-flush.expected", input, expected);
}
