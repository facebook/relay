/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

mod prettier_printer;

use fixture_tests::test_fixture;
use prettier_printer::transform_fixture;

#[tokio::test]
async fn query_simple() {
    let input = include_str!("prettier_printer/fixtures/query_simple.graphql");
    let expected = include_str!("prettier_printer/fixtures/query_simple.expected");
    test_fixture(
        transform_fixture,
        file!(),
        "query_simple.graphql",
        "prettier_printer/fixtures/query_simple.expected",
        input,
        expected,
    )
    .await;
}

#[tokio::test]
async fn query_anonymous() {
    let input = include_str!("prettier_printer/fixtures/query_anonymous.graphql");
    let expected = include_str!("prettier_printer/fixtures/query_anonymous.expected");
    test_fixture(
        transform_fixture,
        file!(),
        "query_anonymous.graphql",
        "prettier_printer/fixtures/query_anonymous.expected",
        input,
        expected,
    )
    .await;
}

#[tokio::test]
async fn query_with_variables() {
    let input = include_str!("prettier_printer/fixtures/query_with_variables.graphql");
    let expected = include_str!("prettier_printer/fixtures/query_with_variables.expected");
    test_fixture(
        transform_fixture,
        file!(),
        "query_with_variables.graphql",
        "prettier_printer/fixtures/query_with_variables.expected",
        input,
        expected,
    )
    .await;
}

#[tokio::test]
async fn mutation_with_variables() {
    let input = include_str!("prettier_printer/fixtures/mutation_with_variables.graphql");
    let expected = include_str!("prettier_printer/fixtures/mutation_with_variables.expected");
    test_fixture(
        transform_fixture,
        file!(),
        "mutation_with_variables.graphql",
        "prettier_printer/fixtures/mutation_with_variables.expected",
        input,
        expected,
    )
    .await;
}

#[tokio::test]
async fn subscription_basic() {
    let input = include_str!("prettier_printer/fixtures/subscription_basic.graphql");
    let expected = include_str!("prettier_printer/fixtures/subscription_basic.expected");
    test_fixture(
        transform_fixture,
        file!(),
        "subscription_basic.graphql",
        "prettier_printer/fixtures/subscription_basic.expected",
        input,
        expected,
    )
    .await;
}

#[tokio::test]
async fn fragment_basic() {
    let input = include_str!("prettier_printer/fixtures/fragment_basic.graphql");
    let expected = include_str!("prettier_printer/fixtures/fragment_basic.expected");
    test_fixture(
        transform_fixture,
        file!(),
        "fragment_basic.graphql",
        "prettier_printer/fixtures/fragment_basic.expected",
        input,
        expected,
    )
    .await;
}

#[tokio::test]
async fn fragment_with_directive() {
    let input = include_str!("prettier_printer/fixtures/fragment_with_directive.graphql");
    let expected = include_str!("prettier_printer/fixtures/fragment_with_directive.expected");
    test_fixture(
        transform_fixture,
        file!(),
        "fragment_with_directive.graphql",
        "prettier_printer/fixtures/fragment_with_directive.expected",
        input,
        expected,
    )
    .await;
}

#[tokio::test]
async fn fragment_spread() {
    let input = include_str!("prettier_printer/fixtures/fragment_spread.graphql");
    let expected = include_str!("prettier_printer/fixtures/fragment_spread.expected");
    test_fixture(
        transform_fixture,
        file!(),
        "fragment_spread.graphql",
        "prettier_printer/fixtures/fragment_spread.expected",
        input,
        expected,
    )
    .await;
}

#[tokio::test]
async fn inline_fragment() {
    let input = include_str!("prettier_printer/fixtures/inline_fragment.graphql");
    let expected = include_str!("prettier_printer/fixtures/inline_fragment.expected");
    test_fixture(
        transform_fixture,
        file!(),
        "inline_fragment.graphql",
        "prettier_printer/fixtures/inline_fragment.expected",
        input,
        expected,
    )
    .await;
}

#[tokio::test]
async fn field_alias() {
    let input = include_str!("prettier_printer/fixtures/field_alias.graphql");
    let expected = include_str!("prettier_printer/fixtures/field_alias.expected");
    test_fixture(
        transform_fixture,
        file!(),
        "field_alias.graphql",
        "prettier_printer/fixtures/field_alias.expected",
        input,
        expected,
    )
    .await;
}

#[tokio::test]
async fn field_directives() {
    let input = include_str!("prettier_printer/fixtures/field_directives.graphql");
    let expected = include_str!("prettier_printer/fixtures/field_directives.expected");
    test_fixture(
        transform_fixture,
        file!(),
        "field_directives.graphql",
        "prettier_printer/fixtures/field_directives.expected",
        input,
        expected,
    )
    .await;
}

#[tokio::test]
async fn argument_values() {
    let input = include_str!("prettier_printer/fixtures/argument_values.graphql");
    let expected = include_str!("prettier_printer/fixtures/argument_values.expected");
    test_fixture(
        transform_fixture,
        file!(),
        "argument_values.graphql",
        "prettier_printer/fixtures/argument_values.expected",
        input,
        expected,
    )
    .await;
}

#[tokio::test]
async fn nested_selections() {
    let input = include_str!("prettier_printer/fixtures/nested_selections.graphql");
    let expected = include_str!("prettier_printer/fixtures/nested_selections.expected");
    test_fixture(
        transform_fixture,
        file!(),
        "nested_selections.graphql",
        "prettier_printer/fixtures/nested_selections.expected",
        input,
        expected,
    )
    .await;
}

#[tokio::test]
async fn inline_fragment_directives() {
    let input = include_str!("prettier_printer/fixtures/inline_fragment_directives.graphql");
    let expected = include_str!("prettier_printer/fixtures/inline_fragment_directives.expected");
    test_fixture(
        transform_fixture,
        file!(),
        "inline_fragment_directives.graphql",
        "prettier_printer/fixtures/inline_fragment_directives.expected",
        input,
        expected,
    )
    .await;
}
