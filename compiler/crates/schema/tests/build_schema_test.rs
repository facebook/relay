/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<a95c2a378639e109e01e4d5882f28a1a>>
 */

mod build_schema;

use build_schema::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn different_directives_on_one_site() {
    let input = include_str!("build_schema/fixtures/different-directives-on-one-site.graphql");
    let expected = include_str!("build_schema/fixtures/different-directives-on-one-site.expected");
    test_fixture(transform_fixture, file!(), "different-directives-on-one-site.graphql", "build_schema/fixtures/different-directives-on-one-site.expected", input, expected).await;
}

#[tokio::test]
async fn directive_definition_argument_duplicate_directive() {
    let input = include_str!("build_schema/fixtures/directive-definition-argument-duplicate-directive.graphql");
    let expected = include_str!("build_schema/fixtures/directive-definition-argument-duplicate-directive.expected");
    test_fixture(transform_fixture, file!(), "directive-definition-argument-duplicate-directive.graphql", "build_schema/fixtures/directive-definition-argument-duplicate-directive.expected", input, expected).await;
}

#[tokio::test]
async fn directive_definition_duplicate_directive() {
    let input = include_str!("build_schema/fixtures/directive-definition-duplicate-directive.graphql");
    let expected = include_str!("build_schema/fixtures/directive-definition-duplicate-directive.expected");
    test_fixture(transform_fixture, file!(), "directive-definition-duplicate-directive.graphql", "build_schema/fixtures/directive-definition-duplicate-directive.expected", input, expected).await;
}

#[tokio::test]
async fn directive_definition_extension_duplicate_directive() {
    let input = include_str!("build_schema/fixtures/directive-definition-extension-duplicate-directive.graphql");
    let expected = include_str!("build_schema/fixtures/directive-definition-extension-duplicate-directive.expected");
    test_fixture(transform_fixture, file!(), "directive-definition-extension-duplicate-directive.graphql", "build_schema/fixtures/directive-definition-extension-duplicate-directive.expected", input, expected).await;
}

#[tokio::test]
async fn directive_on_arg_def() {
    let input = include_str!("build_schema/fixtures/directive-on-arg-def.graphql");
    let expected = include_str!("build_schema/fixtures/directive-on-arg-def.expected");
    test_fixture(transform_fixture, file!(), "directive-on-arg-def.graphql", "build_schema/fixtures/directive-on-arg-def.expected", input, expected).await;
}

#[tokio::test]
async fn directives_for_external_types() {
    let input = include_str!("build_schema/fixtures/directives-for-external-types.graphql");
    let expected = include_str!("build_schema/fixtures/directives-for-external-types.expected");
    test_fixture(transform_fixture, file!(), "directives-for-external-types.graphql", "build_schema/fixtures/directives-for-external-types.expected", input, expected).await;
}

#[tokio::test]
async fn enum_duplicate_directive() {
    let input = include_str!("build_schema/fixtures/enum-duplicate-directive.graphql");
    let expected = include_str!("build_schema/fixtures/enum-duplicate-directive.expected");
    test_fixture(transform_fixture, file!(), "enum-duplicate-directive.graphql", "build_schema/fixtures/enum-duplicate-directive.expected", input, expected).await;
}

#[tokio::test]
async fn enum_value_duplicate_directive() {
    let input = include_str!("build_schema/fixtures/enum-value-duplicate-directive.graphql");
    let expected = include_str!("build_schema/fixtures/enum-value-duplicate-directive.expected");
    test_fixture(transform_fixture, file!(), "enum-value-duplicate-directive.graphql", "build_schema/fixtures/enum-value-duplicate-directive.expected", input, expected).await;
}

#[tokio::test]
async fn extend_input() {
    let input = include_str!("build_schema/fixtures/extend-input.graphql");
    let expected = include_str!("build_schema/fixtures/extend-input.expected");
    test_fixture(transform_fixture, file!(), "extend-input.graphql", "build_schema/fixtures/extend-input.expected", input, expected).await;
}

