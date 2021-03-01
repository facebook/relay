/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<7cea6a16cf3cd6d8bd25cdc373b3b02d>>
 */

mod disallow_reserved_aliases;

use disallow_reserved_aliases::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn id_alias() {
    let input = include_str!("disallow_reserved_aliases/fixtures/id-alias.graphql");
    let expected = include_str!("disallow_reserved_aliases/fixtures/id-alias.expected");
    test_fixture(transform_fixture, "id-alias.graphql", "disallow_reserved_aliases/fixtures/id-alias.expected", input, expected);
}

#[test]
fn id_alias_with_errors_invalid() {
    let input = include_str!("disallow_reserved_aliases/fixtures/id-alias-with-errors.invalid.graphql");
    let expected = include_str!("disallow_reserved_aliases/fixtures/id-alias-with-errors.invalid.expected");
    test_fixture(transform_fixture, "id-alias-with-errors.invalid.graphql", "disallow_reserved_aliases/fixtures/id-alias-with-errors.invalid.expected", input, expected);
}

#[test]
fn relay_id_alias_with_errors_invalid() {
    let input = include_str!("disallow_reserved_aliases/fixtures/relay_id-alias-with-errors.invalid.graphql");
    let expected = include_str!("disallow_reserved_aliases/fixtures/relay_id-alias-with-errors.invalid.expected");
    test_fixture(transform_fixture, "relay_id-alias-with-errors.invalid.graphql", "disallow_reserved_aliases/fixtures/relay_id-alias-with-errors.invalid.expected", input, expected);
}

#[test]
fn typename_alias_with_errors_invalid() {
    let input = include_str!("disallow_reserved_aliases/fixtures/typename-alias-with-errors.invalid.graphql");
    let expected = include_str!("disallow_reserved_aliases/fixtures/typename-alias-with-errors.invalid.expected");
    test_fixture(transform_fixture, "typename-alias-with-errors.invalid.graphql", "disallow_reserved_aliases/fixtures/typename-alias-with-errors.invalid.expected", input, expected);
}
