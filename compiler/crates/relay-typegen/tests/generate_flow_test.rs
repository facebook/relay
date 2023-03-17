/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<e4dcf84160c278d5f1e7b92edfe5b44a>>
 */

mod generate_flow;

use generate_flow::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn actor_change() {
    let input = include_str!("generate_flow/fixtures/actor-change.graphql");
    let expected = include_str!("generate_flow/fixtures/actor-change.expected");
    test_fixture(transform_fixture, "actor-change.graphql", "generate_flow/fixtures/actor-change.expected", input, expected);
}

#[test]
fn actor_change_with_query() {
    let input = include_str!("generate_flow/fixtures/actor-change-with-query.graphql");
    let expected = include_str!("generate_flow/fixtures/actor-change-with-query.expected");
    test_fixture(transform_fixture, "actor-change-with-query.graphql", "generate_flow/fixtures/actor-change-with-query.expected", input, expected);
}

#[test]
fn aliased_fragment_raw_response_type() {
    let input = include_str!("generate_flow/fixtures/aliased-fragment-raw-response-type.graphql");
    let expected = include_str!("generate_flow/fixtures/aliased-fragment-raw-response-type.expected");
    test_fixture(transform_fixture, "aliased-fragment-raw-response-type.graphql", "generate_flow/fixtures/aliased-fragment-raw-response-type.expected", input, expected);
}

#[test]
fn aliased_fragment_spread() {
    let input = include_str!("generate_flow/fixtures/aliased-fragment-spread.graphql");
    let expected = include_str!("generate_flow/fixtures/aliased-fragment-spread.expected");
    test_fixture(transform_fixture, "aliased-fragment-spread.graphql", "generate_flow/fixtures/aliased-fragment-spread.expected", input, expected);
}

#[test]
fn aliased_fragment_spread_in_abstract_selection() {
    let input = include_str!("generate_flow/fixtures/aliased-fragment-spread-in-abstract-selection.graphql");
    let expected = include_str!("generate_flow/fixtures/aliased-fragment-spread-in-abstract-selection.expected");
    test_fixture(transform_fixture, "aliased-fragment-spread-in-abstract-selection.graphql", "generate_flow/fixtures/aliased-fragment-spread-in-abstract-selection.expected", input, expected);
}

#[test]
fn aliased_inline_fragment_spread() {
    let input = include_str!("generate_flow/fixtures/aliased-inline-fragment-spread.graphql");
    let expected = include_str!("generate_flow/fixtures/aliased-inline-fragment-spread.expected");
    test_fixture(transform_fixture, "aliased-inline-fragment-spread.graphql", "generate_flow/fixtures/aliased-inline-fragment-spread.expected", input, expected);
}

#[test]
fn aliased_inline_fragment_spread_without_type_condition_fragment_root() {
    let input = include_str!("generate_flow/fixtures/aliased-inline-fragment-spread-without-type-condition-fragment-root.graphql");
    let expected = include_str!("generate_flow/fixtures/aliased-inline-fragment-spread-without-type-condition-fragment-root.expected");
    test_fixture(transform_fixture, "aliased-inline-fragment-spread-without-type-condition-fragment-root.graphql", "generate_flow/fixtures/aliased-inline-fragment-spread-without-type-condition-fragment-root.expected", input, expected);
}

#[test]
fn aliased_inline_fragment_spread_without_type_condition_linked_field() {
    let input = include_str!("generate_flow/fixtures/aliased-inline-fragment-spread-without-type-condition-linked-field.graphql");
    let expected = include_str!("generate_flow/fixtures/aliased-inline-fragment-spread-without-type-condition-linked-field.expected");
    test_fixture(transform_fixture, "aliased-inline-fragment-spread-without-type-condition-linked-field.graphql", "generate_flow/fixtures/aliased-inline-fragment-spread-without-type-condition-linked-field.expected", input, expected);
}

#[test]
fn aliased_inline_fragment_spread_without_type_condition_query_root() {
    let input = include_str!("generate_flow/fixtures/aliased-inline-fragment-spread-without-type-condition-query-root.graphql");
    let expected = include_str!("generate_flow/fixtures/aliased-inline-fragment-spread-without-type-condition-query-root.expected");
    test_fixture(transform_fixture, "aliased-inline-fragment-spread-without-type-condition-query-root.graphql", "generate_flow/fixtures/aliased-inline-fragment-spread-without-type-condition-query-root.expected", input, expected);
}

#[test]
fn conditional() {
    let input = include_str!("generate_flow/fixtures/conditional.graphql");
    let expected = include_str!("generate_flow/fixtures/conditional.expected");
    test_fixture(transform_fixture, "conditional.graphql", "generate_flow/fixtures/conditional.expected", input, expected);
}

#[test]
fn custom_scalar_type_import() {
    let input = include_str!("generate_flow/fixtures/custom-scalar-type-import.graphql");
    let expected = include_str!("generate_flow/fixtures/custom-scalar-type-import.expected");
    test_fixture(transform_fixture, "custom-scalar-type-import.graphql", "generate_flow/fixtures/custom-scalar-type-import.expected", input, expected);
}

#[test]
fn fragment_spread() {
    let input = include_str!("generate_flow/fixtures/fragment-spread.graphql");
    let expected = include_str!("generate_flow/fixtures/fragment-spread.expected");
    test_fixture(transform_fixture, "fragment-spread.graphql", "generate_flow/fixtures/fragment-spread.expected", input, expected);
}

#[test]
fn inline_fragment() {
    let input = include_str!("generate_flow/fixtures/inline-fragment.graphql");
    let expected = include_str!("generate_flow/fixtures/inline-fragment.expected");
    test_fixture(transform_fixture, "inline-fragment.graphql", "generate_flow/fixtures/inline-fragment.expected", input, expected);
}