#[tokio::test]
async fn extend_interface_before_define() {
    let input = include_str!("build_schema/fixtures/extend-interface-before-define.graphql");
    let expected = include_str!("build_schema/fixtures/extend-interface-before-define.expected");
    test_fixture(transform_fixture, file!(), "extend-interface-before-define.graphql", "build_schema/fixtures/extend-interface-before-define.expected", input, expected).await;
}

#[tokio::test]
async fn extend_object_before_define() {
    let input = include_str!("build_schema/fixtures/extend-object-before-define.graphql");
    let expected = include_str!("build_schema/fixtures/extend-object-before-define.expected");
    test_fixture(transform_fixture, file!(), "extend-object-before-define.graphql", "build_schema/fixtures/extend-object-before-define.expected", input, expected).await;
}

#[tokio::test]
async fn extend_scalar() {
    let input = include_str!("build_schema/fixtures/extend-scalar.graphql");
    let expected = include_str!("build_schema/fixtures/extend-scalar.expected");
    test_fixture(transform_fixture, file!(), "extend-scalar.graphql", "build_schema/fixtures/extend-scalar.expected", input, expected).await;
}

#[tokio::test]
async fn extend_scalar_before_define() {
    let input = include_str!("build_schema/fixtures/extend-scalar-before-define.graphql");
    let expected = include_str!("build_schema/fixtures/extend-scalar-before-define.expected");
    test_fixture(transform_fixture, file!(), "extend-scalar-before-define.graphql", "build_schema/fixtures/extend-scalar-before-define.expected", input, expected).await;
}

#[tokio::test]
async fn extend_schema() {
    let input = include_str!("build_schema/fixtures/extend-schema.graphql");
    let expected = include_str!("build_schema/fixtures/extend-schema.expected");
    test_fixture(transform_fixture, file!(), "extend-schema.graphql", "build_schema/fixtures/extend-schema.expected", input, expected).await;
}

#[tokio::test]
async fn extend_union_before_define() {
    let input = include_str!("build_schema/fixtures/extend-union-before-define.graphql");
    let expected = include_str!("build_schema/fixtures/extend-union-before-define.expected");
    test_fixture(transform_fixture, file!(), "extend-union-before-define.graphql", "build_schema/fixtures/extend-union-before-define.expected", input, expected).await;
}

#[tokio::test]
async fn field_argument_duplicate_directive() {
    let input = include_str!("build_schema/fixtures/field-argument-duplicate-directive.graphql");
    let expected = include_str!("build_schema/fixtures/field-argument-duplicate-directive.expected");
    test_fixture(transform_fixture, file!(), "field-argument-duplicate-directive.graphql", "build_schema/fixtures/field-argument-duplicate-directive.expected", input, expected).await;
}

#[tokio::test]
async fn field_descriptions() {
    let input = include_str!("build_schema/fixtures/field-descriptions.graphql");
    let expected = include_str!("build_schema/fixtures/field-descriptions.expected");
    test_fixture(transform_fixture, file!(), "field-descriptions.graphql", "build_schema/fixtures/field-descriptions.expected", input, expected).await;
}

#[tokio::test]
async fn field_duplicate_directive() {
    let input = include_str!("build_schema/fixtures/field-duplicate-directive.graphql");
    let expected = include_str!("build_schema/fixtures/field-duplicate-directive.expected");
    test_fixture(transform_fixture, file!(), "field-duplicate-directive.graphql", "build_schema/fixtures/field-duplicate-directive.expected", input, expected).await;
}

#[tokio::test]
async fn input_object_duplicate_directive() {
    let input = include_str!("build_schema/fixtures/input-object-duplicate-directive.graphql");
    let expected = include_str!("build_schema/fixtures/input-object-duplicate-directive.expected");
    test_fixture(transform_fixture, file!(), "input-object-duplicate-directive.graphql", "build_schema/fixtures/input-object-duplicate-directive.expected", input, expected).await;
}

