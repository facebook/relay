/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<e8fc3d24e696889e9f915419a22c98e0>>
 */

mod disallow_typename_on_root;

use disallow_typename_on_root::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn typename_on_fragment_invalid() {
    let input = include_str!("disallow_typename_on_root/fixtures/typename-on-fragment.invalid.graphql");
    let expected = include_str!("disallow_typename_on_root/fixtures/typename-on-fragment.invalid.expected");
    test_fixture(transform_fixture, file!(), "typename-on-fragment.invalid.graphql", "disallow_typename_on_root/fixtures/typename-on-fragment.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn typename_on_mutation_invalid() {
    let input = include_str!("disallow_typename_on_root/fixtures/typename-on-mutation.invalid.graphql");
    let expected = include_str!("disallow_typename_on_root/fixtures/typename-on-mutation.invalid.expected");
    test_fixture(transform_fixture, file!(), "typename-on-mutation.invalid.graphql", "disallow_typename_on_root/fixtures/typename-on-mutation.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn typename_on_query_invalid() {
    let input = include_str!("disallow_typename_on_root/fixtures/typename-on-query.invalid.graphql");
    let expected = include_str!("disallow_typename_on_root/fixtures/typename-on-query.invalid.expected");
    test_fixture(transform_fixture, file!(), "typename-on-query.invalid.graphql", "disallow_typename_on_root/fixtures/typename-on-query.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn valid() {
    let input = include_str!("disallow_typename_on_root/fixtures/valid.graphql");
    let expected = include_str!("disallow_typename_on_root/fixtures/valid.expected");
    test_fixture(transform_fixture, file!(), "valid.graphql", "disallow_typename_on_root/fixtures/valid.expected", input, expected).await;
}
