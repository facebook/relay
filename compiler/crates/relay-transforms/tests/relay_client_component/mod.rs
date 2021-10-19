/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use fixture_tests::Fixture;
use graphql_test_helpers::apply_transform_for_test;
use relay_transforms::{relay_client_component, FeatureFlags};

pub fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let flags = FeatureFlags::default();
    apply_transform_for_test(fixture, |program| relay_client_component(program, &flags))
}
