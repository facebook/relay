/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<080455566173c6f7361b4c9ca50ab6d3>>
 */

mod extract;

use extract::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn comments() {
    let input = include_str!("extract/fixtures/comments.js");
    let expected = include_str!("extract/fixtures/comments.expected");
    test_fixture(transform_fixture, file!(), "comments.js", "extract/fixtures/comments.expected", input, expected).await;
}

#[tokio::test]
async fn inline() {
    let input = include_str!("extract/fixtures/inline.js");
    let expected = include_str!("extract/fixtures/inline.expected");
    test_fixture(transform_fixture, file!(), "inline.js", "extract/fixtures/inline.expected", input, expected).await;
}

#[tokio::test]
async fn nested_template_literals() {
    let input = include_str!("extract/fixtures/nested_template_literals.js");
    let expected = include_str!("extract/fixtures/nested_template_literals.expected");
    test_fixture(transform_fixture, file!(), "nested_template_literals.js", "extract/fixtures/nested_template_literals.expected", input, expected).await;
}

#[tokio::test]
async fn no_graphql() {
    let input = include_str!("extract/fixtures/no_graphql.js");
    let expected = include_str!("extract/fixtures/no_graphql.expected");
    test_fixture(transform_fixture, file!(), "no_graphql.js", "extract/fixtures/no_graphql.expected", input, expected).await;
}

#[tokio::test]
async fn quote_in_jsx() {
    let input = include_str!("extract/fixtures/quote_in_jsx.js");
    let expected = include_str!("extract/fixtures/quote_in_jsx.expected");
    test_fixture(transform_fixture, file!(), "quote_in_jsx.js", "extract/fixtures/quote_in_jsx.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver() {
    let input = include_str!("extract/fixtures/relay_resolver.js");
    let expected = include_str!("extract/fixtures/relay_resolver.expected");
    test_fixture(transform_fixture, file!(), "relay_resolver.js", "extract/fixtures/relay_resolver.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_and_graphql() {
    let input = include_str!("extract/fixtures/relay_resolver_and_graphql.js");
    let expected = include_str!("extract/fixtures/relay_resolver_and_graphql.expected");
    test_fixture(transform_fixture, file!(), "relay_resolver_and_graphql.js", "extract/fixtures/relay_resolver_and_graphql.expected", input, expected).await;
}

#[tokio::test]
async fn simple() {
    let input = include_str!("extract/fixtures/simple.flow");
    let expected = include_str!("extract/fixtures/simple.expected");
    test_fixture(transform_fixture, file!(), "simple.flow", "extract/fixtures/simple.expected", input, expected).await;
}

#[tokio::test]
async fn tabbed() {
    let input = include_str!("extract/fixtures/tabbed.js");
    let expected = include_str!("extract/fixtures/tabbed.expected");
    test_fixture(transform_fixture, file!(), "tabbed.js", "extract/fixtures/tabbed.expected", input, expected).await;
}

#[tokio::test]
async fn template_literal() {
    let input = include_str!("extract/fixtures/template_literal.js");
    let expected = include_str!("extract/fixtures/template_literal.expected");
    test_fixture(transform_fixture, file!(), "template_literal.js", "extract/fixtures/template_literal.expected", input, expected).await;
}

#[tokio::test]
async fn with_space() {
    let input = include_str!("extract/fixtures/with_space.js");
    let expected = include_str!("extract/fixtures/with_space.expected");
    test_fixture(transform_fixture, file!(), "with_space.js", "extract/fixtures/with_space.expected", input, expected).await;
}
