/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::FeatureFlag;
use fixture_tests::Fixture;
use graphql_test_helpers::apply_transform_for_test;
use relay_transforms::inline_fragments;

pub async fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    // Fixtures named `skip-impossible-*` enable `skip_impossible_inline_fragments`.
    let skip_impossible_inline_fragments = if fixture.file_name.starts_with("skip-impossible-") {
        FeatureFlag::Enabled
    } else {
        FeatureFlag::Disabled
    };
    apply_transform_for_test(fixture, |program| {
        let next_program = inline_fragments(program, &skip_impossible_inline_fragments);
        assert_eq!(next_program.fragments().count(), 0);
        assert_eq!(
            next_program.operations().count(),
            program.operations().count()
        );
        Ok(next_program)
    })
}
