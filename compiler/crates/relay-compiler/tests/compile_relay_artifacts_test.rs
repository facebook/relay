/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<d4b9a65e33f69e362d639c615584215c>>
 */

mod compile_relay_artifacts;

use compile_relay_artifacts::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn abstract_type_refinement() {
    let input = include_str!("compile_relay_artifacts/fixtures/abstract-type-refinement.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/abstract-type-refinement.expected");
    test_fixture(transform_fixture, "abstract-type-refinement.graphql", "compile_relay_artifacts/fixtures/abstract-type-refinement.expected", input, expected);
}

#[test]
fn abstract_type_refinement_dont_flatten_type_discriminator_fragment_spread() {
    let input = include_str!("compile_relay_artifacts/fixtures/abstract-type-refinement-dont-flatten-type-discriminator-fragment-spread.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/abstract-type-refinement-dont-flatten-type-discriminator-fragment-spread.expected");
    test_fixture(transform_fixture, "abstract-type-refinement-dont-flatten-type-discriminator-fragment-spread.graphql", "compile_relay_artifacts/fixtures/abstract-type-refinement-dont-flatten-type-discriminator-fragment-spread.expected", input, expected);
}

#[test]
fn abstract_type_refinement_dont_flatten_type_discriminator_fragment_spread_conditional() {
    let input = include_str!("compile_relay_artifacts/fixtures/abstract-type-refinement-dont-flatten-type-discriminator-fragment-spread-conditional.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/abstract-type-refinement-dont-flatten-type-discriminator-fragment-spread-conditional.expected");
    test_fixture(transform_fixture, "abstract-type-refinement-dont-flatten-type-discriminator-fragment-spread-conditional.graphql", "compile_relay_artifacts/fixtures/abstract-type-refinement-dont-flatten-type-discriminator-fragment-spread-conditional.expected", input, expected);
}

#[test]
fn abstract_type_refinement_dont_flatten_type_discriminator_inline_fragment() {
    let input = include_str!("compile_relay_artifacts/fixtures/abstract-type-refinement-dont-flatten-type-discriminator-inline-fragment.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/abstract-type-refinement-dont-flatten-type-discriminator-inline-fragment.expected");
    test_fixture(transform_fixture, "abstract-type-refinement-dont-flatten-type-discriminator-inline-fragment.graphql", "compile_relay_artifacts/fixtures/abstract-type-refinement-dont-flatten-type-discriminator-inline-fragment.expected", input, expected);
}

#[test]
fn abstract_type_refinement_dont_flatten_type_discriminator_inline_fragment_conditional() {
    let input = include_str!("compile_relay_artifacts/fixtures/abstract-type-refinement-dont-flatten-type-discriminator-inline-fragment-conditional.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/abstract-type-refinement-dont-flatten-type-discriminator-inline-fragment-conditional.expected");
    test_fixture(transform_fixture, "abstract-type-refinement-dont-flatten-type-discriminator-inline-fragment-conditional.graphql", "compile_relay_artifacts/fixtures/abstract-type-refinement-dont-flatten-type-discriminator-inline-fragment-conditional.expected", input, expected);
}

#[test]
fn abstract_type_refinement_dont_flatten_type_discriminator_nested_fragment_spread() {
    let input = include_str!("compile_relay_artifacts/fixtures/abstract-type-refinement-dont-flatten-type-discriminator-nested-fragment-spread.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/abstract-type-refinement-dont-flatten-type-discriminator-nested-fragment-spread.expected");
    test_fixture(transform_fixture, "abstract-type-refinement-dont-flatten-type-discriminator-nested-fragment-spread.graphql", "compile_relay_artifacts/fixtures/abstract-type-refinement-dont-flatten-type-discriminator-nested-fragment-spread.expected", input, expected);
}

#[test]
fn abstract_type_refinement_dont_flatten_type_discriminator_nested_fragment_spread_within_inline_fragment() {
    let input = include_str!("compile_relay_artifacts/fixtures/abstract-type-refinement-dont-flatten-type-discriminator-nested-fragment-spread-within-inline-fragment.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/abstract-type-refinement-dont-flatten-type-discriminator-nested-fragment-spread-within-inline-fragment.expected");
    test_fixture(transform_fixture, "abstract-type-refinement-dont-flatten-type-discriminator-nested-fragment-spread-within-inline-fragment.graphql", "compile_relay_artifacts/fixtures/abstract-type-refinement-dont-flatten-type-discriminator-nested-fragment-spread-within-inline-fragment.expected", input, expected);
}

#[test]
fn abstract_type_refinement_dont_flatten_type_discriminator_nested_fragment_spread_within_inline_fragment_different_fields() {
    let input = include_str!("compile_relay_artifacts/fixtures/abstract-type-refinement-dont-flatten-type-discriminator-nested-fragment-spread-within-inline-fragment-different-fields.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/abstract-type-refinement-dont-flatten-type-discriminator-nested-fragment-spread-within-inline-fragment-different-fields.expected");
    test_fixture(transform_fixture, "abstract-type-refinement-dont-flatten-type-discriminator-nested-fragment-spread-within-inline-fragment-different-fields.graphql", "compile_relay_artifacts/fixtures/abstract-type-refinement-dont-flatten-type-discriminator-nested-fragment-spread-within-inline-fragment-different-fields.expected", input, expected);
}

#[test]
fn abstract_type_refinement_dont_flatten_type_discriminator_nested_inline_fragment() {
    let input = include_str!("compile_relay_artifacts/fixtures/abstract-type-refinement-dont-flatten-type-discriminator-nested-inline-fragment.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/abstract-type-refinement-dont-flatten-type-discriminator-nested-inline-fragment.expected");
    test_fixture(transform_fixture, "abstract-type-refinement-dont-flatten-type-discriminator-nested-inline-fragment.graphql", "compile_relay_artifacts/fixtures/abstract-type-refinement-dont-flatten-type-discriminator-nested-inline-fragment.expected", input, expected);
}

#[test]
fn abstract_type_refinement_dont_skip_type_discriminator_fragment_spread() {
    let input = include_str!("compile_relay_artifacts/fixtures/abstract-type-refinement-dont-skip-type-discriminator-fragment-spread.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/abstract-type-refinement-dont-skip-type-discriminator-fragment-spread.expected");
    test_fixture(transform_fixture, "abstract-type-refinement-dont-skip-type-discriminator-fragment-spread.graphql", "compile_relay_artifacts/fixtures/abstract-type-refinement-dont-skip-type-discriminator-fragment-spread.expected", input, expected);
}

#[test]
fn abstract_type_refinement_dont_skip_type_discriminator_inline_fragment() {
    let input = include_str!("compile_relay_artifacts/fixtures/abstract-type-refinement-dont-skip-type-discriminator-inline-fragment.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/abstract-type-refinement-dont-skip-type-discriminator-inline-fragment.expected");
    test_fixture(transform_fixture, "abstract-type-refinement-dont-skip-type-discriminator-inline-fragment.graphql", "compile_relay_artifacts/fixtures/abstract-type-refinement-dont-skip-type-discriminator-inline-fragment.expected", input, expected);
}

#[test]
fn abstract_type_refinement_dont_skip_type_discriminator_when_identical_selections() {
    let input = include_str!("compile_relay_artifacts/fixtures/abstract-type-refinement-dont-skip-type-discriminator-when-identical-selections.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/abstract-type-refinement-dont-skip-type-discriminator-when-identical-selections.expected");
    test_fixture(transform_fixture, "abstract-type-refinement-dont-skip-type-discriminator-when-identical-selections.graphql", "compile_relay_artifacts/fixtures/abstract-type-refinement-dont-skip-type-discriminator-when-identical-selections.expected", input, expected);
}

#[test]
fn abstract_type_refinement_no_unnecessary_type_discriminator_under_condition_incorrect() {
    let input = include_str!("compile_relay_artifacts/fixtures/abstract-type-refinement-no-unnecessary-type-discriminator-under-condition_incorrect.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/abstract-type-refinement-no-unnecessary-type-discriminator-under-condition_incorrect.expected");
    test_fixture(transform_fixture, "abstract-type-refinement-no-unnecessary-type-discriminator-under-condition_incorrect.graphql", "compile_relay_artifacts/fixtures/abstract-type-refinement-no-unnecessary-type-discriminator-under-condition_incorrect.expected", input, expected);
}

#[test]
fn actor_change_simple_query() {
    let input = include_str!("compile_relay_artifacts/fixtures/actor-change-simple-query.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/actor-change-simple-query.expected");
    test_fixture(transform_fixture, "actor-change-simple-query.graphql", "compile_relay_artifacts/fixtures/actor-change-simple-query.expected", input, expected);
}

#[test]
fn alias_same_as_name() {
    let input = include_str!("compile_relay_artifacts/fixtures/alias-same-as-name.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/alias-same-as-name.expected");
    test_fixture(transform_fixture, "alias-same-as-name.graphql", "compile_relay_artifacts/fixtures/alias-same-as-name.expected", input, expected);
}

