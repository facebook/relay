/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<cc68e9b478ea557582700e72ba9defe2>>
 */

mod inline_fragments;

use inline_fragments::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn inlines_nested_fragments() {
    let input = include_str!("inline_fragments/fixtures/inlines-nested-fragments.graphql");
    let expected = include_str!("inline_fragments/fixtures/inlines-nested-fragments.expected");
    test_fixture(transform_fixture, file!(), "inlines-nested-fragments.graphql", "inline_fragments/fixtures/inlines-nested-fragments.expected", input, expected).await;
}

#[tokio::test]
async fn inlines_with_directive() {
    let input = include_str!("inline_fragments/fixtures/inlines-with-directive.graphql");
    let expected = include_str!("inline_fragments/fixtures/inlines-with-directive.expected");
    test_fixture(transform_fixture, file!(), "inlines-with-directive.graphql", "inline_fragments/fixtures/inlines-with-directive.expected", input, expected).await;
}

#[tokio::test]
async fn skip_impossible_abstract_field_refinements_kept() {
    let input = include_str!("inline_fragments/fixtures/skip-impossible-abstract-field-refinements-kept.graphql");
    let expected = include_str!("inline_fragments/fixtures/skip-impossible-abstract-field-refinements-kept.expected");
    test_fixture(transform_fixture, file!(), "skip-impossible-abstract-field-refinements-kept.graphql", "inline_fragments/fixtures/skip-impossible-abstract-field-refinements-kept.expected", input, expected).await;
}

#[tokio::test]
async fn skip_impossible_abstract_refinement_kept() {
    let input = include_str!("inline_fragments/fixtures/skip-impossible-abstract-refinement-kept.graphql");
    let expected = include_str!("inline_fragments/fixtures/skip-impossible-abstract-refinement-kept.expected");
    test_fixture(transform_fixture, file!(), "skip-impossible-abstract-refinement-kept.graphql", "inline_fragments/fixtures/skip-impossible-abstract-refinement-kept.expected", input, expected).await;
}

#[tokio::test]
async fn skip_impossible_emptied_wrappers_removed() {
    let input = include_str!("inline_fragments/fixtures/skip-impossible-emptied-wrappers-removed.graphql");
    let expected = include_str!("inline_fragments/fixtures/skip-impossible-emptied-wrappers-removed.expected");
    test_fixture(transform_fixture, file!(), "skip-impossible-emptied-wrappers-removed.graphql", "inline_fragments/fixtures/skip-impossible-emptied-wrappers-removed.expected", input, expected).await;
}

#[tokio::test]
async fn skip_impossible_fragment_pruned_per_record() {
    let input = include_str!("inline_fragments/fixtures/skip-impossible-fragment-pruned-per-record.graphql");
    let expected = include_str!("inline_fragments/fixtures/skip-impossible-fragment-pruned-per-record.expected");
    test_fixture(transform_fixture, file!(), "skip-impossible-fragment-pruned-per-record.graphql", "inline_fragments/fixtures/skip-impossible-fragment-pruned-per-record.expected", input, expected).await;
}

#[tokio::test]
async fn skip_impossible_object_refinement_under_object_field() {
    let input = include_str!("inline_fragments/fixtures/skip-impossible-object-refinement-under-object-field.graphql");
    let expected = include_str!("inline_fragments/fixtures/skip-impossible-object-refinement-under-object-field.expected");
    test_fixture(transform_fixture, file!(), "skip-impossible-object-refinement-under-object-field.graphql", "inline_fragments/fixtures/skip-impossible-object-refinement-under-object-field.expected", input, expected).await;
}

#[tokio::test]
async fn skip_impossible_root_refinements_kept() {
    let input = include_str!("inline_fragments/fixtures/skip-impossible-root-refinements-kept.graphql");
    let expected = include_str!("inline_fragments/fixtures/skip-impossible-root-refinements-kept.expected");
    test_fixture(transform_fixture, file!(), "skip-impossible-root-refinements-kept.graphql", "inline_fragments/fixtures/skip-impossible-root-refinements-kept.expected", input, expected).await;
}
