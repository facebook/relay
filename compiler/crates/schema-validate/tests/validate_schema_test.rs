/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<c45f484f189a81dd662ba1d407352177>>
 */

mod validate_schema;

use validate_schema::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn validate_directives() {
    let input = include_str!("validate_schema/fixtures/validate_directives.graphql");
    let expected = include_str!("validate_schema/fixtures/validate_directives.expected");
    test_fixture(transform_fixture, file!(), "validate_directives.graphql", "validate_schema/fixtures/validate_directives.expected", input, expected).await;
}

#[tokio::test]
async fn validate_enum() {
    let input = include_str!("validate_schema/fixtures/validate_enum.graphql");
    let expected = include_str!("validate_schema/fixtures/validate_enum.expected");
    test_fixture(transform_fixture, file!(), "validate_enum.graphql", "validate_schema/fixtures/validate_enum.expected", input, expected).await;
}

#[tokio::test]
async fn validate_implements_interface() {
    let input = include_str!("validate_schema/fixtures/validate_implements_interface.graphql");
    let expected = include_str!("validate_schema/fixtures/validate_implements_interface.expected");
    test_fixture(transform_fixture, file!(), "validate_implements_interface.graphql", "validate_schema/fixtures/validate_implements_interface.expected", input, expected).await;
}

#[tokio::test]
async fn validate_interface_implements_interface_cyclic() {
    let input = include_str!("validate_schema/fixtures/validate_interface_implements_interface_cyclic.graphql");
    let expected = include_str!("validate_schema/fixtures/validate_interface_implements_interface_cyclic.expected");
    test_fixture(transform_fixture, file!(), "validate_interface_implements_interface_cyclic.graphql", "validate_schema/fixtures/validate_interface_implements_interface_cyclic.expected", input, expected).await;
}

#[tokio::test]
async fn validate_object() {
    let input = include_str!("validate_schema/fixtures/validate_object.graphql");
    let expected = include_str!("validate_schema/fixtures/validate_object.expected");
    test_fixture(transform_fixture, file!(), "validate_object.graphql", "validate_schema/fixtures/validate_object.expected", input, expected).await;
}

#[tokio::test]
async fn validate_root_types() {
    let input = include_str!("validate_schema/fixtures/validate_root_types.graphql");
    let expected = include_str!("validate_schema/fixtures/validate_root_types.expected");
    test_fixture(transform_fixture, file!(), "validate_root_types.graphql", "validate_schema/fixtures/validate_root_types.expected", input, expected).await;
}

#[tokio::test]
async fn validate_root_types_kind() {
    let input = include_str!("validate_schema/fixtures/validate_root_types_kind.graphql");
    let expected = include_str!("validate_schema/fixtures/validate_root_types_kind.expected");
    test_fixture(transform_fixture, file!(), "validate_root_types_kind.graphql", "validate_schema/fixtures/validate_root_types_kind.expected", input, expected).await;
}

#[tokio::test]
async fn validate_union() {
    let input = include_str!("validate_schema/fixtures/validate_union.graphql");
    let expected = include_str!("validate_schema/fixtures/validate_union.expected");
    test_fixture(transform_fixture, file!(), "validate_union.graphql", "validate_schema/fixtures/validate_union.expected", input, expected).await;
}
