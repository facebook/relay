/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::DiagnosticsResult;
use fixture_tests::Fixture;
use graphql_ir::Program;
use graphql_test_helpers::apply_transform_for_test;
use relay_transforms::transform_assignable_fragment_spreads_in_regular_queries;

fn transform(program: &Program) -> DiagnosticsResult<Program> {
    transform_assignable_fragment_spreads_in_regular_queries(program)
}

pub async fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    apply_transform_for_test(fixture, transform)
}
