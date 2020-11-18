/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<d56b9f5d378a674702fb32eb7105fddd>>
 */

mod parse_schema_document;

use parse_schema_document::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn schema_kitchen_sink() {
    let input = include_str!("parse_schema_document/fixtures/schema_kitchen_sink.graphql");
    let expected = include_str!("parse_schema_document/fixtures/schema_kitchen_sink.expected");
    test_fixture(transform_fixture, "schema_kitchen_sink.graphql", "parse_schema_document/fixtures/schema_kitchen_sink.expected", input, expected);
}

#[test]
fn type_definition() {
    let input = include_str!("parse_schema_document/fixtures/type_definition.graphql");
    let expected = include_str!("parse_schema_document/fixtures/type_definition.expected");
    test_fixture(transform_fixture, "type_definition.graphql", "parse_schema_document/fixtures/type_definition.expected", input, expected);
}
