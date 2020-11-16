/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<44e6ef7b4a792e101de2064114e3c94a>>
 */

mod disallow_id_as_alias;

use disallow_id_as_alias::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn id_alias() {
    let input = include_str!("disallow_id_as_alias/fixtures/id-alias.graphql");
    let expected = include_str!("disallow_id_as_alias/fixtures/id-alias.expected");
    test_fixture(transform_fixture, "id-alias.graphql", "disallow_id_as_alias/fixtures/id-alias.expected", input, expected);
}

#[test]
fn id_alias_with_errors_invalid() {
    let input = include_str!("disallow_id_as_alias/fixtures/id-alias-with-errors.invalid.graphql");
    let expected = include_str!("disallow_id_as_alias/fixtures/id-alias-with-errors.invalid.expected");
    test_fixture(transform_fixture, "id-alias-with-errors.invalid.graphql", "disallow_id_as_alias/fixtures/id-alias-with-errors.invalid.expected", input, expected);
}
