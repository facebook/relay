/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<d8711219e10b1f666a01fa60e6b5d967>>
 */

mod query_field;

use fixture_tests::test_fixture;
use query_field::transform_fixture;

#[test]
fn read_query_field() {
    let input = include_str!("query_field/fixtures/read_query_field.graphql");
    let expected = include_str!("query_field/fixtures/read_query_field.expected");
    test_fixture(
        transform_fixture,
        "read_query_field.graphql",
        "query_field/fixtures/read_query_field.expected",
        input,
        expected,
    );
}
