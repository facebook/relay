/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<599a01caa214b3d7f41b6ec10adf76a5>>
 */

mod parse_document;

use parse_document::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn invalid_definition_invalid() {
    let input = include_str!("parse_document/fixtures/invalid_definition.invalid.graphql");
    let expected = include_str!("parse_document/fixtures/invalid_definition.invalid.expected");
    test_fixture(transform_fixture, "invalid_definition.invalid.graphql", "parse_document/fixtures/invalid_definition.invalid.expected", input, expected);
}

#[test]
fn mixed() {
    let input = include_str!("parse_document/fixtures/mixed.graphql");
    let expected = include_str!("parse_document/fixtures/mixed.expected");
    test_fixture(transform_fixture, "mixed.graphql", "parse_document/fixtures/mixed.expected", input, expected);
}
