/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use fixture_tests::Fixture;
use graphql_test_helpers::apply_transform_for_test;
use relay_config::DeferStreamInterface;
use relay_transforms::transform_defer_stream;
use relay_transforms::unwrap_custom_directive_selection;

pub async fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let defer_stream_interface = DeferStreamInterface::default();
    apply_transform_for_test(fixture, |program| {
        let program = transform_defer_stream(program, &defer_stream_interface)?;
        let program = unwrap_custom_directive_selection(&program, defer_stream_interface);
        Ok(program)
    })
}
