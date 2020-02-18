/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use fixture_tests::Fixture;
use schema::{build_schema, build_schema_with_extensions};

pub fn transform_fixture(fixture: &Fixture) -> Result<String, String> {
    let parts: Vec<_> = fixture.content.split("%extensions%").collect();
    let result = match parts.as_slice() {
        [base] => build_schema(base),
        [base, extensions] => build_schema_with_extensions(&[base], &[extensions]),
        _ => panic!("Expected a single extension block"),
    };

    result
        .map(|schema| schema.snapshot_print())
        .map_err(|err| format!("{}", err))
}