#[tokio::test]
async fn input_object_field_duplicate_directive() {
    let input = include_str!("build_schema/fixtures/input-object-field-duplicate-directive.graphql");
    let expected = include_str!("build_schema/fixtures/input-object-field-duplicate-directive.expected");
    test_fixture(transform_fixture, file!(), "input-object-field-duplicate-directive.graphql", "build_schema/fixtures/input-object-field-duplicate-directive.expected", input, expected).await;
}

#[tokio::test]
async fn interface_duplicate_directive() {
    let input = include_str!("build_schema/fixtures/interface-duplicate-directive.graphql");
    let expected = include_str!("build_schema/fixtures/interface-duplicate-directive.expected");
    test_fixture(transform_fixture, file!(), "interface-duplicate-directive.graphql", "build_schema/fixtures/interface-duplicate-directive.expected", input, expected).await;
}

#[tokio::test]
async fn interface_extension_duplicate_directive() {
    let input = include_str!("build_schema/fixtures/interface-extension-duplicate-directive.graphql");
    let expected = include_str!("build_schema/fixtures/interface-extension-duplicate-directive.expected");
    test_fixture(transform_fixture, file!(), "interface-extension-duplicate-directive.graphql", "build_schema/fixtures/interface-extension-duplicate-directive.expected", input, expected).await;
}

#[tokio::test]
async fn interface_implements_interface() {
    let input = include_str!("build_schema/fixtures/interface-implements-interface.graphql");
    let expected = include_str!("build_schema/fixtures/interface-implements-interface.expected");
    test_fixture(transform_fixture, file!(), "interface-implements-interface.graphql", "build_schema/fixtures/interface-implements-interface.expected", input, expected).await;
}

#[tokio::test]
async fn invalid_duplicate_directive() {
    let input = include_str!("build_schema/fixtures/invalid-duplicate-directive.graphql");
    let expected = include_str!("build_schema/fixtures/invalid-duplicate-directive.expected");
    test_fixture(transform_fixture, file!(), "invalid-duplicate-directive.graphql", "build_schema/fixtures/invalid-duplicate-directive.expected", input, expected).await;
}

#[tokio::test]
async fn invalid_duplicate_query_operation() {
    let input = include_str!("build_schema/fixtures/invalid-duplicate-query-operation.graphql");
    let expected = include_str!("build_schema/fixtures/invalid-duplicate-query-operation.expected");
    test_fixture(transform_fixture, file!(), "invalid-duplicate-query-operation.graphql", "build_schema/fixtures/invalid-duplicate-query-operation.expected", input, expected).await;
}

#[tokio::test]
async fn invalid_duplicate_type_name() {
    let input = include_str!("build_schema/fixtures/invalid-duplicate-type-name.graphql");
    let expected = include_str!("build_schema/fixtures/invalid-duplicate-type-name.expected");
    test_fixture(transform_fixture, file!(), "invalid-duplicate-type-name.graphql", "build_schema/fixtures/invalid-duplicate-type-name.expected", input, expected).await;
}

#[tokio::test]
async fn invalid_extension_implements_noninterface() {
    let input = include_str!("build_schema/fixtures/invalid-extension-implements-noninterface.graphql");
    let expected = include_str!("build_schema/fixtures/invalid-extension-implements-noninterface.expected");
    test_fixture(transform_fixture, file!(), "invalid-extension-implements-noninterface.graphql", "build_schema/fixtures/invalid-extension-implements-noninterface.expected", input, expected).await;
}

#[tokio::test]
async fn invalid_implements_non_interface() {
    let input = include_str!("build_schema/fixtures/invalid-implements-non-interface.graphql");
    let expected = include_str!("build_schema/fixtures/invalid-implements-non-interface.expected");
    test_fixture(transform_fixture, file!(), "invalid-implements-non-interface.graphql", "build_schema/fixtures/invalid-implements-non-interface.expected", input, expected).await;
}

#[tokio::test]
async fn invalid_input_extension_duplicate_field() {
    let input = include_str!("build_schema/fixtures/invalid-input-extension-duplicate-field.graphql");
    let expected = include_str!("build_schema/fixtures/invalid-input-extension-duplicate-field.expected");
    test_fixture(transform_fixture, file!(), "invalid-input-extension-duplicate-field.graphql", "build_schema/fixtures/invalid-input-extension-duplicate-field.expected", input, expected).await;
}