#[test]
fn linked_field() {
    let input = include_str!("generate_flow/fixtures/linked-field.graphql");
    let expected = include_str!("generate_flow/fixtures/linked-field.expected");
    test_fixture(transform_fixture, "linked-field.graphql", "generate_flow/fixtures/linked-field.expected", input, expected);
}

#[test]
fn match_field() {
    let input = include_str!("generate_flow/fixtures/match-field.graphql");
    let expected = include_str!("generate_flow/fixtures/match-field.expected");
    test_fixture(transform_fixture, "match-field.graphql", "generate_flow/fixtures/match-field.expected", input, expected);
}

#[test]
fn match_field_in_query() {
    let input = include_str!("generate_flow/fixtures/match-field-in-query.graphql");
    let expected = include_str!("generate_flow/fixtures/match-field-in-query.expected");
    test_fixture(transform_fixture, "match-field-in-query.graphql", "generate_flow/fixtures/match-field-in-query.expected", input, expected);
}

#[test]
fn mutation() {
    let input = include_str!("generate_flow/fixtures/mutation.graphql");
    let expected = include_str!("generate_flow/fixtures/mutation.expected");
    test_fixture(transform_fixture, "mutation.graphql", "generate_flow/fixtures/mutation.expected", input, expected);
}

#[test]
fn mutation_input_has_array() {
    let input = include_str!("generate_flow/fixtures/mutation-input-has-array.graphql");
    let expected = include_str!("generate_flow/fixtures/mutation-input-has-array.expected");
    test_fixture(transform_fixture, "mutation-input-has-array.graphql", "generate_flow/fixtures/mutation-input-has-array.expected", input, expected);
}

#[test]
fn mutation_with_client_extension() {
    let input = include_str!("generate_flow/fixtures/mutation-with-client-extension.graphql");
    let expected = include_str!("generate_flow/fixtures/mutation-with-client-extension.expected");
    test_fixture(transform_fixture, "mutation-with-client-extension.graphql", "generate_flow/fixtures/mutation-with-client-extension.expected", input, expected);
}

#[test]
fn mutation_with_enums_on_fragment() {
    let input = include_str!("generate_flow/fixtures/mutation-with-enums-on-fragment.graphql");
    let expected = include_str!("generate_flow/fixtures/mutation-with-enums-on-fragment.expected");
    test_fixture(transform_fixture, "mutation-with-enums-on-fragment.graphql", "generate_flow/fixtures/mutation-with-enums-on-fragment.expected", input, expected);
}

#[test]
fn mutation_with_nested_fragments() {
    let input = include_str!("generate_flow/fixtures/mutation-with-nested-fragments.graphql");
    let expected = include_str!("generate_flow/fixtures/mutation-with-nested-fragments.expected");
    test_fixture(transform_fixture, "mutation-with-nested-fragments.graphql", "generate_flow/fixtures/mutation-with-nested-fragments.expected", input, expected);
}

#[test]
fn mutation_with_response_on_inline_fragments() {
    let input = include_str!("generate_flow/fixtures/mutation-with-response-on-inline-fragments.graphql");
    let expected = include_str!("generate_flow/fixtures/mutation-with-response-on-inline-fragments.expected");
    test_fixture(transform_fixture, "mutation-with-response-on-inline-fragments.graphql", "generate_flow/fixtures/mutation-with-response-on-inline-fragments.expected", input, expected);
}

#[test]
fn no_inline_fragment() {
    let input = include_str!("generate_flow/fixtures/no-inline-fragment.graphql");
    let expected = include_str!("generate_flow/fixtures/no-inline-fragment.expected");
    test_fixture(transform_fixture, "no-inline-fragment.graphql", "generate_flow/fixtures/no-inline-fragment.expected", input, expected);
}

#[test]
fn plural_fragment() {
    let input = include_str!("generate_flow/fixtures/plural-fragment.graphql");
    let expected = include_str!("generate_flow/fixtures/plural-fragment.expected");
    test_fixture(transform_fixture, "plural-fragment.graphql", "generate_flow/fixtures/plural-fragment.expected", input, expected);
}

#[test]
fn query_mixed_provided_variables() {
    let input = include_str!("generate_flow/fixtures/query-mixed-provided-variables.graphql");
    let expected = include_str!("generate_flow/fixtures/query-mixed-provided-variables.expected");
    test_fixture(transform_fixture, "query-mixed-provided-variables.graphql", "generate_flow/fixtures/query-mixed-provided-variables.expected", input, expected);
}

#[test]
fn query_only_provided_variables() {
    let input = include_str!("generate_flow/fixtures/query-only-provided-variables.graphql");
    let expected = include_str!("generate_flow/fixtures/query-only-provided-variables.expected");
    test_fixture(transform_fixture, "query-only-provided-variables.graphql", "generate_flow/fixtures/query-only-provided-variables.expected", input, expected);
}

#[test]
fn query_provided_variables_custom_scalar() {
    let input = include_str!("generate_flow/fixtures/query-provided-variables-custom-scalar.graphql");
    let expected = include_str!("generate_flow/fixtures/query-provided-variables-custom-scalar.expected");
    test_fixture(transform_fixture, "query-provided-variables-custom-scalar.graphql", "generate_flow/fixtures/query-provided-variables-custom-scalar.expected", input, expected);
}

#[test]
fn query_with_handles() {
    let input = include_str!("generate_flow/fixtures/query-with-handles.graphql");
    let expected = include_str!("generate_flow/fixtures/query-with-handles.expected");
    test_fixture(transform_fixture, "query-with-handles.graphql", "generate_flow/fixtures/query-with-handles.expected", input, expected);
}

#[test]
fn query_with_match_fields() {
    let input = include_str!("generate_flow/fixtures/query-with-match-fields.graphql");
    let expected = include_str!("generate_flow/fixtures/query-with-match-fields.expected");
    test_fixture(transform_fixture, "query-with-match-fields.graphql", "generate_flow/fixtures/query-with-match-fields.expected", input, expected);
}

