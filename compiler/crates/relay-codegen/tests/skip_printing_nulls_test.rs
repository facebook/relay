/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<db8f1fe8d4f574d365535bd907619149>>
 */

mod skip_printing_nulls;

use skip_printing_nulls::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn kitchen_sink() {
    let input = include_str!("skip_printing_nulls/fixtures/kitchen-sink.graphql");
    let expected = include_str!("skip_printing_nulls/fixtures/kitchen-sink.expected");
    test_fixture(transform_fixture, file!(), "kitchen-sink.graphql", "skip_printing_nulls/fixtures/kitchen-sink.expected", input, expected).await;
}
