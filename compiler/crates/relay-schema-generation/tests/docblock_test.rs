/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<7f0997fb1dbf297de82340a1c311a2b0>>
 */

mod docblock;

use docblock::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn arguments() {
    let input = include_str!("docblock/fixtures/arguments.input");
    let expected = include_str!("docblock/fixtures/arguments.expected");
    test_fixture(transform_fixture, file!(), "arguments.input", "docblock/fixtures/arguments.expected", input, expected).await;
}

#[tokio::test]
async fn description() {
    let input = include_str!("docblock/fixtures/description.input");
    let expected = include_str!("docblock/fixtures/description.expected");
    test_fixture(transform_fixture, file!(), "description.input", "docblock/fixtures/description.expected", input, expected).await;
}

#[tokio::test]
async fn idof() {
    let input = include_str!("docblock/fixtures/idof.input");
    let expected = include_str!("docblock/fixtures/idof.expected");
    test_fixture(transform_fixture, file!(), "idof.input", "docblock/fixtures/idof.expected", input, expected).await;
}

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
async fn optional_strong_type() {
    let input = include_str!("docblock/fixtures/optional-strong-type.input");
    let expected = include_str!("docblock/fixtures/optional-strong-type.expected");
    test_fixture(transform_fixture, file!(), "optional-strong-type.input", "docblock/fixtures/optional-strong-type.expected", input, expected).await;
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
async fn primitive_types() {
    let input = include_str!("docblock/fixtures/primitive-types.input");
    let expected = include_str!("docblock/fixtures/primitive-types.expected");
    test_fixture(transform_fixture, file!(), "primitive-types.input", "docblock/fixtures/primitive-types.expected", input, expected).await;
}

#[tokio::test]
async fn return_optional_strong_object() {
    let input = include_str!("docblock/fixtures/return-optional-strong-object.input");
    let expected = include_str!("docblock/fixtures/return-optional-strong-object.expected");
    test_fixture(transform_fixture, file!(), "return-optional-strong-object.input", "docblock/fixtures/return-optional-strong-object.expected", input, expected).await;
}

#[tokio::test]
async fn return_optional_weak_object() {
    let input = include_str!("docblock/fixtures/return-optional-weak-object.input");
    let expected = include_str!("docblock/fixtures/return-optional-weak-object.expected");
    test_fixture(transform_fixture, file!(), "return-optional-weak-object.input", "docblock/fixtures/return-optional-weak-object.expected", input, expected).await;
}

#[tokio::test]
async fn return_relay_resolver_value() {
    let input = include_str!("docblock/fixtures/return-relay-resolver-value.input");
    let expected = include_str!("docblock/fixtures/return-relay-resolver-value.expected");
    test_fixture(transform_fixture, file!(), "return-relay-resolver-value.input", "docblock/fixtures/return-relay-resolver-value.expected", input, expected).await;
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
async fn strong_type_define_flow_within() {
    let input = include_str!("docblock/fixtures/strong-type-define-flow-within.input");
    let expected = include_str!("docblock/fixtures/strong-type-define-flow-within.expected");
    test_fixture(transform_fixture, file!(), "strong-type-define-flow-within.input", "docblock/fixtures/strong-type-define-flow-within.expected", input, expected).await;
}

#[tokio::test]
async fn unsupported_type_error() {
    let input = include_str!("docblock/fixtures/unsupported-type.error.input");
    let expected = include_str!("docblock/fixtures/unsupported-type.error.expected");
    test_fixture(transform_fixture, file!(), "unsupported-type.error.input", "docblock/fixtures/unsupported-type.error.expected", input, expected).await;
}

#[tokio::test]
async fn weak_object() {
    let input = include_str!("docblock/fixtures/weak-object.input");
    let expected = include_str!("docblock/fixtures/weak-object.expected");
    test_fixture(transform_fixture, file!(), "weak-object.input", "docblock/fixtures/weak-object.expected", input, expected).await;
}
