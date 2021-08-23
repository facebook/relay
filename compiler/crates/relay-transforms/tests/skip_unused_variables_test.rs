/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<7cdfb36b24c674509904e75e11160db3>>
 */

mod skip_unused_variables;

use skip_unused_variables::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn kitchen_sink() {
    let input = include_str!("skip_unused_variables/fixtures/kitchen-sink.graphql");
    let expected = include_str!("skip_unused_variables/fixtures/kitchen-sink.expected");
    test_fixture(transform_fixture, "kitchen-sink.graphql", "skip_unused_variables/fixtures/kitchen-sink.expected", input, expected);
}

#[test]
fn non_nullable_variable_with_default_invalid() {
    let input = include_str!("skip_unused_variables/fixtures/non-nullable-variable-with-default.invalid.graphql");
    let expected = include_str!("skip_unused_variables/fixtures/non-nullable-variable-with-default.invalid.expected");
    test_fixture(transform_fixture, "non-nullable-variable-with-default.invalid.graphql", "skip_unused_variables/fixtures/non-nullable-variable-with-default.invalid.expected", input, expected);
}
