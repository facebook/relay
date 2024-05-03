/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use fixture_tests::Fixture;
use schema::build_schema;
use schema_validate_lib::validate;
use schema_validate_lib::SchemaValidationOptions;

pub async fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let schema = build_schema(fixture.content).unwrap();
    Ok(validate(
        &schema,
        SchemaValidationOptions {
            allow_introspection_names: false,
        },
    )
    .print_errors())
}
