/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<424418c51b45b6086d00947be17a05cd>>
 */

mod updatable_directive;

use updatable_directive::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn assignable_fragment_spread_not_subtype_invalid() {
    let input = include_str!("updatable_directive/fixtures/assignable-fragment-spread-not-subtype.invalid.graphql");
    let expected = include_str!("updatable_directive/fixtures/assignable-fragment-spread-not-subtype.invalid.expected");
    test_fixture(transform_fixture, file!(), "assignable-fragment-spread-not-subtype.invalid.graphql", "updatable_directive/fixtures/assignable-fragment-spread-not-subtype.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn assignable_fragment_spreads() {
    let input = include_str!("updatable_directive/fixtures/assignable-fragment-spreads.graphql");
    let expected = include_str!("updatable_directive/fixtures/assignable-fragment-spreads.expected");
    test_fixture(transform_fixture, file!(), "assignable-fragment-spreads.graphql", "updatable_directive/fixtures/assignable-fragment-spreads.expected", input, expected).await;
}

#[tokio::test]
async fn client_side_updatable() {
    let input = include_str!("updatable_directive/fixtures/client-side-updatable.graphql");
    let expected = include_str!("updatable_directive/fixtures/client-side-updatable.expected");
    test_fixture(transform_fixture, file!(), "client-side-updatable.graphql", "updatable_directive/fixtures/client-side-updatable.expected", input, expected).await;
}

#[tokio::test]
async fn dangerously_unaliased_allowed() {
    let input = include_str!("updatable_directive/fixtures/dangerously-unaliased-allowed.graphql");
    let expected = include_str!("updatable_directive/fixtures/dangerously-unaliased-allowed.expected");
    test_fixture(transform_fixture, file!(), "dangerously-unaliased-allowed.graphql", "updatable_directive/fixtures/dangerously-unaliased-allowed.expected", input, expected).await;
}

#[tokio::test]
async fn directive_fragment_spread_invalid() {
    let input = include_str!("updatable_directive/fixtures/directive-fragment-spread.invalid.graphql");
    let expected = include_str!("updatable_directive/fixtures/directive-fragment-spread.invalid.expected");
    test_fixture(transform_fixture, file!(), "directive-fragment-spread.invalid.graphql", "updatable_directive/fixtures/directive-fragment-spread.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn directive_inline_fragment_invalid() {
    let input = include_str!("updatable_directive/fixtures/directive-inline-fragment.invalid.graphql");
    let expected = include_str!("updatable_directive/fixtures/directive-inline-fragment.invalid.expected");
    test_fixture(transform_fixture, file!(), "directive-inline-fragment.invalid.graphql", "updatable_directive/fixtures/directive-inline-fragment.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn directive_linked_field_invalid() {
    let input = include_str!("updatable_directive/fixtures/directive-linked-field.invalid.graphql");
    let expected = include_str!("updatable_directive/fixtures/directive-linked-field.invalid.expected");
    test_fixture(transform_fixture, file!(), "directive-linked-field.invalid.graphql", "updatable_directive/fixtures/directive-linked-field.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn directive_query_invalid() {
    let input = include_str!("updatable_directive/fixtures/directive-query.invalid.graphql");
    let expected = include_str!("updatable_directive/fixtures/directive-query.invalid.expected");
    test_fixture(transform_fixture, file!(), "directive-query.invalid.graphql", "updatable_directive/fixtures/directive-query.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn directive_scalar_field_invalid() {
    let input = include_str!("updatable_directive/fixtures/directive-scalar-field.invalid.graphql");
    let expected = include_str!("updatable_directive/fixtures/directive-scalar-field.invalid.expected");
    test_fixture(transform_fixture, file!(), "directive-scalar-field.invalid.graphql", "updatable_directive/fixtures/directive-scalar-field.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn doubly_nested_fragment_spread_invalid() {
    let input = include_str!("updatable_directive/fixtures/doubly-nested-fragment-spread.invalid.graphql");
    let expected = include_str!("updatable_directive/fixtures/doubly-nested-fragment-spread.invalid.expected");
    test_fixture(transform_fixture, file!(), "doubly-nested-fragment-spread.invalid.graphql", "updatable_directive/fixtures/doubly-nested-fragment-spread.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn include_invalid() {
    let input = include_str!("updatable_directive/fixtures/include.invalid.graphql");
    let expected = include_str!("updatable_directive/fixtures/include.invalid.expected");
    test_fixture(transform_fixture, file!(), "include.invalid.graphql", "updatable_directive/fixtures/include.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn inline_fragment() {
    let input = include_str!("updatable_directive/fixtures/inline-fragment.graphql");
    let expected = include_str!("updatable_directive/fixtures/inline-fragment.expected");
    test_fixture(transform_fixture, file!(), "inline-fragment.graphql", "updatable_directive/fixtures/inline-fragment.expected", input, expected).await;
}

#[tokio::test]
async fn inline_fragment_concrete_type_to_concrete_type_invalid() {
    let input = include_str!("updatable_directive/fixtures/inline-fragment-concrete-type-to-concrete-type.invalid.graphql");
    let expected = include_str!("updatable_directive/fixtures/inline-fragment-concrete-type-to-concrete-type.invalid.expected");
    test_fixture(transform_fixture, file!(), "inline-fragment-concrete-type-to-concrete-type.invalid.graphql", "updatable_directive/fixtures/inline-fragment-concrete-type-to-concrete-type.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn inline_fragment_concrete_type_to_interface_invalid() {
    let input = include_str!("updatable_directive/fixtures/inline-fragment-concrete-type-to-interface.invalid.graphql");
    let expected = include_str!("updatable_directive/fixtures/inline-fragment-concrete-type-to-interface.invalid.expected");
    test_fixture(transform_fixture, file!(), "inline-fragment-concrete-type-to-interface.invalid.graphql", "updatable_directive/fixtures/inline-fragment-concrete-type-to-interface.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn inline_fragment_interface_to_interface_invalid() {
    let input = include_str!("updatable_directive/fixtures/inline-fragment-interface-to-interface.invalid.graphql");
    let expected = include_str!("updatable_directive/fixtures/inline-fragment-interface-to-interface.invalid.expected");
    test_fixture(transform_fixture, file!(), "inline-fragment-interface-to-interface.invalid.graphql", "updatable_directive/fixtures/inline-fragment-interface-to-interface.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn inline_fragment_redundant_invalid() {
    let input = include_str!("updatable_directive/fixtures/inline-fragment-redundant.invalid.graphql");
    let expected = include_str!("updatable_directive/fixtures/inline-fragment-redundant.invalid.expected");
    test_fixture(transform_fixture, file!(), "inline-fragment-redundant.invalid.graphql", "updatable_directive/fixtures/inline-fragment-redundant.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn non_assignable_fragment_spreads_invalid() {
    let input = include_str!("updatable_directive/fixtures/non-assignable-fragment-spreads.invalid.graphql");
    let expected = include_str!("updatable_directive/fixtures/non-assignable-fragment-spreads.invalid.expected");
    test_fixture(transform_fixture, file!(), "non-assignable-fragment-spreads.invalid.graphql", "updatable_directive/fixtures/non-assignable-fragment-spreads.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn required_invalid() {
    let input = include_str!("updatable_directive/fixtures/required.invalid.graphql");
    let expected = include_str!("updatable_directive/fixtures/required.invalid.expected");
    test_fixture(transform_fixture, file!(), "required.invalid.graphql", "updatable_directive/fixtures/required.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn resolver_linked_invalid() {
    let input = include_str!("updatable_directive/fixtures/resolver-linked.invalid.graphql");
    let expected = include_str!("updatable_directive/fixtures/resolver-linked.invalid.expected");
    test_fixture(transform_fixture, file!(), "resolver-linked.invalid.graphql", "updatable_directive/fixtures/resolver-linked.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn resolver_scalar_invalid() {
    let input = include_str!("updatable_directive/fixtures/resolver-scalar.invalid.graphql");
    let expected = include_str!("updatable_directive/fixtures/resolver-scalar.invalid.expected");
    test_fixture(transform_fixture, file!(), "resolver-scalar.invalid.graphql", "updatable_directive/fixtures/resolver-scalar.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn skip_invalid() {
    let input = include_str!("updatable_directive/fixtures/skip.invalid.graphql");
    let expected = include_str!("updatable_directive/fixtures/skip.invalid.expected");
    test_fixture(transform_fixture, file!(), "skip.invalid.graphql", "updatable_directive/fixtures/skip.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn type_narrowing() {
    let input = include_str!("updatable_directive/fixtures/type-narrowing.graphql");
    let expected = include_str!("updatable_directive/fixtures/type-narrowing.expected");
    test_fixture(transform_fixture, file!(), "type-narrowing.graphql", "updatable_directive/fixtures/type-narrowing.expected", input, expected).await;
}

#[tokio::test]
async fn updatable_fragment() {
    let input = include_str!("updatable_directive/fixtures/updatable-fragment.graphql");
    let expected = include_str!("updatable_directive/fixtures/updatable-fragment.expected");
    test_fixture(transform_fixture, file!(), "updatable-fragment.graphql", "updatable_directive/fixtures/updatable-fragment.expected", input, expected).await;
}