#[test]
fn append_edge() {
    let input = include_str!("compile_relay_artifacts/fixtures/append-edge.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/append-edge.expected");
    test_fixture(transform_fixture, "append-edge.graphql", "compile_relay_artifacts/fixtures/append-edge.expected", input, expected);
}

#[test]
fn append_node() {
    let input = include_str!("compile_relay_artifacts/fixtures/append-node.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/append-node.expected");
    test_fixture(transform_fixture, "append-node.graphql", "compile_relay_artifacts/fixtures/append-node.expected", input, expected);
}

#[test]
fn append_node_literal_edge_type_name() {
    let input = include_str!("compile_relay_artifacts/fixtures/append-node-literal-edge-type-name.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/append-node-literal-edge-type-name.expected");
    test_fixture(transform_fixture, "append-node-literal-edge-type-name.graphql", "compile_relay_artifacts/fixtures/append-node-literal-edge-type-name.expected", input, expected);
}

#[test]
fn auto_filled_argument_on_defer() {
    let input = include_str!("compile_relay_artifacts/fixtures/auto-filled-argument-on-defer.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/auto-filled-argument-on-defer.expected");
    test_fixture(transform_fixture, "auto-filled-argument-on-defer.graphql", "compile_relay_artifacts/fixtures/auto-filled-argument-on-defer.expected", input, expected);
}

#[test]
fn auto_filled_argument_on_match() {
    let input = include_str!("compile_relay_artifacts/fixtures/auto-filled-argument-on-match.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/auto-filled-argument-on-match.expected");
    test_fixture(transform_fixture, "auto-filled-argument-on-match.graphql", "compile_relay_artifacts/fixtures/auto-filled-argument-on-match.expected", input, expected);
}

#[test]
fn circular_no_inline_fragment() {
    let input = include_str!("compile_relay_artifacts/fixtures/circular-no-inline-fragment.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/circular-no-inline-fragment.expected");
    test_fixture(transform_fixture, "circular-no-inline-fragment.graphql", "compile_relay_artifacts/fixtures/circular-no-inline-fragment.expected", input, expected);
}

#[test]
fn client_conditions() {
    let input = include_str!("compile_relay_artifacts/fixtures/client-conditions.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/client-conditions.expected");
    test_fixture(transform_fixture, "client-conditions.graphql", "compile_relay_artifacts/fixtures/client-conditions.expected", input, expected);
}

#[test]
fn client_fields_in_inline_fragments() {
    let input = include_str!("compile_relay_artifacts/fixtures/client-fields-in-inline-fragments.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/client-fields-in-inline-fragments.expected");
    test_fixture(transform_fixture, "client-fields-in-inline-fragments.graphql", "compile_relay_artifacts/fixtures/client-fields-in-inline-fragments.expected", input, expected);
}

#[test]
fn client_fields_of_client_type() {
    let input = include_str!("compile_relay_artifacts/fixtures/client-fields-of-client-type.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/client-fields-of-client-type.expected");
    test_fixture(transform_fixture, "client-fields-of-client-type.graphql", "compile_relay_artifacts/fixtures/client-fields-of-client-type.expected", input, expected);
}

#[test]
fn client_fields_on_roots() {
    let input = include_str!("compile_relay_artifacts/fixtures/client-fields-on-roots.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/client-fields-on-roots.expected");
    test_fixture(transform_fixture, "client-fields-on-roots.graphql", "compile_relay_artifacts/fixtures/client-fields-on-roots.expected", input, expected);
}

#[test]
fn client_fields_only_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/client_fields_only_invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/client_fields_only_invalid.expected");
    test_fixture(transform_fixture, "client_fields_only_invalid.graphql", "compile_relay_artifacts/fixtures/client_fields_only_invalid.expected", input, expected);
}

#[test]
fn client_fragment_spreads() {
    let input = include_str!("compile_relay_artifacts/fixtures/client-fragment-spreads.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/client-fragment-spreads.expected");
    test_fixture(transform_fixture, "client-fragment-spreads.graphql", "compile_relay_artifacts/fixtures/client-fragment-spreads.expected", input, expected);
}

#[test]
fn client_fragment_spreads_in_query() {
    let input = include_str!("compile_relay_artifacts/fixtures/client-fragment-spreads-in-query.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/client-fragment-spreads-in-query.expected");
    test_fixture(transform_fixture, "client-fragment-spreads-in-query.graphql", "compile_relay_artifacts/fixtures/client-fragment-spreads-in-query.expected", input, expected);
}

#[test]
fn client_inline_fragments() {
    let input = include_str!("compile_relay_artifacts/fixtures/client-inline-fragments.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/client-inline-fragments.expected");
    test_fixture(transform_fixture, "client-inline-fragments.graphql", "compile_relay_artifacts/fixtures/client-inline-fragments.expected", input, expected);
}

#[test]
fn client_inline_fragments_in_query() {
    let input = include_str!("compile_relay_artifacts/fixtures/client-inline-fragments-in-query.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/client-inline-fragments-in-query.expected");
    test_fixture(transform_fixture, "client-inline-fragments-in-query.graphql", "compile_relay_artifacts/fixtures/client-inline-fragments-in-query.expected", input, expected);
}

#[test]
fn client_linked_fields() {
    let input = include_str!("compile_relay_artifacts/fixtures/client-linked-fields.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/client-linked-fields.expected");
    test_fixture(transform_fixture, "client-linked-fields.graphql", "compile_relay_artifacts/fixtures/client-linked-fields.expected", input, expected);
}

#[test]
fn client_scalar_fields() {
    let input = include_str!("compile_relay_artifacts/fixtures/client-scalar-fields.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/client-scalar-fields.expected");
    test_fixture(transform_fixture, "client-scalar-fields.graphql", "compile_relay_artifacts/fixtures/client-scalar-fields.expected", input, expected);
}

#[test]
fn complex_arguments() {
    let input = include_str!("compile_relay_artifacts/fixtures/complex-arguments.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/complex-arguments.expected");
    test_fixture(transform_fixture, "complex-arguments.graphql", "compile_relay_artifacts/fixtures/complex-arguments.expected", input, expected);
}

#[test]
fn complex_arguments_in_list() {
    let input = include_str!("compile_relay_artifacts/fixtures/complex-arguments-in-list.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/complex-arguments-in-list.expected");
    test_fixture(transform_fixture, "complex-arguments-in-list.graphql", "compile_relay_artifacts/fixtures/complex-arguments-in-list.expected", input, expected);
}

#[test]
fn complex_arguments_with_mutliple_variables() {
    let input = include_str!("compile_relay_artifacts/fixtures/complex-arguments-with-mutliple-variables.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/complex-arguments-with-mutliple-variables.expected");
    test_fixture(transform_fixture, "complex-arguments-with-mutliple-variables.graphql", "compile_relay_artifacts/fixtures/complex-arguments-with-mutliple-variables.expected", input, expected);
}

#[test]
fn conflicting_selections_with_actor_change_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/conflicting-selections-with-actor-change.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/conflicting-selections-with-actor-change.invalid.expected");
    test_fixture(transform_fixture, "conflicting-selections-with-actor-change.invalid.graphql", "compile_relay_artifacts/fixtures/conflicting-selections-with-actor-change.invalid.expected", input, expected);
}

#[test]
fn conflicting_selections_with_defer_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/conflicting-selections-with-defer.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/conflicting-selections-with-defer.invalid.expected");
    test_fixture(transform_fixture, "conflicting-selections-with-defer.invalid.graphql", "compile_relay_artifacts/fixtures/conflicting-selections-with-defer.invalid.expected", input, expected);
}

#[test]
fn conflicting_selections_with_no_inline_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/conflicting-selections-with-no-inline.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/conflicting-selections-with-no-inline.invalid.expected");
    test_fixture(transform_fixture, "conflicting-selections-with-no-inline.invalid.graphql", "compile_relay_artifacts/fixtures/conflicting-selections-with-no-inline.invalid.expected", input, expected);
}

#[test]
fn connection() {
    let input = include_str!("compile_relay_artifacts/fixtures/connection.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/connection.expected");
    test_fixture(transform_fixture, "connection.graphql", "compile_relay_artifacts/fixtures/connection.expected", input, expected);
}

#[test]
fn connection_with_aliased_edges_page_info() {
    let input = include_str!("compile_relay_artifacts/fixtures/connection-with-aliased-edges-page_info.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/connection-with-aliased-edges-page_info.expected");
    test_fixture(transform_fixture, "connection-with-aliased-edges-page_info.graphql", "compile_relay_artifacts/fixtures/connection-with-aliased-edges-page_info.expected", input, expected);
}

#[test]
fn connection_with_dynamic_key() {
    let input = include_str!("compile_relay_artifacts/fixtures/connection-with-dynamic-key.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/connection-with-dynamic-key.expected");
    test_fixture(transform_fixture, "connection-with-dynamic-key.graphql", "compile_relay_artifacts/fixtures/connection-with-dynamic-key.expected", input, expected);
}

