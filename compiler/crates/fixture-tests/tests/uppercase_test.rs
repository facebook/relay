/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<759fa81dcfd359632faaf5a2bd8f9555>>
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
