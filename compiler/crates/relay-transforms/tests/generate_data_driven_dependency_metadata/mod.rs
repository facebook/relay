/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::FeatureFlags;
use fixture_tests::Fixture;
use graphql_test_helpers::apply_transform_for_test;
use relay_transforms::{generate_data_driven_dependency_metadata, transform_match};

pub fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    apply_transform_for_test(fixture, |program| {
        let flags = FeatureFlags::default();
        let program = transform_match(program, &flags)?;
        let program = generate_data_driven_dependency_metadata(&program);
        Ok(program)
    })
}
