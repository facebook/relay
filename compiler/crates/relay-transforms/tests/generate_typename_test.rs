/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<ff111faf561e95f25e383374baf31e15>>
 */

mod generate_typename;

use generate_typename::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn type_name_does_not_exist() {
    let input = include_str!("generate_typename/fixtures/type-name-does-not-exist.graphql");
    let expected = include_str!("generate_typename/fixtures/type-name-does-not-exist.expected");
    test_fixture(transform_fixture, "type-name-does-not-exist.graphql", "generate_typename/fixtures/type-name-does-not-exist.expected", input, expected);
}

#[test]
fn type_name_exists() {
    let input = include_str!("generate_typename/fixtures/type-name-exists.graphql");
    let expected = include_str!("generate_typename/fixtures/type-name-exists.expected");
    test_fixture(transform_fixture, "type-name-exists.graphql", "generate_typename/fixtures/type-name-exists.expected", input, expected);
}
