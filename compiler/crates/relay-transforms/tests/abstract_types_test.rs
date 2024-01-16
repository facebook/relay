/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<3c6017592b56e7915a7d678cc5805e92>>
 */

mod abstract_types;

use abstract_types::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn fragment_on_abstract_type_disabled() {
    let input = include_str!("abstract_types/fixtures/fragment_on_abstract_type_disabled.graphql");
    let expected = include_str!("abstract_types/fixtures/fragment_on_abstract_type_disabled.expected");
    test_fixture(transform_fixture, file!(), "fragment_on_abstract_type_disabled.graphql", "abstract_types/fixtures/fragment_on_abstract_type_disabled.expected", input, expected).await;
}
