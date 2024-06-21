/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<e754c9b986474e80e9bc346aa6c77fcd>>
 */

mod print;

use print::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn schema() {
    let input = include_str!("print/fixtures/schema.graphql");
    let expected = include_str!("print/fixtures/schema.expected");
    test_fixture(transform_fixture, "schema.graphql", "print/fixtures/schema.expected", input, expected);
}
