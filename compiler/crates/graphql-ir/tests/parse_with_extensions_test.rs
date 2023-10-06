/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<52d5e6416c694968846ac5ec0fb6f8a4>>
 */

mod parse_with_extensions;

use parse_with_extensions::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn client_fields() {
    let input = include_str!("parse_with_extensions/fixtures/client-fields.graphql");
    let expected = include_str!("parse_with_extensions/fixtures/client-fields.expected");
    test_fixture(transform_fixture, "client-fields.graphql", "parse_with_extensions/fixtures/client-fields.expected", input, expected).await;
}

#[tokio::test]
async fn client_fields_invalid() {
    let input = include_str!("parse_with_extensions/fixtures/client-fields.invalid.graphql");
    let expected = include_str!("parse_with_extensions/fixtures/client-fields.invalid.expected");
    test_fixture(transform_fixture, "client-fields.invalid.graphql", "parse_with_extensions/fixtures/client-fields.invalid.expected", input, expected).await;
}
