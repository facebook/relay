/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<2727cdaebb7d446fd26bcade2da67b8f>>
 */

mod validate_global_variables;

use validate_global_variables::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn fragment_include_with_provided_argument() {
    let input = include_str!("validate_global_variables/fixtures/fragment-include-with-provided-argument.graphql");
    let expected = include_str!("validate_global_variables/fixtures/fragment-include-with-provided-argument.expected");
    test_fixture(transform_fixture, "fragment-include-with-provided-argument.graphql", "validate_global_variables/fixtures/fragment-include-with-provided-argument.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_with_undefined_variable_invalid() {
    let input = include_str!("validate_global_variables/fixtures/fragment-with-undefined-variable.invalid.graphql");
    let expected = include_str!("validate_global_variables/fixtures/fragment-with-undefined-variable.invalid.expected");
    test_fixture(transform_fixture, "fragment-with-undefined-variable.invalid.graphql", "validate_global_variables/fixtures/fragment-with-undefined-variable.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn query_with_undefined_variable_invalid() {
    let input = include_str!("validate_global_variables/fixtures/query-with-undefined-variable.invalid.graphql");
    let expected = include_str!("validate_global_variables/fixtures/query-with-undefined-variable.invalid.expected");
    test_fixture(transform_fixture, "query-with-undefined-variable.invalid.graphql", "validate_global_variables/fixtures/query-with-undefined-variable.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn query_with_variables() {
    let input = include_str!("validate_global_variables/fixtures/query-with-variables.graphql");
    let expected = include_str!("validate_global_variables/fixtures/query-with-variables.expected");
    test_fixture(transform_fixture, "query-with-variables.graphql", "validate_global_variables/fixtures/query-with-variables.expected", input, expected).await;
}
