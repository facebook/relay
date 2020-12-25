/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<d7c16c29bd10615430a1b09fe261a111>>
 */

mod build_schema;

use build_schema::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn directives_for_external_types() {
    let input = include_str!("build_schema/fixtures/directives-for-external-types.graphql");
    let expected = include_str!("build_schema/fixtures/directives-for-external-types.expected");
    test_fixture(transform_fixture, "directives-for-external-types.graphql", "build_schema/fixtures/directives-for-external-types.expected", input, expected);
}

#[test]
fn interface_implements_interface() {
    let input = include_str!("build_schema/fixtures/interface-implements-interface.graphql");
    let expected = include_str!("build_schema/fixtures/interface-implements-interface.expected");
    test_fixture(transform_fixture, "interface-implements-interface.graphql", "build_schema/fixtures/interface-implements-interface.expected", input, expected);
}

#[test]
fn invalid_implements_non_interface() {
    let input = include_str!("build_schema/fixtures/invalid-implements-non-interface.graphql");
    let expected = include_str!("build_schema/fixtures/invalid-implements-non-interface.expected");
    test_fixture(transform_fixture, "invalid-implements-non-interface.graphql", "build_schema/fixtures/invalid-implements-non-interface.expected", input, expected);
}

#[test]
fn invalid_object_extension_duplicated_server_field() {
    let input = include_str!("build_schema/fixtures/invalid-object-extension-duplicated-server-field.graphql");
    let expected = include_str!("build_schema/fixtures/invalid-object-extension-duplicated-server-field.expected");
    test_fixture(transform_fixture, "invalid-object-extension-duplicated-server-field.graphql", "build_schema/fixtures/invalid-object-extension-duplicated-server-field.expected", input, expected);
}

#[test]
fn invalid_object_extension_local_duplicated_fields() {
    let input = include_str!("build_schema/fixtures/invalid-object-extension-local-duplicated-fields.graphql");
    let expected = include_str!("build_schema/fixtures/invalid-object-extension-local-duplicated-fields.expected");
    test_fixture(transform_fixture, "invalid-object-extension-local-duplicated-fields.graphql", "build_schema/fixtures/invalid-object-extension-local-duplicated-fields.expected", input, expected);
}

#[test]
fn invalid_sdl() {
    let input = include_str!("build_schema/fixtures/invalid-sdl.graphql");
    let expected = include_str!("build_schema/fixtures/invalid-sdl.expected");
    test_fixture(transform_fixture, "invalid-sdl.graphql", "build_schema/fixtures/invalid-sdl.expected", input, expected);
}

#[test]
fn invalid_type_reference() {
    let input = include_str!("build_schema/fixtures/invalid-type-reference.graphql");
    let expected = include_str!("build_schema/fixtures/invalid-type-reference.expected");
    test_fixture(transform_fixture, "invalid-type-reference.graphql", "build_schema/fixtures/invalid-type-reference.expected", input, expected);
}

#[test]
fn kitchen_sink() {
    let input = include_str!("build_schema/fixtures/kitchen-sink.graphql");
    let expected = include_str!("build_schema/fixtures/kitchen-sink.expected");
    test_fixture(transform_fixture, "kitchen-sink.graphql", "build_schema/fixtures/kitchen-sink.expected", input, expected);
}
