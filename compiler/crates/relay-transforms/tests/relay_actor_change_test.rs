/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<21b3f9e95f5f4094cda852fd4fc27e70>>
 */

mod relay_actor_change;

use relay_actor_change::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn actor_change_invalid() {
    let input = include_str!("relay_actor_change/fixtures/actor-change.invalid.graphql");
    let expected = include_str!("relay_actor_change/fixtures/actor-change.invalid.expected");
    test_fixture(transform_fixture, "actor-change.invalid.graphql", "relay_actor_change/fixtures/actor-change.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn actor_change_no_viewer_invalid() {
    let input = include_str!("relay_actor_change/fixtures/actor-change-no-viewer.invalid.graphql");
    let expected = include_str!("relay_actor_change/fixtures/actor-change-no-viewer.invalid.expected");
    test_fixture(transform_fixture, "actor-change-no-viewer.invalid.graphql", "relay_actor_change/fixtures/actor-change-no-viewer.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn actor_change_pluarl_invalid() {
    let input = include_str!("relay_actor_change/fixtures/actor-change-pluarl.invalid.graphql");
    let expected = include_str!("relay_actor_change/fixtures/actor-change-pluarl.invalid.expected");
    test_fixture(transform_fixture, "actor-change-pluarl.invalid.graphql", "relay_actor_change/fixtures/actor-change-pluarl.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn actor_change_wrong_viewer_invalid() {
    let input = include_str!("relay_actor_change/fixtures/actor-change-wrong-viewer.invalid.graphql");
    let expected = include_str!("relay_actor_change/fixtures/actor-change-wrong-viewer.invalid.expected");
    test_fixture(transform_fixture, "actor-change-wrong-viewer.invalid.graphql", "relay_actor_change/fixtures/actor-change-wrong-viewer.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn simple_query() {
    let input = include_str!("relay_actor_change/fixtures/simple-query.graphql");
    let expected = include_str!("relay_actor_change/fixtures/simple-query.expected");
    test_fixture(transform_fixture, "simple-query.graphql", "relay_actor_change/fixtures/simple-query.expected", input, expected).await;
}
