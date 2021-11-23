/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<198c62230082f23eda29005e4f323e8b>>
 */

mod provided_variable_fragment_transform;

use provided_variable_fragment_transform::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn anon_fragment_spread() {
    let input = include_str!("provided_variable_fragment_transform/fixtures/anon_fragment_spread.graphql");
    let expected = include_str!("provided_variable_fragment_transform/fixtures/anon_fragment_spread.expected");
    test_fixture(transform_fixture, "anon_fragment_spread.graphql", "provided_variable_fragment_transform/fixtures/anon_fragment_spread.expected", input, expected);
}

#[test]
fn multiple_fragments() {
    let input = include_str!("provided_variable_fragment_transform/fixtures/multiple_fragments.graphql");
    let expected = include_str!("provided_variable_fragment_transform/fixtures/multiple_fragments.expected");
    test_fixture(transform_fixture, "multiple_fragments.graphql", "provided_variable_fragment_transform/fixtures/multiple_fragments.expected", input, expected);
}

#[test]
fn single_fragment() {
    let input = include_str!("provided_variable_fragment_transform/fixtures/single_fragment.graphql");
    let expected = include_str!("provided_variable_fragment_transform/fixtures/single_fragment.expected");
    test_fixture(transform_fixture, "single_fragment.graphql", "provided_variable_fragment_transform/fixtures/single_fragment.expected", input, expected);
}
