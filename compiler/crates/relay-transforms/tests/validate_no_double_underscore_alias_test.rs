/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<1572c86556d4ca69f37db55f97eb7e4e>>
 */

mod validate_no_double_underscore_alias;

use validate_no_double_underscore_alias::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn double_underscore_invalid() {
    let input = include_str!("validate_no_double_underscore_alias/fixtures/double_underscore.invalid.graphql");
    let expected = include_str!("validate_no_double_underscore_alias/fixtures/double_underscore.invalid.expected");
    test_fixture(transform_fixture, "double_underscore.invalid.graphql", "validate_no_double_underscore_alias/fixtures/double_underscore.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn non_alias() {
    let input = include_str!("validate_no_double_underscore_alias/fixtures/non_alias.graphql");
    let expected = include_str!("validate_no_double_underscore_alias/fixtures/non_alias.expected");
    test_fixture(transform_fixture, "non_alias.graphql", "validate_no_double_underscore_alias/fixtures/non_alias.expected", input, expected).await;
}
