/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use fixture_tests::Fixture;
use relay_transforms::{
    transform_connections, transform_refetchable_fragment, ConnectionInterface,
};

use graphql_test_helpers::apply_transform_for_test;

pub fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    apply_transform_for_test(fixture, |program| {
        let program = transform_connections(program, &ConnectionInterface::default());
        let base_fragments = Default::default();
        transform_refetchable_fragment(&program, &base_fragments, false)
    })
}
