/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b1f736168af03ff5c2b9a422f1dd95e1>>
 */

mod inline_data_fragment;

use inline_data_fragment::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn recursive() {
    let input = include_str!("inline_data_fragment/fixtures/recursive.graphql");
    let expected = include_str!("inline_data_fragment/fixtures/recursive.expected");
    test_fixture(transform_fixture, "recursive.graphql", "inline_data_fragment/fixtures/recursive.expected", input, expected);
}

#[test]
fn variables_invalid() {
    let input = include_str!("inline_data_fragment/fixtures/variables.invalid.graphql");
    let expected = include_str!("inline_data_fragment/fixtures/variables.invalid.expected");
    test_fixture(transform_fixture, "variables.invalid.graphql", "inline_data_fragment/fixtures/variables.invalid.expected", input, expected);
}
