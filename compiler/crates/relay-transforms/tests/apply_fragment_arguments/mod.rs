/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use fixture_tests::Fixture;
use fnv::FnvHashSet;
use graphql_test_helpers::apply_transform_for_test;
use relay_transforms::{apply_fragment_arguments, FeatureFlag};

pub fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    apply_transform_for_test(fixture, |program| {
        apply_fragment_arguments(
            program,
            false,
            &FeatureFlag::Enabled,
            &FnvHashSet::default(),
        )
    })
}