#[test]
fn connection_with_dynamic_key_missing_variable_definition_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/connection-with-dynamic-key-missing-variable-definition.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/connection-with-dynamic-key-missing-variable-definition.invalid.expected");
    test_fixture(transform_fixture, "connection-with-dynamic-key-missing-variable-definition.invalid.graphql", "compile_relay_artifacts/fixtures/connection-with-dynamic-key-missing-variable-definition.invalid.expected", input, expected);
}

#[test]
fn constant_variable_matches_constant_value() {
    let input = include_str!("compile_relay_artifacts/fixtures/constant_variable_matches_constant_value.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/constant_variable_matches_constant_value.expected");
    test_fixture(transform_fixture, "constant_variable_matches_constant_value.graphql", "compile_relay_artifacts/fixtures/constant_variable_matches_constant_value.expected", input, expected);
}

#[test]
fn defer_if_arguments() {
    let input = include_str!("compile_relay_artifacts/fixtures/defer_if_arguments.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/defer_if_arguments.expected");
    test_fixture(transform_fixture, "defer_if_arguments.graphql", "compile_relay_artifacts/fixtures/defer_if_arguments.expected", input, expected);
}

#[test]
fn defer_multiple_fragments_same_parent() {
    let input = include_str!("compile_relay_artifacts/fixtures/defer-multiple-fragments-same-parent.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/defer-multiple-fragments-same-parent.expected");
    test_fixture(transform_fixture, "defer-multiple-fragments-same-parent.graphql", "compile_relay_artifacts/fixtures/defer-multiple-fragments-same-parent.expected", input, expected);
}

#[test]
fn delete_edge() {
    let input = include_str!("compile_relay_artifacts/fixtures/delete-edge.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/delete-edge.expected");
    test_fixture(transform_fixture, "delete-edge.graphql", "compile_relay_artifacts/fixtures/delete-edge.expected", input, expected);
}

#[test]
fn delete_edge_plural() {
    let input = include_str!("compile_relay_artifacts/fixtures/delete-edge-plural.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/delete-edge-plural.expected");
    test_fixture(transform_fixture, "delete-edge-plural.graphql", "compile_relay_artifacts/fixtures/delete-edge-plural.expected", input, expected);
}

#[test]
fn directive_with_conditions() {
    let input = include_str!("compile_relay_artifacts/fixtures/directive_with_conditions.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/directive_with_conditions.expected");
    test_fixture(transform_fixture, "directive_with_conditions.graphql", "compile_relay_artifacts/fixtures/directive_with_conditions.expected", input, expected);
}

#[test]
fn duplicate_directive_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/duplicate-directive.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/duplicate-directive.invalid.expected");
    test_fixture(transform_fixture, "duplicate-directive.invalid.graphql", "compile_relay_artifacts/fixtures/duplicate-directive.invalid.expected", input, expected);
}

#[test]
fn explicit_null_argument() {
    let input = include_str!("compile_relay_artifacts/fixtures/explicit-null-argument.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/explicit-null-argument.expected");
    test_fixture(transform_fixture, "explicit-null-argument.graphql", "compile_relay_artifacts/fixtures/explicit-null-argument.expected", input, expected);
}

#[test]
fn explicit_null_default_value() {
    let input = include_str!("compile_relay_artifacts/fixtures/explicit-null-default-value.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/explicit-null-default-value.expected");
    test_fixture(transform_fixture, "explicit-null-default-value.graphql", "compile_relay_artifacts/fixtures/explicit-null-default-value.expected", input, expected);
}

#[test]
fn false_positive_circular_fragment_reference_regression() {
    let input = include_str!("compile_relay_artifacts/fixtures/false-positive-circular-fragment-reference-regression.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/false-positive-circular-fragment-reference-regression.expected");
    test_fixture(transform_fixture, "false-positive-circular-fragment-reference-regression.graphql", "compile_relay_artifacts/fixtures/false-positive-circular-fragment-reference-regression.expected", input, expected);
}

#[test]
fn fields_with_null_argument_values() {
    let input = include_str!("compile_relay_artifacts/fixtures/fields-with-null-argument-values.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/fields-with-null-argument-values.expected");
    test_fixture(transform_fixture, "fields-with-null-argument-values.graphql", "compile_relay_artifacts/fixtures/fields-with-null-argument-values.expected", input, expected);
}

#[test]
fn flight_props_transform() {
    let input = include_str!("compile_relay_artifacts/fixtures/flight-props-transform.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/flight-props-transform.expected");
    test_fixture(transform_fixture, "flight-props-transform.graphql", "compile_relay_artifacts/fixtures/flight-props-transform.expected", input, expected);
}

#[test]
fn fragment_on_node_interface() {
    let input = include_str!("compile_relay_artifacts/fixtures/fragment-on-node-interface.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/fragment-on-node-interface.expected");
    test_fixture(transform_fixture, "fragment-on-node-interface.graphql", "compile_relay_artifacts/fixtures/fragment-on-node-interface.expected", input, expected);
}

#[test]
fn fragment_on_non_node_fetchable_type() {
    let input = include_str!("compile_relay_artifacts/fixtures/fragment-on-non-node-fetchable-type.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/fragment-on-non-node-fetchable-type.expected");
    test_fixture(transform_fixture, "fragment-on-non-node-fetchable-type.graphql", "compile_relay_artifacts/fixtures/fragment-on-non-node-fetchable-type.expected", input, expected);
}

#[test]
fn fragment_on_object_implementing_node_interface() {
    let input = include_str!("compile_relay_artifacts/fixtures/fragment-on-object-implementing-node-interface.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/fragment-on-object-implementing-node-interface.expected");
    test_fixture(transform_fixture, "fragment-on-object-implementing-node-interface.graphql", "compile_relay_artifacts/fixtures/fragment-on-object-implementing-node-interface.expected", input, expected);
}

#[test]
fn fragment_on_query() {
    let input = include_str!("compile_relay_artifacts/fixtures/fragment-on-query.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/fragment-on-query.expected");
    test_fixture(transform_fixture, "fragment-on-query.graphql", "compile_relay_artifacts/fixtures/fragment-on-query.expected", input, expected);
}

#[test]
fn fragment_on_query_with_cycle_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/fragment-on-query-with-cycle.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/fragment-on-query-with-cycle.invalid.expected");
    test_fixture(transform_fixture, "fragment-on-query-with-cycle.invalid.graphql", "compile_relay_artifacts/fixtures/fragment-on-query-with-cycle.invalid.expected", input, expected);
}

#[test]
fn fragment_on_viewer() {
    let input = include_str!("compile_relay_artifacts/fixtures/fragment-on-viewer.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/fragment-on-viewer.expected");
    test_fixture(transform_fixture, "fragment-on-viewer.graphql", "compile_relay_artifacts/fixtures/fragment-on-viewer.expected", input, expected);
}

#[test]
fn fragment_with_defer_arguments() {
    let input = include_str!("compile_relay_artifacts/fixtures/fragment-with-defer-arguments.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/fragment-with-defer-arguments.expected");
    test_fixture(transform_fixture, "fragment-with-defer-arguments.graphql", "compile_relay_artifacts/fixtures/fragment-with-defer-arguments.expected", input, expected);
}

#[test]
fn fragment_with_defer_arguments_without_label() {
    let input = include_str!("compile_relay_artifacts/fixtures/fragment-with-defer-arguments-without-label.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/fragment-with-defer-arguments-without-label.expected");
    test_fixture(transform_fixture, "fragment-with-defer-arguments-without-label.graphql", "compile_relay_artifacts/fixtures/fragment-with-defer-arguments-without-label.expected", input, expected);
}

#[test]
fn fragment_with_defer_in_stream() {
    let input = include_str!("compile_relay_artifacts/fixtures/fragment-with-defer-in-stream.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/fragment-with-defer-in-stream.expected");
    test_fixture(transform_fixture, "fragment-with-defer-in-stream.graphql", "compile_relay_artifacts/fixtures/fragment-with-defer-in-stream.expected", input, expected);
}

#[test]
fn fragment_with_defer_on_abstract_type() {
    let input = include_str!("compile_relay_artifacts/fixtures/fragment-with-defer-on-abstract-type.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/fragment-with-defer-on-abstract-type.expected");
    test_fixture(transform_fixture, "fragment-with-defer-on-abstract-type.graphql", "compile_relay_artifacts/fixtures/fragment-with-defer-on-abstract-type.expected", input, expected);
}

#[test]
fn fragment_with_match_directive() {
    let input = include_str!("compile_relay_artifacts/fixtures/fragment-with-match-directive.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/fragment-with-match-directive.expected");
    test_fixture(transform_fixture, "fragment-with-match-directive.graphql", "compile_relay_artifacts/fixtures/fragment-with-match-directive.expected", input, expected);
}

#[test]
fn fragment_with_stream() {
    let input = include_str!("compile_relay_artifacts/fixtures/fragment-with-stream.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/fragment-with-stream.expected");
    test_fixture(transform_fixture, "fragment-with-stream.graphql", "compile_relay_artifacts/fixtures/fragment-with-stream.expected", input, expected);
}

