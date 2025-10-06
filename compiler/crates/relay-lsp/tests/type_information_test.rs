/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<5b3aa2445864fb8afa02cfe0a5778895>>
 */

mod type_information;

use type_information::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn enum_type() {
    let input = include_str!("type_information/fixtures/enum_type.json");
    let expected = include_str!("type_information/fixtures/enum_type.expected");
    test_fixture(transform_fixture, file!(), "enum_type.json", "type_information/fixtures/enum_type.expected", input, expected).await;
}

#[tokio::test]
async fn input_object() {
    let input = include_str!("type_information/fixtures/input_object.json");
    let expected = include_str!("type_information/fixtures/input_object.expected");
    test_fixture(transform_fixture, file!(), "input_object.json", "type_information/fixtures/input_object.expected", input, expected).await;
}

#[tokio::test]
async fn interface_type() {
    let input = include_str!("type_information/fixtures/interface_type.json");
    let expected = include_str!("type_information/fixtures/interface_type.expected");
    test_fixture(transform_fixture, file!(), "interface_type.json", "type_information/fixtures/interface_type.expected", input, expected).await;
}

#[tokio::test]
async fn interface_with_implements() {
    let input = include_str!("type_information/fixtures/interface_with_implements.json");
    let expected = include_str!("type_information/fixtures/interface_with_implements.expected");
    test_fixture(transform_fixture, file!(), "interface_with_implements.json", "type_information/fixtures/interface_with_implements.expected", input, expected).await;
}

#[tokio::test]
async fn massive_type() {
    let input = include_str!("type_information/fixtures/massive_type.json");
    let expected = include_str!("type_information/fixtures/massive_type.expected");
    test_fixture(transform_fixture, file!(), "massive_type.json", "type_information/fixtures/massive_type.expected", input, expected).await;
}

#[tokio::test]
async fn object_type() {
    let input = include_str!("type_information/fixtures/object_type.json");
    let expected = include_str!("type_information/fixtures/object_type.expected");
    test_fixture(transform_fixture, file!(), "object_type.json", "type_information/fixtures/object_type.expected", input, expected).await;
}

#[tokio::test]
async fn scalar_type() {
    let input = include_str!("type_information/fixtures/scalar_type.json");
    let expected = include_str!("type_information/fixtures/scalar_type.expected");
    test_fixture(transform_fixture, file!(), "scalar_type.json", "type_information/fixtures/scalar_type.expected", input, expected).await;
}

#[tokio::test]
async fn union_type() {
    let input = include_str!("type_information/fixtures/union_type.json");
    let expected = include_str!("type_information/fixtures/union_type.expected");
    test_fixture(transform_fixture, file!(), "union_type.json", "type_information/fixtures/union_type.expected", input, expected).await;
}
