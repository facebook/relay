/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<8f017f687ee7cc87942c4c22f19d0722>>
 */

mod match_transform;

use match_transform::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn direct_js_field_invalid() {
    let input = include_str!("match_transform/fixtures/direct-js-field.invalid.graphql");
    let expected = include_str!("match_transform/fixtures/direct-js-field.invalid.expected");
    test_fixture(transform_fixture, "direct-js-field.invalid.graphql", "match_transform/fixtures/direct-js-field.invalid.expected", input, expected);
}

#[test]
fn invalid_match_type() {
    let input = include_str!("match_transform/fixtures/invalid-match-type.graphql");
    let expected = include_str!("match_transform/fixtures/invalid-match-type.expected");
    test_fixture(transform_fixture, "invalid-match-type.graphql", "match_transform/fixtures/invalid-match-type.expected", input, expected);
}

#[test]
fn invalid_no_matches() {
    let input = include_str!("match_transform/fixtures/invalid-no-matches.graphql");
    let expected = include_str!("match_transform/fixtures/invalid-no-matches.expected");
    test_fixture(transform_fixture, "invalid-no-matches.graphql", "match_transform/fixtures/invalid-no-matches.expected", input, expected);
}

#[test]
fn invalid_non_empty_selections() {
    let input = include_str!("match_transform/fixtures/invalid-non-empty-selections.graphql");
    let expected = include_str!("match_transform/fixtures/invalid-non-empty-selections.expected");
    test_fixture(transform_fixture, "invalid-non-empty-selections.graphql", "match_transform/fixtures/invalid-non-empty-selections.expected", input, expected);
}

#[test]
fn match_on_child_of_plural() {
    let input = include_str!("match_transform/fixtures/match-on-child-of-plural.graphql");
    let expected = include_str!("match_transform/fixtures/match-on-child-of-plural.expected");
    test_fixture(transform_fixture, "match-on-child-of-plural.graphql", "match_transform/fixtures/match-on-child-of-plural.expected", input, expected);
}

#[test]
fn match_with_explicit_support_arg_invalid() {
    let input = include_str!("match_transform/fixtures/match-with-explicit-support-arg.invalid.graphql");
    let expected = include_str!("match_transform/fixtures/match-with-explicit-support-arg.invalid.expected");
    test_fixture(transform_fixture, "match-with-explicit-support-arg.invalid.graphql", "match_transform/fixtures/match-with-explicit-support-arg.invalid.expected", input, expected);
}

#[test]
fn match_with_extra_args() {
    let input = include_str!("match_transform/fixtures/match-with-extra-args.graphql");
    let expected = include_str!("match_transform/fixtures/match-with-extra-args.expected");
    test_fixture(transform_fixture, "match-with-extra-args.graphql", "match_transform/fixtures/match-with-extra-args.expected", input, expected);
}

#[test]
fn module_on_inline_data_invalid() {
    let input = include_str!("match_transform/fixtures/module-on-inline-data.invalid.graphql");
    let expected = include_str!("match_transform/fixtures/module-on-inline-data.invalid.expected");
    test_fixture(transform_fixture, "module-on-inline-data.invalid.graphql", "match_transform/fixtures/module-on-inline-data.invalid.expected", input, expected);
}

#[test]
fn module_with_other_directives_invalid() {
    let input = include_str!("match_transform/fixtures/module-with-other-directives.invalid.graphql");
    let expected = include_str!("match_transform/fixtures/module-with-other-directives.invalid.expected");
    test_fixture(transform_fixture, "module-with-other-directives.invalid.graphql", "match_transform/fixtures/module-with-other-directives.invalid.expected", input, expected);
}

#[test]
fn module_without_match() {
    let input = include_str!("match_transform/fixtures/module-without-match.graphql");
    let expected = include_str!("match_transform/fixtures/module-without-match.expected");
    test_fixture(transform_fixture, "module-without-match.graphql", "match_transform/fixtures/module-without-match.expected", input, expected);
}

#[test]
fn no_server_supported_arg_invalid() {
    let input = include_str!("match_transform/fixtures/no-server-supported-arg.invalid.graphql");
    let expected = include_str!("match_transform/fixtures/no-server-supported-arg.invalid.expected");
    test_fixture(transform_fixture, "no-server-supported-arg.invalid.graphql", "match_transform/fixtures/no-server-supported-arg.invalid.expected", input, expected);
}

#[test]
fn relay_match_on_interface() {
    let input = include_str!("match_transform/fixtures/relay-match-on-interface.graphql");
    let expected = include_str!("match_transform/fixtures/relay-match-on-interface.expected");
    test_fixture(transform_fixture, "relay-match-on-interface.graphql", "match_transform/fixtures/relay-match-on-interface.expected", input, expected);
}

#[test]
fn relay_match_on_union() {
    let input = include_str!("match_transform/fixtures/relay-match-on-union.graphql");
    let expected = include_str!("match_transform/fixtures/relay-match-on-union.expected");
    test_fixture(transform_fixture, "relay-match-on-union.graphql", "match_transform/fixtures/relay-match-on-union.expected", input, expected);
}

#[test]
fn relay_match_on_union_plural() {
    let input = include_str!("match_transform/fixtures/relay-match-on-union-plural.graphql");
    let expected = include_str!("match_transform/fixtures/relay-match-on-union-plural.expected");
    test_fixture(transform_fixture, "relay-match-on-union-plural.graphql", "match_transform/fixtures/relay-match-on-union-plural.expected", input, expected);
}
