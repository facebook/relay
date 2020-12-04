/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<42b533219d939a67a290c896413619b9>>
 */

mod skip_redundant_nodes;

use skip_redundant_nodes::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn dont_skip_different_ids() {
    let input = include_str!("skip_redundant_nodes/fixtures/dont-skip-different-ids.graphql");
    let expected = include_str!("skip_redundant_nodes/fixtures/dont-skip-different-ids.expected");
    test_fixture(transform_fixture, "dont-skip-different-ids.graphql", "skip_redundant_nodes/fixtures/dont-skip-different-ids.expected", input, expected);
}

#[test]
fn dont_skip_nested_fields_across_fragments() {
    let input = include_str!("skip_redundant_nodes/fixtures/dont-skip-nested-fields-across-fragments.graphql");
    let expected = include_str!("skip_redundant_nodes/fixtures/dont-skip-nested-fields-across-fragments.expected");
    test_fixture(transform_fixture, "dont-skip-nested-fields-across-fragments.graphql", "skip_redundant_nodes/fixtures/dont-skip-nested-fields-across-fragments.expected", input, expected);
}

#[test]
fn dont_skip_with_inline_on_diffent_types() {
    let input = include_str!("skip_redundant_nodes/fixtures/dont-skip-with-inline-on-diffent-types.graphql");
    let expected = include_str!("skip_redundant_nodes/fixtures/dont-skip-with-inline-on-diffent-types.expected");
    test_fixture(transform_fixture, "dont-skip-with-inline-on-diffent-types.graphql", "skip_redundant_nodes/fixtures/dont-skip-with-inline-on-diffent-types.expected", input, expected);
}

#[test]
fn redundant_selection_in_inline_fragments() {
    let input = include_str!("skip_redundant_nodes/fixtures/redundant-selection-in-inline-fragments.graphql");
    let expected = include_str!("skip_redundant_nodes/fixtures/redundant-selection-in-inline-fragments.expected");
    test_fixture(transform_fixture, "redundant-selection-in-inline-fragments.graphql", "skip_redundant_nodes/fixtures/redundant-selection-in-inline-fragments.expected", input, expected);
}

#[test]
fn skip_nested_linked_fields() {
    let input = include_str!("skip_redundant_nodes/fixtures/skip-nested-linked-fields.graphql");
    let expected = include_str!("skip_redundant_nodes/fixtures/skip-nested-linked-fields.expected");
    test_fixture(transform_fixture, "skip-nested-linked-fields.graphql", "skip_redundant_nodes/fixtures/skip-nested-linked-fields.expected", input, expected);
}

#[test]
fn skips_nested_fields() {
    let input = include_str!("skip_redundant_nodes/fixtures/skips-nested-fields.graphql");
    let expected = include_str!("skip_redundant_nodes/fixtures/skips-nested-fields.expected");
    test_fixture(transform_fixture, "skips-nested-fields.graphql", "skip_redundant_nodes/fixtures/skips-nested-fields.expected", input, expected);
}

#[test]
fn skips_with_client_extensions() {
    let input = include_str!("skip_redundant_nodes/fixtures/skips-with-client-extensions.graphql");
    let expected = include_str!("skip_redundant_nodes/fixtures/skips-with-client-extensions.expected");
    test_fixture(transform_fixture, "skips-with-client-extensions.graphql", "skip_redundant_nodes/fixtures/skips-with-client-extensions.expected", input, expected);
}

#[test]
fn skips_with_fragment() {
    let input = include_str!("skip_redundant_nodes/fixtures/skips-with-fragment.graphql");
    let expected = include_str!("skip_redundant_nodes/fixtures/skips-with-fragment.expected");
    test_fixture(transform_fixture, "skips-with-fragment.graphql", "skip_redundant_nodes/fixtures/skips-with-fragment.expected", input, expected);
}

#[test]
fn skips_with_module() {
    let input = include_str!("skip_redundant_nodes/fixtures/skips-with-module.graphql");
    let expected = include_str!("skip_redundant_nodes/fixtures/skips-with-module.expected");
    test_fixture(transform_fixture, "skips-with-module.graphql", "skip_redundant_nodes/fixtures/skips-with-module.expected", input, expected);
}

#[test]
fn skips_with_outer_fields_first() {
    let input = include_str!("skip_redundant_nodes/fixtures/skips-with-outer-fields-first.graphql");
    let expected = include_str!("skip_redundant_nodes/fixtures/skips-with-outer-fields-first.expected");
    test_fixture(transform_fixture, "skips-with-outer-fields-first.graphql", "skip_redundant_nodes/fixtures/skips-with-outer-fields-first.expected", input, expected);
}

#[test]
fn skips_with_outer_fields_last() {
    let input = include_str!("skip_redundant_nodes/fixtures/skips-with-outer-fields-last.graphql");
    let expected = include_str!("skip_redundant_nodes/fixtures/skips-with-outer-fields-last.expected");
    test_fixture(transform_fixture, "skips-with-outer-fields-last.graphql", "skip_redundant_nodes/fixtures/skips-with-outer-fields-last.expected", input, expected);
}
