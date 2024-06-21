/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<0b5686d10624fd1700d69be68ba3f437>>
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
fn variables() {
    let input = include_str!("inline_data_fragment/fixtures/variables.graphql");
    let expected = include_str!("inline_data_fragment/fixtures/variables.expected");
    test_fixture(transform_fixture, "variables.graphql", "inline_data_fragment/fixtures/variables.expected", input, expected);
}