#[tokio::test]
async fn invalid_input_type() {
    let input = include_str!("build_schema/fixtures/invalid-input-type.graphql");
    let expected = include_str!("build_schema/fixtures/invalid-input-type.expected");
    test_fixture(transform_fixture, file!(), "invalid-input-type.graphql", "build_schema/fixtures/invalid-input-type.expected", input, expected).await;
}

#[tokio::test]
async fn invalid_input_type_interface() {
    let input = include_str!("build_schema/fixtures/invalid-input-type-interface.graphql");
    let expected = include_str!("build_schema/fixtures/invalid-input-type-interface.expected");
    test_fixture(transform_fixture, file!(), "invalid-input-type-interface.graphql", "build_schema/fixtures/invalid-input-type-interface.expected", input, expected).await;
}

#[tokio::test]
async fn invalid_input_type_union() {
    let input = include_str!("build_schema/fixtures/invalid-input-type-union.graphql");
    let expected = include_str!("build_schema/fixtures/invalid-input-type-union.expected");
    test_fixture(transform_fixture, file!(), "invalid-input-type-union.graphql", "build_schema/fixtures/invalid-input-type-union.expected", input, expected).await;
}

#[tokio::test]
async fn invalid_interface_implements_noninterface() {
    let input = include_str!("build_schema/fixtures/invalid-interface-implements-noninterface.graphql");
    let expected = include_str!("build_schema/fixtures/invalid-interface-implements-noninterface.expected");
    test_fixture(transform_fixture, file!(), "invalid-interface-implements-noninterface.graphql", "build_schema/fixtures/invalid-interface-implements-noninterface.expected", input, expected).await;
}

#[tokio::test]
async fn invalid_object_extension_duplicated_server_field() {
    let input = include_str!("build_schema/fixtures/invalid-object-extension-duplicated-server-field.graphql");
    let expected = include_str!("build_schema/fixtures/invalid-object-extension-duplicated-server-field.expected");
    test_fixture(transform_fixture, file!(), "invalid-object-extension-duplicated-server-field.graphql", "build_schema/fixtures/invalid-object-extension-duplicated-server-field.expected", input, expected).await;
}

#[tokio::test]
async fn invalid_object_extension_local_duplicated_fields() {
    let input = include_str!("build_schema/fixtures/invalid-object-extension-local-duplicated-fields.graphql");
    let expected = include_str!("build_schema/fixtures/invalid-object-extension-local-duplicated-fields.expected");
    test_fixture(transform_fixture, file!(), "invalid-object-extension-local-duplicated-fields.graphql", "build_schema/fixtures/invalid-object-extension-local-duplicated-fields.expected", input, expected).await;
}

#[tokio::test]
async fn invalid_schema_extension_duplicate_operation() {
    let input = include_str!("build_schema/fixtures/invalid-schema-extension-duplicate-operation.graphql");
    let expected = include_str!("build_schema/fixtures/invalid-schema-extension-duplicate-operation.expected");
    test_fixture(transform_fixture, file!(), "invalid-schema-extension-duplicate-operation.graphql", "build_schema/fixtures/invalid-schema-extension-duplicate-operation.expected", input, expected).await;
}

#[tokio::test]
async fn invalid_sdl() {
    let input = include_str!("build_schema/fixtures/invalid-sdl.graphql");
    let expected = include_str!("build_schema/fixtures/invalid-sdl.expected");
    test_fixture(transform_fixture, file!(), "invalid-sdl.graphql", "build_schema/fixtures/invalid-sdl.expected", input, expected).await;
}

#[tokio::test]
async fn invalid_type_reference() {
    let input = include_str!("build_schema/fixtures/invalid-type-reference.graphql");
    let expected = include_str!("build_schema/fixtures/invalid-type-reference.expected");
    test_fixture(transform_fixture, file!(), "invalid-type-reference.graphql", "build_schema/fixtures/invalid-type-reference.expected", input, expected).await;
}

