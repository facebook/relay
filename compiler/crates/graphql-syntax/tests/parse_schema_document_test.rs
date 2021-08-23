/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<0141311d55f1d51679a9d50fa0b5b1da>>
 */

mod parse_schema_document;

use parse_schema_document::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn directive_description() {
    let input = include_str!("parse_schema_document/fixtures/directive_description.graphql");
    let expected = include_str!("parse_schema_document/fixtures/directive_description.expected");
    test_fixture(transform_fixture, "directive_description.graphql", "parse_schema_document/fixtures/directive_description.expected", input, expected);
}

#[test]
fn field_description() {
    let input = include_str!("parse_schema_document/fixtures/field_description.graphql");
    let expected = include_str!("parse_schema_document/fixtures/field_description.expected");
    test_fixture(transform_fixture, "field_description.graphql", "parse_schema_document/fixtures/field_description.expected", input, expected);
}

#[test]
fn schema_kitchen_sink() {
    let input = include_str!("parse_schema_document/fixtures/schema_kitchen_sink.graphql");
    let expected = include_str!("parse_schema_document/fixtures/schema_kitchen_sink.expected");
    test_fixture(transform_fixture, "schema_kitchen_sink.graphql", "parse_schema_document/fixtures/schema_kitchen_sink.expected", input, expected);
}

#[test]
fn schema_with_leading_comment() {
    let input = include_str!("parse_schema_document/fixtures/schema_with_leading_comment.graphql");
    let expected = include_str!("parse_schema_document/fixtures/schema_with_leading_comment.expected");
    test_fixture(transform_fixture, "schema_with_leading_comment.graphql", "parse_schema_document/fixtures/schema_with_leading_comment.expected", input, expected);
}

#[test]
fn type_definition() {
    let input = include_str!("parse_schema_document/fixtures/type_definition.graphql");
    let expected = include_str!("parse_schema_document/fixtures/type_definition.expected");
    test_fixture(transform_fixture, "type_definition.graphql", "parse_schema_document/fixtures/type_definition.expected", input, expected);
}
