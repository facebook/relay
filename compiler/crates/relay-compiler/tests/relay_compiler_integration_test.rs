/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<f4ae16968134971fac3e74162e89c4af>>
 */

mod relay_compiler_integration;

use relay_compiler_integration::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn bare_graphql_token_does_not_loop() {
    let input = include_str!("relay_compiler_integration/fixtures/bare_graphql_token_does_not_loop.input");
    let expected = include_str!("relay_compiler_integration/fixtures/bare_graphql_token_does_not_loop.expected");
    test_fixture(transform_fixture, file!(), "bare_graphql_token_does_not_loop.input", "relay_compiler_integration/fixtures/bare_graphql_token_does_not_loop.expected", input, expected).await;
}

#[tokio::test]
async fn block_string_hash_consistency() {
    let input = include_str!("relay_compiler_integration/fixtures/block_string_hash_consistency.input");
    let expected = include_str!("relay_compiler_integration/fixtures/block_string_hash_consistency.expected");
    test_fixture(transform_fixture, file!(), "block_string_hash_consistency.input", "relay_compiler_integration/fixtures/block_string_hash_consistency.expected", input, expected).await;
}

#[tokio::test]
async fn client_extension_interface_backed_by_resolvers_in_throw_on_field_error() {
    let input = include_str!("relay_compiler_integration/fixtures/client_extension_interface_backed_by_resolvers_in_throw_on_field_error.input");
    let expected = include_str!("relay_compiler_integration/fixtures/client_extension_interface_backed_by_resolvers_in_throw_on_field_error.expected");
    test_fixture(transform_fixture, file!(), "client_extension_interface_backed_by_resolvers_in_throw_on_field_error.input", "relay_compiler_integration/fixtures/client_extension_interface_backed_by_resolvers_in_throw_on_field_error.expected", input, expected).await;
}

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
async fn client_schema_extension_in_throw_on_field_error() {
    let input = include_str!("relay_compiler_integration/fixtures/client_schema_extension_in_throw_on_field_error.input");
    let expected = include_str!("relay_compiler_integration/fixtures/client_schema_extension_in_throw_on_field_error.expected");
    test_fixture(transform_fixture, file!(), "client_schema_extension_in_throw_on_field_error.input", "relay_compiler_integration/fixtures/client_schema_extension_in_throw_on_field_error.expected", input, expected).await;
}

#[tokio::test]
async fn client_schema_extension_interface_uses_resolver_type() {
    let input = include_str!("relay_compiler_integration/fixtures/client_schema_extension_interface_uses_resolver_type.input");
    let expected = include_str!("relay_compiler_integration/fixtures/client_schema_extension_interface_uses_resolver_type.expected");
    test_fixture(transform_fixture, file!(), "client_schema_extension_interface_uses_resolver_type.input", "relay_compiler_integration/fixtures/client_schema_extension_interface_uses_resolver_type.expected", input, expected).await;
}

#[tokio::test]
async fn config_validation_excluded_source_directory() {
    let input = include_str!("relay_compiler_integration/fixtures/config_validation_excluded_source_directory.input");
    let expected = include_str!("relay_compiler_integration/fixtures/config_validation_excluded_source_directory.expected");
    test_fixture(transform_fixture, file!(), "config_validation_excluded_source_directory.input", "relay_compiler_integration/fixtures/config_validation_excluded_source_directory.expected", input, expected).await;
}

#[tokio::test]
async fn config_validation_invalid_exclude_glob() {
    let input = include_str!("relay_compiler_integration/fixtures/config_validation_invalid_exclude_glob.input");
    let expected = include_str!("relay_compiler_integration/fixtures/config_validation_invalid_exclude_glob.expected");
    test_fixture(transform_fixture, file!(), "config_validation_invalid_exclude_glob.input", "relay_compiler_integration/fixtures/config_validation_invalid_exclude_glob.expected", input, expected).await;
}

#[tokio::test]
async fn config_validation_invalid_excludes_extensions_glob() {
    let input = include_str!("relay_compiler_integration/fixtures/config_validation_invalid_excludes_extensions_glob.input");
    let expected = include_str!("relay_compiler_integration/fixtures/config_validation_invalid_excludes_extensions_glob.expected");
    test_fixture(transform_fixture, file!(), "config_validation_invalid_excludes_extensions_glob.input", "relay_compiler_integration/fixtures/config_validation_invalid_excludes_extensions_glob.expected", input, expected).await;
}

#[tokio::test]
async fn config_validation_missing_schema_extension_directory() {
    let input = include_str!("relay_compiler_integration/fixtures/config_validation_missing_schema_extension_directory.input");
    let expected = include_str!("relay_compiler_integration/fixtures/config_validation_missing_schema_extension_directory.expected");
    test_fixture(transform_fixture, file!(), "config_validation_missing_schema_extension_directory.input", "relay_compiler_integration/fixtures/config_validation_missing_schema_extension_directory.expected", input, expected).await;
}

#[tokio::test]
async fn config_validation_missing_schema_file() {
    let input = include_str!("relay_compiler_integration/fixtures/config_validation_missing_schema_file.input");
    let expected = include_str!("relay_compiler_integration/fixtures/config_validation_missing_schema_file.expected");
    test_fixture(transform_fixture, file!(), "config_validation_missing_schema_file.input", "relay_compiler_integration/fixtures/config_validation_missing_schema_file.expected", input, expected).await;
}

#[tokio::test]
async fn config_validation_missing_source_directory() {
    let input = include_str!("relay_compiler_integration/fixtures/config_validation_missing_source_directory.input");
    let expected = include_str!("relay_compiler_integration/fixtures/config_validation_missing_source_directory.expected");
    test_fixture(transform_fixture, file!(), "config_validation_missing_source_directory.input", "relay_compiler_integration/fixtures/config_validation_missing_source_directory.expected", input, expected).await;
}

