/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<c76fde417081b2595591a1ffa8f5fa64>>
 */

mod skip_printing_nulls;

use skip_printing_nulls::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn kitchen_sink() {
    let input = include_str!("skip_printing_nulls/fixtures/kitchen-sink.graphql");
    let expected = include_str!("skip_printing_nulls/fixtures/kitchen-sink.expected");
    test_fixture(transform_fixture, "kitchen-sink.graphql", "skip_printing_nulls/fixtures/kitchen-sink.expected", input, expected);
}
