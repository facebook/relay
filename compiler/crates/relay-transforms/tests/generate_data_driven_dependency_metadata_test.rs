/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<7ec79e515b10d64e946ebcf22ddbf19a>>
 */

mod generate_data_driven_dependency_metadata;

use generate_data_driven_dependency_metadata::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn match_on_child_of_plural() {
    let input = include_str!("generate_data_driven_dependency_metadata/fixtures/match-on-child-of-plural.graphql");
    let expected = include_str!("generate_data_driven_dependency_metadata/fixtures/match-on-child-of-plural.expected");
    test_fixture(transform_fixture, "match-on-child-of-plural.graphql", "generate_data_driven_dependency_metadata/fixtures/match-on-child-of-plural.expected", input, expected);
}

#[test]
fn match_with_extra_args() {
    let input = include_str!("generate_data_driven_dependency_metadata/fixtures/match-with-extra-args.graphql");
    let expected = include_str!("generate_data_driven_dependency_metadata/fixtures/match-with-extra-args.expected");
    test_fixture(transform_fixture, "match-with-extra-args.graphql", "generate_data_driven_dependency_metadata/fixtures/match-with-extra-args.expected", input, expected);
}

#[test]
fn module_without_match() {
    let input = include_str!("generate_data_driven_dependency_metadata/fixtures/module-without-match.graphql");
    let expected = include_str!("generate_data_driven_dependency_metadata/fixtures/module-without-match.expected");
    test_fixture(transform_fixture, "module-without-match.graphql", "generate_data_driven_dependency_metadata/fixtures/module-without-match.expected", input, expected);
}

#[test]
fn relay_match_on_interface() {
    let input = include_str!("generate_data_driven_dependency_metadata/fixtures/relay-match-on-interface.graphql");
    let expected = include_str!("generate_data_driven_dependency_metadata/fixtures/relay-match-on-interface.expected");
    test_fixture(transform_fixture, "relay-match-on-interface.graphql", "generate_data_driven_dependency_metadata/fixtures/relay-match-on-interface.expected", input, expected);
}

#[test]
fn relay_match_on_union() {
    let input = include_str!("generate_data_driven_dependency_metadata/fixtures/relay-match-on-union.graphql");
    let expected = include_str!("generate_data_driven_dependency_metadata/fixtures/relay-match-on-union.expected");
    test_fixture(transform_fixture, "relay-match-on-union.graphql", "generate_data_driven_dependency_metadata/fixtures/relay-match-on-union.expected", input, expected);
}

#[test]
fn relay_match_on_union_plural() {
    let input = include_str!("generate_data_driven_dependency_metadata/fixtures/relay-match-on-union-plural.graphql");
    let expected = include_str!("generate_data_driven_dependency_metadata/fixtures/relay-match-on-union-plural.expected");
    test_fixture(transform_fixture, "relay-match-on-union-plural.graphql", "generate_data_driven_dependency_metadata/fixtures/relay-match-on-union-plural.expected", input, expected);
}