#[test]
fn id_as_alias_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/id-as-alias.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/id-as-alias.invalid.expected");
    test_fixture(transform_fixture, "id-as-alias.invalid.graphql", "compile_relay_artifacts/fixtures/id-as-alias.invalid.expected", input, expected);
}

#[test]
fn incompatible_variable_usage_across_documents() {
    let input = include_str!("compile_relay_artifacts/fixtures/incompatible-variable-usage-across-documents.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/incompatible-variable-usage-across-documents.expected");
    test_fixture(transform_fixture, "incompatible-variable-usage-across-documents.graphql", "compile_relay_artifacts/fixtures/incompatible-variable-usage-across-documents.expected", input, expected);
}

#[test]
fn inline_and_mask_are_incompatible_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/inline-and-mask-are-incompatible.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/inline-and-mask-are-incompatible.invalid.expected");
    test_fixture(transform_fixture, "inline-and-mask-are-incompatible.invalid.graphql", "compile_relay_artifacts/fixtures/inline-and-mask-are-incompatible.invalid.expected", input, expected);
}

#[test]
fn inline_data_fragment() {
    let input = include_str!("compile_relay_artifacts/fixtures/inline-data-fragment.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/inline-data-fragment.expected");
    test_fixture(transform_fixture, "inline-data-fragment.graphql", "compile_relay_artifacts/fixtures/inline-data-fragment.expected", input, expected);
}

#[test]
fn inline_data_fragment_global_vars() {
    let input = include_str!("compile_relay_artifacts/fixtures/inline-data-fragment-global-vars.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/inline-data-fragment-global-vars.expected");
    test_fixture(transform_fixture, "inline-data-fragment-global-vars.graphql", "compile_relay_artifacts/fixtures/inline-data-fragment-global-vars.expected", input, expected);
}

#[test]
fn inline_data_fragment_local_args() {
    let input = include_str!("compile_relay_artifacts/fixtures/inline-data-fragment-local-args.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/inline-data-fragment-local-args.expected");
    test_fixture(transform_fixture, "inline-data-fragment-local-args.graphql", "compile_relay_artifacts/fixtures/inline-data-fragment-local-args.expected", input, expected);
}

#[test]
fn kitchen_sink() {
    let input = include_str!("compile_relay_artifacts/fixtures/kitchen-sink.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/kitchen-sink.expected");
    test_fixture(transform_fixture, "kitchen-sink.graphql", "compile_relay_artifacts/fixtures/kitchen-sink.expected", input, expected);
}

#[test]
fn linked_handle_field() {
    let input = include_str!("compile_relay_artifacts/fixtures/linked-handle-field.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/linked-handle-field.expected");
    test_fixture(transform_fixture, "linked-handle-field.graphql", "compile_relay_artifacts/fixtures/linked-handle-field.expected", input, expected);
}

#[test]
fn match_field_overlap_across_documents() {
    let input = include_str!("compile_relay_artifacts/fixtures/match-field-overlap-across-documents.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/match-field-overlap-across-documents.expected");
    test_fixture(transform_fixture, "match-field-overlap-across-documents.graphql", "compile_relay_artifacts/fixtures/match-field-overlap-across-documents.expected", input, expected);
}

#[test]
fn match_on_child_of_plural() {
    let input = include_str!("compile_relay_artifacts/fixtures/match-on-child-of-plural.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/match-on-child-of-plural.expected");
    test_fixture(transform_fixture, "match-on-child-of-plural.graphql", "compile_relay_artifacts/fixtures/match-on-child-of-plural.expected", input, expected);
}

#[test]
fn match_with_invalid_key_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/match-with-invalid-key.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/match-with-invalid-key.invalid.expected");
    test_fixture(transform_fixture, "match-with-invalid-key.invalid.graphql", "compile_relay_artifacts/fixtures/match-with-invalid-key.invalid.expected", input, expected);
}

#[test]
fn match_with_variable_key_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/match-with-variable-key.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/match-with-variable-key.invalid.expected");
    test_fixture(transform_fixture, "match-with-variable-key.invalid.graphql", "compile_relay_artifacts/fixtures/match-with-variable-key.invalid.expected", input, expected);
}

#[test]
fn missing_argument_on_field_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/missing-argument-on-field.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/missing-argument-on-field.invalid.expected");
    test_fixture(transform_fixture, "missing-argument-on-field.invalid.graphql", "compile_relay_artifacts/fixtures/missing-argument-on-field.invalid.expected", input, expected);
}

#[test]
fn module_deduping() {
    let input = include_str!("compile_relay_artifacts/fixtures/module-deduping.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/module-deduping.expected");
    test_fixture(transform_fixture, "module-deduping.graphql", "compile_relay_artifacts/fixtures/module-deduping.expected", input, expected);
}

#[test]
fn module_in_inline_fragment() {
    let input = include_str!("compile_relay_artifacts/fixtures/module-in-inline-fragment.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/module-in-inline-fragment.expected");
    test_fixture(transform_fixture, "module-in-inline-fragment.graphql", "compile_relay_artifacts/fixtures/module-in-inline-fragment.expected", input, expected);
}

#[test]
fn module_overlap_across_documents() {
    let input = include_str!("compile_relay_artifacts/fixtures/module-overlap-across-documents.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/module-overlap-across-documents.expected");
    test_fixture(transform_fixture, "module-overlap-across-documents.graphql", "compile_relay_artifacts/fixtures/module-overlap-across-documents.expected", input, expected);
}

#[test]
fn module_overlap_within_document_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/module-overlap-within-document.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/module-overlap-within-document.invalid.expected");
    test_fixture(transform_fixture, "module-overlap-within-document.invalid.graphql", "compile_relay_artifacts/fixtures/module-overlap-within-document.invalid.expected", input, expected);
}

#[test]
fn module_with_defer() {
    let input = include_str!("compile_relay_artifacts/fixtures/module-with-defer.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/module-with-defer.expected");
    test_fixture(transform_fixture, "module-with-defer.graphql", "compile_relay_artifacts/fixtures/module-with-defer.expected", input, expected);
}

#[test]
fn multiple_conditions() {
    let input = include_str!("compile_relay_artifacts/fixtures/multiple_conditions.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/multiple_conditions.expected");
    test_fixture(transform_fixture, "multiple_conditions.graphql", "compile_relay_artifacts/fixtures/multiple_conditions.expected", input, expected);
}

#[test]
fn multiple_modules_different_component_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/multiple-modules-different-component.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/multiple-modules-different-component.invalid.expected");
    test_fixture(transform_fixture, "multiple-modules-different-component.invalid.graphql", "compile_relay_artifacts/fixtures/multiple-modules-different-component.invalid.expected", input, expected);
}

#[test]
fn multiple_modules_different_fragment_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/multiple-modules-different-fragment.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/multiple-modules-different-fragment.invalid.expected");
    test_fixture(transform_fixture, "multiple-modules-different-fragment.invalid.graphql", "compile_relay_artifacts/fixtures/multiple-modules-different-fragment.invalid.expected", input, expected);
}

#[test]
fn multiple_modules_same_selections() {
    let input = include_str!("compile_relay_artifacts/fixtures/multiple-modules-same-selections.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/multiple-modules-same-selections.expected");
    test_fixture(transform_fixture, "multiple-modules-same-selections.graphql", "compile_relay_artifacts/fixtures/multiple-modules-same-selections.expected", input, expected);
}

#[test]
fn multiple_modules_with_key() {
    let input = include_str!("compile_relay_artifacts/fixtures/multiple-modules-with-key.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/multiple-modules-with-key.expected");
    test_fixture(transform_fixture, "multiple-modules-with-key.graphql", "compile_relay_artifacts/fixtures/multiple-modules-with-key.expected", input, expected);
}

#[test]
fn multiple_modules_without_key_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/multiple-modules-without-key.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/multiple-modules-without-key.invalid.expected");
    test_fixture(transform_fixture, "multiple-modules-without-key.invalid.graphql", "compile_relay_artifacts/fixtures/multiple-modules-without-key.invalid.expected", input, expected);
}

#[test]
fn nested_conditions() {
    let input = include_str!("compile_relay_artifacts/fixtures/nested_conditions.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/nested_conditions.expected");
    test_fixture(transform_fixture, "nested_conditions.graphql", "compile_relay_artifacts/fixtures/nested_conditions.expected", input, expected);
}

#[test]
fn no_inline_abstract_fragment() {
    let input = include_str!("compile_relay_artifacts/fixtures/no-inline-abstract-fragment.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/no-inline-abstract-fragment.expected");
    test_fixture(transform_fixture, "no-inline-abstract-fragment.graphql", "compile_relay_artifacts/fixtures/no-inline-abstract-fragment.expected", input, expected);
}