#[test]
fn query_with_module_field() {
    let input = include_str!("generate_flow/fixtures/query-with-module-field.graphql");
    let expected = include_str!("generate_flow/fixtures/query-with-module-field.expected");
    test_fixture(transform_fixture, "query-with-module-field.graphql", "generate_flow/fixtures/query-with-module-field.expected", input, expected);
}

#[test]
fn query_with_multiple_match_fields() {
    let input = include_str!("generate_flow/fixtures/query-with-multiple-match-fields.graphql");
    let expected = include_str!("generate_flow/fixtures/query-with-multiple-match-fields.expected");
    test_fixture(transform_fixture, "query-with-multiple-match-fields.graphql", "generate_flow/fixtures/query-with-multiple-match-fields.expected", input, expected);
}

#[test]
fn query_with_raw_response_and_client_components() {
    let input = include_str!("generate_flow/fixtures/query_with_raw_response_and_client_components.graphql");
    let expected = include_str!("generate_flow/fixtures/query_with_raw_response_and_client_components.expected");
    test_fixture(transform_fixture, "query_with_raw_response_and_client_components.graphql", "generate_flow/fixtures/query_with_raw_response_and_client_components.expected", input, expected);
}

#[test]
fn query_with_raw_response_on_conditional() {
    let input = include_str!("generate_flow/fixtures/query-with-raw-response-on-conditional.graphql");
    let expected = include_str!("generate_flow/fixtures/query-with-raw-response-on-conditional.expected");
    test_fixture(transform_fixture, "query-with-raw-response-on-conditional.graphql", "generate_flow/fixtures/query-with-raw-response-on-conditional.expected", input, expected);
}

#[test]
fn query_with_raw_response_on_literal_conditional() {
    let input = include_str!("generate_flow/fixtures/query-with-raw-response-on-literal-conditional.graphql");
    let expected = include_str!("generate_flow/fixtures/query-with-raw-response-on-literal-conditional.expected");
    test_fixture(transform_fixture, "query-with-raw-response-on-literal-conditional.graphql", "generate_flow/fixtures/query-with-raw-response-on-literal-conditional.expected", input, expected);
}

#[test]
fn query_with_stream() {
    let input = include_str!("generate_flow/fixtures/query-with-stream.graphql");
    let expected = include_str!("generate_flow/fixtures/query-with-stream.expected");
    test_fixture(transform_fixture, "query-with-stream.graphql", "generate_flow/fixtures/query-with-stream.expected", input, expected);
}

#[test]
fn query_with_stream_connection() {
    let input = include_str!("generate_flow/fixtures/query-with-stream-connection.graphql");
    let expected = include_str!("generate_flow/fixtures/query-with-stream-connection.expected");
    test_fixture(transform_fixture, "query-with-stream-connection.graphql", "generate_flow/fixtures/query-with-stream-connection.expected", input, expected);
}

#[test]
fn recursive_fragments() {
    let input = include_str!("generate_flow/fixtures/recursive-fragments.graphql");
    let expected = include_str!("generate_flow/fixtures/recursive-fragments.expected");
    test_fixture(transform_fixture, "recursive-fragments.graphql", "generate_flow/fixtures/recursive-fragments.expected", input, expected);
}

#[test]
fn refetchable() {
    let input = include_str!("generate_flow/fixtures/refetchable.graphql");
    let expected = include_str!("generate_flow/fixtures/refetchable.expected");
    test_fixture(transform_fixture, "refetchable.graphql", "generate_flow/fixtures/refetchable.expected", input, expected);
}

#[test]
fn refetchable_fragment() {
    let input = include_str!("generate_flow/fixtures/refetchable-fragment.graphql");
    let expected = include_str!("generate_flow/fixtures/refetchable-fragment.expected");
    test_fixture(transform_fixture, "refetchable-fragment.graphql", "generate_flow/fixtures/refetchable-fragment.expected", input, expected);
}

#[test]
fn regular_query_with_assignable_fragment_spread() {
    let input = include_str!("generate_flow/fixtures/regular-query-with-assignable-fragment-spread.graphql");
    let expected = include_str!("generate_flow/fixtures/regular-query-with-assignable-fragment-spread.expected");
    test_fixture(transform_fixture, "regular-query-with-assignable-fragment-spread.graphql", "generate_flow/fixtures/regular-query-with-assignable-fragment-spread.expected", input, expected);
}

#[test]
fn relay_client_id_field() {
    let input = include_str!("generate_flow/fixtures/relay-client-id-field.graphql");
    let expected = include_str!("generate_flow/fixtures/relay-client-id-field.expected");
    test_fixture(transform_fixture, "relay-client-id-field.graphql", "generate_flow/fixtures/relay-client-id-field.expected", input, expected);
}

#[test]
fn relay_live_resolver() {
    let input = include_str!("generate_flow/fixtures/relay-live-resolver.graphql");
    let expected = include_str!("generate_flow/fixtures/relay-live-resolver.expected");
    test_fixture(transform_fixture, "relay-live-resolver.graphql", "generate_flow/fixtures/relay-live-resolver.expected", input, expected);
}

#[test]
fn relay_live_resolver_no_fragment() {
    let input = include_str!("generate_flow/fixtures/relay-live-resolver-no-fragment.graphql");
    let expected = include_str!("generate_flow/fixtures/relay-live-resolver-no-fragment.expected");
    test_fixture(transform_fixture, "relay-live-resolver-no-fragment.graphql", "generate_flow/fixtures/relay-live-resolver-no-fragment.expected", input, expected);
}

#[test]
fn relay_live_resolver_with_field_args() {
    let input = include_str!("generate_flow/fixtures/relay-live-resolver-with-field-args.graphql");
    let expected = include_str!("generate_flow/fixtures/relay-live-resolver-with-field-args.expected");
    test_fixture(transform_fixture, "relay-live-resolver-with-field-args.graphql", "generate_flow/fixtures/relay-live-resolver-with-field-args.expected", input, expected);
}

