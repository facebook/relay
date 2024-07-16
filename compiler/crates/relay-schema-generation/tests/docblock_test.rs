/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<4d7cfd31a59eabd365ffbd0813ff3669>>
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
async fn conflicting_type_definitions_error() {
    let input = include_str!("docblock/fixtures/conflicting-type-definitions.error.input");
    let expected = include_str!("docblock/fixtures/conflicting-type-definitions.error.expected");
    test_fixture(transform_fixture, file!(), "conflicting-type-definitions.error.input", "docblock/fixtures/conflicting-type-definitions.error.expected", input, expected).await;
}

#[tokio::test]
async fn custom_scalar() {
    let input = include_str!("docblock/fixtures/custom-scalar.input");
    let expected = include_str!("docblock/fixtures/custom-scalar.expected");
    test_fixture(transform_fixture, file!(), "custom-scalar.input", "docblock/fixtures/custom-scalar.expected", input, expected).await;
}

#[tokio::test]
async fn custom_scalar_global() {
    let input = include_str!("docblock/fixtures/custom-scalar-global.input");
    let expected = include_str!("docblock/fixtures/custom-scalar-global.expected");
    test_fixture(transform_fixture, file!(), "custom-scalar-global.input", "docblock/fixtures/custom-scalar-global.expected", input, expected).await;
}

#[tokio::test]
async fn deprecated() {
    let input = include_str!("docblock/fixtures/deprecated.input");
    let expected = include_str!("docblock/fixtures/deprecated.expected");
    test_fixture(transform_fixture, file!(), "deprecated.input", "docblock/fixtures/deprecated.expected", input, expected).await;
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
async fn resolver_functions_on_query() {
    let input = include_str!("docblock/fixtures/resolver-functions-on-Query.input");
    let expected = include_str!("docblock/fixtures/resolver-functions-on-Query.expected");
    test_fixture(transform_fixture, file!(), "resolver-functions-on-Query.input", "docblock/fixtures/resolver-functions-on-Query.expected", input, expected).await;
}

#[tokio::test]
async fn return_aliased_weak_object_todo() {
    let input = include_str!("docblock/fixtures/return-aliased-weak-object.todo.input");
    let expected = include_str!("docblock/fixtures/return-aliased-weak-object.todo.expected");
    test_fixture(transform_fixture, file!(), "return-aliased-weak-object.todo.input", "docblock/fixtures/return-aliased-weak-object.todo.expected", input, expected).await;
}

#[tokio::test]
async fn return_an_object() {
    let input = include_str!("docblock/fixtures/return-an-object.input");
    let expected = include_str!("docblock/fixtures/return-an-object.expected");
    test_fixture(transform_fixture, file!(), "return-an-object.input", "docblock/fixtures/return-an-object.expected", input, expected).await;
}

#[tokio::test]
async fn return_invalid_object_error() {
    let input = include_str!("docblock/fixtures/return-invalid-object.error.input");
    let expected = include_str!("docblock/fixtures/return-invalid-object.error.expected");
    test_fixture(transform_fixture, file!(), "return-invalid-object.error.input", "docblock/fixtures/return-invalid-object.error.expected", input, expected).await;
}

#[tokio::test]
async fn return_non_optional_type() {
    let input = include_str!("docblock/fixtures/return-non-optional-type.input");
    let expected = include_str!("docblock/fixtures/return-non-optional-type.expected");
    test_fixture(transform_fixture, file!(), "return-non-optional-type.input", "docblock/fixtures/return-non-optional-type.expected", input, expected).await;
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
async fn return_strong_object_directly_error() {
    let input = include_str!("docblock/fixtures/return-strong-object-directly.error.input");
    let expected = include_str!("docblock/fixtures/return-strong-object-directly.error.expected");
    test_fixture(transform_fixture, file!(), "return-strong-object-directly.error.input", "docblock/fixtures/return-strong-object-directly.error.expected", input, expected).await;
}

#[tokio::test]
async fn root_fragment() {
    let input = include_str!("docblock/fixtures/root-fragment.input");
    let expected = include_str!("docblock/fixtures/root-fragment.expected");
    test_fixture(transform_fixture, file!(), "root-fragment.input", "docblock/fixtures/root-fragment.expected", input, expected).await;
}

#[tokio::test]
async fn root_fragment_arguments() {
    let input = include_str!("docblock/fixtures/root-fragment-arguments.input");
    let expected = include_str!("docblock/fixtures/root-fragment-arguments.expected");
    test_fixture(transform_fixture, file!(), "root-fragment-arguments.input", "docblock/fixtures/root-fragment-arguments.expected", input, expected).await;
}

#[tokio::test]
async fn root_fragment_arguments_error() {
    let input = include_str!("docblock/fixtures/root-fragment-arguments.error.input");
    let expected = include_str!("docblock/fixtures/root-fragment-arguments.error.expected");
    test_fixture(transform_fixture, file!(), "root-fragment-arguments.error.input", "docblock/fixtures/root-fragment-arguments.error.expected", input, expected).await;
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
