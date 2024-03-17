/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<2a4c5d6f2ace83c3fdcea2feebf2ea23>>
 */

mod disallow_non_node_id_fields;

use disallow_non_node_id_fields::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn disallowed_definitions_invalid() {
    let input = include_str!("disallow_non_node_id_fields/fixtures/disallowed-definitions.invalid.graphql");
    let expected = include_str!("disallow_non_node_id_fields/fixtures/disallowed-definitions.invalid.expected");
    test_fixture(transform_fixture, file!(), "disallowed-definitions.invalid.graphql", "disallow_non_node_id_fields/fixtures/disallowed-definitions.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn illegal_scalar_invalid() {
    let input = include_str!("disallow_non_node_id_fields/fixtures/illegal-scalar.invalid.graphql");
    let expected = include_str!("disallow_non_node_id_fields/fixtures/illegal-scalar.invalid.expected");
    test_fixture(transform_fixture, file!(), "illegal-scalar.invalid.graphql", "disallow_non_node_id_fields/fixtures/illegal-scalar.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn invalid_id_selection_allowed() {
    let input = include_str!("disallow_non_node_id_fields/fixtures/invalid-id-selection-allowed.graphql");
    let expected = include_str!("disallow_non_node_id_fields/fixtures/invalid-id-selection-allowed.expected");
    test_fixture(transform_fixture, file!(), "invalid-id-selection-allowed.graphql", "disallow_non_node_id_fields/fixtures/invalid-id-selection-allowed.expected", input, expected).await;
}

#[tokio::test]
async fn invalid_id_selection_disallowed_invalid() {
    let input = include_str!("disallow_non_node_id_fields/fixtures/invalid-id-selection-disallowed.invalid.graphql");
    let expected = include_str!("disallow_non_node_id_fields/fixtures/invalid-id-selection-disallowed.invalid.expected");
    test_fixture(transform_fixture, file!(), "invalid-id-selection-disallowed.invalid.graphql", "disallow_non_node_id_fields/fixtures/invalid-id-selection-disallowed.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn valid_id_selection() {
    let input = include_str!("disallow_non_node_id_fields/fixtures/valid-id-selection.graphql");
    let expected = include_str!("disallow_non_node_id_fields/fixtures/valid-id-selection.expected");
    test_fixture(transform_fixture, file!(), "valid-id-selection.graphql", "disallow_non_node_id_fields/fixtures/valid-id-selection.expected", input, expected).await;
}
