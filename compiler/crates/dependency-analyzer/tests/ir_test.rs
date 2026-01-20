/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<e73e0f01d763893458338bcb944955fd>>
 */

mod ir;

use ir::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn base_definitions_change_fragment() {
    let input = include_str!("ir/fixtures/base-definitions-change-fragment.graphql");
    let expected = include_str!("ir/fixtures/base-definitions-change-fragment.expected");
    test_fixture(transform_fixture, file!(), "base-definitions-change-fragment.graphql", "ir/fixtures/base-definitions-change-fragment.expected", input, expected).await;
}

#[tokio::test]
async fn base_definitions_change_fragment2() {
    let input = include_str!("ir/fixtures/base-definitions-change-fragment2.graphql");
    let expected = include_str!("ir/fixtures/base-definitions-change-fragment2.expected");
    test_fixture(transform_fixture, file!(), "base-definitions-change-fragment2.graphql", "ir/fixtures/base-definitions-change-fragment2.expected", input, expected).await;
}

#[tokio::test]
async fn base_definitions_change_query() {
    let input = include_str!("ir/fixtures/base-definitions-change-query.graphql");
    let expected = include_str!("ir/fixtures/base-definitions-change-query.expected");
    test_fixture(transform_fixture, file!(), "base-definitions-change-query.graphql", "ir/fixtures/base-definitions-change-query.expected", input, expected).await;
}

#[tokio::test]
async fn definitions_only_change_fragment() {
    let input = include_str!("ir/fixtures/definitions-only-change-fragment.graphql");
    let expected = include_str!("ir/fixtures/definitions-only-change-fragment.expected");
    test_fixture(transform_fixture, file!(), "definitions-only-change-fragment.graphql", "ir/fixtures/definitions-only-change-fragment.expected", input, expected).await;
}

#[tokio::test]
async fn definitions_only_change_query() {
    let input = include_str!("ir/fixtures/definitions-only-change-query.graphql");
    let expected = include_str!("ir/fixtures/definitions-only-change-query.expected");
    test_fixture(transform_fixture, file!(), "definitions-only-change-query.graphql", "ir/fixtures/definitions-only-change-query.expected", input, expected).await;
}

#[tokio::test]
async fn definitions_only_no_change() {
    let input = include_str!("ir/fixtures/definitions-only-no-change.graphql");
    let expected = include_str!("ir/fixtures/definitions-only-no-change.expected");
    test_fixture(transform_fixture, file!(), "definitions-only-no-change.graphql", "ir/fixtures/definitions-only-no-change.expected", input, expected).await;
}

#[tokio::test]
async fn implicit_dependencies_parent_child() {
    let input = include_str!("ir/fixtures/implicit-dependencies-parent-child.graphql");
    let expected = include_str!("ir/fixtures/implicit-dependencies-parent-child.expected");
    test_fixture(transform_fixture, file!(), "implicit-dependencies-parent-child.graphql", "ir/fixtures/implicit-dependencies-parent-child.expected", input, expected).await;
}

#[tokio::test]
async fn new_resolver_field() {
    let input = include_str!("ir/fixtures/new-resolver-field.graphql");
    let expected = include_str!("ir/fixtures/new-resolver-field.expected");
    test_fixture(transform_fixture, file!(), "new-resolver-field.graphql", "ir/fixtures/new-resolver-field.expected", input, expected).await;
}

#[tokio::test]
async fn new_resolver_model_field() {
    let input = include_str!("ir/fixtures/new-resolver-model-field.graphql");
    let expected = include_str!("ir/fixtures/new-resolver-model-field.expected");
    test_fixture(transform_fixture, file!(), "new-resolver-model-field.graphql", "ir/fixtures/new-resolver-model-field.expected", input, expected).await;
}

#[tokio::test]
async fn new_resolver_model_field_with_custom_fragment() {
    let input = include_str!("ir/fixtures/new-resolver-model-field-with-custom-fragment.graphql");
    let expected = include_str!("ir/fixtures/new-resolver-model-field-with-custom-fragment.expected");
    test_fixture(transform_fixture, file!(), "new-resolver-model-field-with-custom-fragment.graphql", "ir/fixtures/new-resolver-model-field-with-custom-fragment.expected", input, expected).await;
}

#[tokio::test]
async fn new_resolver_on_interface() {
    let input = include_str!("ir/fixtures/new-resolver-on-interface.graphql");
    let expected = include_str!("ir/fixtures/new-resolver-on-interface.expected");
    test_fixture(transform_fixture, file!(), "new-resolver-on-interface.graphql", "ir/fixtures/new-resolver-on-interface.expected", input, expected).await;
}

#[tokio::test]
async fn query_then_fragment() {
    let input = include_str!("ir/fixtures/query-then-fragment.graphql");
    let expected = include_str!("ir/fixtures/query-then-fragment.expected");
    test_fixture(transform_fixture, file!(), "query-then-fragment.graphql", "ir/fixtures/query-then-fragment.expected", input, expected).await;
}

