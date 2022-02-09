/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<630a99acb13b7fe097d1c9676882f46a>>
 */

mod parse;

use parse::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn invalid_docblock_invalid() {
    let input = include_str!("parse/fixtures/invalid_docblock.invalid.ecmascript");
    let expected = include_str!("parse/fixtures/invalid_docblock.invalid.expected");
    test_fixture(transform_fixture, "invalid_docblock.invalid.ecmascript", "parse/fixtures/invalid_docblock.invalid.expected", input, expected);
}

#[test]
fn simple_docblock() {
    let input = include_str!("parse/fixtures/simple_docblock.ecmascript");
    let expected = include_str!("parse/fixtures/simple_docblock.expected");
    test_fixture(transform_fixture, "simple_docblock.ecmascript", "parse/fixtures/simple_docblock.expected", input, expected);
}
