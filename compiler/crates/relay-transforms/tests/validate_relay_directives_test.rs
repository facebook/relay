/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<2df264bee52e84eb0dc28b2c098e73ad>>
 */

mod validate_relay_directives;

use validate_relay_directives::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn mask_incompatible_type_invalid() {
    let input = include_str!("validate_relay_directives/fixtures/mask-incompatible-type-invalid.graphql");
    let expected = include_str!("validate_relay_directives/fixtures/mask-incompatible-type-invalid.expected");
    test_fixture(transform_fixture, file!(), "mask-incompatible-type-invalid.graphql", "validate_relay_directives/fixtures/mask-incompatible-type-invalid.expected", input, expected).await;
}

#[tokio::test]
async fn mask_incompatible_type_invalid2() {
    let input = include_str!("validate_relay_directives/fixtures/mask-incompatible-type-invalid2.graphql");
    let expected = include_str!("validate_relay_directives/fixtures/mask-incompatible-type-invalid2.expected");
    test_fixture(transform_fixture, file!(), "mask-incompatible-type-invalid2.graphql", "validate_relay_directives/fixtures/mask-incompatible-type-invalid2.expected", input, expected).await;
}

#[tokio::test]
async fn mask_incompatible_type_query_invalid() {
    let input = include_str!("validate_relay_directives/fixtures/mask-incompatible-type-query.invalid.graphql");
    let expected = include_str!("validate_relay_directives/fixtures/mask-incompatible-type-query.invalid.expected");
    test_fixture(transform_fixture, file!(), "mask-incompatible-type-query.invalid.graphql", "validate_relay_directives/fixtures/mask-incompatible-type-query.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn mask_mixed_local_root_invalid() {
    let input = include_str!("validate_relay_directives/fixtures/mask-mixed-local-root-invalid.graphql");
    let expected = include_str!("validate_relay_directives/fixtures/mask-mixed-local-root-invalid.expected");
    test_fixture(transform_fixture, file!(), "mask-mixed-local-root-invalid.graphql", "validate_relay_directives/fixtures/mask-mixed-local-root-invalid.expected", input, expected).await;
}

#[tokio::test]
async fn mask_mixed_null() {
    let input = include_str!("validate_relay_directives/fixtures/mask-mixed-null.graphql");
    let expected = include_str!("validate_relay_directives/fixtures/mask-mixed-null.expected");
    test_fixture(transform_fixture, file!(), "mask-mixed-null.graphql", "validate_relay_directives/fixtures/mask-mixed-null.expected", input, expected).await;
}

#[tokio::test]
async fn plural_fragment() {
    let input = include_str!("validate_relay_directives/fixtures/plural-fragment.graphql");
    let expected = include_str!("validate_relay_directives/fixtures/plural-fragment.expected");
    test_fixture(transform_fixture, file!(), "plural-fragment.graphql", "validate_relay_directives/fixtures/plural-fragment.expected", input, expected).await;
}

#[tokio::test]
async fn plural_fragment_variables_invalid() {
    let input = include_str!("validate_relay_directives/fixtures/plural-fragment-variables.invalid.graphql");
    let expected = include_str!("validate_relay_directives/fixtures/plural-fragment-variables.invalid.expected");
    test_fixture(transform_fixture, file!(), "plural-fragment-variables.invalid.graphql", "validate_relay_directives/fixtures/plural-fragment-variables.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn unmasked_spread() {
    let input = include_str!("validate_relay_directives/fixtures/unmasked-spread.graphql");
    let expected = include_str!("validate_relay_directives/fixtures/unmasked-spread.expected");
    test_fixture(transform_fixture, file!(), "unmasked-spread.graphql", "validate_relay_directives/fixtures/unmasked-spread.expected", input, expected).await;
}

#[tokio::test]
async fn unmasked_spread_unmasked_fragment() {
    let input = include_str!("validate_relay_directives/fixtures/unmasked-spread-unmasked-fragment.graphql");
    let expected = include_str!("validate_relay_directives/fixtures/unmasked-spread-unmasked-fragment.expected");
    test_fixture(transform_fixture, file!(), "unmasked-spread-unmasked-fragment.graphql", "validate_relay_directives/fixtures/unmasked-spread-unmasked-fragment.expected", input, expected).await;
}

#[tokio::test]
async fn unmasked_spread_with_argument_definition_invalid() {
    let input = include_str!("validate_relay_directives/fixtures/unmasked-spread-with-argument-definition.invalid.graphql");
    let expected = include_str!("validate_relay_directives/fixtures/unmasked-spread-with-argument-definition.invalid.expected");
    test_fixture(transform_fixture, file!(), "unmasked-spread-with-argument-definition.invalid.graphql", "validate_relay_directives/fixtures/unmasked-spread-with-argument-definition.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn unmasked_spread_with_directive_invalid() {
    let input = include_str!("validate_relay_directives/fixtures/unmasked-spread-with-directive.invalid.graphql");
    let expected = include_str!("validate_relay_directives/fixtures/unmasked-spread-with-directive.invalid.expected");
    test_fixture(transform_fixture, file!(), "unmasked-spread-with-directive.invalid.graphql", "validate_relay_directives/fixtures/unmasked-spread-with-directive.invalid.expected", input, expected).await;
}
