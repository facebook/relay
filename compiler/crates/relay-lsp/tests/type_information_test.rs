/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<89c0ff202d14ceb8f11c8939487f8f60>>
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
async fn filter_case_insensitive() {
    let input = include_str!("type_information/fixtures/filter_case_insensitive.json");
    let expected = include_str!("type_information/fixtures/filter_case_insensitive.expected");
    test_fixture(transform_fixture, file!(), "filter_case_insensitive.json", "type_information/fixtures/filter_case_insensitive.expected", input, expected).await;
}

#[tokio::test]
async fn filter_no_matches() {
    let input = include_str!("type_information/fixtures/filter_no_matches.json");
    let expected = include_str!("type_information/fixtures/filter_no_matches.expected");
    test_fixture(transform_fixture, file!(), "filter_no_matches.json", "type_information/fixtures/filter_no_matches.expected", input, expected).await;
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
async fn massive_type_filtered() {
    let input = include_str!("type_information/fixtures/massive_type_filtered.json");
    let expected = include_str!("type_information/fixtures/massive_type_filtered.expected");
    test_fixture(transform_fixture, file!(), "massive_type_filtered.json", "type_information/fixtures/massive_type_filtered.expected", input, expected).await;
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
