/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<d5c1c2d3a31832a10a654919a68a7df3>>
 */

mod sort_selections;

use sort_selections::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn sort_selections_transform() {
    let input = include_str!("sort_selections/fixtures/sort-selections-transform.graphql");
    let expected = include_str!("sort_selections/fixtures/sort-selections-transform.expected");
    test_fixture(transform_fixture, "sort-selections-transform.graphql", "sort_selections/fixtures/sort-selections-transform.expected", input, expected);
}
