/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<deb766629b75c758df128a08ff4fd206>>
 */

mod print_schema;

use print_schema::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn kitchen_sink() {
    let input = include_str!("print_schema/fixtures/kitchen-sink.graphql");
    let expected = include_str!("print_schema/fixtures/kitchen-sink.expected");
    test_fixture(transform_fixture, "kitchen-sink.graphql", "print_schema/fixtures/kitchen-sink.expected", input, expected);
}