#[tokio::test]
async fn config_validation_project_missing() {
    let input = include_str!("relay_compiler_integration/fixtures/config_validation_project_missing.input");
    let expected = include_str!("relay_compiler_integration/fixtures/config_validation_project_missing.expected");
    test_fixture(transform_fixture, file!(), "config_validation_project_missing.input", "relay_compiler_integration/fixtures/config_validation_project_missing.expected", input, expected).await;
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
async fn dangerously_throw_on_semantically_nullable_field() {
    let input = include_str!("relay_compiler_integration/fixtures/dangerously_throw_on_semantically_nullable_field.input");
    let expected = include_str!("relay_compiler_integration/fixtures/dangerously_throw_on_semantically_nullable_field.expected");
    test_fixture(transform_fixture, file!(), "dangerously_throw_on_semantically_nullable_field.input", "relay_compiler_integration/fixtures/dangerously_throw_on_semantically_nullable_field.expected", input, expected).await;
}

#[tokio::test]
async fn default_excludes_node_modules() {
    let input = include_str!("relay_compiler_integration/fixtures/default_excludes_node_modules.input");
    let expected = include_str!("relay_compiler_integration/fixtures/default_excludes_node_modules.expected");
    test_fixture(transform_fixture, file!(), "default_excludes_node_modules.input", "relay_compiler_integration/fixtures/default_excludes_node_modules.expected", input, expected).await;
}

#[tokio::test]
async fn delete_match_removes_normalization() {
    let input = include_str!("relay_compiler_integration/fixtures/delete_match_removes_normalization.input");
    let expected = include_str!("relay_compiler_integration/fixtures/delete_match_removes_normalization.expected");
    test_fixture(transform_fixture, file!(), "delete_match_removes_normalization.input", "relay_compiler_integration/fixtures/delete_match_removes_normalization.expected", input, expected).await;
}

#[tokio::test]
async fn error_handling_fragment() {
    let input = include_str!("relay_compiler_integration/fixtures/error_handling_fragment.input");
    let expected = include_str!("relay_compiler_integration/fixtures/error_handling_fragment.expected");
    test_fixture(transform_fixture, file!(), "error_handling_fragment.input", "relay_compiler_integration/fixtures/error_handling_fragment.expected", input, expected).await;
}

#[tokio::test]
async fn error_handling_query() {
    let input = include_str!("relay_compiler_integration/fixtures/error_handling_query.input");
    let expected = include_str!("relay_compiler_integration/fixtures/error_handling_query.expected");
    test_fixture(transform_fixture, file!(), "error_handling_query.input", "relay_compiler_integration/fixtures/error_handling_query.expected", input, expected).await;
}

#[tokio::test]
async fn exec_resolvers_directive_with_root_fragment() {
    let input = include_str!("relay_compiler_integration/fixtures/exec_resolvers_directive_with_root_fragment.input");
    let expected = include_str!("relay_compiler_integration/fixtures/exec_resolvers_directive_with_root_fragment.expected");
    test_fixture(transform_fixture, file!(), "exec_resolvers_directive_with_root_fragment.input", "relay_compiler_integration/fixtures/exec_resolvers_directive_with_root_fragment.expected", input, expected).await;
}

#[tokio::test]
async fn exec_time_resolver_mixed_interface_client_edge_invalid() {
    let input = include_str!("relay_compiler_integration/fixtures/exec_time_resolver_mixed_interface_client_edge.invalid.input");
    let expected = include_str!("relay_compiler_integration/fixtures/exec_time_resolver_mixed_interface_client_edge.invalid.expected");
    test_fixture(transform_fixture, file!(), "exec_time_resolver_mixed_interface_client_edge.invalid.input", "relay_compiler_integration/fixtures/exec_time_resolver_mixed_interface_client_edge.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn exec_time_resolver_query_root_no_flag() {
    let input = include_str!("relay_compiler_integration/fixtures/exec_time_resolver_query_root_no_flag.input");
    let expected = include_str!("relay_compiler_integration/fixtures/exec_time_resolver_query_root_no_flag.expected");
    test_fixture(transform_fixture, file!(), "exec_time_resolver_query_root_no_flag.input", "relay_compiler_integration/fixtures/exec_time_resolver_query_root_no_flag.expected", input, expected).await;
}

#[tokio::test]
async fn exec_time_resolver_server_to_client_has_flag() {
    let input = include_str!("relay_compiler_integration/fixtures/exec_time_resolver_server_to_client_has_flag.input");
    let expected = include_str!("relay_compiler_integration/fixtures/exec_time_resolver_server_to_client_has_flag.expected");
    test_fixture(transform_fixture, file!(), "exec_time_resolver_server_to_client_has_flag.input", "relay_compiler_integration/fixtures/exec_time_resolver_server_to_client_has_flag.expected", input, expected).await;
}

#[tokio::test]
async fn extra_in_single_file_config() {
    let input = include_str!("relay_compiler_integration/fixtures/extra_in_single_file_config.input");
    let expected = include_str!("relay_compiler_integration/fixtures/extra_in_single_file_config.expected");
    test_fixture(transform_fixture, file!(), "extra_in_single_file_config.input", "relay_compiler_integration/fixtures/extra_in_single_file_config.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_alias_nested_in_inline_fragment() {
    let input = include_str!("relay_compiler_integration/fixtures/fragment_alias_nested_in_inline_fragment.input");
    let expected = include_str!("relay_compiler_integration/fixtures/fragment_alias_nested_in_inline_fragment.expected");
    test_fixture(transform_fixture, file!(), "fragment_alias_nested_in_inline_fragment.input", "relay_compiler_integration/fixtures/fragment_alias_nested_in_inline_fragment.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_arguments() {
    let input = include_str!("relay_compiler_integration/fixtures/fragment_arguments.input");
    let expected = include_str!("relay_compiler_integration/fixtures/fragment_arguments.expected");
    test_fixture(transform_fixture, file!(), "fragment_arguments.input", "relay_compiler_integration/fixtures/fragment_arguments.expected", input, expected).await;
}

#[tokio::test]
async fn incremental_base_project_extension_change() {
    let input = include_str!("relay_compiler_integration/fixtures/incremental_base_project_extension_change.input");
    let expected = include_str!("relay_compiler_integration/fixtures/incremental_base_project_extension_change.expected");
    test_fixture(transform_fixture, file!(), "incremental_base_project_extension_change.input", "relay_compiler_integration/fixtures/incremental_base_project_extension_change.expected", input, expected).await;
}

#[tokio::test]
async fn incremental_delete_fragment_used_by_relay_resolver() {
    let input = include_str!("relay_compiler_integration/fixtures/incremental_delete_fragment_used_by_relay_resolver.input");
    let expected = include_str!("relay_compiler_integration/fixtures/incremental_delete_fragment_used_by_relay_resolver.expected");
    test_fixture(transform_fixture, file!(), "incremental_delete_fragment_used_by_relay_resolver.input", "relay_compiler_integration/fixtures/incremental_delete_fragment_used_by_relay_resolver.expected", input, expected).await;
}

#[tokio::test]
async fn incremental_delete_module_fragment() {
    let input = include_str!("relay_compiler_integration/fixtures/incremental_delete_module_fragment.input");
    let expected = include_str!("relay_compiler_integration/fixtures/incremental_delete_module_fragment.expected");
    test_fixture(transform_fixture, file!(), "incremental_delete_module_fragment.input", "relay_compiler_integration/fixtures/incremental_delete_module_fragment.expected", input, expected).await;
}

#[tokio::test]
async fn incremental_file_deletion() {
    let input = include_str!("relay_compiler_integration/fixtures/incremental_file_deletion.input");
    let expected = include_str!("relay_compiler_integration/fixtures/incremental_file_deletion.expected");
    test_fixture(transform_fixture, file!(), "incremental_file_deletion.input", "relay_compiler_integration/fixtures/incremental_file_deletion.expected", input, expected).await;
}

#[tokio::test]
async fn incremental_fuzz_multiproject_cross_fragment_change() {
    let input = include_str!("relay_compiler_integration/fixtures/incremental_fuzz_multiproject_cross_fragment_change.input");
    let expected = include_str!("relay_compiler_integration/fixtures/incremental_fuzz_multiproject_cross_fragment_change.expected");
    test_fixture(transform_fixture, file!(), "incremental_fuzz_multiproject_cross_fragment_change.input", "relay_compiler_integration/fixtures/incremental_fuzz_multiproject_cross_fragment_change.expected", input, expected).await;
}

#[tokio::test]
async fn incremental_fuzz_subscription_root_type_change() {
    let input = include_str!("relay_compiler_integration/fixtures/incremental_fuzz_subscription_root_type_change.input");
    let expected = include_str!("relay_compiler_integration/fixtures/incremental_fuzz_subscription_root_type_change.expected");
    test_fixture(transform_fixture, file!(), "incremental_fuzz_subscription_root_type_change.input", "relay_compiler_integration/fixtures/incremental_fuzz_subscription_root_type_change.expected", input, expected).await;
}

#[tokio::test]
async fn incremental_input_object_field_addition() {
    let input = include_str!("relay_compiler_integration/fixtures/incremental_input_object_field_addition.input");
    let expected = include_str!("relay_compiler_integration/fixtures/incremental_input_object_field_addition.expected");
    test_fixture(transform_fixture, file!(), "incremental_input_object_field_addition.input", "relay_compiler_integration/fixtures/incremental_input_object_field_addition.expected", input, expected).await;
}

#[tokio::test]
async fn incremental_input_object_removed() {
    let input = include_str!("relay_compiler_integration/fixtures/incremental_input_object_removed.input");
    let expected = include_str!("relay_compiler_integration/fixtures/incremental_input_object_removed.expected");
    test_fixture(transform_fixture, file!(), "incremental_input_object_removed.input", "relay_compiler_integration/fixtures/incremental_input_object_removed.expected", input, expected).await;
}

#[tokio::test]
async fn incremental_mutation_field_return_type_change() {
    let input = include_str!("relay_compiler_integration/fixtures/incremental_mutation_field_return_type_change.input");
    let expected = include_str!("relay_compiler_integration/fixtures/incremental_mutation_field_return_type_change.expected");
    test_fixture(transform_fixture, file!(), "incremental_mutation_field_return_type_change.input", "relay_compiler_integration/fixtures/incremental_mutation_field_return_type_change.expected", input, expected).await;
}

#[tokio::test]
async fn incremental_object_added_with_interface() {
    let input = include_str!("relay_compiler_integration/fixtures/incremental_object_added_with_interface.input");
    let expected = include_str!("relay_compiler_integration/fixtures/incremental_object_added_with_interface.expected");
    test_fixture(transform_fixture, file!(), "incremental_object_added_with_interface.input", "relay_compiler_integration/fixtures/incremental_object_added_with_interface.expected", input, expected).await;
}

#[tokio::test]
async fn incremental_object_removed_with_interface() {
    let input = include_str!("relay_compiler_integration/fixtures/incremental_object_removed_with_interface.input");
    let expected = include_str!("relay_compiler_integration/fixtures/incremental_object_removed_with_interface.expected");
    test_fixture(transform_fixture, file!(), "incremental_object_removed_with_interface.input", "relay_compiler_integration/fixtures/incremental_object_removed_with_interface.expected", input, expected).await;
}

#[tokio::test]
async fn incremental_schema_change_with_base_project() {
    let input = include_str!("relay_compiler_integration/fixtures/incremental_schema_change_with_base_project.input");
    let expected = include_str!("relay_compiler_integration/fixtures/incremental_schema_change_with_base_project.expected");
    test_fixture(transform_fixture, file!(), "incremental_schema_change_with_base_project.input", "relay_compiler_integration/fixtures/incremental_schema_change_with_base_project.expected", input, expected).await;
}

#[tokio::test]
async fn incremental_schema_field_nullability_change() {
    let input = include_str!("relay_compiler_integration/fixtures/incremental_schema_field_nullability_change.input");
    let expected = include_str!("relay_compiler_integration/fixtures/incremental_schema_field_nullability_change.expected");
    test_fixture(transform_fixture, file!(), "incremental_schema_field_nullability_change.input", "relay_compiler_integration/fixtures/incremental_schema_field_nullability_change.expected", input, expected).await;
}

#[tokio::test]
async fn live_resolver_implements_interface_field() {
    let input = include_str!("relay_compiler_integration/fixtures/live_resolver_implements_interface_field.input");
    let expected = include_str!("relay_compiler_integration/fixtures/live_resolver_implements_interface_field.expected");
    test_fixture(transform_fixture, file!(), "live_resolver_implements_interface_field.input", "relay_compiler_integration/fixtures/live_resolver_implements_interface_field.expected", input, expected).await;
}

#[tokio::test]
async fn mixed_interface_direct_field_selection() {
    let input = include_str!("relay_compiler_integration/fixtures/mixed_interface_direct_field_selection.input");
    let expected = include_str!("relay_compiler_integration/fixtures/mixed_interface_direct_field_selection.expected");
    test_fixture(transform_fixture, file!(), "mixed_interface_direct_field_selection.input", "relay_compiler_integration/fixtures/mixed_interface_direct_field_selection.expected", input, expected).await;
}

#[tokio::test]
async fn mixed_interface_fragment_spread() {
    let input = include_str!("relay_compiler_integration/fixtures/mixed_interface_fragment_spread.input");
    let expected = include_str!("relay_compiler_integration/fixtures/mixed_interface_fragment_spread.expected");
    test_fixture(transform_fixture, file!(), "mixed_interface_fragment_spread.input", "relay_compiler_integration/fixtures/mixed_interface_fragment_spread.expected", input, expected).await;
}

#[tokio::test]
async fn mixed_interface_missing_node_interface_invalid() {
    let input = include_str!("relay_compiler_integration/fixtures/mixed_interface_missing_node_interface.invalid.input");
    let expected = include_str!("relay_compiler_integration/fixtures/mixed_interface_missing_node_interface.invalid.expected");
    test_fixture(transform_fixture, file!(), "mixed_interface_missing_node_interface.invalid.input", "relay_compiler_integration/fixtures/mixed_interface_missing_node_interface.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn mixed_interface_nested_object_type_not_refined() {
    let input = include_str!("relay_compiler_integration/fixtures/mixed_interface_nested_object_type_not_refined.input");
    let expected = include_str!("relay_compiler_integration/fixtures/mixed_interface_nested_object_type_not_refined.expected");
    test_fixture(transform_fixture, file!(), "mixed_interface_nested_object_type_not_refined.input", "relay_compiler_integration/fixtures/mixed_interface_nested_object_type_not_refined.expected", input, expected).await;
}

#[tokio::test]
async fn mixed_interface_server_type_does_not_implement_node_invalid() {
    let input = include_str!("relay_compiler_integration/fixtures/mixed_interface_server_type_does_not_implement_node.invalid.input");
    let expected = include_str!("relay_compiler_integration/fixtures/mixed_interface_server_type_does_not_implement_node.invalid.expected");
    test_fixture(transform_fixture, file!(), "mixed_interface_server_type_does_not_implement_node.invalid.input", "relay_compiler_integration/fixtures/mixed_interface_server_type_does_not_implement_node.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn module_name_validation_enforced_with_flag_invalid() {
    let input = include_str!("relay_compiler_integration/fixtures/module_name_validation_enforced_with_flag.invalid.input");
    let expected = include_str!("relay_compiler_integration/fixtures/module_name_validation_enforced_with_flag.invalid.expected");
    test_fixture(transform_fixture, file!(), "module_name_validation_enforced_with_flag.invalid.input", "relay_compiler_integration/fixtures/module_name_validation_enforced_with_flag.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn module_name_validation_skipped_for_non_haste() {
    let input = include_str!("relay_compiler_integration/fixtures/module_name_validation_skipped_for_non_haste.input");
    let expected = include_str!("relay_compiler_integration/fixtures/module_name_validation_skipped_for_non_haste.expected");
    test_fixture(transform_fixture, file!(), "module_name_validation_skipped_for_non_haste.input", "relay_compiler_integration/fixtures/module_name_validation_skipped_for_non_haste.expected", input, expected).await;
}

#[tokio::test]
async fn multiple_resolvers_on_interface_of_all_strong_model_type() {
    let input = include_str!("relay_compiler_integration/fixtures/multiple_resolvers_on_interface_of_all_strong_model_type.input");
    let expected = include_str!("relay_compiler_integration/fixtures/multiple_resolvers_on_interface_of_all_strong_model_type.expected");
    test_fixture(transform_fixture, file!(), "multiple_resolvers_on_interface_of_all_strong_model_type.input", "relay_compiler_integration/fixtures/multiple_resolvers_on_interface_of_all_strong_model_type.expected", input, expected).await;
}

#[tokio::test]
async fn multiple_resolvers_returns_interfaces_of_all_strong_model_type() {
    let input = include_str!("relay_compiler_integration/fixtures/multiple_resolvers_returns_interfaces_of_all_strong_model_type.input");
    let expected = include_str!("relay_compiler_integration/fixtures/multiple_resolvers_returns_interfaces_of_all_strong_model_type.expected");
    test_fixture(transform_fixture, file!(), "multiple_resolvers_returns_interfaces_of_all_strong_model_type.input", "relay_compiler_integration/fixtures/multiple_resolvers_returns_interfaces_of_all_strong_model_type.expected", input, expected).await;
}

#[tokio::test]
async fn non_relay_file_in_generated_dir() {
    let input = include_str!("relay_compiler_integration/fixtures/non_relay_file_in_generated_dir.input");
    let expected = include_str!("relay_compiler_integration/fixtures/non_relay_file_in_generated_dir.expected");
    test_fixture(transform_fixture, file!(), "non_relay_file_in_generated_dir.input", "relay_compiler_integration/fixtures/non_relay_file_in_generated_dir.expected", input, expected).await;
}

#[tokio::test]
async fn non_relay_file_in_generated_dir_with_custom_output() {
    let input = include_str!("relay_compiler_integration/fixtures/non_relay_file_in_generated_dir_with_custom_output.input");
    let expected = include_str!("relay_compiler_integration/fixtures/non_relay_file_in_generated_dir_with_custom_output.expected");
    test_fixture(transform_fixture, file!(), "non_relay_file_in_generated_dir_with_custom_output.input", "relay_compiler_integration/fixtures/non_relay_file_in_generated_dir_with_custom_output.expected", input, expected).await;
}

#[tokio::test]
async fn prefetchable_refetchable_pagination() {
    let input = include_str!("relay_compiler_integration/fixtures/prefetchable_refetchable_pagination.input");
    let expected = include_str!("relay_compiler_integration/fixtures/prefetchable_refetchable_pagination.expected");
    test_fixture(transform_fixture, file!(), "prefetchable_refetchable_pagination.input", "relay_compiler_integration/fixtures/prefetchable_refetchable_pagination.expected", input, expected).await;
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
async fn refetchable_with_directive_enum_arg() {
    let input = include_str!("relay_compiler_integration/fixtures/refetchable_with_directive_enum_arg.input");
    let expected = include_str!("relay_compiler_integration/fixtures/refetchable_with_directive_enum_arg.expected");
    test_fixture(transform_fixture, file!(), "refetchable_with_directive_enum_arg.input", "relay_compiler_integration/fixtures/refetchable_with_directive_enum_arg.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolvers_in_throw_on_field_error() {
    let input = include_str!("relay_compiler_integration/fixtures/relay_resolvers_in_throw_on_field_error.input");
    let expected = include_str!("relay_compiler_integration/fixtures/relay_resolvers_in_throw_on_field_error.expected");
    test_fixture(transform_fixture, file!(), "relay_resolvers_in_throw_on_field_error.input", "relay_compiler_integration/fixtures/relay_resolvers_in_throw_on_field_error.expected", input, expected).await;
}

#[tokio::test]
async fn repro_dangerously_unaliased_changes_output_after() {
    let input = include_str!("relay_compiler_integration/fixtures/repro_dangerously_unaliased_changes_output_after.input");
    let expected = include_str!("relay_compiler_integration/fixtures/repro_dangerously_unaliased_changes_output_after.expected");
    test_fixture(transform_fixture, file!(), "repro_dangerously_unaliased_changes_output_after.input", "relay_compiler_integration/fixtures/repro_dangerously_unaliased_changes_output_after.expected", input, expected).await;
}

#[tokio::test]
async fn repro_dangerously_unaliased_changes_output_before() {
    let input = include_str!("relay_compiler_integration/fixtures/repro_dangerously_unaliased_changes_output_before.input");
    let expected = include_str!("relay_compiler_integration/fixtures/repro_dangerously_unaliased_changes_output_before.expected");
    test_fixture(transform_fixture, file!(), "repro_dangerously_unaliased_changes_output_before.input", "relay_compiler_integration/fixtures/repro_dangerously_unaliased_changes_output_before.expected", input, expected).await;
}

#[tokio::test]
async fn required_conditional_field() {
    let input = include_str!("relay_compiler_integration/fixtures/required_conditional_field.input");
    let expected = include_str!("relay_compiler_integration/fixtures/required_conditional_field.expected");
    test_fixture(transform_fixture, file!(), "required_conditional_field.input", "relay_compiler_integration/fixtures/required_conditional_field.expected", input, expected).await;
}

#[tokio::test]
async fn resolver_on_interface() {
    let input = include_str!("relay_compiler_integration/fixtures/resolver_on_interface.input");
    let expected = include_str!("relay_compiler_integration/fixtures/resolver_on_interface.expected");
    test_fixture(transform_fixture, file!(), "resolver_on_interface.input", "relay_compiler_integration/fixtures/resolver_on_interface.expected", input, expected).await;
}

#[tokio::test]
async fn resolver_on_interface_does_not_pass_schema_validation_invalid() {
    let input = include_str!("relay_compiler_integration/fixtures/resolver_on_interface_does_not_pass_schema_validation.invalid.input");
    let expected = include_str!("relay_compiler_integration/fixtures/resolver_on_interface_does_not_pass_schema_validation.invalid.expected");
    test_fixture(transform_fixture, file!(), "resolver_on_interface_does_not_pass_schema_validation.invalid.input", "relay_compiler_integration/fixtures/resolver_on_interface_does_not_pass_schema_validation.invalid.expected", input, expected).await;
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
async fn resolver_on_interface_returns_custom_scalar() {
    let input = include_str!("relay_compiler_integration/fixtures/resolver_on_interface_returns_custom_scalar.input");
    let expected = include_str!("relay_compiler_integration/fixtures/resolver_on_interface_returns_custom_scalar.expected");
    test_fixture(transform_fixture, file!(), "resolver_on_interface_returns_custom_scalar.input", "relay_compiler_integration/fixtures/resolver_on_interface_returns_custom_scalar.expected", input, expected).await;
}

#[tokio::test]
async fn resolver_return_fragment_conflicts_with_existing_invalid() {
    let input = include_str!("relay_compiler_integration/fixtures/resolver_return_fragment_conflicts_with_existing.invalid.input");
    let expected = include_str!("relay_compiler_integration/fixtures/resolver_return_fragment_conflicts_with_existing.invalid.expected");
    test_fixture(transform_fixture, file!(), "resolver_return_fragment_conflicts_with_existing.invalid.input", "relay_compiler_integration/fixtures/resolver_return_fragment_conflicts_with_existing.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn resolver_return_fragment_invalid_module_name_invalid() {
    let input = include_str!("relay_compiler_integration/fixtures/resolver_return_fragment_invalid_module_name.invalid.input");
    let expected = include_str!("relay_compiler_integration/fixtures/resolver_return_fragment_invalid_module_name.invalid.expected");
    test_fixture(transform_fixture, file!(), "resolver_return_fragment_invalid_module_name.invalid.input", "relay_compiler_integration/fixtures/resolver_return_fragment_invalid_module_name.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn resolver_return_fragment_invalid_name_invalid() {
    let input = include_str!("relay_compiler_integration/fixtures/resolver_return_fragment_invalid_name.invalid.input");
    let expected = include_str!("relay_compiler_integration/fixtures/resolver_return_fragment_invalid_name.invalid.expected");
    test_fixture(transform_fixture, file!(), "resolver_return_fragment_invalid_name.invalid.input", "relay_compiler_integration/fixtures/resolver_return_fragment_invalid_name.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn resolver_return_fragment_requires_feature_flag_invalid() {
    let input = include_str!("relay_compiler_integration/fixtures/resolver_return_fragment_requires_feature_flag.invalid.input");
    let expected = include_str!("relay_compiler_integration/fixtures/resolver_return_fragment_requires_feature_flag.invalid.expected");
    test_fixture(transform_fixture, file!(), "resolver_return_fragment_requires_feature_flag.invalid.input", "relay_compiler_integration/fixtures/resolver_return_fragment_requires_feature_flag.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn resolver_returns_client_schema_extension_enum() {
    let input = include_str!("relay_compiler_integration/fixtures/resolver_returns_client_schema_extension_enum.input");
    let expected = include_str!("relay_compiler_integration/fixtures/resolver_returns_client_schema_extension_enum.expected");
    test_fixture(transform_fixture, file!(), "resolver_returns_client_schema_extension_enum.input", "relay_compiler_integration/fixtures/resolver_returns_client_schema_extension_enum.expected", input, expected).await;
}

#[tokio::test]
async fn resolver_returns_enum_with_enum_suffix() {
    let input = include_str!("relay_compiler_integration/fixtures/resolver_returns_enum_with_enum_suffix.input");
    let expected = include_str!("relay_compiler_integration/fixtures/resolver_returns_enum_with_enum_suffix.expected");
    test_fixture(transform_fixture, file!(), "resolver_returns_enum_with_enum_suffix.input", "relay_compiler_integration/fixtures/resolver_returns_enum_with_enum_suffix.expected", input, expected).await;
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
async fn resolver_returns_plural_server_type_invalid() {
    let input = include_str!("relay_compiler_integration/fixtures/resolver_returns_plural_server_type.invalid.input");
    let expected = include_str!("relay_compiler_integration/fixtures/resolver_returns_plural_server_type.invalid.expected");
    test_fixture(transform_fixture, file!(), "resolver_returns_plural_server_type.invalid.input", "relay_compiler_integration/fixtures/resolver_returns_plural_server_type.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn resolver_returns_union_of_cse() {
    let input = include_str!("relay_compiler_integration/fixtures/resolver_returns_union_of_cse.input");
    let expected = include_str!("relay_compiler_integration/fixtures/resolver_returns_union_of_cse.expected");
    test_fixture(transform_fixture, file!(), "resolver_returns_union_of_cse.input", "relay_compiler_integration/fixtures/resolver_returns_union_of_cse.expected", input, expected).await;
}

#[tokio::test]
async fn resolver_returns_union_of_cse_weak() {
    let input = include_str!("relay_compiler_integration/fixtures/resolver_returns_union_of_cse_weak.input");
    let expected = include_str!("relay_compiler_integration/fixtures/resolver_returns_union_of_cse_weak.expected");
    test_fixture(transform_fixture, file!(), "resolver_returns_union_of_cse_weak.input", "relay_compiler_integration/fixtures/resolver_returns_union_of_cse_weak.expected", input, expected).await;
}

#[tokio::test]
async fn resolver_returns_union_of_strong_resolver() {
    let input = include_str!("relay_compiler_integration/fixtures/resolver_returns_union_of_strong_resolver.input");
    let expected = include_str!("relay_compiler_integration/fixtures/resolver_returns_union_of_strong_resolver.expected");
    test_fixture(transform_fixture, file!(), "resolver_returns_union_of_strong_resolver.input", "relay_compiler_integration/fixtures/resolver_returns_union_of_strong_resolver.expected", input, expected).await;
}

#[tokio::test]
async fn resolver_returns_union_of_weak_resolver() {
    let input = include_str!("relay_compiler_integration/fixtures/resolver_returns_union_of_weak_resolver.input");
    let expected = include_str!("relay_compiler_integration/fixtures/resolver_returns_union_of_weak_resolver.expected");
    test_fixture(transform_fixture, file!(), "resolver_returns_union_of_weak_resolver.input", "relay_compiler_integration/fixtures/resolver_returns_union_of_weak_resolver.expected", input, expected).await;
}

#[tokio::test]
async fn resolver_returns_weak_client_schema_type() {
    let input = include_str!("relay_compiler_integration/fixtures/resolver_returns_weak_client_schema_type.input");
    let expected = include_str!("relay_compiler_integration/fixtures/resolver_returns_weak_client_schema_type.expected");
    test_fixture(transform_fixture, file!(), "resolver_returns_weak_client_schema_type.input", "relay_compiler_integration/fixtures/resolver_returns_weak_client_schema_type.expected", input, expected).await;
}

#[tokio::test]
async fn resolver_semantic_non_null_custom_scalar() {
    let input = include_str!("relay_compiler_integration/fixtures/resolver_semantic_non_null_custom_scalar.input");
    let expected = include_str!("relay_compiler_integration/fixtures/resolver_semantic_non_null_custom_scalar.expected");
    test_fixture(transform_fixture, file!(), "resolver_semantic_non_null_custom_scalar.input", "relay_compiler_integration/fixtures/resolver_semantic_non_null_custom_scalar.expected", input, expected).await;
}

#[tokio::test]
async fn resolver_semantic_non_null_live() {
    let input = include_str!("relay_compiler_integration/fixtures/resolver_semantic_non_null_live.input");
    let expected = include_str!("relay_compiler_integration/fixtures/resolver_semantic_non_null_live.expected");
    test_fixture(transform_fixture, file!(), "resolver_semantic_non_null_live.input", "relay_compiler_integration/fixtures/resolver_semantic_non_null_live.expected", input, expected).await;
}

#[tokio::test]
async fn resolver_semantic_non_null_plural() {
    let input = include_str!("relay_compiler_integration/fixtures/resolver_semantic_non_null_plural.input");
    let expected = include_str!("relay_compiler_integration/fixtures/resolver_semantic_non_null_plural.expected");
    test_fixture(transform_fixture, file!(), "resolver_semantic_non_null_plural.input", "relay_compiler_integration/fixtures/resolver_semantic_non_null_plural.expected", input, expected).await;
}

#[tokio::test]
async fn resolver_semantic_non_null_plural_live() {
    let input = include_str!("relay_compiler_integration/fixtures/resolver_semantic_non_null_plural_live.input");
    let expected = include_str!("relay_compiler_integration/fixtures/resolver_semantic_non_null_plural_live.expected");
    test_fixture(transform_fixture, file!(), "resolver_semantic_non_null_plural_live.input", "relay_compiler_integration/fixtures/resolver_semantic_non_null_plural_live.expected", input, expected).await;
}

#[tokio::test]
async fn resolver_semantic_non_null_relayresolvervalue() {
    let input = include_str!("relay_compiler_integration/fixtures/resolver_semantic_non_null_relayresolvervalue.input");
    let expected = include_str!("relay_compiler_integration/fixtures/resolver_semantic_non_null_relayresolvervalue.expected");
    test_fixture(transform_fixture, file!(), "resolver_semantic_non_null_relayresolvervalue.input", "relay_compiler_integration/fixtures/resolver_semantic_non_null_relayresolvervalue.expected", input, expected).await;
}

#[tokio::test]
async fn resolver_semantic_non_null_relayresolvervalue_disabled() {
    let input = include_str!("relay_compiler_integration/fixtures/resolver_semantic_non_null_relayresolvervalue_disabled.input");
    let expected = include_str!("relay_compiler_integration/fixtures/resolver_semantic_non_null_relayresolvervalue_disabled.expected");
    test_fixture(transform_fixture, file!(), "resolver_semantic_non_null_relayresolvervalue_disabled.input", "relay_compiler_integration/fixtures/resolver_semantic_non_null_relayresolvervalue_disabled.expected", input, expected).await;
}

#[tokio::test]
async fn resolver_semantic_non_null_scalar() {
    let input = include_str!("relay_compiler_integration/fixtures/resolver_semantic_non_null_scalar.input");
    let expected = include_str!("relay_compiler_integration/fixtures/resolver_semantic_non_null_scalar.expected");
    test_fixture(transform_fixture, file!(), "resolver_semantic_non_null_scalar.input", "relay_compiler_integration/fixtures/resolver_semantic_non_null_scalar.expected", input, expected).await;
}

#[tokio::test]
async fn resolver_with_return_fragment() {
    let input = include_str!("relay_compiler_integration/fixtures/resolver_with_return_fragment.input");
    let expected = include_str!("relay_compiler_integration/fixtures/resolver_with_return_fragment.expected");
    test_fixture(transform_fixture, file!(), "resolver_with_return_fragment.input", "relay_compiler_integration/fixtures/resolver_with_return_fragment.expected", input, expected).await;
}

#[tokio::test]
async fn resolvers_mask_false() {
    let input = include_str!("relay_compiler_integration/fixtures/resolvers_mask_false.input");
    let expected = include_str!("relay_compiler_integration/fixtures/resolvers_mask_false.expected");
    test_fixture(transform_fixture, file!(), "resolvers_mask_false.input", "relay_compiler_integration/fixtures/resolvers_mask_false.expected", input, expected).await;
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
async fn resolvers_schema_module_no_map() {
    let input = include_str!("relay_compiler_integration/fixtures/resolvers_schema_module_no_map.input");
    let expected = include_str!("relay_compiler_integration/fixtures/resolvers_schema_module_no_map.expected");
    test_fixture(transform_fixture, file!(), "resolvers_schema_module_no_map.input", "relay_compiler_integration/fixtures/resolvers_schema_module_no_map.expected", input, expected).await;
}

#[tokio::test]
async fn resolvers_with_context_javascript() {
    let input = include_str!("relay_compiler_integration/fixtures/resolvers_with_context_javascript.input");
    let expected = include_str!("relay_compiler_integration/fixtures/resolvers_with_context_javascript.expected");
    test_fixture(transform_fixture, file!(), "resolvers_with_context_javascript.input", "relay_compiler_integration/fixtures/resolvers_with_context_javascript.expected", input, expected).await;
}

#[tokio::test]
async fn resolvers_with_context_package_import() {
    let input = include_str!("relay_compiler_integration/fixtures/resolvers_with_context_package_import.input");
    let expected = include_str!("relay_compiler_integration/fixtures/resolvers_with_context_package_import.expected");
    test_fixture(transform_fixture, file!(), "resolvers_with_context_package_import.input", "relay_compiler_integration/fixtures/resolvers_with_context_package_import.expected", input, expected).await;
}

#[tokio::test]
async fn resolvers_with_context_path_import() {
    let input = include_str!("relay_compiler_integration/fixtures/resolvers_with_context_path_import.input");
    let expected = include_str!("relay_compiler_integration/fixtures/resolvers_with_context_path_import.expected");
    test_fixture(transform_fixture, file!(), "resolvers_with_context_path_import.input", "relay_compiler_integration/fixtures/resolvers_with_context_path_import.expected", input, expected).await;
}

#[tokio::test]
async fn schema_in_excluded_dir_works() {
    let input = include_str!("relay_compiler_integration/fixtures/schema_in_excluded_dir_works.input");
    let expected = include_str!("relay_compiler_integration/fixtures/schema_in_excluded_dir_works.expected");
    test_fixture(transform_fixture, file!(), "schema_in_excluded_dir_works.input", "relay_compiler_integration/fixtures/schema_in_excluded_dir_works.expected", input, expected).await;
}

#[tokio::test]
async fn schema_in_generated_dir() {
    let input = include_str!("relay_compiler_integration/fixtures/schema_in_generated_dir.input");
    let expected = include_str!("relay_compiler_integration/fixtures/schema_in_generated_dir.expected");
    test_fixture(transform_fixture, file!(), "schema_in_generated_dir.input", "relay_compiler_integration/fixtures/schema_in_generated_dir.expected", input, expected).await;
}

#[tokio::test]
async fn schema_outside_root_dir() {
    let input = include_str!("relay_compiler_integration/fixtures/schema_outside_root_dir.input");
    let expected = include_str!("relay_compiler_integration/fixtures/schema_outside_root_dir.expected");
    test_fixture(transform_fixture, file!(), "schema_outside_root_dir.input", "relay_compiler_integration/fixtures/schema_outside_root_dir.expected", input, expected).await;
}

#[tokio::test]
async fn semantic_null_require_bubble_to_required_parent() {
    let input = include_str!("relay_compiler_integration/fixtures/semantic_null_require_bubble_to_required_parent.input");
    let expected = include_str!("relay_compiler_integration/fixtures/semantic_null_require_bubble_to_required_parent.expected");
    test_fixture(transform_fixture, file!(), "semantic_null_require_bubble_to_required_parent.input", "relay_compiler_integration/fixtures/semantic_null_require_bubble_to_required_parent.expected", input, expected).await;
}

#[tokio::test]
async fn semantic_null_require_bubbling() {
    let input = include_str!("relay_compiler_integration/fixtures/semantic_null_require_bubbling.input");
    let expected = include_str!("relay_compiler_integration/fixtures/semantic_null_require_bubbling.expected");
    test_fixture(transform_fixture, file!(), "semantic_null_require_bubbling.input", "relay_compiler_integration/fixtures/semantic_null_require_bubbling.expected", input, expected).await;
}

#[tokio::test]
async fn simple_fragment() {
    let input = include_str!("relay_compiler_integration/fixtures/simple_fragment.input");
    let expected = include_str!("relay_compiler_integration/fixtures/simple_fragment.expected");
    test_fixture(transform_fixture, file!(), "simple_fragment.input", "relay_compiler_integration/fixtures/simple_fragment.expected", input, expected).await;
}

#[tokio::test]
async fn simple_fragment_name_change() {
    let input = include_str!("relay_compiler_integration/fixtures/simple_fragment_name_change.input");
    let expected = include_str!("relay_compiler_integration/fixtures/simple_fragment_name_change.expected");
    test_fixture(transform_fixture, file!(), "simple_fragment_name_change.input", "relay_compiler_integration/fixtures/simple_fragment_name_change.expected", input, expected).await;
}

#[tokio::test]
async fn spread_interface_fragment_on_concrete_type() {
    let input = include_str!("relay_compiler_integration/fixtures/spread_interface_fragment_on_concrete_type.input");
    let expected = include_str!("relay_compiler_integration/fixtures/spread_interface_fragment_on_concrete_type.expected");
    test_fixture(transform_fixture, file!(), "spread_interface_fragment_on_concrete_type.input", "relay_compiler_integration/fixtures/spread_interface_fragment_on_concrete_type.expected", input, expected).await;
}

#[tokio::test]
async fn spread_interface_fragment_on_weak_concrete_type() {
    let input = include_str!("relay_compiler_integration/fixtures/spread_interface_fragment_on_weak_concrete_type.input");
    let expected = include_str!("relay_compiler_integration/fixtures/spread_interface_fragment_on_weak_concrete_type.expected");
    test_fixture(transform_fixture, file!(), "spread_interface_fragment_on_weak_concrete_type.input", "relay_compiler_integration/fixtures/spread_interface_fragment_on_weak_concrete_type.expected", input, expected).await;
}

#[tokio::test]
async fn spread_multiple_interface_fragments_on_concrete_type() {
    let input = include_str!("relay_compiler_integration/fixtures/spread_multiple_interface_fragments_on_concrete_type.input");
    let expected = include_str!("relay_compiler_integration/fixtures/spread_multiple_interface_fragments_on_concrete_type.expected");
    test_fixture(transform_fixture, file!(), "spread_multiple_interface_fragments_on_concrete_type.input", "relay_compiler_integration/fixtures/spread_multiple_interface_fragments_on_concrete_type.expected", input, expected).await;
}

#[tokio::test]
async fn typescript_resolver_type_import() {
    let input = include_str!("relay_compiler_integration/fixtures/typescript_resolver_type_import.input");
    let expected = include_str!("relay_compiler_integration/fixtures/typescript_resolver_type_import.expected");
    test_fixture(transform_fixture, file!(), "typescript_resolver_type_import.input", "relay_compiler_integration/fixtures/typescript_resolver_type_import.expected", input, expected).await;
}

#[tokio::test]
async fn typescript_resolver_with_context() {
    let input = include_str!("relay_compiler_integration/fixtures/typescript_resolver_with_context.input");
    let expected = include_str!("relay_compiler_integration/fixtures/typescript_resolver_with_context.expected");
    test_fixture(transform_fixture, file!(), "typescript_resolver_with_context.input", "relay_compiler_integration/fixtures/typescript_resolver_with_context.expected", input, expected).await;
}
