/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::DiagnosticsResult;
use common::FeatureFlag;
use fixture_tests::Fixture;
use graphql_ir::Program;
use graphql_test_helpers::apply_transform_for_test;
use relay_transforms::catch_directive;
use relay_transforms::fragment_alias_directive;

fn transform(program: &Program) -> DiagnosticsResult<Program> {
    catch_directive(&fragment_alias_directive(program, &FeatureFlag::Enabled)?)
}

pub async fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    apply_transform_for_test(fixture, transform)
}