#[test]
fn relay_live_resolver_with_field_args_no_fragment() {
    let input = include_str!("generate_flow/fixtures/relay-live-resolver-with-field-args-no-fragment.graphql");
    let expected = include_str!("generate_flow/fixtures/relay-live-resolver-with-field-args-no-fragment.expected");
    test_fixture(transform_fixture, "relay-live-resolver-with-field-args-no-fragment.graphql", "generate_flow/fixtures/relay-live-resolver-with-field-args-no-fragment.expected", input, expected);
}

#[test]
fn relay_resolver() {
    let input = include_str!("generate_flow/fixtures/relay-resolver.graphql");
    let expected = include_str!("generate_flow/fixtures/relay-resolver.expected");
    test_fixture(transform_fixture, "relay-resolver.graphql", "generate_flow/fixtures/relay-resolver.expected", input, expected);
}

#[test]
fn relay_resolver_client_edge() {
    let input = include_str!("generate_flow/fixtures/relay-resolver-client-edge.graphql");
    let expected = include_str!("generate_flow/fixtures/relay-resolver-client-edge.expected");
    test_fixture(transform_fixture, "relay-resolver-client-edge.graphql", "generate_flow/fixtures/relay-resolver-client-edge.expected", input, expected);
}

#[test]
fn relay_resolver_client_edge_required() {
    let input = include_str!("generate_flow/fixtures/relay-resolver-client-edge-required.graphql");
    let expected = include_str!("generate_flow/fixtures/relay-resolver-client-edge-required.expected");
    test_fixture(transform_fixture, "relay-resolver-client-edge-required.graphql", "generate_flow/fixtures/relay-resolver-client-edge-required.expected", input, expected);
}

#[test]
fn relay_resolver_client_edge_required_edge() {
    let input = include_str!("generate_flow/fixtures/relay-resolver-client-edge-required-edge.graphql");
    let expected = include_str!("generate_flow/fixtures/relay-resolver-client-edge-required-edge.expected");
    test_fixture(transform_fixture, "relay-resolver-client-edge-required-edge.graphql", "generate_flow/fixtures/relay-resolver-client-edge-required-edge.expected", input, expected);
}

#[test]
fn relay_resolver_in_fragment() {
    let input = include_str!("generate_flow/fixtures/relay-resolver-in-fragment.graphql");
    let expected = include_str!("generate_flow/fixtures/relay-resolver-in-fragment.expected");
    test_fixture(transform_fixture, "relay-resolver-in-fragment.graphql", "generate_flow/fixtures/relay-resolver-in-fragment.expected", input, expected);
}

#[test]
fn relay_resolver_inject_fragment_data() {
    let input = include_str!("generate_flow/fixtures/relay-resolver-inject-fragment-data.graphql");
    let expected = include_str!("generate_flow/fixtures/relay-resolver-inject-fragment-data.expected");
    test_fixture(transform_fixture, "relay-resolver-inject-fragment-data.graphql", "generate_flow/fixtures/relay-resolver-inject-fragment-data.expected", input, expected);
}

#[test]
fn relay_resolver_live_client_edge() {
    let input = include_str!("generate_flow/fixtures/relay-resolver-live-client-edge.graphql");
    let expected = include_str!("generate_flow/fixtures/relay-resolver-live-client-edge.expected");
    test_fixture(transform_fixture, "relay-resolver-live-client-edge.graphql", "generate_flow/fixtures/relay-resolver-live-client-edge.expected", input, expected);
}

#[test]
fn relay_resolver_multiple_consumers() {
    let input = include_str!("generate_flow/fixtures/relay-resolver-multiple-consumers.graphql");
    let expected = include_str!("generate_flow/fixtures/relay-resolver-multiple-consumers.expected");
    test_fixture(transform_fixture, "relay-resolver-multiple-consumers.graphql", "generate_flow/fixtures/relay-resolver-multiple-consumers.expected", input, expected);
}

#[test]
fn relay_resolver_named_import() {
    let input = include_str!("generate_flow/fixtures/relay-resolver-named-import.graphql");
    let expected = include_str!("generate_flow/fixtures/relay-resolver-named-import.expected");
    test_fixture(transform_fixture, "relay-resolver-named-import.graphql", "generate_flow/fixtures/relay-resolver-named-import.expected", input, expected);
}

#[test]
fn relay_resolver_plural_client_edge() {
    let input = include_str!("generate_flow/fixtures/relay-resolver-plural-client-edge.graphql");
    let expected = include_str!("generate_flow/fixtures/relay-resolver-plural-client-edge.expected");
    test_fixture(transform_fixture, "relay-resolver-plural-client-edge.graphql", "generate_flow/fixtures/relay-resolver-plural-client-edge.expected", input, expected);
}

#[test]
fn relay_resolver_plural_client_edge_with_required_edge() {
    let input = include_str!("generate_flow/fixtures/relay-resolver-plural-client-edge-with-required-edge.graphql");
    let expected = include_str!("generate_flow/fixtures/relay-resolver-plural-client-edge-with-required-edge.expected");
    test_fixture(transform_fixture, "relay-resolver-plural-client-edge-with-required-edge.graphql", "generate_flow/fixtures/relay-resolver-plural-client-edge-with-required-edge.expected", input, expected);
}

#[test]
fn relay_resolver_plural_required_client_edge() {
    let input = include_str!("generate_flow/fixtures/relay-resolver-plural-required-client-edge.graphql");
    let expected = include_str!("generate_flow/fixtures/relay-resolver-plural-required-client-edge.expected");
    test_fixture(transform_fixture, "relay-resolver-plural-required-client-edge.graphql", "generate_flow/fixtures/relay-resolver-plural-required-client-edge.expected", input, expected);
}

