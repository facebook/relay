/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<673e108854b42fe5128e69b9ae6d3180>>
 */

mod relay_test_operation;

use relay_test_operation::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn query_with_enums() {
    let input = include_str!("relay_test_operation/fixtures/query-with-enums.graphql");
    let expected = include_str!("relay_test_operation/fixtures/query-with-enums.expected");
    test_fixture(transform_fixture, "query-with-enums.graphql", "relay_test_operation/fixtures/query-with-enums.expected", input, expected);
}

#[test]
fn simple_query() {
    let input = include_str!("relay_test_operation/fixtures/simple-query.graphql");
    let expected = include_str!("relay_test_operation/fixtures/simple-query.expected");
    test_fixture(transform_fixture, "simple-query.graphql", "relay_test_operation/fixtures/simple-query.expected", input, expected);
}
