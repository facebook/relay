/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<a59d0b450eec17b68fc78646befcd68d>>
 */

mod extract;

use extract::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn comments() {
    let input = include_str!("extract/fixtures/comments.js");
    let expected = include_str!("extract/fixtures/comments.expected");
    test_fixture(transform_fixture, "comments.js", "extract/fixtures/comments.expected", input, expected);
}

#[test]
fn inline() {
    let input = include_str!("extract/fixtures/inline.js");
    let expected = include_str!("extract/fixtures/inline.expected");
    test_fixture(transform_fixture, "inline.js", "extract/fixtures/inline.expected", input, expected);
}

#[test]
fn nested_template_literals() {
    let input = include_str!("extract/fixtures/nested_template_literals.js");
    let expected = include_str!("extract/fixtures/nested_template_literals.expected");
    test_fixture(transform_fixture, "nested_template_literals.js", "extract/fixtures/nested_template_literals.expected", input, expected);
}

#[test]
fn no_graphql() {
    let input = include_str!("extract/fixtures/no_graphql.js");
    let expected = include_str!("extract/fixtures/no_graphql.expected");
    test_fixture(transform_fixture, "no_graphql.js", "extract/fixtures/no_graphql.expected", input, expected);
}

#[test]
fn quote_in_jsx() {
    let input = include_str!("extract/fixtures/quote_in_jsx.js");
    let expected = include_str!("extract/fixtures/quote_in_jsx.expected");
    test_fixture(transform_fixture, "quote_in_jsx.js", "extract/fixtures/quote_in_jsx.expected", input, expected);
}

#[test]
fn relay_resolver() {
    let input = include_str!("extract/fixtures/relay_resolver.js");
    let expected = include_str!("extract/fixtures/relay_resolver.expected");
    test_fixture(transform_fixture, "relay_resolver.js", "extract/fixtures/relay_resolver.expected", input, expected);
}

#[test]
fn simple() {
    let input = include_str!("extract/fixtures/simple.flow");
    let expected = include_str!("extract/fixtures/simple.expected");
    test_fixture(transform_fixture, "simple.flow", "extract/fixtures/simple.expected", input, expected);
}

#[test]
fn tabbed() {
    let input = include_str!("extract/fixtures/tabbed.js");
    let expected = include_str!("extract/fixtures/tabbed.expected");
    test_fixture(transform_fixture, "tabbed.js", "extract/fixtures/tabbed.expected", input, expected);
}

#[test]
fn template_literal() {
    let input = include_str!("extract/fixtures/template_literal.js");
    let expected = include_str!("extract/fixtures/template_literal.expected");
    test_fixture(transform_fixture, "template_literal.js", "extract/fixtures/template_literal.expected", input, expected);
}