#[test]
fn no_inline_fragment() {
    let input = include_str!("compile_relay_artifacts/fixtures/no-inline-fragment.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/no-inline-fragment.expected");
    test_fixture(transform_fixture, "no-inline-fragment.graphql", "compile_relay_artifacts/fixtures/no-inline-fragment.expected", input, expected);
}

#[test]
fn no_inline_fragment_and_module() {
    let input = include_str!("compile_relay_artifacts/fixtures/no-inline-fragment-and-module.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/no-inline-fragment-and-module.expected");
    test_fixture(transform_fixture, "no-inline-fragment-and-module.graphql", "compile_relay_artifacts/fixtures/no-inline-fragment-and-module.expected", input, expected);
}

#[test]
fn no_inline_fragment_in_raw_response_query() {
    let input = include_str!("compile_relay_artifacts/fixtures/no-inline-fragment-in-raw-response-query.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/no-inline-fragment-in-raw-response-query.expected");
    test_fixture(transform_fixture, "no-inline-fragment-in-raw-response-query.graphql", "compile_relay_artifacts/fixtures/no-inline-fragment-in-raw-response-query.expected", input, expected);
}

#[test]
fn original_client_fields_test() {
    let input = include_str!("compile_relay_artifacts/fixtures/original-client-fields-test.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/original-client-fields-test.expected");
    test_fixture(transform_fixture, "original-client-fields-test.graphql", "compile_relay_artifacts/fixtures/original-client-fields-test.expected", input, expected);
}

#[test]
fn plural_fragment() {
    let input = include_str!("compile_relay_artifacts/fixtures/plural-fragment.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/plural-fragment.expected");
    test_fixture(transform_fixture, "plural-fragment.graphql", "compile_relay_artifacts/fixtures/plural-fragment.expected", input, expected);
}

#[test]
fn prepend_node() {
    let input = include_str!("compile_relay_artifacts/fixtures/prepend-node.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/prepend-node.expected");
    test_fixture(transform_fixture, "prepend-node.graphql", "compile_relay_artifacts/fixtures/prepend-node.expected", input, expected);
}

#[test]
fn provided_variable_in_fragment() {
    let input = include_str!("compile_relay_artifacts/fixtures/provided-variable-in-fragment.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/provided-variable-in-fragment.expected");
    test_fixture(transform_fixture, "provided-variable-in-fragment.graphql", "compile_relay_artifacts/fixtures/provided-variable-in-fragment.expected", input, expected);
}

#[test]
fn query_with_and_without_module_directive() {
    let input = include_str!("compile_relay_artifacts/fixtures/query-with-and-without-module-directive.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/query-with-and-without-module-directive.expected");
    test_fixture(transform_fixture, "query-with-and-without-module-directive.graphql", "compile_relay_artifacts/fixtures/query-with-and-without-module-directive.expected", input, expected);
}

#[test]
fn query_with_conditional_module() {
    let input = include_str!("compile_relay_artifacts/fixtures/query-with-conditional-module.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/query-with-conditional-module.expected");
    test_fixture(transform_fixture, "query-with-conditional-module.graphql", "compile_relay_artifacts/fixtures/query-with-conditional-module.expected", input, expected);
}

#[test]
fn query_with_fragment_variables() {
    let input = include_str!("compile_relay_artifacts/fixtures/query-with-fragment-variables.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/query-with-fragment-variables.expected");
    test_fixture(transform_fixture, "query-with-fragment-variables.graphql", "compile_relay_artifacts/fixtures/query-with-fragment-variables.expected", input, expected);
}

#[test]
fn query_with_match_directive() {
    let input = include_str!("compile_relay_artifacts/fixtures/query-with-match-directive.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/query-with-match-directive.expected");
    test_fixture(transform_fixture, "query-with-match-directive.graphql", "compile_relay_artifacts/fixtures/query-with-match-directive.expected", input, expected);
}

#[test]
fn query_with_match_directive_no_inline_experimental() {
    let input = include_str!("compile_relay_artifacts/fixtures/query-with-match-directive-no-inline-experimental.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/query-with-match-directive-no-inline-experimental.expected");
    test_fixture(transform_fixture, "query-with-match-directive-no-inline-experimental.graphql", "compile_relay_artifacts/fixtures/query-with-match-directive-no-inline-experimental.expected", input, expected);
}

#[test]
fn query_with_match_directive_no_modules_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/query-with-match-directive-no-modules.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/query-with-match-directive-no-modules.invalid.expected");
    test_fixture(transform_fixture, "query-with-match-directive-no-modules.invalid.graphql", "compile_relay_artifacts/fixtures/query-with-match-directive-no-modules.invalid.expected", input, expected);
}

#[test]
fn query_with_match_directive_with_extra_argument() {
    let input = include_str!("compile_relay_artifacts/fixtures/query-with-match-directive-with-extra-argument.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/query-with-match-directive-with-extra-argument.expected");
    test_fixture(transform_fixture, "query-with-match-directive-with-extra-argument.graphql", "compile_relay_artifacts/fixtures/query-with-match-directive-with-extra-argument.expected", input, expected);
}

#[test]
fn query_with_match_directive_with_typename() {
    let input = include_str!("compile_relay_artifacts/fixtures/query-with-match-directive-with-typename.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/query-with-match-directive-with-typename.expected");
    test_fixture(transform_fixture, "query-with-match-directive-with-typename.graphql", "compile_relay_artifacts/fixtures/query-with-match-directive-with-typename.expected", input, expected);
}

#[test]
fn query_with_module_directive() {
    let input = include_str!("compile_relay_artifacts/fixtures/query-with-module-directive.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/query-with-module-directive.expected");
    test_fixture(transform_fixture, "query-with-module-directive.graphql", "compile_relay_artifacts/fixtures/query-with-module-directive.expected", input, expected);
}

#[test]
fn query_with_module_directive_and_arguments() {
    let input = include_str!("compile_relay_artifacts/fixtures/query-with-module-directive-and-arguments.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/query-with-module-directive-and-arguments.expected");
    test_fixture(transform_fixture, "query-with-module-directive-and-arguments.graphql", "compile_relay_artifacts/fixtures/query-with-module-directive-and-arguments.expected", input, expected);
}

#[test]
fn query_with_raw_response_type_directive() {
    let input = include_str!("compile_relay_artifacts/fixtures/query-with-raw-response-type-directive.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/query-with-raw-response-type-directive.expected");
    test_fixture(transform_fixture, "query-with-raw-response-type-directive.graphql", "compile_relay_artifacts/fixtures/query-with-raw-response-type-directive.expected", input, expected);
}

#[test]
fn query_with_relay_client_component() {
    let input = include_str!("compile_relay_artifacts/fixtures/query-with-relay-client-component.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/query-with-relay-client-component.expected");
    test_fixture(transform_fixture, "query-with-relay-client-component.graphql", "compile_relay_artifacts/fixtures/query-with-relay-client-component.expected", input, expected);
}

#[test]
fn query_with_relay_client_component_with_argument_definitions() {
    let input = include_str!("compile_relay_artifacts/fixtures/query-with-relay-client-component-with-argument-definitions.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/query-with-relay-client-component-with-argument-definitions.expected");
    test_fixture(transform_fixture, "query-with-relay-client-component-with-argument-definitions.graphql", "compile_relay_artifacts/fixtures/query-with-relay-client-component-with-argument-definitions.expected", input, expected);
}

#[test]
fn redundant_selection_in_inline_fragments() {
    let input = include_str!("compile_relay_artifacts/fixtures/redundant-selection-in-inline-fragments.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/redundant-selection-in-inline-fragments.expected");
    test_fixture(transform_fixture, "redundant-selection-in-inline-fragments.graphql", "compile_relay_artifacts/fixtures/redundant-selection-in-inline-fragments.expected", input, expected);
}

#[test]
fn refetchable_conflict_with_operation_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/refetchable_conflict_with_operation.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/refetchable_conflict_with_operation.invalid.expected");
    test_fixture(transform_fixture, "refetchable_conflict_with_operation.invalid.graphql", "compile_relay_artifacts/fixtures/refetchable_conflict_with_operation.invalid.expected", input, expected);
}

#[test]
fn refetchable_conflict_with_refetchable_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/refetchable_conflict_with_refetchable.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/refetchable_conflict_with_refetchable.invalid.expected");
    test_fixture(transform_fixture, "refetchable_conflict_with_refetchable.invalid.graphql", "compile_relay_artifacts/fixtures/refetchable_conflict_with_refetchable.invalid.expected", input, expected);
}

#[test]
fn refetchable_connection() {
    let input = include_str!("compile_relay_artifacts/fixtures/refetchable-connection.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/refetchable-connection.expected");
    test_fixture(transform_fixture, "refetchable-connection.graphql", "compile_relay_artifacts/fixtures/refetchable-connection.expected", input, expected);
}

#[test]
fn refetchable_connection_custom_handler() {
    let input = include_str!("compile_relay_artifacts/fixtures/refetchable-connection-custom-handler.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/refetchable-connection-custom-handler.expected");
    test_fixture(transform_fixture, "refetchable-connection-custom-handler.graphql", "compile_relay_artifacts/fixtures/refetchable-connection-custom-handler.expected", input, expected);
}

