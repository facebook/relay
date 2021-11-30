/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<67889aa8700af55d50fb2196049469a5>>
 */

mod assignable_directive;

use assignable_directive::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn assignable_fragment() {
    let input = include_str!("assignable_directive/fixtures/assignable-fragment.graphql");
    let expected = include_str!("assignable_directive/fixtures/assignable-fragment.expected");
    test_fixture(transform_fixture, "assignable-fragment.graphql", "assignable_directive/fixtures/assignable-fragment.expected", input, expected);
}

#[test]
fn assignable_fragment_aliased_typename_invalid() {
    let input = include_str!("assignable_directive/fixtures/assignable-fragment-aliased-typename.invalid.graphql");
    let expected = include_str!("assignable_directive/fixtures/assignable-fragment-aliased-typename.invalid.expected");
    test_fixture(transform_fixture, "assignable-fragment-aliased-typename.invalid.graphql", "assignable_directive/fixtures/assignable-fragment-aliased-typename.invalid.expected", input, expected);
}

#[test]
fn assignable_fragment_directive_on_typename_invalid() {
    let input = include_str!("assignable_directive/fixtures/assignable-fragment-directive-on-typename.invalid.graphql");
    let expected = include_str!("assignable_directive/fixtures/assignable-fragment-directive-on-typename.invalid.expected");
    test_fixture(transform_fixture, "assignable-fragment-directive-on-typename.invalid.graphql", "assignable_directive/fixtures/assignable-fragment-directive-on-typename.invalid.expected", input, expected);
}

#[test]
fn assignable_fragment_directive_other_directives_invalid() {
    let input = include_str!("assignable_directive/fixtures/assignable-fragment-directive-other-directives.invalid.graphql");
    let expected = include_str!("assignable_directive/fixtures/assignable-fragment-directive-other-directives.invalid.expected");
    test_fixture(transform_fixture, "assignable-fragment-directive-other-directives.invalid.graphql", "assignable_directive/fixtures/assignable-fragment-directive-other-directives.invalid.expected", input, expected);
}

#[test]
fn assignable_fragment_no_typename_invalid() {
    let input = include_str!("assignable_directive/fixtures/assignable-fragment-no-typename.invalid.graphql");
    let expected = include_str!("assignable_directive/fixtures/assignable-fragment-no-typename.invalid.expected");
    test_fixture(transform_fixture, "assignable-fragment-no-typename.invalid.graphql", "assignable_directive/fixtures/assignable-fragment-no-typename.invalid.expected", input, expected);
}

#[test]
fn assignable_fragment_other_fields_invalid() {
    let input = include_str!("assignable_directive/fixtures/assignable-fragment-other-fields.invalid.graphql");
    let expected = include_str!("assignable_directive/fixtures/assignable-fragment-other-fields.invalid.expected");
    test_fixture(transform_fixture, "assignable-fragment-other-fields.invalid.graphql", "assignable_directive/fixtures/assignable-fragment-other-fields.invalid.expected", input, expected);
}
