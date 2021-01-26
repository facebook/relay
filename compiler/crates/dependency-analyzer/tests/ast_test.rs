/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<5fdc5f5d839de66d4e93384eb00f58ca>>
 */

mod ast;

use ast::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn base_definitions() {
    let input = include_str!("ast/fixtures/base-definitions.graphql");
    let expected = include_str!("ast/fixtures/base-definitions.expected");
    test_fixture(transform_fixture, "base-definitions.graphql", "ast/fixtures/base-definitions.expected", input, expected);
}

#[test]
fn definitions_only() {
    let input = include_str!("ast/fixtures/definitions-only.graphql");
    let expected = include_str!("ast/fixtures/definitions-only.expected");
    test_fixture(transform_fixture, "definitions-only.graphql", "ast/fixtures/definitions-only.expected", input, expected);
}

#[test]
fn missing_fragments() {
    let input = include_str!("ast/fixtures/missing-fragments.graphql");
    let expected = include_str!("ast/fixtures/missing-fragments.expected");
    test_fixture(transform_fixture, "missing-fragments.graphql", "ast/fixtures/missing-fragments.expected", input, expected);
}

#[test]
fn multiple_base_definitions() {
    let input = include_str!("ast/fixtures/multiple-base-definitions.graphql");
    let expected = include_str!("ast/fixtures/multiple-base-definitions.expected");
    test_fixture(transform_fixture, "multiple-base-definitions.graphql", "ast/fixtures/multiple-base-definitions.expected", input, expected);
}
