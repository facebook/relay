/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<820058c64181406d53ecd592a4b8e4a7>>
 */

mod validate_relay_directives;

use validate_relay_directives::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn mask_incompatible_type_invalid() {
    let input = include_str!("validate_relay_directives/fixtures/mask-incompatible-type-invalid.graphql");
    let expected = include_str!("validate_relay_directives/fixtures/mask-incompatible-type-invalid.expected");
    test_fixture(transform_fixture, "mask-incompatible-type-invalid.graphql", "validate_relay_directives/fixtures/mask-incompatible-type-invalid.expected", input, expected);
}

#[test]
fn mask_incompatible_type_invalid2() {
    let input = include_str!("validate_relay_directives/fixtures/mask-incompatible-type-invalid2.graphql");
    let expected = include_str!("validate_relay_directives/fixtures/mask-incompatible-type-invalid2.expected");
    test_fixture(transform_fixture, "mask-incompatible-type-invalid2.graphql", "validate_relay_directives/fixtures/mask-incompatible-type-invalid2.expected", input, expected);
}

#[test]
fn mask_incompatible_type_query_invalid() {
    let input = include_str!("validate_relay_directives/fixtures/mask-incompatible-type-query.invalid.graphql");
    let expected = include_str!("validate_relay_directives/fixtures/mask-incompatible-type-query.invalid.expected");
    test_fixture(transform_fixture, "mask-incompatible-type-query.invalid.graphql", "validate_relay_directives/fixtures/mask-incompatible-type-query.invalid.expected", input, expected);
}

#[test]
fn mask_mixed_local_root_invalid() {
    let input = include_str!("validate_relay_directives/fixtures/mask-mixed-local-root-invalid.graphql");
    let expected = include_str!("validate_relay_directives/fixtures/mask-mixed-local-root-invalid.expected");
    test_fixture(transform_fixture, "mask-mixed-local-root-invalid.graphql", "validate_relay_directives/fixtures/mask-mixed-local-root-invalid.expected", input, expected);
}

#[test]
fn mask_mixed_null() {
    let input = include_str!("validate_relay_directives/fixtures/mask-mixed-null.graphql");
    let expected = include_str!("validate_relay_directives/fixtures/mask-mixed-null.expected");
    test_fixture(transform_fixture, "mask-mixed-null.graphql", "validate_relay_directives/fixtures/mask-mixed-null.expected", input, expected);
}

#[test]
fn plural_fragment() {
    let input = include_str!("validate_relay_directives/fixtures/plural-fragment.graphql");
    let expected = include_str!("validate_relay_directives/fixtures/plural-fragment.expected");
    test_fixture(transform_fixture, "plural-fragment.graphql", "validate_relay_directives/fixtures/plural-fragment.expected", input, expected);
}

#[test]
fn plural_fragment_variables_invalid() {
    let input = include_str!("validate_relay_directives/fixtures/plural-fragment-variables.invalid.graphql");
    let expected = include_str!("validate_relay_directives/fixtures/plural-fragment-variables.invalid.expected");
    test_fixture(transform_fixture, "plural-fragment-variables.invalid.graphql", "validate_relay_directives/fixtures/plural-fragment-variables.invalid.expected", input, expected);
}

#[test]
fn unmasked_spread() {
    let input = include_str!("validate_relay_directives/fixtures/unmasked-spread.graphql");
    let expected = include_str!("validate_relay_directives/fixtures/unmasked-spread.expected");
    test_fixture(transform_fixture, "unmasked-spread.graphql", "validate_relay_directives/fixtures/unmasked-spread.expected", input, expected);
}

#[test]
fn unmasked_spread_with_argument_definition_invalid() {
    let input = include_str!("validate_relay_directives/fixtures/unmasked-spread-with-argument-definition.invalid.graphql");
    let expected = include_str!("validate_relay_directives/fixtures/unmasked-spread-with-argument-definition.invalid.expected");
    test_fixture(transform_fixture, "unmasked-spread-with-argument-definition.invalid.graphql", "validate_relay_directives/fixtures/unmasked-spread-with-argument-definition.invalid.expected", input, expected);
}

#[test]
fn unmasked_spread_with_directive_invalid() {
    let input = include_str!("validate_relay_directives/fixtures/unmasked-spread-with-directive.invalid.graphql");
    let expected = include_str!("validate_relay_directives/fixtures/unmasked-spread-with-directive.invalid.expected");
    test_fixture(transform_fixture, "unmasked-spread-with-directive.invalid.graphql", "validate_relay_directives/fixtures/unmasked-spread-with-directive.invalid.expected", input, expected);
}
