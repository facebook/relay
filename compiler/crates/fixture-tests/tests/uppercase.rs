/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use fixture_tests::Fixture;

pub async fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    Ok(fixture.content.to_uppercase())
}
