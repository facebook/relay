/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use extract_graphql::parse_chunks;
use fixture_tests::Fixture;

pub fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    Ok(format!("{:#?}", parse_chunks(fixture.content)))
}