#[test]
fn refetchable_fragment_directives() {
    let input = include_str!("compile_relay_artifacts/fixtures/refetchable_fragment_directives.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/refetchable_fragment_directives.expected");
    test_fixture(transform_fixture, "refetchable_fragment_directives.graphql", "compile_relay_artifacts/fixtures/refetchable_fragment_directives.expected", input, expected);
}

#[test]
fn refetchable_fragment_directives_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/refetchable_fragment_directives.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/refetchable_fragment_directives.invalid.expected");
    test_fixture(transform_fixture, "refetchable_fragment_directives.invalid.graphql", "compile_relay_artifacts/fixtures/refetchable_fragment_directives.invalid.expected", input, expected);
}

#[test]
fn refetchable_fragment_on_node_with_missing_id() {
    let input = include_str!("compile_relay_artifacts/fixtures/refetchable-fragment-on-node-with-missing-id.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/refetchable-fragment-on-node-with-missing-id.expected");
    test_fixture(transform_fixture, "refetchable-fragment-on-node-with-missing-id.graphql", "compile_relay_artifacts/fixtures/refetchable-fragment-on-node-with-missing-id.expected", input, expected);
}

#[test]
fn refetchable_fragment_with_connection() {
    let input = include_str!("compile_relay_artifacts/fixtures/refetchable-fragment-with-connection.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/refetchable-fragment-with-connection.expected");
    test_fixture(transform_fixture, "refetchable-fragment-with-connection.graphql", "compile_relay_artifacts/fixtures/refetchable-fragment-with-connection.expected", input, expected);
}

#[test]
fn refetchable_fragment_with_connection_bidirectional() {
    let input = include_str!("compile_relay_artifacts/fixtures/refetchable-fragment-with-connection-bidirectional.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/refetchable-fragment-with-connection-bidirectional.expected");
    test_fixture(transform_fixture, "refetchable-fragment-with-connection-bidirectional.graphql", "compile_relay_artifacts/fixtures/refetchable-fragment-with-connection-bidirectional.expected", input, expected);
}

#[test]
fn refetchable_fragment_with_connection_with_stream() {
    let input = include_str!("compile_relay_artifacts/fixtures/refetchable-fragment-with-connection-with-stream.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/refetchable-fragment-with-connection-with-stream.expected");
    test_fixture(transform_fixture, "refetchable-fragment-with-connection-with-stream.graphql", "compile_relay_artifacts/fixtures/refetchable-fragment-with-connection-with-stream.expected", input, expected);
}

#[test]
fn refetchable_with_arguments_conflicting_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/refetchable-with-arguments-conflicting.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/refetchable-with-arguments-conflicting.invalid.expected");
    test_fixture(transform_fixture, "refetchable-with-arguments-conflicting.invalid.graphql", "compile_relay_artifacts/fixtures/refetchable-with-arguments-conflicting.invalid.expected", input, expected);
}

#[test]
fn refetchable_with_arguments_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/refetchable-with-arguments.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/refetchable-with-arguments.invalid.expected");
    test_fixture(transform_fixture, "refetchable-with-arguments.invalid.graphql", "compile_relay_artifacts/fixtures/refetchable-with-arguments.invalid.expected", input, expected);
}

#[test]
fn relay_client_id_field() {
    let input = include_str!("compile_relay_artifacts/fixtures/relay-client-id-field.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/relay-client-id-field.expected");
    test_fixture(transform_fixture, "relay-client-id-field.graphql", "compile_relay_artifacts/fixtures/relay-client-id-field.expected", input, expected);
}

#[test]
fn relay_resolver() {
    let input = include_str!("compile_relay_artifacts/fixtures/relay-resolver.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/relay-resolver.expected");
    test_fixture(transform_fixture, "relay-resolver.graphql", "compile_relay_artifacts/fixtures/relay-resolver.expected", input, expected);
}

#[test]
fn relay_resolver_alias() {
    let input = include_str!("compile_relay_artifacts/fixtures/relay-resolver-alias.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/relay-resolver-alias.expected");
    test_fixture(transform_fixture, "relay-resolver-alias.graphql", "compile_relay_artifacts/fixtures/relay-resolver-alias.expected", input, expected);
}

#[test]
fn relay_resolver_backing_client_edge() {
    let input = include_str!("compile_relay_artifacts/fixtures/relay-resolver-backing-client-edge.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/relay-resolver-backing-client-edge.expected");
    test_fixture(transform_fixture, "relay-resolver-backing-client-edge.graphql", "compile_relay_artifacts/fixtures/relay-resolver-backing-client-edge.expected", input, expected);
}

#[test]
fn required_argument_not_passed_default_value() {
    let input = include_str!("compile_relay_artifacts/fixtures/required_argument_not_passed_default_value.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/required_argument_not_passed_default_value.expected");
    test_fixture(transform_fixture, "required_argument_not_passed_default_value.graphql", "compile_relay_artifacts/fixtures/required_argument_not_passed_default_value.expected", input, expected);
}

#[test]
fn required_argument_not_passed_no_args_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/required_argument_not_passed_no_args.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/required_argument_not_passed_no_args.invalid.expected");
    test_fixture(transform_fixture, "required_argument_not_passed_no_args.invalid.graphql", "compile_relay_artifacts/fixtures/required_argument_not_passed_no_args.invalid.expected", input, expected);
}

#[test]
fn required_argument_not_passed_other_args_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/required_argument_not_passed_other_args.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/required_argument_not_passed_other_args.invalid.expected");
    test_fixture(transform_fixture, "required_argument_not_passed_other_args.invalid.graphql", "compile_relay_artifacts/fixtures/required_argument_not_passed_other_args.invalid.expected", input, expected);
}

#[test]
fn required_directive() {
    let input = include_str!("compile_relay_artifacts/fixtures/required-directive.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/required-directive.expected");
    test_fixture(transform_fixture, "required-directive.graphql", "compile_relay_artifacts/fixtures/required-directive.expected", input, expected);
}

#[test]
fn same_fields_with_different_args_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/same-fields-with-different-args.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/same-fields-with-different-args.invalid.expected");
    test_fixture(transform_fixture, "same-fields-with-different-args.invalid.graphql", "compile_relay_artifacts/fixtures/same-fields-with-different-args.invalid.expected", input, expected);
}

#[test]
fn same_fields_with_different_args_variables_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/same_fields_with_different_args_variables.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/same_fields_with_different_args_variables.invalid.expected");
    test_fixture(transform_fixture, "same_fields_with_different_args_variables.invalid.graphql", "compile_relay_artifacts/fixtures/same_fields_with_different_args_variables.invalid.expected", input, expected);
}

#[test]
fn scalar_handle_field() {
    let input = include_str!("compile_relay_artifacts/fixtures/scalar-handle-field.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/scalar-handle-field.expected");
    test_fixture(transform_fixture, "scalar-handle-field.graphql", "compile_relay_artifacts/fixtures/scalar-handle-field.expected", input, expected);
}

#[test]
fn selection_set_conflict_added_argument() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_added_argument.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_added_argument.expected");
    test_fixture(transform_fixture, "selection_set_conflict_added_argument.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_added_argument.expected", input, expected);
}

#[test]
fn selection_set_conflict_alias_covering_name() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_alias_covering_name.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_alias_covering_name.expected");
    test_fixture(transform_fixture, "selection_set_conflict_alias_covering_name.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_alias_covering_name.expected", input, expected);
}

#[test]
fn selection_set_conflict_composite_vs_noncomposite() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_composite_vs_noncomposite.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_composite_vs_noncomposite.expected");
    test_fixture(transform_fixture, "selection_set_conflict_composite_vs_noncomposite.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_composite_vs_noncomposite.expected", input, expected);
}

#[test]
fn selection_set_conflict_conflicting_list_and_non_list_types() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_conflicting_list_and_non_list_types.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_conflicting_list_and_non_list_types.expected");
    test_fixture(transform_fixture, "selection_set_conflict_conflicting_list_and_non_list_types.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_conflicting_list_and_non_list_types.expected", input, expected);
}

#[test]
fn selection_set_conflict_conflicting_list_and_non_list_types_opposite_order() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_conflicting_list_and_non_list_types_opposite_order.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_conflicting_list_and_non_list_types_opposite_order.expected");
    test_fixture(transform_fixture, "selection_set_conflict_conflicting_list_and_non_list_types_opposite_order.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_conflicting_list_and_non_list_types_opposite_order.expected", input, expected);
}

#[test]
fn selection_set_conflict_conflicting_nullable_and_non_nullable_types() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_conflicting_nullable_and_non_nullable_types.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_conflicting_nullable_and_non_nullable_types.expected");
    test_fixture(transform_fixture, "selection_set_conflict_conflicting_nullable_and_non_nullable_types.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_conflicting_nullable_and_non_nullable_types.expected", input, expected);
}

