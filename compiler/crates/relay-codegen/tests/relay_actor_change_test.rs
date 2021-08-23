/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<d871c8e68800c48bdab6037a95562519>>
 */

mod relay_actor_change;

use relay_actor_change::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn relay_actor_change_simple_query() {
    let input = include_str!("relay_actor_change/fixtures/relay_actor_change-simple-query.graphql");
    let expected = include_str!("relay_actor_change/fixtures/relay_actor_change-simple-query.expected");
    test_fixture(transform_fixture, "relay_actor_change-simple-query.graphql", "relay_actor_change/fixtures/relay_actor_change-simple-query.expected", input, expected);
}
