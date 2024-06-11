/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<71701182887388b05adae9f92976538d>>
 */

mod relay_actor_change;

use relay_actor_change::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn relay_actor_change_simple_query() {
    let input = include_str!("relay_actor_change/fixtures/relay_actor_change-simple-query.graphql");
    let expected = include_str!("relay_actor_change/fixtures/relay_actor_change-simple-query.expected");
    test_fixture(transform_fixture, file!(), "relay_actor_change-simple-query.graphql", "relay_actor_change/fixtures/relay_actor_change-simple-query.expected", input, expected).await;
}
