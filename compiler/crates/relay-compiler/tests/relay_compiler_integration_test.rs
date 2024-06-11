/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<a06755e39058e30909990af90e891e89>>
 */

mod relay_compiler_integration;

use relay_compiler_integration::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn client_mutation_extension() {
    let input = include_str!("relay_compiler_integration/fixtures/client_mutation_extension.input");
    let expected = include_str!("relay_compiler_integration/fixtures/client_mutation_extension.expected");
    test_fixture(transform_fixture, file!(), "client_mutation_extension.input", "relay_compiler_integration/fixtures/client_mutation_extension.expected", input, expected).await;
}

#[tokio::test]
async fn client_mutation_resolver() {
    let input = include_str!("relay_compiler_integration/fixtures/client_mutation_resolver.input");
    let expected = include_str!("relay_compiler_integration/fixtures/client_mutation_resolver.expected");
    test_fixture(transform_fixture, file!(), "client_mutation_resolver.input", "relay_compiler_integration/fixtures/client_mutation_resolver.expected", input, expected).await;
}

#[tokio::test]
async fn client_mutation_resolver_different_mutation_ok() {
    let input = include_str!("relay_compiler_integration/fixtures/client_mutation_resolver_different_mutation_ok.input");
    let expected = include_str!("relay_compiler_integration/fixtures/client_mutation_resolver_different_mutation_ok.expected");
    test_fixture(transform_fixture, file!(), "client_mutation_resolver_different_mutation_ok.input", "relay_compiler_integration/fixtures/client_mutation_resolver_different_mutation_ok.expected", input, expected).await;
}

#[tokio::test]
async fn client_mutation_resolver_invalid_disabled() {
    let input = include_str!("relay_compiler_integration/fixtures/client_mutation_resolver_invalid_disabled.input");
    let expected = include_str!("relay_compiler_integration/fixtures/client_mutation_resolver_invalid_disabled.expected");
    test_fixture(transform_fixture, file!(), "client_mutation_resolver_invalid_disabled.input", "relay_compiler_integration/fixtures/client_mutation_resolver_invalid_disabled.expected", input, expected).await;
}

#[tokio::test]
async fn client_mutation_resolver_invalid_nonscalar() {
    let input = include_str!("relay_compiler_integration/fixtures/client_mutation_resolver_invalid_nonscalar.input");
    let expected = include_str!("relay_compiler_integration/fixtures/client_mutation_resolver_invalid_nonscalar.expected");
    test_fixture(transform_fixture, file!(), "client_mutation_resolver_invalid_nonscalar.input", "relay_compiler_integration/fixtures/client_mutation_resolver_invalid_nonscalar.expected", input, expected).await;
}

#[tokio::test]
async fn custom_scalar_variable_default_arg_invalid() {
    let input = include_str!("relay_compiler_integration/fixtures/custom_scalar_variable_default_arg.invalid.input");
    let expected = include_str!("relay_compiler_integration/fixtures/custom_scalar_variable_default_arg.invalid.expected");
    test_fixture(transform_fixture, file!(), "custom_scalar_variable_default_arg.invalid.input", "relay_compiler_integration/fixtures/custom_scalar_variable_default_arg.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn custom_scalar_variable_default_arg_non_strict() {
    let input = include_str!("relay_compiler_integration/fixtures/custom_scalar_variable_default_arg_non_strict.input");
    let expected = include_str!("relay_compiler_integration/fixtures/custom_scalar_variable_default_arg_non_strict.expected");
    test_fixture(transform_fixture, file!(), "custom_scalar_variable_default_arg_non_strict.input", "relay_compiler_integration/fixtures/custom_scalar_variable_default_arg_non_strict.expected", input, expected).await;
}

#[tokio::test]
async fn preloadable_query_flow() {
    let input = include_str!("relay_compiler_integration/fixtures/preloadable_query_flow.input");
    let expected = include_str!("relay_compiler_integration/fixtures/preloadable_query_flow.expected");
    test_fixture(transform_fixture, file!(), "preloadable_query_flow.input", "relay_compiler_integration/fixtures/preloadable_query_flow.expected", input, expected).await;
}

#[tokio::test]
async fn preloadable_query_javascript() {
    let input = include_str!("relay_compiler_integration/fixtures/preloadable_query_javascript.input");
    let expected = include_str!("relay_compiler_integration/fixtures/preloadable_query_javascript.expected");
    test_fixture(transform_fixture, file!(), "preloadable_query_javascript.input", "relay_compiler_integration/fixtures/preloadable_query_javascript.expected", input, expected).await;
}

#[tokio::test]
async fn preloadable_query_typescript() {
    let input = include_str!("relay_compiler_integration/fixtures/preloadable_query_typescript.input");
    let expected = include_str!("relay_compiler_integration/fixtures/preloadable_query_typescript.expected");
    test_fixture(transform_fixture, file!(), "preloadable_query_typescript.input", "relay_compiler_integration/fixtures/preloadable_query_typescript.expected", input, expected).await;
}

#[tokio::test]
async fn resolver_on_interface() {
    let input = include_str!("relay_compiler_integration/fixtures/resolver_on_interface.input");
    let expected = include_str!("relay_compiler_integration/fixtures/resolver_on_interface.expected");
    test_fixture(transform_fixture, file!(), "resolver_on_interface.input", "relay_compiler_integration/fixtures/resolver_on_interface.expected", input, expected).await;
}

#[tokio::test]
async fn resolvers_schema_module() {
    let input = include_str!("relay_compiler_integration/fixtures/resolvers_schema_module.input");
    let expected = include_str!("relay_compiler_integration/fixtures/resolvers_schema_module.expected");
    test_fixture(transform_fixture, file!(), "resolvers_schema_module.input", "relay_compiler_integration/fixtures/resolvers_schema_module.expected", input, expected).await;
}

#[tokio::test]
async fn resolvers_schema_module_apply_to_normalization_ast() {
    let input = include_str!("relay_compiler_integration/fixtures/resolvers_schema_module_apply_to_normalization_ast.input");
    let expected = include_str!("relay_compiler_integration/fixtures/resolvers_schema_module_apply_to_normalization_ast.expected");
    test_fixture(transform_fixture, file!(), "resolvers_schema_module_apply_to_normalization_ast.input", "relay_compiler_integration/fixtures/resolvers_schema_module_apply_to_normalization_ast.expected", input, expected).await;
}

#[tokio::test]
async fn simple_fragment() {
    let input = include_str!("relay_compiler_integration/fixtures/simple_fragment.input");
    let expected = include_str!("relay_compiler_integration/fixtures/simple_fragment.expected");
    test_fixture(transform_fixture, file!(), "simple_fragment.input", "relay_compiler_integration/fixtures/simple_fragment.expected", input, expected).await;
}

#[tokio::test]
async fn typescript_resolver_type_import() {
    let input = include_str!("relay_compiler_integration/fixtures/typescript_resolver_type_import.input");
    let expected = include_str!("relay_compiler_integration/fixtures/typescript_resolver_type_import.expected");
    test_fixture(transform_fixture, file!(), "typescript_resolver_type_import.input", "relay_compiler_integration/fixtures/typescript_resolver_type_import.expected", input, expected).await;
}
