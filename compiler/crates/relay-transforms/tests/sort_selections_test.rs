/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<4756f3936d79676febd7bddece3bdf35>>
 */

mod sort_selections;

use sort_selections::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn sort_selections_transform() {
    let input = include_str!("sort_selections/fixtures/sort-selections-transform.graphql");
    let expected = include_str!("sort_selections/fixtures/sort-selections-transform.expected");
    test_fixture(transform_fixture, "sort-selections-transform.graphql", "sort_selections/fixtures/sort-selections-transform.expected", input, expected).await;
}
