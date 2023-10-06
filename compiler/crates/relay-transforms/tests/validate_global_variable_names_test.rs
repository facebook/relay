/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<84eb865f483da914802befbac064f06c>>
 */

mod validate_global_variable_names;

use validate_global_variable_names::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn relayinternal_prefix_invalid() {
    let input = include_str!("validate_global_variable_names/fixtures/relayinternal_prefix_invalid.graphql");
    let expected = include_str!("validate_global_variable_names/fixtures/relayinternal_prefix_invalid.expected");
    test_fixture(transform_fixture, "relayinternal_prefix_invalid.graphql", "validate_global_variable_names/fixtures/relayinternal_prefix_invalid.expected", input, expected).await;
}
