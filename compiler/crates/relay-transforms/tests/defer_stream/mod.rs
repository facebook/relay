/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use fixture_tests::Fixture;
use graphql_test_helpers::apply_transform_for_test;
use relay_transforms::{
    transform_defer_stream, unwrap_custom_directive_selection, DeferStreamInterface,
};

pub fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    apply_transform_for_test(fixture, |program| {
        let defer_stream_interface = DeferStreamInterface::default();
        let program = transform_defer_stream(program, &defer_stream_interface)?;
        let program = unwrap_custom_directive_selection(&program, &defer_stream_interface);
        Ok(program)
    })
}
