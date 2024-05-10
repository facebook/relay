/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<efdfc991713e0b8adfedec168c7a62ca>>
 */

mod docblock;

use docblock::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn incorrect_export_error() {
    let input = include_str!("docblock/fixtures/incorrect-export-error.input");
    let expected = include_str!("docblock/fixtures/incorrect-export-error.expected");
    test_fixture(transform_fixture, file!(), "incorrect-export-error.input", "docblock/fixtures/incorrect-export-error.expected", input, expected).await;
}

#[tokio::test]
async fn incorrect_type_error() {
    let input = include_str!("docblock/fixtures/incorrect-type-error.input");
    let expected = include_str!("docblock/fixtures/incorrect-type-error.expected");
    test_fixture(transform_fixture, file!(), "incorrect-type-error.input", "docblock/fixtures/incorrect-type-error.expected", input, expected).await;
}

#[tokio::test]
async fn live() {
    let input = include_str!("docblock/fixtures/live.input");
    let expected = include_str!("docblock/fixtures/live.expected");
    test_fixture(transform_fixture, file!(), "live.input", "docblock/fixtures/live.expected", input, expected).await;
}

#[tokio::test]
async fn missing_param_type_error() {
    let input = include_str!("docblock/fixtures/missing-param-type-error.input");
    let expected = include_str!("docblock/fixtures/missing-param-type-error.expected");
    test_fixture(transform_fixture, file!(), "missing-param-type-error.input", "docblock/fixtures/missing-param-type-error.expected", input, expected).await;
}

#[tokio::test]
async fn multiple_modules() {
    let input = include_str!("docblock/fixtures/multiple-modules.input");
    let expected = include_str!("docblock/fixtures/multiple-modules.expected");
    test_fixture(transform_fixture, file!(), "multiple-modules.input", "docblock/fixtures/multiple-modules.expected", input, expected).await;
}

#[tokio::test]
async fn parse_error() {
    let input = include_str!("docblock/fixtures/parse_error.input");
    let expected = include_str!("docblock/fixtures/parse_error.expected");
    test_fixture(transform_fixture, file!(), "parse_error.input", "docblock/fixtures/parse_error.expected", input, expected).await;
}

#[tokio::test]
async fn plural_optional() {
    let input = include_str!("docblock/fixtures/plural-optional.input");
    let expected = include_str!("docblock/fixtures/plural-optional.expected");
    test_fixture(transform_fixture, file!(), "plural-optional.input", "docblock/fixtures/plural-optional.expected", input, expected).await;
}

#[tokio::test]
async fn root_fragment() {
    let input = include_str!("docblock/fixtures/root-fragment.input");
    let expected = include_str!("docblock/fixtures/root-fragment.expected");
    test_fixture(transform_fixture, file!(), "root-fragment.input", "docblock/fixtures/root-fragment.expected", input, expected).await;
}

#[tokio::test]
async fn single_module() {
    let input = include_str!("docblock/fixtures/single-module.input");
    let expected = include_str!("docblock/fixtures/single-module.expected");
    test_fixture(transform_fixture, file!(), "single-module.input", "docblock/fixtures/single-module.expected", input, expected).await;
}

#[tokio::test]
async fn weak_object() {
    let input = include_str!("docblock/fixtures/weak-object.input");
    let expected = include_str!("docblock/fixtures/weak-object.expected");
    test_fixture(transform_fixture, file!(), "weak-object.input", "docblock/fixtures/weak-object.expected", input, expected).await;
}

#[tokio::test]
async fn weak_object_no_fields() {
    let input = include_str!("docblock/fixtures/weak-object-no-fields.input");
    let expected = include_str!("docblock/fixtures/weak-object-no-fields.expected");
    test_fixture(transform_fixture, file!(), "weak-object-no-fields.input", "docblock/fixtures/weak-object-no-fields.expected", input, expected).await;
}

#[tokio::test]
async fn weak_type_error() {
    let input = include_str!("docblock/fixtures/weak-type-error.input");
    let expected = include_str!("docblock/fixtures/weak-type-error.expected");
    test_fixture(transform_fixture, file!(), "weak-type-error.input", "docblock/fixtures/weak-type-error.expected", input, expected).await;
}