#[tokio::test]
async fn kitchen_sink() {
    let input = include_str!("build_schema/fixtures/kitchen-sink.graphql");
    let expected = include_str!("build_schema/fixtures/kitchen-sink.expected");
    test_fixture(transform_fixture, file!(), "kitchen-sink.graphql", "build_schema/fixtures/kitchen-sink.expected", input, expected).await;
}

#[tokio::test]
async fn object_duplicate_directive() {
    let input = include_str!("build_schema/fixtures/object-duplicate-directive.graphql");
    let expected = include_str!("build_schema/fixtures/object-duplicate-directive.expected");
    test_fixture(transform_fixture, file!(), "object-duplicate-directive.graphql", "build_schema/fixtures/object-duplicate-directive.expected", input, expected).await;
}

#[tokio::test]
async fn object_duplicate_directive_differing_args() {
    let input = include_str!("build_schema/fixtures/object-duplicate-directive-differing-args.graphql");
    let expected = include_str!("build_schema/fixtures/object-duplicate-directive-differing-args.expected");
    test_fixture(transform_fixture, file!(), "object-duplicate-directive-differing-args.graphql", "build_schema/fixtures/object-duplicate-directive-differing-args.expected", input, expected).await;
}

#[tokio::test]
async fn object_extension_duplicate_directive() {
    let input = include_str!("build_schema/fixtures/object-extension-duplicate-directive.graphql");
    let expected = include_str!("build_schema/fixtures/object-extension-duplicate-directive.expected");
    test_fixture(transform_fixture, file!(), "object-extension-duplicate-directive.graphql", "build_schema/fixtures/object-extension-duplicate-directive.expected", input, expected).await;
}

#[tokio::test]
async fn object_extension_duplicate_directive_differing_args() {
    let input = include_str!("build_schema/fixtures/object-extension-duplicate-directive-differing-args.graphql");
    let expected = include_str!("build_schema/fixtures/object-extension-duplicate-directive-differing-args.expected");
    test_fixture(transform_fixture, file!(), "object-extension-duplicate-directive-differing-args.graphql", "build_schema/fixtures/object-extension-duplicate-directive-differing-args.expected", input, expected).await;
}

#[tokio::test]
async fn repeatable_directive_applied_multiple_times() {
    let input = include_str!("build_schema/fixtures/repeatable-directive-applied-multiple-times.graphql");
    let expected = include_str!("build_schema/fixtures/repeatable-directive-applied-multiple-times.expected");
    test_fixture(transform_fixture, file!(), "repeatable-directive-applied-multiple-times.graphql", "build_schema/fixtures/repeatable-directive-applied-multiple-times.expected", input, expected).await;
}

#[tokio::test]
async fn scalar_duplicate_directive() {
    let input = include_str!("build_schema/fixtures/scalar-duplicate-directive.graphql");
    let expected = include_str!("build_schema/fixtures/scalar-duplicate-directive.expected");
    test_fixture(transform_fixture, file!(), "scalar-duplicate-directive.graphql", "build_schema/fixtures/scalar-duplicate-directive.expected", input, expected).await;
}

#[tokio::test]
async fn undefined_directive_applied_multiple_times() {
    let input = include_str!("build_schema/fixtures/undefined-directive-applied-multiple-times.graphql");
    let expected = include_str!("build_schema/fixtures/undefined-directive-applied-multiple-times.expected");
    test_fixture(transform_fixture, file!(), "undefined-directive-applied-multiple-times.graphql", "build_schema/fixtures/undefined-directive-applied-multiple-times.expected", input, expected).await;
}

#[tokio::test]
async fn union_duplicate_directive() {
    let input = include_str!("build_schema/fixtures/union-duplicate-directive.graphql");
    let expected = include_str!("build_schema/fixtures/union-duplicate-directive.expected");
    test_fixture(transform_fixture, file!(), "union-duplicate-directive.graphql", "build_schema/fixtures/union-duplicate-directive.expected", input, expected).await;
}
