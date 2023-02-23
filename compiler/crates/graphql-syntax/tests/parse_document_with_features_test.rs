/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<467adf22a47715eb35bf37efa6f69f7f>>
 */

mod parse_document_with_features;

use parse_document_with_features::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn fragment_with_empty_vardefs_invalid() {
    let input = include_str!("parse_document_with_features/fixtures/fragment_with_empty_vardefs.invalid.graphql");
    let expected = include_str!("parse_document_with_features/fixtures/fragment_with_empty_vardefs.invalid.expected");
    test_fixture(transform_fixture, "fragment_with_empty_vardefs.invalid.graphql", "parse_document_with_features/fixtures/fragment_with_empty_vardefs.invalid.expected", input, expected);
}

#[test]
fn fragment_with_variable_defs() {
    let input = include_str!("parse_document_with_features/fixtures/fragment_with_variable_defs.graphql");
    let expected = include_str!("parse_document_with_features/fixtures/fragment_with_variable_defs.expected");
    test_fixture(transform_fixture, "fragment_with_variable_defs.graphql", "parse_document_with_features/fixtures/fragment_with_variable_defs.expected", input, expected);
}

#[test]
fn spread_with_arguments() {
    let input = include_str!("parse_document_with_features/fixtures/spread_with_arguments.graphql");
    let expected = include_str!("parse_document_with_features/fixtures/spread_with_arguments.expected");
    test_fixture(transform_fixture, "spread_with_arguments.graphql", "parse_document_with_features/fixtures/spread_with_arguments.expected", input, expected);
}

#[test]
fn spread_with_empty_arguments_invalid() {
    let input = include_str!("parse_document_with_features/fixtures/spread_with_empty_arguments.invalid.graphql");
    let expected = include_str!("parse_document_with_features/fixtures/spread_with_empty_arguments.invalid.expected");
    test_fixture(transform_fixture, "spread_with_empty_arguments.invalid.graphql", "parse_document_with_features/fixtures/spread_with_empty_arguments.invalid.expected", input, expected);
}
