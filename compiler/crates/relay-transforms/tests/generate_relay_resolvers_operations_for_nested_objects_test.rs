/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<20ab42723e37f4addfe04c564491ca86>>
 */

mod generate_relay_resolvers_operations_for_nested_objects;

use generate_relay_resolvers_operations_for_nested_objects::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn output_type() {
    let input = include_str!("generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type.graphql");
    let expected = include_str!("generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type.expected");
    test_fixture(transform_fixture, "output-type.graphql", "generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type.expected", input, expected);
}

#[test]
fn output_type_input_invalid() {
    let input = include_str!("generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-input.invalid.graphql");
    let expected = include_str!("generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-input.invalid.expected");
    test_fixture(transform_fixture, "output-type-input.invalid.graphql", "generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-input.invalid.expected", input, expected);
}

#[test]
fn output_type_scalar_invalid() {
    let input = include_str!("generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-scalar.invalid.graphql");
    let expected = include_str!("generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-scalar.invalid.expected");
    test_fixture(transform_fixture, "output-type-scalar.invalid.graphql", "generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-scalar.invalid.expected", input, expected);
}

#[test]
fn output_type_with_interface_invalid() {
    let input = include_str!("generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-with-interface.invalid.graphql");
    let expected = include_str!("generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-with-interface.invalid.expected");
    test_fixture(transform_fixture, "output-type-with-interface.invalid.graphql", "generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-with-interface.invalid.expected", input, expected);
}
