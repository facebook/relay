// @generated SignedSource<<5017de08d0f6489d8f0a1d320ef46e2d>>

mod compile_relay_artifacts;

use compile_relay_artifacts::transform_fixture;
use fixture_tests::test_fixture;

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
fn defer_multiple_fragments_same_parent() {
    let input = include_str!("compile_relay_artifacts/fixtures/defer-multiple-fragments-same-parent.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/defer-multiple-fragments-same-parent.expected");
    test_fixture(transform_fixture, "defer-multiple-fragments-same-parent.graphql", "compile_relay_artifacts/fixtures/defer-multiple-fragments-same-parent.expected", input, expected);
}

#[test]
fn explicit_null_argument() {
    let input = include_str!("compile_relay_artifacts/fixtures/explicit-null-argument.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/explicit-null-argument.expected");
    test_fixture(transform_fixture, "explicit-null-argument.graphql", "compile_relay_artifacts/fixtures/explicit-null-argument.expected", input, expected);
}

#[test]
fn false_positive_circular_fragment_reference_regression() {
    let input = include_str!("compile_relay_artifacts/fixtures/false-positive-circular-fragment-reference-regression.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/false-positive-circular-fragment-reference-regression.expected");
    test_fixture(transform_fixture, "false-positive-circular-fragment-reference-regression.graphql", "compile_relay_artifacts/fixtures/false-positive-circular-fragment-reference-regression.expected", input, expected);
}

#[test]
fn fragment_on_node_interface() {
    let input = include_str!("compile_relay_artifacts/fixtures/fragment-on-node-interface.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/fragment-on-node-interface.expected");
    test_fixture(transform_fixture, "fragment-on-node-interface.graphql", "compile_relay_artifacts/fixtures/fragment-on-node-interface.expected", input, expected);
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
fn fragment_with_defer_on_abstract_type() {
    let input = include_str!("compile_relay_artifacts/fixtures/fragment-with-defer-on-abstract-type.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/fragment-with-defer-on-abstract-type.expected");
    test_fixture(transform_fixture, "fragment-with-defer-on-abstract-type.graphql", "compile_relay_artifacts/fixtures/fragment-with-defer-on-abstract-type.expected", input, expected);
}

#[test]
fn fragment_with_defer_on_client_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/fragment-with-defer-on-client.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/fragment-with-defer-on-client.invalid.expected");
    test_fixture(transform_fixture, "fragment-with-defer-on-client.invalid.graphql", "compile_relay_artifacts/fixtures/fragment-with-defer-on-client.invalid.expected", input, expected);
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
fn query_with_raw_response_type_directive() {
    let input = include_str!("compile_relay_artifacts/fixtures/query-with-raw-response-type-directive.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/query-with-raw-response-type-directive.expected");
    test_fixture(transform_fixture, "query-with-raw-response-type-directive.graphql", "compile_relay_artifacts/fixtures/query-with-raw-response-type-directive.expected", input, expected);
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
fn relay_client_id_field() {
    let input = include_str!("compile_relay_artifacts/fixtures/relay-client-id-field.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/relay-client-id-field.expected");
    test_fixture(transform_fixture, "relay-client-id-field.graphql", "compile_relay_artifacts/fixtures/relay-client-id-field.expected", input, expected);
}

#[test]
fn scalar_handle_field() {
    let input = include_str!("compile_relay_artifacts/fixtures/scalar-handle-field.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/scalar-handle-field.expected");
    test_fixture(transform_fixture, "scalar-handle-field.graphql", "compile_relay_artifacts/fixtures/scalar-handle-field.expected", input, expected);
}

#[test]
fn sibling_client_selections() {
    let input = include_str!("compile_relay_artifacts/fixtures/sibling-client-selections.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/sibling-client-selections.expected");
    test_fixture(transform_fixture, "sibling-client-selections.graphql", "compile_relay_artifacts/fixtures/sibling-client-selections.expected", input, expected);
}

#[test]
fn stable_literals() {
    let input = include_str!("compile_relay_artifacts/fixtures/stable-literals.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/stable-literals.expected");
    test_fixture(transform_fixture, "stable-literals.graphql", "compile_relay_artifacts/fixtures/stable-literals.expected", input, expected);
}

#[test]
fn stream_connection() {
    let input = include_str!("compile_relay_artifacts/fixtures/stream-connection.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/stream-connection.expected");
    test_fixture(transform_fixture, "stream-connection.graphql", "compile_relay_artifacts/fixtures/stream-connection.expected", input, expected);
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
fn unmasked_fragment_spreads_recursive() {
    let input = include_str!("compile_relay_artifacts/fixtures/unmasked-fragment-spreads-recursive.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/unmasked-fragment-spreads-recursive.expected");
    test_fixture(transform_fixture, "unmasked-fragment-spreads-recursive.graphql", "compile_relay_artifacts/fixtures/unmasked-fragment-spreads-recursive.expected", input, expected);
}

#[test]
fn unused_fragment_argdef_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/unused-fragment-argdef.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/unused-fragment-argdef.invalid.expected");
    test_fixture(transform_fixture, "unused-fragment-argdef.invalid.graphql", "compile_relay_artifacts/fixtures/unused-fragment-argdef.invalid.expected", input, expected);
}

#[test]
fn unused_fragment_argdef_unchecked() {
    let input = include_str!("compile_relay_artifacts/fixtures/unused-fragment-argdef-unchecked.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/unused-fragment-argdef-unchecked.expected");
    test_fixture(transform_fixture, "unused-fragment-argdef-unchecked.graphql", "compile_relay_artifacts/fixtures/unused-fragment-argdef-unchecked.expected", input, expected);
}

#[test]
fn unused_variables_removed_from_print_not_codegen() {
    let input = include_str!("compile_relay_artifacts/fixtures/unused-variables-removed-from-print-not-codegen.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/unused-variables-removed-from-print-not-codegen.expected");
    test_fixture(transform_fixture, "unused-variables-removed-from-print-not-codegen.graphql", "compile_relay_artifacts/fixtures/unused-variables-removed-from-print-not-codegen.expected", input, expected);
}

#[test]
fn viewer_query() {
    let input = include_str!("compile_relay_artifacts/fixtures/viewer-query.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/viewer-query.expected");
    test_fixture(transform_fixture, "viewer-query.graphql", "compile_relay_artifacts/fixtures/viewer-query.expected", input, expected);
}
