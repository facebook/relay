/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use fixture_tests::Fixture;
use graphql_test_helpers::apply_transform_for_test;
use relay_config::DeferStreamInterface;
use relay_transforms::transform_connections;
use relay_transforms::transform_refetchable_fragment;
use relay_transforms::ConnectionInterface;

pub async fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    apply_transform_for_test(fixture, |program| {
        let program = transform_connections(
            program,
            &ConnectionInterface::default(),
            &DeferStreamInterface::default(),
            false,
        );
        let base_fragments = Default::default();
        transform_refetchable_fragment(
            &program,
            &Default::default(),
            &base_fragments,
            false,
            vec![],
        )
    })
}
