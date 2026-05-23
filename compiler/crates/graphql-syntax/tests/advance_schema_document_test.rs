/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<1b78966281c5964a162ff1c5662713ed>>
 */

mod advance_schema_document;

use advance_schema_document::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn schema_kitchen_sink() {
    let input = include_str!("advance_schema_document/fixtures/schema_kitchen_sink.graphql");
    let expected = include_str!("advance_schema_document/fixtures/schema_kitchen_sink.expected");
    test_fixture(transform_fixture, file!(), "schema_kitchen_sink.graphql", "advance_schema_document/fixtures/schema_kitchen_sink.expected", input, expected).await;
}

#[tokio::test]
async fn schema_with_leading_comment() {
    let input = include_str!("advance_schema_document/fixtures/schema_with_leading_comment.graphql");
    let expected = include_str!("advance_schema_document/fixtures/schema_with_leading_comment.expected");
    test_fixture(transform_fixture, file!(), "schema_with_leading_comment.graphql", "advance_schema_document/fixtures/schema_with_leading_comment.expected", input, expected).await;
}

#[tokio::test]
async fn type_definition() {
    let input = include_str!("advance_schema_document/fixtures/type_definition.graphql");
    let expected = include_str!("advance_schema_document/fixtures/type_definition.expected");
    test_fixture(transform_fixture, file!(), "type_definition.graphql", "advance_schema_document/fixtures/type_definition.expected", input, expected).await;
}
