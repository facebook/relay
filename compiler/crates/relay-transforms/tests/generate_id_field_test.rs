/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<a02dd8945cc8a1ed3e941b601a4785c6>>
 */

mod generate_id_field;

use generate_id_field::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn abstract_plural() {
    let input = include_str!("generate_id_field/fixtures/abstract-plural.graphql");
    let expected = include_str!("generate_id_field/fixtures/abstract-plural.expected");
    test_fixture(transform_fixture, "abstract-plural.graphql", "generate_id_field/fixtures/abstract-plural.expected", input, expected);
}

#[test]
fn node_union() {
    let input = include_str!("generate_id_field/fixtures/node-union.graphql");
    let expected = include_str!("generate_id_field/fixtures/node-union.expected");
    test_fixture(transform_fixture, "node-union.graphql", "generate_id_field/fixtures/node-union.expected", input, expected);
}

#[test]
fn non_node_union() {
    let input = include_str!("generate_id_field/fixtures/non-node-union.graphql");
    let expected = include_str!("generate_id_field/fixtures/non-node-union.expected");
    test_fixture(transform_fixture, "non-node-union.graphql", "generate_id_field/fixtures/non-node-union.expected", input, expected);
}

#[test]
fn query_with_fragment_variables() {
    let input = include_str!("generate_id_field/fixtures/query-with-fragment-variables.graphql");
    let expected = include_str!("generate_id_field/fixtures/query-with-fragment-variables.expected");
    test_fixture(transform_fixture, "query-with-fragment-variables.graphql", "generate_id_field/fixtures/query-with-fragment-variables.expected", input, expected);
}
