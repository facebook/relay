/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<2cfb8c187c11a7372faf59117a88b6dc>>
 */

mod validate_no_double_underscore_alias;

use validate_no_double_underscore_alias::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn double_underscore_invalid() {
    let input = include_str!("validate_no_double_underscore_alias/fixtures/double_underscore.invalid.graphql");
    let expected = include_str!("validate_no_double_underscore_alias/fixtures/double_underscore.invalid.expected");
    test_fixture(transform_fixture, "double_underscore.invalid.graphql", "validate_no_double_underscore_alias/fixtures/double_underscore.invalid.expected", input, expected);
}

#[test]
fn non_alias() {
    let input = include_str!("validate_no_double_underscore_alias/fixtures/non_alias.graphql");
    let expected = include_str!("validate_no_double_underscore_alias/fixtures/non_alias.expected");
    test_fixture(transform_fixture, "non_alias.graphql", "validate_no_double_underscore_alias/fixtures/non_alias.expected", input, expected);
}
