/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use fixture_tests::Fixture;
use graphql_test_helpers::apply_transform_for_test;
use regex::Regex;
use relay_transforms::generate_test_operation_metadata;

pub fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let test_path_regex = Some(Regex::new(r#"^test"#).unwrap());
    apply_transform_for_test(fixture, |program| {
        generate_test_operation_metadata(program, &test_path_regex)
    })
}
