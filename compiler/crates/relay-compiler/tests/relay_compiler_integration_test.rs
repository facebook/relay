/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<7361e8ee8ea5d74f22c7aa6f30d86839>>
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
async fn fragment_arguments() {
    let input = include_str!("relay_compiler_integration/fixtures/fragment_arguments.input");
    let expected = include_str!("relay_compiler_integration/fixtures/fragment_arguments.expected");
    test_fixture(transform_fixture, file!(), "fragment_arguments.input", "relay_compiler_integration/fixtures/fragment_arguments.expected", input, expected).await;
}

#[tokio::test]
async fn live_resolver_implements_interface_field() {
    let input = include_str!("relay_compiler_integration/fixtures/live_resolver_implements_interface_field.input");
    let expected = include_str!("relay_compiler_integration/fixtures/live_resolver_implements_interface_field.expected");
    test_fixture(transform_fixture, file!(), "live_resolver_implements_interface_field.input", "relay_compiler_integration/fixtures/live_resolver_implements_interface_field.expected", input, expected).await;
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
async fn resolver_on_interface_of_all_strong_model_type() {
    let input = include_str!("relay_compiler_integration/fixtures/resolver_on_interface_of_all_strong_model_type.input");
    let expected = include_str!("relay_compiler_integration/fixtures/resolver_on_interface_of_all_strong_model_type.expected");
    test_fixture(transform_fixture, file!(), "resolver_on_interface_of_all_strong_model_type.input", "relay_compiler_integration/fixtures/resolver_on_interface_of_all_strong_model_type.expected", input, expected).await;
}

#[tokio::test]
async fn resolver_on_interface_of_all_strong_model_type_including_cse() {
    let input = include_str!("relay_compiler_integration/fixtures/resolver_on_interface_of_all_strong_model_type_including_cse.input");
    let expected = include_str!("relay_compiler_integration/fixtures/resolver_on_interface_of_all_strong_model_type_including_cse.expected");
    test_fixture(transform_fixture, file!(), "resolver_on_interface_of_all_strong_model_type_including_cse.input", "relay_compiler_integration/fixtures/resolver_on_interface_of_all_strong_model_type_including_cse.expected", input, expected).await;
}

#[tokio::test]
async fn resolver_on_interface_of_all_strong_model_type_with_root_fragment() {
    let input = include_str!("relay_compiler_integration/fixtures/resolver_on_interface_of_all_strong_model_type_with_root_fragment.input");
    let expected = include_str!("relay_compiler_integration/fixtures/resolver_on_interface_of_all_strong_model_type_with_root_fragment.expected");
    test_fixture(transform_fixture, file!(), "resolver_on_interface_of_all_strong_model_type_with_root_fragment.input", "relay_compiler_integration/fixtures/resolver_on_interface_of_all_strong_model_type_with_root_fragment.expected", input, expected).await;
}

#[tokio::test]
async fn resolver_on_interface_of_all_weak_model_type() {
    let input = include_str!("relay_compiler_integration/fixtures/resolver_on_interface_of_all_weak_model_type.input");
    let expected = include_str!("relay_compiler_integration/fixtures/resolver_on_interface_of_all_weak_model_type.expected");
    test_fixture(transform_fixture, file!(), "resolver_on_interface_of_all_weak_model_type.input", "relay_compiler_integration/fixtures/resolver_on_interface_of_all_weak_model_type.expected", input, expected).await;
}

#[tokio::test]
async fn resolver_returns_interface_of_all_live_model_type() {
    let input = include_str!("relay_compiler_integration/fixtures/resolver_returns_interface_of_all_live_model_type.input");
    let expected = include_str!("relay_compiler_integration/fixtures/resolver_returns_interface_of_all_live_model_type.expected");
    test_fixture(transform_fixture, file!(), "resolver_returns_interface_of_all_live_model_type.input", "relay_compiler_integration/fixtures/resolver_returns_interface_of_all_live_model_type.expected", input, expected).await;
}

#[tokio::test]
async fn resolver_returns_interface_of_all_strong_model_type() {
    let input = include_str!("relay_compiler_integration/fixtures/resolver_returns_interface_of_all_strong_model_type.input");
    let expected = include_str!("relay_compiler_integration/fixtures/resolver_returns_interface_of_all_strong_model_type.expected");
    test_fixture(transform_fixture, file!(), "resolver_returns_interface_of_all_strong_model_type.input", "relay_compiler_integration/fixtures/resolver_returns_interface_of_all_strong_model_type.expected", input, expected).await;
}

#[tokio::test]
async fn resolver_returns_interface_of_all_strong_model_type_including_cse() {
    let input = include_str!("relay_compiler_integration/fixtures/resolver_returns_interface_of_all_strong_model_type_including_cse.input");
    let expected = include_str!("relay_compiler_integration/fixtures/resolver_returns_interface_of_all_strong_model_type_including_cse.expected");
    test_fixture(transform_fixture, file!(), "resolver_returns_interface_of_all_strong_model_type_including_cse.input", "relay_compiler_integration/fixtures/resolver_returns_interface_of_all_strong_model_type_including_cse.expected", input, expected).await;
}

#[tokio::test]
async fn resolver_returns_interface_of_all_weak_model_type() {
    let input = include_str!("relay_compiler_integration/fixtures/resolver_returns_interface_of_all_weak_model_type.input");
    let expected = include_str!("relay_compiler_integration/fixtures/resolver_returns_interface_of_all_weak_model_type.expected");
    test_fixture(transform_fixture, file!(), "resolver_returns_interface_of_all_weak_model_type.input", "relay_compiler_integration/fixtures/resolver_returns_interface_of_all_weak_model_type.expected", input, expected).await;
}

#[tokio::test]
async fn resolver_returns_interface_of_live_and_non_live_strong_model_type() {
    let input = include_str!("relay_compiler_integration/fixtures/resolver_returns_interface_of_live_and_non_live_strong_model_type.input");
    let expected = include_str!("relay_compiler_integration/fixtures/resolver_returns_interface_of_live_and_non_live_strong_model_type.expected");
    test_fixture(transform_fixture, file!(), "resolver_returns_interface_of_live_and_non_live_strong_model_type.input", "relay_compiler_integration/fixtures/resolver_returns_interface_of_live_and_non_live_strong_model_type.expected", input, expected).await;
}

#[tokio::test]
async fn resolvers_non_nullable() {
    let input = include_str!("relay_compiler_integration/fixtures/resolvers_non_nullable.input");
    let expected = include_str!("relay_compiler_integration/fixtures/resolvers_non_nullable.expected");
    test_fixture(transform_fixture, file!(), "resolvers_non_nullable.input", "relay_compiler_integration/fixtures/resolvers_non_nullable.expected", input, expected).await;
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
async fn spread_interface_fragment_on_concrete_type() {
    let input = include_str!("relay_compiler_integration/fixtures/spread_interface_fragment_on_concrete_type.input");
    let expected = include_str!("relay_compiler_integration/fixtures/spread_interface_fragment_on_concrete_type.expected");
    test_fixture(transform_fixture, file!(), "spread_interface_fragment_on_concrete_type.input", "relay_compiler_integration/fixtures/spread_interface_fragment_on_concrete_type.expected", input, expected).await;
}

#[tokio::test]
async fn typescript_resolver_type_import() {
    let input = include_str!("relay_compiler_integration/fixtures/typescript_resolver_type_import.input");
    let expected = include_str!("relay_compiler_integration/fixtures/typescript_resolver_type_import.expected");
    test_fixture(transform_fixture, file!(), "typescript_resolver_type_import.input", "relay_compiler_integration/fixtures/typescript_resolver_type_import.expected", input, expected).await;
}
