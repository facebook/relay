/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<273ffd6866e55a9ed31d0fc960dcaac8>>
 */

mod relay_resolvers_abstract_types;

use relay_resolvers_abstract_types::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn fragment_on_abstract_type_disabled() {
    let input = include_str!("relay_resolvers_abstract_types/fixtures/fragment_on_abstract_type_disabled.graphql");
    let expected = include_str!("relay_resolvers_abstract_types/fixtures/fragment_on_abstract_type_disabled.expected");
    test_fixture(transform_fixture, file!(), "fragment_on_abstract_type_disabled.graphql", "relay_resolvers_abstract_types/fixtures/fragment_on_abstract_type_disabled.expected", input, expected).await;
}
