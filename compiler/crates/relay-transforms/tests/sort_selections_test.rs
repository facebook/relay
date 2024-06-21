/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<ac4bd062fa6d4f41dd31d8bc0262a37e>>
 */

mod sort_selections;

use sort_selections::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn sort_selections_transform() {
    let input = include_str!("sort_selections/fixtures/sort-selections-transform.graphql");
    let expected = include_str!("sort_selections/fixtures/sort-selections-transform.expected");
    test_fixture(transform_fixture, file!(), "sort-selections-transform.graphql", "sort_selections/fixtures/sort-selections-transform.expected", input, expected).await;
}
