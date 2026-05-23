/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<015f5d0f887cfdca2bff8cd762cc2a55>>
 */

mod apply_fragment_arguments;

use apply_fragment_arguments::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn deletes_empty_fragments() {
    let input = include_str!("apply_fragment_arguments/fixtures/deletes-empty-fragments.graphql");
    let expected = include_str!("apply_fragment_arguments/fixtures/deletes-empty-fragments.expected");
    test_fixture(transform_fixture, file!(), "deletes-empty-fragments.graphql", "apply_fragment_arguments/fixtures/deletes-empty-fragments.expected", input, expected).await;
}

#[tokio::test]
async fn deletes_unreferenced_fragments() {
    let input = include_str!("apply_fragment_arguments/fixtures/deletes-unreferenced-fragments.graphql");
    let expected = include_str!("apply_fragment_arguments/fixtures/deletes-unreferenced-fragments.expected");
    test_fixture(transform_fixture, file!(), "deletes-unreferenced-fragments.graphql", "apply_fragment_arguments/fixtures/deletes-unreferenced-fragments.expected", input, expected).await;
}

#[tokio::test]
async fn empty_selection_constant_include_false_argument() {
    let input = include_str!("apply_fragment_arguments/fixtures/empty-selection-constant-include-false-argument.graphql");
    let expected = include_str!("apply_fragment_arguments/fixtures/empty-selection-constant-include-false-argument.expected");
    test_fixture(transform_fixture, file!(), "empty-selection-constant-include-false-argument.graphql", "apply_fragment_arguments/fixtures/empty-selection-constant-include-false-argument.expected", input, expected).await;
}

#[tokio::test]
async fn empty_selection_constant_skip_true_argument() {
    let input = include_str!("apply_fragment_arguments/fixtures/empty-selection-constant-skip-true-argument.graphql");
    let expected = include_str!("apply_fragment_arguments/fixtures/empty-selection-constant-skip-true-argument.expected");
    test_fixture(transform_fixture, file!(), "empty-selection-constant-skip-true-argument.graphql", "apply_fragment_arguments/fixtures/empty-selection-constant-skip-true-argument.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_include_with_provided_argument() {
    let input = include_str!("apply_fragment_arguments/fixtures/fragment-include-with-provided-argument.graphql");
    let expected = include_str!("apply_fragment_arguments/fixtures/fragment-include-with-provided-argument.expected");
    test_fixture(transform_fixture, file!(), "fragment-include-with-provided-argument.graphql", "apply_fragment_arguments/fixtures/fragment-include-with-provided-argument.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_with_float_argument() {
    let input = include_str!("apply_fragment_arguments/fixtures/fragment-with-float-argument.graphql");
    let expected = include_str!("apply_fragment_arguments/fixtures/fragment-with-float-argument.expected");
    test_fixture(transform_fixture, file!(), "fragment-with-float-argument.graphql", "apply_fragment_arguments/fixtures/fragment-with-float-argument.expected", input, expected).await;
}

#[tokio::test]
async fn inline_fragment_with_provided_argument() {
    let input = include_str!("apply_fragment_arguments/fixtures/inline-fragment-with-provided-argument.graphql");
    let expected = include_str!("apply_fragment_arguments/fixtures/inline-fragment-with-provided-argument.expected");
    test_fixture(transform_fixture, file!(), "inline-fragment-with-provided-argument.graphql", "apply_fragment_arguments/fixtures/inline-fragment-with-provided-argument.expected", input, expected).await;
}

#[tokio::test]
async fn inlines_fragment_arguments() {
    let input = include_str!("apply_fragment_arguments/fixtures/inlines-fragment-arguments.graphql");
    let expected = include_str!("apply_fragment_arguments/fixtures/inlines-fragment-arguments.expected");
    test_fixture(transform_fixture, file!(), "inlines-fragment-arguments.graphql", "apply_fragment_arguments/fixtures/inlines-fragment-arguments.expected", input, expected).await;
}

#[tokio::test]
async fn inlines_literal_fragment_arguments() {
    let input = include_str!("apply_fragment_arguments/fixtures/inlines-literal-fragment-arguments.graphql");
    let expected = include_str!("apply_fragment_arguments/fixtures/inlines-literal-fragment-arguments.expected");
    test_fixture(transform_fixture, file!(), "inlines-literal-fragment-arguments.graphql", "apply_fragment_arguments/fixtures/inlines-literal-fragment-arguments.expected", input, expected).await;
}

#[tokio::test]
async fn merges_identical_fragments() {
    let input = include_str!("apply_fragment_arguments/fixtures/merges-identical-fragments.graphql");
    let expected = include_str!("apply_fragment_arguments/fixtures/merges-identical-fragments.expected");
    test_fixture(transform_fixture, file!(), "merges-identical-fragments.graphql", "apply_fragment_arguments/fixtures/merges-identical-fragments.expected", input, expected).await;
}

#[tokio::test]
async fn merges_identical_fragments_literal_arguments() {
    let input = include_str!("apply_fragment_arguments/fixtures/merges-identical-fragments-literal-arguments.graphql");
    let expected = include_str!("apply_fragment_arguments/fixtures/merges-identical-fragments-literal-arguments.expected");
    test_fixture(transform_fixture, file!(), "merges-identical-fragments-literal-arguments.graphql", "apply_fragment_arguments/fixtures/merges-identical-fragments-literal-arguments.expected", input, expected).await;
}

#[tokio::test]
async fn multiple_queries_with_provided_argument() {
    let input = include_str!("apply_fragment_arguments/fixtures/multiple-queries-with-provided-argument.graphql");
    let expected = include_str!("apply_fragment_arguments/fixtures/multiple-queries-with-provided-argument.expected");
    test_fixture(transform_fixture, file!(), "multiple-queries-with-provided-argument.graphql", "apply_fragment_arguments/fixtures/multiple-queries-with-provided-argument.expected", input, expected).await;
}

#[tokio::test]
async fn noncyclic_fragment_with_provided_argument() {
    let input = include_str!("apply_fragment_arguments/fixtures/noncyclic-fragment-with-provided-argument.graphql");
    let expected = include_str!("apply_fragment_arguments/fixtures/noncyclic-fragment-with-provided-argument.expected");
    test_fixture(transform_fixture, file!(), "noncyclic-fragment-with-provided-argument.graphql", "apply_fragment_arguments/fixtures/noncyclic-fragment-with-provided-argument.expected", input, expected).await;
}

#[tokio::test]
async fn rejects_cyclic_fragments_invalid() {
    let input = include_str!("apply_fragment_arguments/fixtures/rejects-cyclic-fragments.invalid.graphql");
    let expected = include_str!("apply_fragment_arguments/fixtures/rejects-cyclic-fragments.invalid.expected");
    test_fixture(transform_fixture, file!(), "rejects-cyclic-fragments.invalid.graphql", "apply_fragment_arguments/fixtures/rejects-cyclic-fragments.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn uses_defaults_for_literal_null_arguments() {
    let input = include_str!("apply_fragment_arguments/fixtures/uses-defaults-for-literal-null-arguments.graphql");
    let expected = include_str!("apply_fragment_arguments/fixtures/uses-defaults-for-literal-null-arguments.expected");
    test_fixture(transform_fixture, file!(), "uses-defaults-for-literal-null-arguments.graphql", "apply_fragment_arguments/fixtures/uses-defaults-for-literal-null-arguments.expected", input, expected).await;
}
