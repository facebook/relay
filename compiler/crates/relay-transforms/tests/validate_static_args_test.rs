/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<7c97b400056e87e80acdee4470b99a05>>
 */

mod validate_static_args;

use validate_static_args::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn match_with_dynamic_arg_invalid() {
    let input = include_str!("validate_static_args/fixtures/match-with-dynamic-arg.invalid.graphql");
    let expected = include_str!("validate_static_args/fixtures/match-with-dynamic-arg.invalid.expected");
    test_fixture(transform_fixture, "match-with-dynamic-arg.invalid.graphql", "validate_static_args/fixtures/match-with-dynamic-arg.invalid.expected", input, expected);
}

#[test]
fn nonstatic_values_on_static_arg_invalid() {
    let input = include_str!("validate_static_args/fixtures/nonstatic-values-on-static-arg.invalid.graphql");
    let expected = include_str!("validate_static_args/fixtures/nonstatic-values-on-static-arg.invalid.expected");
    test_fixture(transform_fixture, "nonstatic-values-on-static-arg.invalid.graphql", "validate_static_args/fixtures/nonstatic-values-on-static-arg.invalid.expected", input, expected);
}

#[test]
fn required_with_dynamic_arg_invalid() {
    let input = include_str!("validate_static_args/fixtures/required-with-dynamic-arg.invalid.graphql");
    let expected = include_str!("validate_static_args/fixtures/required-with-dynamic-arg.invalid.expected");
    test_fixture(transform_fixture, "required-with-dynamic-arg.invalid.graphql", "validate_static_args/fixtures/required-with-dynamic-arg.invalid.expected", input, expected);
}

#[test]
fn static_only_for_constants() {
    let input = include_str!("validate_static_args/fixtures/static-only-for-constants.graphql");
    let expected = include_str!("validate_static_args/fixtures/static-only-for-constants.expected");
    test_fixture(transform_fixture, "static-only-for-constants.graphql", "validate_static_args/fixtures/static-only-for-constants.expected", input, expected);
}
