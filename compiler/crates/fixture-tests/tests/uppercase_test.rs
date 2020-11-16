/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<5485f969d2c4ec061b42a61e18f80eed>>
 */

mod uppercase;

use uppercase::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn hello() {
    let input = include_str!("uppercase/fixtures/hello.txt");
    let expected = include_str!("uppercase/fixtures/hello.expected");
    test_fixture(transform_fixture, "hello.txt", "uppercase/fixtures/hello.expected", input, expected);
}

#[test]
fn world() {
    let input = include_str!("uppercase/fixtures/world.txt");
    let expected = include_str!("uppercase/fixtures/world.expected");
    test_fixture(transform_fixture, "world.txt", "uppercase/fixtures/world.expected", input, expected);
}
