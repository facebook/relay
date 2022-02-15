/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<11c2bc0a2c120cfffd3aea83f29750bd>>
 */

mod parse;

use parse::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn relay_resolver() {
    let input = include_str!("parse/fixtures/relay-resolver.js");
    let expected = include_str!("parse/fixtures/relay-resolver.expected");
    test_fixture(transform_fixture, "relay-resolver.js", "parse/fixtures/relay-resolver.expected", input, expected);
}
