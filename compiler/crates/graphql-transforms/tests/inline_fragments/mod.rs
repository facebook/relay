/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use fixture_tests::Fixture;
use graphql_transforms::inline_fragments;

#[path = "../test_helper.rs"]
mod test_helper;

use test_helper::apply_transform_for_test;

pub fn transform_fixture(fixture: &Fixture) -> Result<String, String> {
    apply_transform_for_test(fixture, |program| {
        let next_program = inline_fragments(&program);
        assert_eq!(next_program.fragments().count(), 0);
        assert_eq!(
            next_program.operations().count(),
            program.operations().count()
        );
        Ok(next_program)
    })
}
