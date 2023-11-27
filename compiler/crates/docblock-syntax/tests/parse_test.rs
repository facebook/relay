/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<51c96537c8af1ebfd9e5d3e44443df65>>
 */

mod parse;

use parse::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn docblock_ends_mid_line() {
    let input = include_str!("parse/fixtures/docblock-ends-mid-line.ecmascript");
    let expected = include_str!("parse/fixtures/docblock-ends-mid-line.expected");
    test_fixture(transform_fixture, file!(), "docblock-ends-mid-line.ecmascript", "parse/fixtures/docblock-ends-mid-line.expected", input, expected).await;
}

#[tokio::test]
async fn empty_block() {
    let input = include_str!("parse/fixtures/empty-block.ecmascript");
    let expected = include_str!("parse/fixtures/empty-block.expected");
    test_fixture(transform_fixture, file!(), "empty-block.ecmascript", "parse/fixtures/empty-block.expected", input, expected).await;
}

#[tokio::test]
async fn field_followed_by_free_text() {
    let input = include_str!("parse/fixtures/field-followed-by-free-text.ecmascript");
    let expected = include_str!("parse/fixtures/field-followed-by-free-text.expected");
    test_fixture(transform_fixture, file!(), "field-followed-by-free-text.ecmascript", "parse/fixtures/field-followed-by-free-text.expected", input, expected).await;
}

#[tokio::test]
async fn free_text_starting_with_star() {
    let input = include_str!("parse/fixtures/free-text-starting-with-star.ecmascript");
    let expected = include_str!("parse/fixtures/free-text-starting-with-star.expected");
    test_fixture(transform_fixture, file!(), "free-text-starting-with-star.ecmascript", "parse/fixtures/free-text-starting-with-star.expected", input, expected).await;
}

#[tokio::test]
async fn invalid_docblock_invalid() {
    let input = include_str!("parse/fixtures/invalid_docblock.invalid.ecmascript");
    let expected = include_str!("parse/fixtures/invalid_docblock.invalid.expected");
    test_fixture(transform_fixture, file!(), "invalid_docblock.invalid.ecmascript", "parse/fixtures/invalid_docblock.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn invalid_field_name_invalid() {
    let input = include_str!("parse/fixtures/invalid_field_name.invalid.ecmascript");
    let expected = include_str!("parse/fixtures/invalid_field_name.invalid.expected");
    test_fixture(transform_fixture, file!(), "invalid_field_name.invalid.ecmascript", "parse/fixtures/invalid_field_name.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn missing_star_invalid() {
    let input = include_str!("parse/fixtures/missing_star.invalid.ecmascript");
    let expected = include_str!("parse/fixtures/missing_star.invalid.expected");
    test_fixture(transform_fixture, file!(), "missing_star.invalid.ecmascript", "parse/fixtures/missing_star.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn multiple_fields() {
    let input = include_str!("parse/fixtures/multiple-fields.ecmascript");
    let expected = include_str!("parse/fixtures/multiple-fields.expected");
    test_fixture(transform_fixture, file!(), "multiple-fields.ecmascript", "parse/fixtures/multiple-fields.expected", input, expected).await;
}

#[tokio::test]
async fn simple_docblock() {
    let input = include_str!("parse/fixtures/simple_docblock.ecmascript");
    let expected = include_str!("parse/fixtures/simple_docblock.expected");
    test_fixture(transform_fixture, file!(), "simple_docblock.ecmascript", "parse/fixtures/simple_docblock.expected", input, expected).await;
}
