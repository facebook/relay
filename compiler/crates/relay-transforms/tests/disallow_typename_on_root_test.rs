/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<a9688eaa3922b2d2665be37c3d186891>>
 */

mod disallow_typename_on_root;

use disallow_typename_on_root::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn typename_on_mutation_invalid() {
    let input = include_str!("disallow_typename_on_root/fixtures/typename-on-mutation.invalid.graphql");
    let expected = include_str!("disallow_typename_on_root/fixtures/typename-on-mutation.invalid.expected");
    test_fixture(transform_fixture, "typename-on-mutation.invalid.graphql", "disallow_typename_on_root/fixtures/typename-on-mutation.invalid.expected", input, expected);
}

#[test]
fn typename_on_query_invalid() {
    let input = include_str!("disallow_typename_on_root/fixtures/typename-on-query.invalid.graphql");
    let expected = include_str!("disallow_typename_on_root/fixtures/typename-on-query.invalid.expected");
    test_fixture(transform_fixture, "typename-on-query.invalid.graphql", "disallow_typename_on_root/fixtures/typename-on-query.invalid.expected", input, expected);
}

#[test]
fn valid() {
    let input = include_str!("disallow_typename_on_root/fixtures/valid.graphql");
    let expected = include_str!("disallow_typename_on_root/fixtures/valid.expected");
    test_fixture(transform_fixture, "valid.graphql", "disallow_typename_on_root/fixtures/valid.expected", input, expected);
}
