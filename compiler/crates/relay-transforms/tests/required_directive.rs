/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::FeatureFlag;
use common::FeatureFlags;
use fixture_tests::Fixture;
use graphql_test_helpers::apply_transform_for_test;
use relay_transforms::fragment_alias_directive;
use relay_transforms::required_directive;

pub async fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let disallow_required_action_throw_on_semantically_nullable_fields =
        if fixture.content.contains(
            "# relay:feature-flag disallow_required_action_throw_on_semantically_nullable_fields",
        ) {
            FeatureFlag::Enabled
        } else {
            FeatureFlag::Disabled
        };

    let feature_flags = FeatureFlags {
        disallow_required_action_throw_on_semantically_nullable_fields,
        ..Default::default()
    };

    apply_transform_for_test(fixture, |program| {
        required_directive(
            &fragment_alias_directive(program, &FeatureFlag::Enabled)?,
            &feature_flags,
        )
    })
}
