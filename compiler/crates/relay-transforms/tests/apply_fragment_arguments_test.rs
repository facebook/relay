/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<10714f15064e3e19d5180fc18578b833>>
 */

mod apply_fragment_arguments;

use apply_fragment_arguments::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn deletes_empty_fragments() {
    let input = include_str!("apply_fragment_arguments/fixtures/deletes-empty-fragments.graphql");
    let expected = include_str!("apply_fragment_arguments/fixtures/deletes-empty-fragments.expected");
    test_fixture(transform_fixture, "deletes-empty-fragments.graphql", "apply_fragment_arguments/fixtures/deletes-empty-fragments.expected", input, expected);
}

#[test]
fn deletes_unreferenced_fragments() {
    let input = include_str!("apply_fragment_arguments/fixtures/deletes-unreferenced-fragments.graphql");
    let expected = include_str!("apply_fragment_arguments/fixtures/deletes-unreferenced-fragments.expected");
    test_fixture(transform_fixture, "deletes-unreferenced-fragments.graphql", "apply_fragment_arguments/fixtures/deletes-unreferenced-fragments.expected", input, expected);
}

#[test]
fn fragment_include_with_provided_argument() {
    let input = include_str!("apply_fragment_arguments/fixtures/fragment-include-with-provided-argument.graphql");
    let expected = include_str!("apply_fragment_arguments/fixtures/fragment-include-with-provided-argument.expected");
    test_fixture(transform_fixture, "fragment-include-with-provided-argument.graphql", "apply_fragment_arguments/fixtures/fragment-include-with-provided-argument.expected", input, expected);
}

#[test]
fn fragment_with_float_argument() {
    let input = include_str!("apply_fragment_arguments/fixtures/fragment-with-float-argument.graphql");
    let expected = include_str!("apply_fragment_arguments/fixtures/fragment-with-float-argument.expected");
    test_fixture(transform_fixture, "fragment-with-float-argument.graphql", "apply_fragment_arguments/fixtures/fragment-with-float-argument.expected", input, expected);
}

#[test]
fn inline_fragment_with_provided_argument() {
    let input = include_str!("apply_fragment_arguments/fixtures/inline-fragment-with-provided-argument.graphql");
    let expected = include_str!("apply_fragment_arguments/fixtures/inline-fragment-with-provided-argument.expected");
    test_fixture(transform_fixture, "inline-fragment-with-provided-argument.graphql", "apply_fragment_arguments/fixtures/inline-fragment-with-provided-argument.expected", input, expected);
}

#[test]
fn inlines_fragment_arguments() {
    let input = include_str!("apply_fragment_arguments/fixtures/inlines-fragment-arguments.graphql");
    let expected = include_str!("apply_fragment_arguments/fixtures/inlines-fragment-arguments.expected");
    test_fixture(transform_fixture, "inlines-fragment-arguments.graphql", "apply_fragment_arguments/fixtures/inlines-fragment-arguments.expected", input, expected);
}

#[test]
fn inlines_literal_fragment_arguments() {
    let input = include_str!("apply_fragment_arguments/fixtures/inlines-literal-fragment-arguments.graphql");
    let expected = include_str!("apply_fragment_arguments/fixtures/inlines-literal-fragment-arguments.expected");
    test_fixture(transform_fixture, "inlines-literal-fragment-arguments.graphql", "apply_fragment_arguments/fixtures/inlines-literal-fragment-arguments.expected", input, expected);
}

#[test]
fn merges_identical_fragments() {
    let input = include_str!("apply_fragment_arguments/fixtures/merges-identical-fragments.graphql");
    let expected = include_str!("apply_fragment_arguments/fixtures/merges-identical-fragments.expected");
    test_fixture(transform_fixture, "merges-identical-fragments.graphql", "apply_fragment_arguments/fixtures/merges-identical-fragments.expected", input, expected);
}

#[test]
fn merges_identical_fragments_literal_arguments() {
    let input = include_str!("apply_fragment_arguments/fixtures/merges-identical-fragments-literal-arguments.graphql");
    let expected = include_str!("apply_fragment_arguments/fixtures/merges-identical-fragments-literal-arguments.expected");
    test_fixture(transform_fixture, "merges-identical-fragments-literal-arguments.graphql", "apply_fragment_arguments/fixtures/merges-identical-fragments-literal-arguments.expected", input, expected);
}

#[test]
fn noncyclic_fragment_with_provided_argument() {
    let input = include_str!("apply_fragment_arguments/fixtures/noncyclic-fragment-with-provided-argument.graphql");
    let expected = include_str!("apply_fragment_arguments/fixtures/noncyclic-fragment-with-provided-argument.expected");
    test_fixture(transform_fixture, "noncyclic-fragment-with-provided-argument.graphql", "apply_fragment_arguments/fixtures/noncyclic-fragment-with-provided-argument.expected", input, expected);
}

#[test]
fn rejects_cyclic_fragments_invalid() {
    let input = include_str!("apply_fragment_arguments/fixtures/rejects-cyclic-fragments.invalid.graphql");
    let expected = include_str!("apply_fragment_arguments/fixtures/rejects-cyclic-fragments.invalid.expected");
    test_fixture(transform_fixture, "rejects-cyclic-fragments.invalid.graphql", "apply_fragment_arguments/fixtures/rejects-cyclic-fragments.invalid.expected", input, expected);
}

#[test]
fn uses_defaults_for_literal_null_arguments() {
    let input = include_str!("apply_fragment_arguments/fixtures/uses-defaults-for-literal-null-arguments.graphql");
    let expected = include_str!("apply_fragment_arguments/fixtures/uses-defaults-for-literal-null-arguments.expected");
    test_fixture(transform_fixture, "uses-defaults-for-literal-null-arguments.graphql", "apply_fragment_arguments/fixtures/uses-defaults-for-literal-null-arguments.expected", input, expected);
}