#[test]
fn relay_resolver_plural_required_client_edge_with_required_edge() {
    let input = include_str!("generate_flow/fixtures/relay-resolver-plural-required-client-edge-with-required-edge.graphql");
    let expected = include_str!("generate_flow/fixtures/relay-resolver-plural-required-client-edge-with-required-edge.expected");
    test_fixture(transform_fixture, "relay-resolver-plural-required-client-edge-with-required-edge.graphql", "generate_flow/fixtures/relay-resolver-plural-required-client-edge-with-required-edge.expected", input, expected);
}

#[test]
fn relay_resolver_raw_response() {
    let input = include_str!("generate_flow/fixtures/relay-resolver-raw-response.graphql");
    let expected = include_str!("generate_flow/fixtures/relay-resolver-raw-response.expected");
    test_fixture(transform_fixture, "relay-resolver-raw-response.graphql", "generate_flow/fixtures/relay-resolver-raw-response.expected", input, expected);
}

#[test]
fn relay_resolver_required() {
    let input = include_str!("generate_flow/fixtures/relay-resolver-required.graphql");
    let expected = include_str!("generate_flow/fixtures/relay-resolver-required.expected");
    test_fixture(transform_fixture, "relay-resolver-required.graphql", "generate_flow/fixtures/relay-resolver-required.expected", input, expected);
}

#[test]
fn relay_resolver_with_output_type_client_interface() {
    let input = include_str!("generate_flow/fixtures/relay-resolver-with-output-type-client-interface.graphql");
    let expected = include_str!("generate_flow/fixtures/relay-resolver-with-output-type-client-interface.expected");
    test_fixture(transform_fixture, "relay-resolver-with-output-type-client-interface.graphql", "generate_flow/fixtures/relay-resolver-with-output-type-client-interface.expected", input, expected);
}

#[test]
fn relay_resolver_with_output_type_client_object() {
    let input = include_str!("generate_flow/fixtures/relay-resolver-with-output-type-client-object.graphql");
    let expected = include_str!("generate_flow/fixtures/relay-resolver-with-output-type-client-object.expected");
    test_fixture(transform_fixture, "relay-resolver-with-output-type-client-object.graphql", "generate_flow/fixtures/relay-resolver-with-output-type-client-object.expected", input, expected);
}

#[test]
fn relay_resolver_with_output_type_enum() {
    let input = include_str!("generate_flow/fixtures/relay-resolver-with-output-type-enum.graphql");
    let expected = include_str!("generate_flow/fixtures/relay-resolver-with-output-type-enum.expected");
    test_fixture(transform_fixture, "relay-resolver-with-output-type-enum.graphql", "generate_flow/fixtures/relay-resolver-with-output-type-enum.expected", input, expected);
}

#[test]
fn relay_resolver_with_output_type_relay_resolver_value() {
    let input = include_str!("generate_flow/fixtures/relay-resolver-with-output-type-relay-resolver-value.graphql");
    let expected = include_str!("generate_flow/fixtures/relay-resolver-with-output-type-relay-resolver-value.expected");
    test_fixture(transform_fixture, "relay-resolver-with-output-type-relay-resolver-value.graphql", "generate_flow/fixtures/relay-resolver-with-output-type-relay-resolver-value.expected", input, expected);
}

#[test]
fn relay_resolver_with_output_type_relay_resolver_value_required() {
    let input = include_str!("generate_flow/fixtures/relay-resolver-with-output-type-relay-resolver-value-required.graphql");
    let expected = include_str!("generate_flow/fixtures/relay-resolver-with-output-type-relay-resolver-value-required.expected");
    test_fixture(transform_fixture, "relay-resolver-with-output-type-relay-resolver-value-required.graphql", "generate_flow/fixtures/relay-resolver-with-output-type-relay-resolver-value-required.expected", input, expected);
}

#[test]
fn relay_resolver_with_output_type_scalar() {
    let input = include_str!("generate_flow/fixtures/relay-resolver-with-output-type-scalar.graphql");
    let expected = include_str!("generate_flow/fixtures/relay-resolver-with-output-type-scalar.expected");
    test_fixture(transform_fixture, "relay-resolver-with-output-type-scalar.graphql", "generate_flow/fixtures/relay-resolver-with-output-type-scalar.expected", input, expected);
}

#[test]
fn relay_resolver_with_output_type_scalar_required() {
    let input = include_str!("generate_flow/fixtures/relay-resolver-with-output-type-scalar-required.graphql");
    let expected = include_str!("generate_flow/fixtures/relay-resolver-with-output-type-scalar-required.expected");
    test_fixture(transform_fixture, "relay-resolver-with-output-type-scalar-required.graphql", "generate_flow/fixtures/relay-resolver-with-output-type-scalar-required.expected", input, expected);
}

#[test]
fn relay_weak_client_type() {
    let input = include_str!("generate_flow/fixtures/relay-weak-client-type.graphql");
    let expected = include_str!("generate_flow/fixtures/relay-weak-client-type.expected");
    test_fixture(transform_fixture, "relay-weak-client-type.graphql", "generate_flow/fixtures/relay-weak-client-type.expected", input, expected);
}

#[test]
fn required() {
    let input = include_str!("generate_flow/fixtures/required.graphql");
    let expected = include_str!("generate_flow/fixtures/required.expected");
    test_fixture(transform_fixture, "required.graphql", "generate_flow/fixtures/required.expected", input, expected);
}

#[test]
fn required_bubbles_through_inline_fragments_to_fragment() {
    let input = include_str!("generate_flow/fixtures/required-bubbles-through-inline-fragments-to-fragment.graphql");
    let expected = include_str!("generate_flow/fixtures/required-bubbles-through-inline-fragments-to-fragment.expected");
    test_fixture(transform_fixture, "required-bubbles-through-inline-fragments-to-fragment.graphql", "generate_flow/fixtures/required-bubbles-through-inline-fragments-to-fragment.expected", input, expected);
}

#[test]
fn required_bubbles_to_fragment() {
    let input = include_str!("generate_flow/fixtures/required-bubbles-to-fragment.graphql");
    let expected = include_str!("generate_flow/fixtures/required-bubbles-to-fragment.expected");
    test_fixture(transform_fixture, "required-bubbles-to-fragment.graphql", "generate_flow/fixtures/required-bubbles-to-fragment.expected", input, expected);
}

