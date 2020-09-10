/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use fixture_tests::Fixture;
use graphql_ir::{Program, ValidationResult};
use graphql_test_helpers::apply_transform_for_test;
use graphql_transforms::{required_directive, FeatureFlags};
use interner::Intern;

fn transform(program: &Program) -> ValidationResult<Program> {
    required_directive(
        program,
        &FeatureFlags {
            enable_required_transform_for_prefix: Some("Enabled".intern()),
            enable_flight_transform: false,
        },
    )
}

pub fn transform_fixture(fixture: &Fixture) -> Result<String, String> {
    apply_transform_for_test(fixture, transform)
}