#[test]
fn selection_set_conflict_conflicting_selection_sets_inside_list_type() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_conflicting_selection_sets_inside_list_type.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_conflicting_selection_sets_inside_list_type.expected");
    test_fixture(transform_fixture, "selection_set_conflict_conflicting_selection_sets_inside_list_type.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_conflicting_selection_sets_inside_list_type.expected", input, expected);
}

#[test]
fn selection_set_conflict_conflicting_selection_sets_inside_list_type_multiple_conflicts() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_conflicting_selection_sets_inside_list_type_multiple_conflicts.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_conflicting_selection_sets_inside_list_type_multiple_conflicts.expected");
    test_fixture(transform_fixture, "selection_set_conflict_conflicting_selection_sets_inside_list_type_multiple_conflicts.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_conflicting_selection_sets_inside_list_type_multiple_conflicts.expected", input, expected);
}

#[test]
fn selection_set_conflict_different_aliases() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_different_aliases.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_different_aliases.expected");
    test_fixture(transform_fixture, "selection_set_conflict_different_aliases.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_different_aliases.expected", input, expected);
}

#[test]
fn selection_set_conflict_different_arguments() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_different_arguments.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_different_arguments.expected");
    test_fixture(transform_fixture, "selection_set_conflict_different_arguments.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_different_arguments.expected", input, expected);
}

#[test]
fn selection_set_conflict_different_arguments_with_list() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_different_arguments_with_list.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_different_arguments_with_list.expected");
    test_fixture(transform_fixture, "selection_set_conflict_different_arguments_with_list.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_different_arguments_with_list.expected", input, expected);
}

#[test]
fn selection_set_conflict_different_name() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_different_name.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_different_name.expected");
    test_fixture(transform_fixture, "selection_set_conflict_different_name.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_different_name.expected", input, expected);
}

#[test]
fn selection_set_conflict_different_return_types_for_field_but_same_shape() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_different_return_types_for_field_but_same_shape.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_different_return_types_for_field_but_same_shape.expected");
    test_fixture(transform_fixture, "selection_set_conflict_different_return_types_for_field_but_same_shape.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_different_return_types_for_field_but_same_shape.expected", input, expected);
}

#[test]
fn selection_set_conflict_different_types_with_conflict() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_different_types_with_conflict.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_different_types_with_conflict.expected");
    test_fixture(transform_fixture, "selection_set_conflict_different_types_with_conflict.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_different_types_with_conflict.expected", input, expected);
}

#[test]
fn selection_set_conflict_different_types_with_conflict_different_shape() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_different_types_with_conflict_different_shape.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_different_types_with_conflict_different_shape.expected");
    test_fixture(transform_fixture, "selection_set_conflict_different_types_with_conflict_different_shape.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_different_types_with_conflict_different_shape.expected", input, expected);
}

#[test]
fn selection_set_conflict_different_types_with_conflict_in_typeless_inline_fragments() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_different_types_with_conflict_in_typeless_inline_fragments.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_different_types_with_conflict_in_typeless_inline_fragments.expected");
    test_fixture(transform_fixture, "selection_set_conflict_different_types_with_conflict_in_typeless_inline_fragments.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_different_types_with_conflict_in_typeless_inline_fragments.expected", input, expected);
}

#[test]
fn selection_set_conflict_different_types_without_conflict() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_different_types_without_conflict.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_different_types_without_conflict.expected");
    test_fixture(transform_fixture, "selection_set_conflict_different_types_without_conflict.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_different_types_without_conflict.expected", input, expected);
}

#[test]
fn selection_set_conflict_different_types_without_conflict_1() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_different_types_without_conflict_1.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_different_types_without_conflict_1.expected");
    test_fixture(transform_fixture, "selection_set_conflict_different_types_without_conflict_1.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_different_types_without_conflict_1.expected", input, expected);
}

#[test]
fn selection_set_conflict_different_types_without_conflict_in_typeless_inline_fragments() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_different_types_without_conflict_in_typeless_inline_fragments.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_different_types_without_conflict_in_typeless_inline_fragments.expected");
    test_fixture(transform_fixture, "selection_set_conflict_different_types_without_conflict_in_typeless_inline_fragments.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_different_types_without_conflict_in_typeless_inline_fragments.expected", input, expected);
}

#[test]
fn selection_set_conflict_inconsistent_stream_usage_1() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_inconsistent_stream_usage_1.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_inconsistent_stream_usage_1.expected");
    test_fixture(transform_fixture, "selection_set_conflict_inconsistent_stream_usage_1.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_inconsistent_stream_usage_1.expected", input, expected);
}

#[test]
fn selection_set_conflict_inconsistent_stream_usage_2() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_inconsistent_stream_usage_2.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_inconsistent_stream_usage_2.expected");
    test_fixture(transform_fixture, "selection_set_conflict_inconsistent_stream_usage_2.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_inconsistent_stream_usage_2.expected", input, expected);
}

#[test]
fn selection_set_conflict_invalid_same_fragments_in_different_contexts() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_invalid_same_fragments_in_different_contexts.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_invalid_same_fragments_in_different_contexts.expected");
    test_fixture(transform_fixture, "selection_set_conflict_invalid_same_fragments_in_different_contexts.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_invalid_same_fragments_in_different_contexts.expected", input, expected);
}

#[test]
fn selection_set_conflict_missing_argument() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_missing_argument.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_missing_argument.expected");
    test_fixture(transform_fixture, "selection_set_conflict_missing_argument.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_missing_argument.expected", input, expected);
}

#[test]
fn selection_set_conflict_multiple_conflicts() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_multiple_conflicts.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_multiple_conflicts.expected");
    test_fixture(transform_fixture, "selection_set_conflict_multiple_conflicts.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_multiple_conflicts.expected", input, expected);
}

#[test]
fn selection_set_conflict_multiple_conflicts_with_different_args() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_multiple_conflicts_with_different_args.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_multiple_conflicts_with_different_args.expected");
    test_fixture(transform_fixture, "selection_set_conflict_multiple_conflicts_with_different_args.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_multiple_conflicts_with_different_args.expected", input, expected);
}

#[test]
fn selection_set_conflict_nested_conflict() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_nested_conflict.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_nested_conflict.expected");
    test_fixture(transform_fixture, "selection_set_conflict_nested_conflict.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_nested_conflict.expected", input, expected);
}

#[test]
fn selection_set_conflict_stream_on_nodes_or_edges() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_stream_on_nodes_or_edges.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_stream_on_nodes_or_edges.expected");
    test_fixture(transform_fixture, "selection_set_conflict_stream_on_nodes_or_edges.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_stream_on_nodes_or_edges.expected", input, expected);
}

#[test]
fn selection_set_conflict_stream_on_nodes_or_edges_without_defer_on_page_info() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_stream_on_nodes_or_edges_without_defer_on_page_info.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_stream_on_nodes_or_edges_without_defer_on_page_info.expected");
    test_fixture(transform_fixture, "selection_set_conflict_stream_on_nodes_or_edges_without_defer_on_page_info.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_stream_on_nodes_or_edges_without_defer_on_page_info.expected", input, expected);
}

#[test]
fn selection_set_conflict_stream_on_nodes_or_edges_without_defer_on_page_info_and_page_info_alias() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_stream_on_nodes_or_edges_without_defer_on_page_info_and_page_info_alias.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_stream_on_nodes_or_edges_without_defer_on_page_info_and_page_info_alias.expected");
    test_fixture(transform_fixture, "selection_set_conflict_stream_on_nodes_or_edges_without_defer_on_page_info_and_page_info_alias.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_stream_on_nodes_or_edges_without_defer_on_page_info_and_page_info_alias.expected", input, expected);
}

#[test]
fn selection_set_conflict_valid() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_valid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_valid.expected");
    test_fixture(transform_fixture, "selection_set_conflict_valid.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_valid.expected", input, expected);
}

#[test]
fn selection_set_conflict_valid_stream() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_valid_stream.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_valid_stream.expected");
    test_fixture(transform_fixture, "selection_set_conflict_valid_stream.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_valid_stream.expected", input, expected);
}

#[test]
fn selection_set_conflict_with_fragment() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_with_fragment.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_with_fragment.expected");
    test_fixture(transform_fixture, "selection_set_conflict_with_fragment.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_with_fragment.expected", input, expected);
}

#[test]
fn selection_set_conflict_with_inline_fragment() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_with_inline_fragment.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_with_inline_fragment.expected");
    test_fixture(transform_fixture, "selection_set_conflict_with_inline_fragment.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_with_inline_fragment.expected", input, expected);
}

#[test]
fn selection_set_conflict_with_nested_fragments() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_with_nested_fragments.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_with_nested_fragments.expected");
    test_fixture(transform_fixture, "selection_set_conflict_with_nested_fragments.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_with_nested_fragments.expected", input, expected);
}

#[test]
fn selections_on_interface() {
    let input = include_str!("compile_relay_artifacts/fixtures/selections-on-interface.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selections-on-interface.expected");
    test_fixture(transform_fixture, "selections-on-interface.graphql", "compile_relay_artifacts/fixtures/selections-on-interface.expected", input, expected);
}

