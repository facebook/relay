/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<ffc1a0363a0a6137108787e4e848f93d>>
 */

mod validate_global_variable_names;

use validate_global_variable_names::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn relayinternal_prefix_invalid() {
    let input = include_str!("validate_global_variable_names/fixtures/relayinternal_prefix_invalid.graphql");
    let expected = include_str!("validate_global_variable_names/fixtures/relayinternal_prefix_invalid.expected");
    test_fixture(transform_fixture, "relayinternal_prefix_invalid.graphql", "validate_global_variable_names/fixtures/relayinternal_prefix_invalid.expected", input, expected);
}
