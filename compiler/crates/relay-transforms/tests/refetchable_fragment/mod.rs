/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use fixture_tests::Fixture;
use graphql_test_helpers::apply_transform_for_test;
use relay_transforms::transform_connections;
use relay_transforms::transform_refetchable_fragment;
use relay_transforms::ConnectionInterface;

pub fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    apply_transform_for_test(fixture, |program| {
        let program = transform_connections(program, &ConnectionInterface::default());
        let base_fragments = Default::default();
        let schema_config = if fixture.content.contains("// enable-token-field: true") {
            let mut schema_config: relay_config::SchemaConfig = Default::default();
            schema_config.enable_token_field = true;
            schema_config
        } else {
            Default::default()
        };
        transform_refetchable_fragment(&program, &schema_config, &base_fragments, false)
    })
}
