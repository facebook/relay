/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<f3abeff8bed19f3dde20e9f5e5394d05>>
 */

mod validate_schema;

use validate_schema::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn validate_directives() {
    let input = include_str!("validate_schema/fixtures/validate_directives.graphql");
    let expected = include_str!("validate_schema/fixtures/validate_directives.expected");
    test_fixture(transform_fixture, "validate_directives.graphql", "validate_schema/fixtures/validate_directives.expected", input, expected);
}

#[test]
fn validate_enum() {
    let input = include_str!("validate_schema/fixtures/validate_enum.graphql");
    let expected = include_str!("validate_schema/fixtures/validate_enum.expected");
    test_fixture(transform_fixture, "validate_enum.graphql", "validate_schema/fixtures/validate_enum.expected", input, expected);
}

#[test]
fn validate_interface_implements_interface_cyclic() {
    let input = include_str!("validate_schema/fixtures/validate_interface_implements_interface_cyclic.graphql");
    let expected = include_str!("validate_schema/fixtures/validate_interface_implements_interface_cyclic.expected");
    test_fixture(transform_fixture, "validate_interface_implements_interface_cyclic.graphql", "validate_schema/fixtures/validate_interface_implements_interface_cyclic.expected", input, expected);
}

#[test]
fn validate_object() {
    let input = include_str!("validate_schema/fixtures/validate_object.graphql");
    let expected = include_str!("validate_schema/fixtures/validate_object.expected");
    test_fixture(transform_fixture, "validate_object.graphql", "validate_schema/fixtures/validate_object.expected", input, expected);
}

#[test]
fn validate_root_types() {
    let input = include_str!("validate_schema/fixtures/validate_root_types.graphql");
    let expected = include_str!("validate_schema/fixtures/validate_root_types.expected");
    test_fixture(transform_fixture, "validate_root_types.graphql", "validate_schema/fixtures/validate_root_types.expected", input, expected);
}

#[test]
fn validate_union() {
    let input = include_str!("validate_schema/fixtures/validate_union.graphql");
    let expected = include_str!("validate_schema/fixtures/validate_union.expected");
    test_fixture(transform_fixture, "validate_union.graphql", "validate_schema/fixtures/validate_union.expected", input, expected);
}