#[test]
fn sibling_client_selections() {
    let input = include_str!("compile_relay_artifacts/fixtures/sibling-client-selections.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/sibling-client-selections.expected");
    test_fixture(transform_fixture, "sibling-client-selections.graphql", "compile_relay_artifacts/fixtures/sibling-client-selections.expected", input, expected);
}

#[test]
fn spread_of_assignable_fragment() {
    let input = include_str!("compile_relay_artifacts/fixtures/spread-of-assignable-fragment.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/spread-of-assignable-fragment.expected");
    test_fixture(transform_fixture, "spread-of-assignable-fragment.graphql", "compile_relay_artifacts/fixtures/spread-of-assignable-fragment.expected", input, expected);
}

#[test]
fn stable_literals() {
    let input = include_str!("compile_relay_artifacts/fixtures/stable-literals.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/stable-literals.expected");
    test_fixture(transform_fixture, "stable-literals.graphql", "compile_relay_artifacts/fixtures/stable-literals.expected", input, expected);
}

#[test]
fn stream_and_handle() {
    let input = include_str!("compile_relay_artifacts/fixtures/stream-and-handle.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/stream-and-handle.expected");
    test_fixture(transform_fixture, "stream-and-handle.graphql", "compile_relay_artifacts/fixtures/stream-and-handle.expected", input, expected);
}

#[test]
fn stream_connection() {
    let input = include_str!("compile_relay_artifacts/fixtures/stream-connection.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/stream-connection.expected");
    test_fixture(transform_fixture, "stream-connection.graphql", "compile_relay_artifacts/fixtures/stream-connection.expected", input, expected);
}

#[test]
fn stream_connection_conditional() {
    let input = include_str!("compile_relay_artifacts/fixtures/stream-connection-conditional.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/stream-connection-conditional.expected");
    test_fixture(transform_fixture, "stream-connection-conditional.graphql", "compile_relay_artifacts/fixtures/stream-connection-conditional.expected", input, expected);
}

#[test]
fn stream_if_arguments() {
    let input = include_str!("compile_relay_artifacts/fixtures/stream_if_arguments.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/stream_if_arguments.expected");
    test_fixture(transform_fixture, "stream_if_arguments.graphql", "compile_relay_artifacts/fixtures/stream_if_arguments.expected", input, expected);
}

#[test]
fn subscription_transform() {
    let input = include_str!("compile_relay_artifacts/fixtures/subscription-transform.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/subscription-transform.expected");
    test_fixture(transform_fixture, "subscription-transform.graphql", "compile_relay_artifacts/fixtures/subscription-transform.expected", input, expected);
}

#[test]
fn supported_arg() {
    let input = include_str!("compile_relay_artifacts/fixtures/supported_arg.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/supported_arg.expected");
    test_fixture(transform_fixture, "supported_arg.graphql", "compile_relay_artifacts/fixtures/supported_arg.expected", input, expected);
}

#[test]
fn supported_arg_non_static_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/supported_arg_non_static.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/supported_arg_non_static.invalid.expected");
    test_fixture(transform_fixture, "supported_arg_non_static.invalid.graphql", "compile_relay_artifacts/fixtures/supported_arg_non_static.invalid.expected", input, expected);
}

#[test]
fn unions() {
    let input = include_str!("compile_relay_artifacts/fixtures/unions.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/unions.expected");
    test_fixture(transform_fixture, "unions.graphql", "compile_relay_artifacts/fixtures/unions.expected", input, expected);
}

#[test]
fn unknown_root_variable_in_fragment_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/unknown-root-variable-in-fragment.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/unknown-root-variable-in-fragment.invalid.expected");
    test_fixture(transform_fixture, "unknown-root-variable-in-fragment.invalid.graphql", "compile_relay_artifacts/fixtures/unknown-root-variable-in-fragment.invalid.expected", input, expected);
}

#[test]
fn unmasked_fragment_spreads_dup_arguments() {
    let input = include_str!("compile_relay_artifacts/fixtures/unmasked-fragment-spreads-dup-arguments.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/unmasked-fragment-spreads-dup-arguments.expected");
    test_fixture(transform_fixture, "unmasked-fragment-spreads-dup-arguments.graphql", "compile_relay_artifacts/fixtures/unmasked-fragment-spreads-dup-arguments.expected", input, expected);
}

#[test]
fn unmasked_fragment_spreads_global_arguments() {
    let input = include_str!("compile_relay_artifacts/fixtures/unmasked-fragment-spreads-global-arguments.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/unmasked-fragment-spreads-global-arguments.expected");
    test_fixture(transform_fixture, "unmasked-fragment-spreads-global-arguments.graphql", "compile_relay_artifacts/fixtures/unmasked-fragment-spreads-global-arguments.expected", input, expected);
}

#[test]
fn unmasked_fragment_spreads_local_arguments_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/unmasked-fragment-spreads-local-arguments.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/unmasked-fragment-spreads-local-arguments.invalid.expected");
    test_fixture(transform_fixture, "unmasked-fragment-spreads-local-arguments.invalid.graphql", "compile_relay_artifacts/fixtures/unmasked-fragment-spreads-local-arguments.invalid.expected", input, expected);
}

#[test]
fn unmasked_fragment_spreads_on_query() {
    let input = include_str!("compile_relay_artifacts/fixtures/unmasked-fragment-spreads-on-query.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/unmasked-fragment-spreads-on-query.expected");
    test_fixture(transform_fixture, "unmasked-fragment-spreads-on-query.graphql", "compile_relay_artifacts/fixtures/unmasked-fragment-spreads-on-query.expected", input, expected);
}

#[test]
fn unmasked_fragment_spreads_recursive() {
    let input = include_str!("compile_relay_artifacts/fixtures/unmasked-fragment-spreads-recursive.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/unmasked-fragment-spreads-recursive.expected");
    test_fixture(transform_fixture, "unmasked-fragment-spreads-recursive.graphql", "compile_relay_artifacts/fixtures/unmasked-fragment-spreads-recursive.expected", input, expected);
}

#[test]
fn unused_fragment_arg_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/unused_fragment_arg.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/unused_fragment_arg.invalid.expected");
    test_fixture(transform_fixture, "unused_fragment_arg.invalid.graphql", "compile_relay_artifacts/fixtures/unused_fragment_arg.invalid.expected", input, expected);
}

#[test]
fn unused_fragment_arg_unchecked() {
    let input = include_str!("compile_relay_artifacts/fixtures/unused_fragment_arg_unchecked.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/unused_fragment_arg_unchecked.expected");
    test_fixture(transform_fixture, "unused_fragment_arg_unchecked.graphql", "compile_relay_artifacts/fixtures/unused_fragment_arg_unchecked.expected", input, expected);
}

#[test]
fn unused_fragment_argdef_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/unused_fragment_argdef.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/unused_fragment_argdef.invalid.expected");
    test_fixture(transform_fixture, "unused_fragment_argdef.invalid.graphql", "compile_relay_artifacts/fixtures/unused_fragment_argdef.invalid.expected", input, expected);
}

#[test]
fn unused_fragment_argdef_invalid_suppression_arg_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/unused_fragment_argdef_invalid_suppression_arg.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/unused_fragment_argdef_invalid_suppression_arg.invalid.expected");
    test_fixture(transform_fixture, "unused_fragment_argdef_invalid_suppression_arg.invalid.graphql", "compile_relay_artifacts/fixtures/unused_fragment_argdef_invalid_suppression_arg.invalid.expected", input, expected);
}

#[test]
fn unused_variables_removed_from_print_not_codegen() {
    let input = include_str!("compile_relay_artifacts/fixtures/unused-variables-removed-from-print-not-codegen.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/unused-variables-removed-from-print-not-codegen.expected");
    test_fixture(transform_fixture, "unused-variables-removed-from-print-not-codegen.graphql", "compile_relay_artifacts/fixtures/unused-variables-removed-from-print-not-codegen.expected", input, expected);
}

#[test]
fn validate_global_variables_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/validate-global-variables.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/validate-global-variables.invalid.expected");
    test_fixture(transform_fixture, "validate-global-variables.invalid.graphql", "compile_relay_artifacts/fixtures/validate-global-variables.invalid.expected", input, expected);
}

#[test]
fn validate_global_variables_shared_fragment_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/validate-global-variables-shared-fragment.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/validate-global-variables-shared-fragment.invalid.expected");
    test_fixture(transform_fixture, "validate-global-variables-shared-fragment.invalid.graphql", "compile_relay_artifacts/fixtures/validate-global-variables-shared-fragment.invalid.expected", input, expected);
}

#[test]
fn viewer_query() {
    let input = include_str!("compile_relay_artifacts/fixtures/viewer-query.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/viewer-query.expected");
    test_fixture(transform_fixture, "viewer-query.graphql", "compile_relay_artifacts/fixtures/viewer-query.expected", input, expected);
}
