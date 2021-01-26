/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<8b9f953ea6234af2285f7267e7ecec0e>>
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