#[test]
fn required_bubbles_to_item_in_plural_field() {
    let input = include_str!("generate_flow/fixtures/required-bubbles-to-item-in-plural-field.graphql");
    let expected = include_str!("generate_flow/fixtures/required-bubbles-to-item-in-plural-field.expected");
    test_fixture(transform_fixture, "required-bubbles-to-item-in-plural-field.graphql", "generate_flow/fixtures/required-bubbles-to-item-in-plural-field.expected", input, expected);
}

#[test]
fn required_bubbles_to_item_in_required_plural_field() {
    let input = include_str!("generate_flow/fixtures/required-bubbles-to-item-in-required-plural-field.graphql");
    let expected = include_str!("generate_flow/fixtures/required-bubbles-to-item-in-required-plural-field.expected");
    test_fixture(transform_fixture, "required-bubbles-to-item-in-required-plural-field.graphql", "generate_flow/fixtures/required-bubbles-to-item-in-required-plural-field.expected", input, expected);
}

#[test]
fn required_bubbles_to_non_null_item_in_non_null_plural_linked_field() {
    let input = include_str!("generate_flow/fixtures/required-bubbles-to-non-null-item-in-non-null-plural-linked-field.graphql");
    let expected = include_str!("generate_flow/fixtures/required-bubbles-to-non-null-item-in-non-null-plural-linked-field.expected");
    test_fixture(transform_fixture, "required-bubbles-to-non-null-item-in-non-null-plural-linked-field.graphql", "generate_flow/fixtures/required-bubbles-to-non-null-item-in-non-null-plural-linked-field.expected", input, expected);
}

#[test]
fn required_bubbles_to_non_null_linked_field() {
    let input = include_str!("generate_flow/fixtures/required-bubbles-to-non-null-linked-field.graphql");
    let expected = include_str!("generate_flow/fixtures/required-bubbles-to-non-null-linked-field.expected");
    test_fixture(transform_fixture, "required-bubbles-to-non-null-linked-field.graphql", "generate_flow/fixtures/required-bubbles-to-non-null-linked-field.expected", input, expected);
}

#[test]
fn required_bubbles_to_non_null_linked_field_through_inline_fragment() {
    let input = include_str!("generate_flow/fixtures/required-bubbles-to-non-null-linked-field-through-inline-fragment.graphql");
    let expected = include_str!("generate_flow/fixtures/required-bubbles-to-non-null-linked-field-through-inline-fragment.expected");
    test_fixture(transform_fixture, "required-bubbles-to-non-null-linked-field-through-inline-fragment.graphql", "generate_flow/fixtures/required-bubbles-to-non-null-linked-field-through-inline-fragment.expected", input, expected);
}

#[test]
fn required_bubbles_to_non_null_plural_linked_field() {
    let input = include_str!("generate_flow/fixtures/required-bubbles-to-non-null-plural-linked-field.graphql");
    let expected = include_str!("generate_flow/fixtures/required-bubbles-to-non-null-plural-linked-field.expected");
    test_fixture(transform_fixture, "required-bubbles-to-non-null-plural-linked-field.graphql", "generate_flow/fixtures/required-bubbles-to-non-null-plural-linked-field.expected", input, expected);
}

#[test]
fn required_bubbles_to_plural_fragment_root() {
    let input = include_str!("generate_flow/fixtures/required-bubbles-to-plural-fragment-root.graphql");
    let expected = include_str!("generate_flow/fixtures/required-bubbles-to-plural-fragment-root.expected");
    test_fixture(transform_fixture, "required-bubbles-to-plural-fragment-root.graphql", "generate_flow/fixtures/required-bubbles-to-plural-fragment-root.expected", input, expected);
}

#[test]
fn required_bubbles_to_query() {
    let input = include_str!("generate_flow/fixtures/required-bubbles-to-query.graphql");
    let expected = include_str!("generate_flow/fixtures/required-bubbles-to-query.expected");
    test_fixture(transform_fixture, "required-bubbles-to-query.graphql", "generate_flow/fixtures/required-bubbles-to-query.expected", input, expected);
}

#[test]
fn required_bubbles_up_to_mutation_response() {
    let input = include_str!("generate_flow/fixtures/required-bubbles-up-to-mutation-response.graphql");
    let expected = include_str!("generate_flow/fixtures/required-bubbles-up-to-mutation-response.expected");
    test_fixture(transform_fixture, "required-bubbles-up-to-mutation-response.graphql", "generate_flow/fixtures/required-bubbles-up-to-mutation-response.expected", input, expected);
}

#[test]
fn required_chain_bubbles_to_non_null_linked_field_through_inline_fragment() {
    let input = include_str!("generate_flow/fixtures/required-chain-bubbles-to-non-null-linked-field-through-inline-fragment.graphql");
    let expected = include_str!("generate_flow/fixtures/required-chain-bubbles-to-non-null-linked-field-through-inline-fragment.expected");
    test_fixture(transform_fixture, "required-chain-bubbles-to-non-null-linked-field-through-inline-fragment.graphql", "generate_flow/fixtures/required-chain-bubbles-to-non-null-linked-field-through-inline-fragment.expected", input, expected);
}

#[test]
fn required_isolates_concrete_inline_fragments() {
    let input = include_str!("generate_flow/fixtures/required-isolates-concrete-inline-fragments.graphql");
    let expected = include_str!("generate_flow/fixtures/required-isolates-concrete-inline-fragments.expected");
    test_fixture(transform_fixture, "required-isolates-concrete-inline-fragments.graphql", "generate_flow/fixtures/required-isolates-concrete-inline-fragments.expected", input, expected);
}

