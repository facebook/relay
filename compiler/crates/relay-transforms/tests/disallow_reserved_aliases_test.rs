/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<8a54c4298c83b3b072fa04aaa6053eda>>
 */

mod disallow_reserved_aliases;

use disallow_reserved_aliases::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn id_alias() {
    let input = include_str!("disallow_reserved_aliases/fixtures/id-alias.graphql");
    let expected = include_str!("disallow_reserved_aliases/fixtures/id-alias.expected");
    test_fixture(transform_fixture, file!(), "id-alias.graphql", "disallow_reserved_aliases/fixtures/id-alias.expected", input, expected).await;
}

#[tokio::test]
async fn id_alias_with_errors_invalid() {
    let input = include_str!("disallow_reserved_aliases/fixtures/id-alias-with-errors.invalid.graphql");
    let expected = include_str!("disallow_reserved_aliases/fixtures/id-alias-with-errors.invalid.expected");
    test_fixture(transform_fixture, file!(), "id-alias-with-errors.invalid.graphql", "disallow_reserved_aliases/fixtures/id-alias-with-errors.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn relay_id_alias_with_errors_invalid() {
    let input = include_str!("disallow_reserved_aliases/fixtures/relay_id-alias-with-errors.invalid.graphql");
    let expected = include_str!("disallow_reserved_aliases/fixtures/relay_id-alias-with-errors.invalid.expected");
    test_fixture(transform_fixture, file!(), "relay_id-alias-with-errors.invalid.graphql", "disallow_reserved_aliases/fixtures/relay_id-alias-with-errors.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn typename_alias_with_errors_invalid() {
    let input = include_str!("disallow_reserved_aliases/fixtures/typename-alias-with-errors.invalid.graphql");
    let expected = include_str!("disallow_reserved_aliases/fixtures/typename-alias-with-errors.invalid.expected");
    test_fixture(transform_fixture, file!(), "typename-alias-with-errors.invalid.graphql", "disallow_reserved_aliases/fixtures/typename-alias-with-errors.invalid.expected", input, expected).await;
}
