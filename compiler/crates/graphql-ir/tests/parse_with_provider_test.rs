/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b92dbb5e2f930d15607b78f6fba95604>>
 */

mod parse_with_provider;

use parse_with_provider::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn fragment_with_invalid_defaultvalue_provider() {
    let input = include_str!("parse_with_provider/fixtures/fragment_with_invalid_defaultvalue_provider.graphql");
    let expected = include_str!("parse_with_provider/fixtures/fragment_with_invalid_defaultvalue_provider.expected");
    test_fixture(transform_fixture, "fragment_with_invalid_defaultvalue_provider.graphql", "parse_with_provider/fixtures/fragment_with_invalid_defaultvalue_provider.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_with_invalid_type_provider() {
    let input = include_str!("parse_with_provider/fixtures/fragment_with_invalid_type_provider.graphql");
    let expected = include_str!("parse_with_provider/fixtures/fragment_with_invalid_type_provider.expected");
    test_fixture(transform_fixture, "fragment_with_invalid_type_provider.graphql", "parse_with_provider/fixtures/fragment_with_invalid_type_provider.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_with_valid_provider() {
    let input = include_str!("parse_with_provider/fixtures/fragment_with_valid_provider.graphql");
    let expected = include_str!("parse_with_provider/fixtures/fragment_with_valid_provider.expected");
    test_fixture(transform_fixture, "fragment_with_valid_provider.graphql", "parse_with_provider/fixtures/fragment_with_valid_provider.expected", input, expected).await;
}

#[tokio::test]
async fn use_fragment_spread_with_provider() {
    let input = include_str!("parse_with_provider/fixtures/use_fragment_spread_with_provider.graphql");
    let expected = include_str!("parse_with_provider/fixtures/use_fragment_spread_with_provider.expected");
    test_fixture(transform_fixture, "use_fragment_spread_with_provider.graphql", "parse_with_provider/fixtures/use_fragment_spread_with_provider.expected", input, expected).await;
}
