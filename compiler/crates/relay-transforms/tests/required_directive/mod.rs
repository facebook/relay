/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::DiagnosticsResult;
use fixture_tests::Fixture;
use graphql_ir::Program;
use graphql_test_helpers::apply_transform_for_test;
use interner::Intern;
use relay_transforms::{required_directive, FeatureFlags};

fn transform(program: &Program) -> DiagnosticsResult<Program> {
    required_directive(
        program,
        &FeatureFlags {
            enable_required_transform_for_prefix: Some("Enabled".intern()),
            enable_flight_transform: false,
        },
    )
}

pub fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    apply_transform_for_test(fixture, transform)
}
