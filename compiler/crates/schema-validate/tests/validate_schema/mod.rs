/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use fixture_tests::Fixture;
use schema::build_schema;
use schema_validate_lib::validate;

pub fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let schema = build_schema(fixture.content).unwrap();
    Ok(validate(&schema).print_errors())
}
