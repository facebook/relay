/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<0c48dc8497a4f85ba11723da2e93dfdf>>
 */

mod generate_id_field;

use generate_id_field::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn abstract_plural() {
    let input = include_str!("generate_id_field/fixtures/abstract-plural.graphql");
    let expected = include_str!("generate_id_field/fixtures/abstract-plural.expected");
    test_fixture(transform_fixture, file!(), "abstract-plural.graphql", "generate_id_field/fixtures/abstract-plural.expected", input, expected).await;
}

#[tokio::test]
async fn node_union() {
    let input = include_str!("generate_id_field/fixtures/node-union.graphql");
    let expected = include_str!("generate_id_field/fixtures/node-union.expected");
    test_fixture(transform_fixture, file!(), "node-union.graphql", "generate_id_field/fixtures/node-union.expected", input, expected).await;
}

#[tokio::test]
async fn non_node_union() {
    let input = include_str!("generate_id_field/fixtures/non-node-union.graphql");
    let expected = include_str!("generate_id_field/fixtures/non-node-union.expected");
    test_fixture(transform_fixture, file!(), "non-node-union.graphql", "generate_id_field/fixtures/non-node-union.expected", input, expected).await;
}

#[tokio::test]
async fn query_with_fragment_variables() {
    let input = include_str!("generate_id_field/fixtures/query-with-fragment-variables.graphql");
    let expected = include_str!("generate_id_field/fixtures/query-with-fragment-variables.expected");
    test_fixture(transform_fixture, file!(), "query-with-fragment-variables.graphql", "generate_id_field/fixtures/query-with-fragment-variables.expected", input, expected).await;
}
