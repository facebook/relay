/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b80ed8000fcf7a5b3f5fc35428a84d2f>>
 */

mod generate_relay_resolvers_operations_for_nested_objects;

use generate_relay_resolvers_operations_for_nested_objects::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn output_type_client_type() {
    let input = include_str!("generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-client-type.graphql");
    let expected = include_str!("generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-client-type.expected");
    test_fixture(transform_fixture, file!(), "output-type-client-type.graphql", "generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-client-type.expected", input, expected).await;
}

#[tokio::test]
async fn output_type_input_invalid() {
    let input = include_str!("generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-input.invalid.graphql");
    let expected = include_str!("generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-input.invalid.expected");
    test_fixture(transform_fixture, file!(), "output-type-input.invalid.graphql", "generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-input.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn output_type_scalar() {
    let input = include_str!("generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-scalar.graphql");
    let expected = include_str!("generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-scalar.expected");
    test_fixture(transform_fixture, file!(), "output-type-scalar.graphql", "generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-scalar.expected", input, expected).await;
}

#[tokio::test]
async fn output_type_with_arguments() {
    let input = include_str!("generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-with-arguments.graphql");
    let expected = include_str!("generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-with-arguments.expected");
    test_fixture(transform_fixture, file!(), "output-type-with-arguments.graphql", "generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-with-arguments.expected", input, expected).await;
}

#[tokio::test]
async fn output_type_with_client_interface() {
    let input = include_str!("generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-with-client-interface.graphql");
    let expected = include_str!("generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-with-client-interface.expected");
    test_fixture(transform_fixture, file!(), "output-type-with-client-interface.graphql", "generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-with-client-interface.expected", input, expected).await;
}

#[tokio::test]
async fn output_type_with_client_interface_and_object_recursion_invalid() {
    let input = include_str!("generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-with-client-interface-and-object-recursion.invalid.graphql");
    let expected = include_str!("generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-with-client-interface-and-object-recursion.invalid.expected");
    test_fixture(transform_fixture, file!(), "output-type-with-client-interface-and-object-recursion.invalid.graphql", "generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-with-client-interface-and-object-recursion.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn output_type_with_client_interface_recursion_invalid() {
    let input = include_str!("generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-with-client-interface-recursion.invalid.graphql");
    let expected = include_str!("generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-with-client-interface-recursion.invalid.expected");
    test_fixture(transform_fixture, file!(), "output-type-with-client-interface-recursion.invalid.graphql", "generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-with-client-interface-recursion.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn output_type_with_id() {
    let input = include_str!("generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-with-id.graphql");
    let expected = include_str!("generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-with-id.expected");
    test_fixture(transform_fixture, file!(), "output-type-with-id.graphql", "generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-with-id.expected", input, expected).await;
}

#[tokio::test]
async fn output_type_with_interface_recursion_but_lying_client_type() {
    let input = include_str!("generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-with-interface-recursion-but-lying-client-type.graphql");
    let expected = include_str!("generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-with-interface-recursion-but-lying-client-type.expected");
    test_fixture(transform_fixture, file!(), "output-type-with-interface-recursion-but-lying-client-type.graphql", "generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-with-interface-recursion-but-lying-client-type.expected", input, expected).await;
}

#[tokio::test]
async fn output_type_with_nested_recursion() {
    let input = include_str!("generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-with-nested-recursion.graphql");
    let expected = include_str!("generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-with-nested-recursion.expected");
    test_fixture(transform_fixture, file!(), "output-type-with-nested-recursion.graphql", "generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-with-nested-recursion.expected", input, expected).await;
}

#[tokio::test]
async fn output_type_with_nested_server_object() {
    let input = include_str!("generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-with-nested-server-object.graphql");
    let expected = include_str!("generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-with-nested-server-object.expected");
    test_fixture(transform_fixture, file!(), "output-type-with-nested-server-object.graphql", "generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-with-nested-server-object.expected", input, expected).await;
}

#[tokio::test]
async fn output_type_with_recursion() {
    let input = include_str!("generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-with-recursion.graphql");
    let expected = include_str!("generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-with-recursion.expected");
    test_fixture(transform_fixture, file!(), "output-type-with-recursion.graphql", "generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-with-recursion.expected", input, expected).await;
}

#[tokio::test]
async fn output_type_with_relay_resolver_fields() {
    let input = include_str!("generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-with-relay-resolver-fields.graphql");
    let expected = include_str!("generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-with-relay-resolver-fields.expected");
    test_fixture(transform_fixture, file!(), "output-type-with-relay-resolver-fields.graphql", "generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-with-relay-resolver-fields.expected", input, expected).await;
}

#[tokio::test]
async fn output_type_with_server_interface_invalid() {
    let input = include_str!("generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-with-server-interface.invalid.graphql");
    let expected = include_str!("generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-with-server-interface.invalid.expected");
    test_fixture(transform_fixture, file!(), "output-type-with-server-interface.invalid.graphql", "generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-with-server-interface.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn output_type_with_server_object() {
    let input = include_str!("generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-with-server-object.graphql");
    let expected = include_str!("generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-with-server-object.expected");
    test_fixture(transform_fixture, file!(), "output-type-with-server-object.graphql", "generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-with-server-object.expected", input, expected).await;
}

#[tokio::test]
async fn output_type_with_type_with_id() {
    let input = include_str!("generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-with-type-with-id.graphql");
    let expected = include_str!("generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-with-type-with-id.expected");
    test_fixture(transform_fixture, file!(), "output-type-with-type-with-id.graphql", "generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-with-type-with-id.expected", input, expected).await;
}

#[tokio::test]
async fn output_type_with_unimplemented_interface_invalid() {
    let input = include_str!("generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-with-unimplemented-interface.invalid.graphql");
    let expected = include_str!("generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-with-unimplemented-interface.invalid.expected");
    test_fixture(transform_fixture, file!(), "output-type-with-unimplemented-interface.invalid.graphql", "generate_relay_resolvers_operations_for_nested_objects/fixtures/output-type-with-unimplemented-interface.invalid.expected", input, expected).await;
}