#[test]
fn required_raw_response_type() {
    let input = include_str!("generate_flow/fixtures/required-raw-response-type.graphql");
    let expected = include_str!("generate_flow/fixtures/required-raw-response-type.expected");
    test_fixture(transform_fixture, "required-raw-response-type.graphql", "generate_flow/fixtures/required-raw-response-type.expected", input, expected);
}

#[test]
fn required_throw_doesnt_bubbles_to_fragment() {
    let input = include_str!("generate_flow/fixtures/required-throw-doesnt-bubbles-to-fragment.graphql");
    let expected = include_str!("generate_flow/fixtures/required-throw-doesnt-bubbles-to-fragment.expected");
    test_fixture(transform_fixture, "required-throw-doesnt-bubbles-to-fragment.graphql", "generate_flow/fixtures/required-throw-doesnt-bubbles-to-fragment.expected", input, expected);
}

#[test]
fn required_throw_doesnt_bubbles_to_query() {
    let input = include_str!("generate_flow/fixtures/required-throw-doesnt-bubbles-to-query.graphql");
    let expected = include_str!("generate_flow/fixtures/required-throw-doesnt-bubbles-to-query.expected");
    test_fixture(transform_fixture, "required-throw-doesnt-bubbles-to-query.graphql", "generate_flow/fixtures/required-throw-doesnt-bubbles-to-query.expected", input, expected);
}

#[test]
fn required_throws_nested() {
    let input = include_str!("generate_flow/fixtures/required-throws-nested.graphql");
    let expected = include_str!("generate_flow/fixtures/required-throws-nested.expected");
    test_fixture(transform_fixture, "required-throws-nested.graphql", "generate_flow/fixtures/required-throws-nested.expected", input, expected);
}

#[test]
fn required_throws_within_non_null_linked_field() {
    let input = include_str!("generate_flow/fixtures/required-throws-within-non-null-linked-field.graphql");
    let expected = include_str!("generate_flow/fixtures/required-throws-within-non-null-linked-field.expected");
    test_fixture(transform_fixture, "required-throws-within-non-null-linked-field.graphql", "generate_flow/fixtures/required-throws-within-non-null-linked-field.expected", input, expected);
}

#[test]
fn required_throws_within_non_null_plural_linked_field() {
    let input = include_str!("generate_flow/fixtures/required-throws-within-non-null-plural-linked-field.graphql");
    let expected = include_str!("generate_flow/fixtures/required-throws-within-non-null-plural-linked-field.expected");
    test_fixture(transform_fixture, "required-throws-within-non-null-plural-linked-field.graphql", "generate_flow/fixtures/required-throws-within-non-null-plural-linked-field.expected", input, expected);
}

#[test]
fn required_within_aliased_inline_fragment() {
    let input = include_str!("generate_flow/fixtures/required-within-aliased-inline-fragment.graphql");
    let expected = include_str!("generate_flow/fixtures/required-within-aliased-inline-fragment.expected");
    test_fixture(transform_fixture, "required-within-aliased-inline-fragment.graphql", "generate_flow/fixtures/required-within-aliased-inline-fragment.expected", input, expected);
}

#[test]
fn required_within_aliased_inline_fragment_on_abstract() {
    let input = include_str!("generate_flow/fixtures/required-within-aliased-inline-fragment-on-abstract.graphql");
    let expected = include_str!("generate_flow/fixtures/required-within-aliased-inline-fragment-on-abstract.expected");
    test_fixture(transform_fixture, "required-within-aliased-inline-fragment-on-abstract.graphql", "generate_flow/fixtures/required-within-aliased-inline-fragment-on-abstract.expected", input, expected);
}

#[test]
fn roots() {
    let input = include_str!("generate_flow/fixtures/roots.graphql");
    let expected = include_str!("generate_flow/fixtures/roots.expected");
    test_fixture(transform_fixture, "roots.graphql", "generate_flow/fixtures/roots.expected", input, expected);
}

#[test]
fn scalar_field() {
    let input = include_str!("generate_flow/fixtures/scalar-field.graphql");
    let expected = include_str!("generate_flow/fixtures/scalar-field.expected");
    test_fixture(transform_fixture, "scalar-field.graphql", "generate_flow/fixtures/scalar-field.expected", input, expected);
}

#[test]
fn simple() {
    let input = include_str!("generate_flow/fixtures/simple.graphql");
    let expected = include_str!("generate_flow/fixtures/simple.expected");
    test_fixture(transform_fixture, "simple.graphql", "generate_flow/fixtures/simple.expected", input, expected);
}

#[test]
fn typename_in_union_with_other_fields() {
    let input = include_str!("generate_flow/fixtures/typename-in-union-with-other-fields.graphql");
    let expected = include_str!("generate_flow/fixtures/typename-in-union-with-other-fields.expected");
    test_fixture(transform_fixture, "typename-in-union-with-other-fields.graphql", "generate_flow/fixtures/typename-in-union-with-other-fields.expected", input, expected);
}

#[test]
fn typename_inside_with_overlapping_fields() {
    let input = include_str!("generate_flow/fixtures/typename-inside-with-overlapping-fields.graphql");
    let expected = include_str!("generate_flow/fixtures/typename-inside-with-overlapping-fields.expected");
    test_fixture(transform_fixture, "typename-inside-with-overlapping-fields.graphql", "generate_flow/fixtures/typename-inside-with-overlapping-fields.expected", input, expected);
}

#[test]
fn typename_on_union() {
    let input = include_str!("generate_flow/fixtures/typename-on-union.graphql");
    let expected = include_str!("generate_flow/fixtures/typename-on-union.expected");
    test_fixture(transform_fixture, "typename-on-union.graphql", "generate_flow/fixtures/typename-on-union.expected", input, expected);
}

#[test]
fn typename_on_union_with_non_matching_aliases() {
    let input = include_str!("generate_flow/fixtures/typename-on-union-with-non-matching-aliases.graphql");
    let expected = include_str!("generate_flow/fixtures/typename-on-union-with-non-matching-aliases.expected");
    test_fixture(transform_fixture, "typename-on-union-with-non-matching-aliases.graphql", "generate_flow/fixtures/typename-on-union-with-non-matching-aliases.expected", input, expected);
}

