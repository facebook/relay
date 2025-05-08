/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<8206a3292d96e0cd429bb5089b3d2e71>>
 */

mod parse_document_with_enquoted_alias;

use parse_document_with_enquoted_alias::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn enquoted_alias_with_enquoted_field_invalid() {
    let input = include_str!("parse_document_with_enquoted_alias/fixtures/enquoted_alias_with_enquoted_field.invalid.graphql");
    let expected = include_str!("parse_document_with_enquoted_alias/fixtures/enquoted_alias_with_enquoted_field.invalid.expected");
    test_fixture(transform_fixture, file!(), "enquoted_alias_with_enquoted_field.invalid.graphql", "parse_document_with_enquoted_alias/fixtures/enquoted_alias_with_enquoted_field.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn enquoted_alias_with_escape() {
    let input = include_str!("parse_document_with_enquoted_alias/fixtures/enquoted_alias_with_escape.graphql");
    let expected = include_str!("parse_document_with_enquoted_alias/fixtures/enquoted_alias_with_escape.expected");
    test_fixture(transform_fixture, file!(), "enquoted_alias_with_escape.graphql", "parse_document_with_enquoted_alias/fixtures/enquoted_alias_with_escape.expected", input, expected).await;
}

#[tokio::test]
async fn enquoted_field_name_invalid() {
    let input = include_str!("parse_document_with_enquoted_alias/fixtures/enquoted_field_name.invalid.graphql");
    let expected = include_str!("parse_document_with_enquoted_alias/fixtures/enquoted_field_name.invalid.expected");
    test_fixture(transform_fixture, file!(), "enquoted_field_name.invalid.graphql", "parse_document_with_enquoted_alias/fixtures/enquoted_field_name.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn simple_enquoted_alias() {
    let input = include_str!("parse_document_with_enquoted_alias/fixtures/simple_enquoted_alias.graphql");
    let expected = include_str!("parse_document_with_enquoted_alias/fixtures/simple_enquoted_alias.expected");
    test_fixture(transform_fixture, file!(), "simple_enquoted_alias.graphql", "parse_document_with_enquoted_alias/fixtures/simple_enquoted_alias.expected", input, expected).await;
}