#[tokio::test]
async fn recursive_fragments() {
    let input = include_str!("ir/fixtures/recursive-fragments.graphql");
    let expected = include_str!("ir/fixtures/recursive-fragments.expected");
    test_fixture(transform_fixture, file!(), "recursive-fragments.graphql", "ir/fixtures/recursive-fragments.expected", input, expected).await;
}

#[tokio::test]
async fn scalar_field_argument_enum_change() {
    let input = include_str!("ir/fixtures/scalar-field-argument-enum-change.graphql");
    let expected = include_str!("ir/fixtures/scalar-field-argument-enum-change.expected");
    test_fixture(transform_fixture, file!(), "scalar-field-argument-enum-change.graphql", "ir/fixtures/scalar-field-argument-enum-change.expected", input, expected).await;
}

#[tokio::test]
async fn schema_and_definitions_change() {
    let input = include_str!("ir/fixtures/schema-and-definitions-change.graphql");
    let expected = include_str!("ir/fixtures/schema-and-definitions-change.expected");
    test_fixture(transform_fixture, file!(), "schema-and-definitions-change.graphql", "ir/fixtures/schema-and-definitions-change.expected", input, expected).await;
}

#[tokio::test]
async fn schema_enum_and_object_change() {
    let input = include_str!("ir/fixtures/schema-enum-and-object-change.graphql");
    let expected = include_str!("ir/fixtures/schema-enum-and-object-change.expected");
    test_fixture(transform_fixture, file!(), "schema-enum-and-object-change.graphql", "ir/fixtures/schema-enum-and-object-change.expected", input, expected).await;
}

#[tokio::test]
async fn schema_enum_change() {
    let input = include_str!("ir/fixtures/schema-enum-change.graphql");
    let expected = include_str!("ir/fixtures/schema-enum-change.expected");
    test_fixture(transform_fixture, file!(), "schema-enum-change.graphql", "ir/fixtures/schema-enum-change.expected", input, expected).await;
}

#[tokio::test]
async fn schema_enum_in_input_object_change() {
    let input = include_str!("ir/fixtures/schema-enum-in-input-object-change.graphql");
    let expected = include_str!("ir/fixtures/schema-enum-in-input-object-change.expected");
    test_fixture(transform_fixture, file!(), "schema-enum-in-input-object-change.graphql", "ir/fixtures/schema-enum-in-input-object-change.expected", input, expected).await;
}

#[tokio::test]
async fn schema_object_change() {
    let input = include_str!("ir/fixtures/schema-object-change.graphql");
    let expected = include_str!("ir/fixtures/schema-object-change.expected");
    test_fixture(transform_fixture, file!(), "schema-object-change.graphql", "ir/fixtures/schema-object-change.expected", input, expected).await;
}

#[tokio::test]
async fn schema_object_in_union_change() {
    let input = include_str!("ir/fixtures/schema-object-in-union-change.graphql");
    let expected = include_str!("ir/fixtures/schema-object-in-union-change.expected");
    test_fixture(transform_fixture, file!(), "schema-object-in-union-change.graphql", "ir/fixtures/schema-object-in-union-change.expected", input, expected).await;
}

#[tokio::test]
async fn schema_object_with_interface_change() {
    let input = include_str!("ir/fixtures/schema-object-with-interface-change.graphql");
    let expected = include_str!("ir/fixtures/schema-object-with-interface-change.expected");
    test_fixture(transform_fixture, file!(), "schema-object-with-interface-change.graphql", "ir/fixtures/schema-object-with-interface-change.expected", input, expected).await;
}

#[tokio::test]
async fn schema_recursive_input_type_change() {
    let input = include_str!("ir/fixtures/schema-recursive-input-type-change.graphql");
    let expected = include_str!("ir/fixtures/schema-recursive-input-type-change.expected");
    test_fixture(transform_fixture, file!(), "schema-recursive-input-type-change.graphql", "ir/fixtures/schema-recursive-input-type-change.expected", input, expected).await;
}

#[tokio::test]
async fn schema_union_change() {
    let input = include_str!("ir/fixtures/schema-union-change.graphql");
    let expected = include_str!("ir/fixtures/schema-union-change.expected");
    test_fixture(transform_fixture, file!(), "schema-union-change.graphql", "ir/fixtures/schema-union-change.expected", input, expected).await;
}

#[tokio::test]
async fn transitive_implicit_dependency() {
    let input = include_str!("ir/fixtures/transitive-implicit-dependency.graphql");
    let expected = include_str!("ir/fixtures/transitive-implicit-dependency.expected");
    test_fixture(transform_fixture, file!(), "transitive-implicit-dependency.graphql", "ir/fixtures/transitive-implicit-dependency.expected", input, expected).await;
}
