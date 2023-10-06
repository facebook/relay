/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use fixture_tests::Fixture;
use graphql_test_helpers::apply_transform_for_test;
use relay_config::ProjectName;
use relay_config::SchemaConfig;
use relay_transforms::generate_relay_resolvers_operations_for_nested_objects;

pub async fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    apply_transform_for_test(fixture, |program| {
        generate_relay_resolvers_operations_for_nested_objects(
            ProjectName::default(),
            program,
            &SchemaConfig::default(),
        )
    })
}
