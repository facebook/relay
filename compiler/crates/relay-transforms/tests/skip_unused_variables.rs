/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use fixture_tests::Fixture;
use graphql_test_helpers::apply_transform_for_test;
use relay_transforms::ValidateVariablesOptions;
use relay_transforms::validate_operation_variables;

pub async fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    apply_transform_for_test(fixture, |program| {
        validate_operation_variables(
            program,
            ValidateVariablesOptions {
                remove_unused_variables: true,
            },
        )
    })
}
