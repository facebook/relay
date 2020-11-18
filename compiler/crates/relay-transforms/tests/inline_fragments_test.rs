/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<d749c13c534a02b3be5414cbf26746a5>>
 */

mod inline_fragments;

use inline_fragments::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn inlines_nested_fragments() {
    let input = include_str!("inline_fragments/fixtures/inlines-nested-fragments.graphql");
    let expected = include_str!("inline_fragments/fixtures/inlines-nested-fragments.expected");
    test_fixture(transform_fixture, "inlines-nested-fragments.graphql", "inline_fragments/fixtures/inlines-nested-fragments.expected", input, expected);
}