#[test]
fn unmasked_fragment_spreads() {
    let input = include_str!("generate_flow/fixtures/unmasked-fragment-spreads.graphql");
    let expected = include_str!("generate_flow/fixtures/unmasked-fragment-spreads.expected");
    test_fixture(transform_fixture, "unmasked-fragment-spreads.graphql", "generate_flow/fixtures/unmasked-fragment-spreads.expected", input, expected);
}

#[test]
fn updatable_fragment_spread() {
    let input = include_str!("generate_flow/fixtures/updatable-fragment-spread.graphql");
    let expected = include_str!("generate_flow/fixtures/updatable-fragment-spread.expected");
    test_fixture(transform_fixture, "updatable-fragment-spread.graphql", "generate_flow/fixtures/updatable-fragment-spread.expected", input, expected);
}

#[test]
fn updatable_fragment_spread_and_regular_spread() {
    let input = include_str!("generate_flow/fixtures/updatable-fragment-spread-and-regular-spread.graphql");
    let expected = include_str!("generate_flow/fixtures/updatable-fragment-spread-and-regular-spread.expected");
    test_fixture(transform_fixture, "updatable-fragment-spread-and-regular-spread.graphql", "generate_flow/fixtures/updatable-fragment-spread-and-regular-spread.expected", input, expected);
}

#[test]
fn updatable_fragment_spread_multiple() {
    let input = include_str!("generate_flow/fixtures/updatable-fragment-spread-multiple.graphql");
    let expected = include_str!("generate_flow/fixtures/updatable-fragment-spread-multiple.expected");
    test_fixture(transform_fixture, "updatable-fragment-spread-multiple.graphql", "generate_flow/fixtures/updatable-fragment-spread-multiple.expected", input, expected);
}

#[test]
fn updatable_operation() {
    let input = include_str!("generate_flow/fixtures/updatable-operation.graphql");
    let expected = include_str!("generate_flow/fixtures/updatable-operation.expected");
    test_fixture(transform_fixture, "updatable-operation.graphql", "generate_flow/fixtures/updatable-operation.expected", input, expected);
}

#[test]
fn updatable_operation_assignable_fragment() {
    let input = include_str!("generate_flow/fixtures/updatable-operation-assignable-fragment.graphql");
    let expected = include_str!("generate_flow/fixtures/updatable-operation-assignable-fragment.expected");
    test_fixture(transform_fixture, "updatable-operation-assignable-fragment.graphql", "generate_flow/fixtures/updatable-operation-assignable-fragment.expected", input, expected);
}

#[test]
fn updatable_operation_assignable_fragment_plural() {
    let input = include_str!("generate_flow/fixtures/updatable-operation-assignable-fragment-plural.graphql");
    let expected = include_str!("generate_flow/fixtures/updatable-operation-assignable-fragment-plural.expected");
    test_fixture(transform_fixture, "updatable-operation-assignable-fragment-plural.graphql", "generate_flow/fixtures/updatable-operation-assignable-fragment-plural.expected", input, expected);
}

#[test]
fn updatable_operation_assignable_fragments_within_narrowing() {
    let input = include_str!("generate_flow/fixtures/updatable-operation-assignable-fragments-within-narrowing.graphql");
    let expected = include_str!("generate_flow/fixtures/updatable-operation-assignable-fragments-within-narrowing.expected");
    test_fixture(transform_fixture, "updatable-operation-assignable-fragments-within-narrowing.graphql", "generate_flow/fixtures/updatable-operation-assignable-fragments-within-narrowing.expected", input, expected);
}

#[test]
fn updatable_operation_multiple_assignable_fragments() {
    let input = include_str!("generate_flow/fixtures/updatable-operation-multiple-assignable-fragments.graphql");
    let expected = include_str!("generate_flow/fixtures/updatable-operation-multiple-assignable-fragments.expected");
    test_fixture(transform_fixture, "updatable-operation-multiple-assignable-fragments.graphql", "generate_flow/fixtures/updatable-operation-multiple-assignable-fragments.expected", input, expected);
}

#[test]
fn updatable_operation_plural_field_no_spreads() {
    let input = include_str!("generate_flow/fixtures/updatable-operation-plural-field-no-spreads.graphql");
    let expected = include_str!("generate_flow/fixtures/updatable-operation-plural-field-no-spreads.expected");
    test_fixture(transform_fixture, "updatable-operation-plural-field-no-spreads.graphql", "generate_flow/fixtures/updatable-operation-plural-field-no-spreads.expected", input, expected);
}

#[test]
fn updatable_operation_plural_field_with_spreads() {
    let input = include_str!("generate_flow/fixtures/updatable-operation-plural-field-with-spreads.graphql");
    let expected = include_str!("generate_flow/fixtures/updatable-operation-plural-field-with-spreads.expected");
    test_fixture(transform_fixture, "updatable-operation-plural-field-with-spreads.graphql", "generate_flow/fixtures/updatable-operation-plural-field-with-spreads.expected", input, expected);
}

#[test]
fn updatable_operation_special_fields() {
    let input = include_str!("generate_flow/fixtures/updatable-operation-special-fields.graphql");
    let expected = include_str!("generate_flow/fixtures/updatable-operation-special-fields.expected");
    test_fixture(transform_fixture, "updatable-operation-special-fields.graphql", "generate_flow/fixtures/updatable-operation-special-fields.expected", input, expected);
}

#[test]
fn updatable_operation_type_refinement() {
    let input = include_str!("generate_flow/fixtures/updatable-operation-type-refinement.graphql");
    let expected = include_str!("generate_flow/fixtures/updatable-operation-type-refinement.expected");
    test_fixture(transform_fixture, "updatable-operation-type-refinement.graphql", "generate_flow/fixtures/updatable-operation-type-refinement.expected", input, expected);
}
