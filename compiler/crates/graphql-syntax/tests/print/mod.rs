/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use fixture_tests::Fixture;
use schema::new_parse_definitions;

pub fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let type_system_definitions = new_parse_definitions(fixture.content)
        .expect("Failed to parse definitions")
        .definitions;

    let result = type_system_definitions
        .iter()
        .map(|node| format!("{}", node))
        .collect::<Vec<String>>()
        .join("\n");

    Ok(result)
}
