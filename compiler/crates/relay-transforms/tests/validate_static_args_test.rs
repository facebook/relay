/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<dbe4340bbd7e486919c92ac04bc448ba>>
 */

mod validate_static_args;

use validate_static_args::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn nonstatic_values_on_static_arg_invalid() {
    let input = include_str!("validate_static_args/fixtures/nonstatic-values-on-static-arg.invalid.graphql");
    let expected = include_str!("validate_static_args/fixtures/nonstatic-values-on-static-arg.invalid.expected");
    test_fixture(transform_fixture, "nonstatic-values-on-static-arg.invalid.graphql", "validate_static_args/fixtures/nonstatic-values-on-static-arg.invalid.expected", input, expected);
}

#[test]
fn static_only_for_constants() {
    let input = include_str!("validate_static_args/fixtures/static-only-for-constants.graphql");
    let expected = include_str!("validate_static_args/fixtures/static-only-for-constants.expected");
    test_fixture(transform_fixture, "static-only-for-constants.graphql", "validate_static_args/fixtures/static-only-for-constants.expected", input, expected);
}
