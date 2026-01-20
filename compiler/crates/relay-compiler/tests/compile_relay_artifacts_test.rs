/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<5ad6f57edc5880bba323992bb2575b54>>
 */

mod compile_relay_artifacts;

use compile_relay_artifacts::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn abstract_type_refinement() {
    let input = include_str!("compile_relay_artifacts/fixtures/abstract-type-refinement.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/abstract-type-refinement.expected");
    test_fixture(transform_fixture, file!(), "abstract-type-refinement.graphql", "compile_relay_artifacts/fixtures/abstract-type-refinement.expected", input, expected).await;
}

#[tokio::test]
async fn abstract_type_refinement_dont_flatten_type_discriminator_fragment_spread() {
    let input = include_str!("compile_relay_artifacts/fixtures/abstract-type-refinement-dont-flatten-type-discriminator-fragment-spread.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/abstract-type-refinement-dont-flatten-type-discriminator-fragment-spread.expected");
    test_fixture(transform_fixture, file!(), "abstract-type-refinement-dont-flatten-type-discriminator-fragment-spread.graphql", "compile_relay_artifacts/fixtures/abstract-type-refinement-dont-flatten-type-discriminator-fragment-spread.expected", input, expected).await;
}

#[tokio::test]
async fn abstract_type_refinement_dont_flatten_type_discriminator_fragment_spread_conditional() {
    let input = include_str!("compile_relay_artifacts/fixtures/abstract-type-refinement-dont-flatten-type-discriminator-fragment-spread-conditional.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/abstract-type-refinement-dont-flatten-type-discriminator-fragment-spread-conditional.expected");
    test_fixture(transform_fixture, file!(), "abstract-type-refinement-dont-flatten-type-discriminator-fragment-spread-conditional.graphql", "compile_relay_artifacts/fixtures/abstract-type-refinement-dont-flatten-type-discriminator-fragment-spread-conditional.expected", input, expected).await;
}

#[tokio::test]
async fn abstract_type_refinement_dont_flatten_type_discriminator_inline_fragment() {
    let input = include_str!("compile_relay_artifacts/fixtures/abstract-type-refinement-dont-flatten-type-discriminator-inline-fragment.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/abstract-type-refinement-dont-flatten-type-discriminator-inline-fragment.expected");
    test_fixture(transform_fixture, file!(), "abstract-type-refinement-dont-flatten-type-discriminator-inline-fragment.graphql", "compile_relay_artifacts/fixtures/abstract-type-refinement-dont-flatten-type-discriminator-inline-fragment.expected", input, expected).await;
}

#[tokio::test]
async fn abstract_type_refinement_dont_flatten_type_discriminator_inline_fragment_conditional() {
    let input = include_str!("compile_relay_artifacts/fixtures/abstract-type-refinement-dont-flatten-type-discriminator-inline-fragment-conditional.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/abstract-type-refinement-dont-flatten-type-discriminator-inline-fragment-conditional.expected");
    test_fixture(transform_fixture, file!(), "abstract-type-refinement-dont-flatten-type-discriminator-inline-fragment-conditional.graphql", "compile_relay_artifacts/fixtures/abstract-type-refinement-dont-flatten-type-discriminator-inline-fragment-conditional.expected", input, expected).await;
}

#[tokio::test]
async fn abstract_type_refinement_dont_flatten_type_discriminator_nested_fragment_spread() {
    let input = include_str!("compile_relay_artifacts/fixtures/abstract-type-refinement-dont-flatten-type-discriminator-nested-fragment-spread.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/abstract-type-refinement-dont-flatten-type-discriminator-nested-fragment-spread.expected");
    test_fixture(transform_fixture, file!(), "abstract-type-refinement-dont-flatten-type-discriminator-nested-fragment-spread.graphql", "compile_relay_artifacts/fixtures/abstract-type-refinement-dont-flatten-type-discriminator-nested-fragment-spread.expected", input, expected).await;
}

#[tokio::test]
async fn abstract_type_refinement_dont_flatten_type_discriminator_nested_fragment_spread_within_inline_fragment() {
    let input = include_str!("compile_relay_artifacts/fixtures/abstract-type-refinement-dont-flatten-type-discriminator-nested-fragment-spread-within-inline-fragment.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/abstract-type-refinement-dont-flatten-type-discriminator-nested-fragment-spread-within-inline-fragment.expected");
    test_fixture(transform_fixture, file!(), "abstract-type-refinement-dont-flatten-type-discriminator-nested-fragment-spread-within-inline-fragment.graphql", "compile_relay_artifacts/fixtures/abstract-type-refinement-dont-flatten-type-discriminator-nested-fragment-spread-within-inline-fragment.expected", input, expected).await;
}

#[tokio::test]
async fn abstract_type_refinement_dont_flatten_type_discriminator_nested_fragment_spread_within_inline_fragment_different_fields() {
    let input = include_str!("compile_relay_artifacts/fixtures/abstract-type-refinement-dont-flatten-type-discriminator-nested-fragment-spread-within-inline-fragment-different-fields.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/abstract-type-refinement-dont-flatten-type-discriminator-nested-fragment-spread-within-inline-fragment-different-fields.expected");
    test_fixture(transform_fixture, file!(), "abstract-type-refinement-dont-flatten-type-discriminator-nested-fragment-spread-within-inline-fragment-different-fields.graphql", "compile_relay_artifacts/fixtures/abstract-type-refinement-dont-flatten-type-discriminator-nested-fragment-spread-within-inline-fragment-different-fields.expected", input, expected).await;
}

#[tokio::test]
async fn abstract_type_refinement_dont_flatten_type_discriminator_nested_inline_fragment() {
    let input = include_str!("compile_relay_artifacts/fixtures/abstract-type-refinement-dont-flatten-type-discriminator-nested-inline-fragment.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/abstract-type-refinement-dont-flatten-type-discriminator-nested-inline-fragment.expected");
    test_fixture(transform_fixture, file!(), "abstract-type-refinement-dont-flatten-type-discriminator-nested-inline-fragment.graphql", "compile_relay_artifacts/fixtures/abstract-type-refinement-dont-flatten-type-discriminator-nested-inline-fragment.expected", input, expected).await;
}

#[tokio::test]
async fn abstract_type_refinement_dont_skip_type_discriminator_fragment_spread() {
    let input = include_str!("compile_relay_artifacts/fixtures/abstract-type-refinement-dont-skip-type-discriminator-fragment-spread.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/abstract-type-refinement-dont-skip-type-discriminator-fragment-spread.expected");
    test_fixture(transform_fixture, file!(), "abstract-type-refinement-dont-skip-type-discriminator-fragment-spread.graphql", "compile_relay_artifacts/fixtures/abstract-type-refinement-dont-skip-type-discriminator-fragment-spread.expected", input, expected).await;
}

#[tokio::test]
async fn abstract_type_refinement_dont_skip_type_discriminator_inline_fragment() {
    let input = include_str!("compile_relay_artifacts/fixtures/abstract-type-refinement-dont-skip-type-discriminator-inline-fragment.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/abstract-type-refinement-dont-skip-type-discriminator-inline-fragment.expected");
    test_fixture(transform_fixture, file!(), "abstract-type-refinement-dont-skip-type-discriminator-inline-fragment.graphql", "compile_relay_artifacts/fixtures/abstract-type-refinement-dont-skip-type-discriminator-inline-fragment.expected", input, expected).await;
}

#[tokio::test]
async fn abstract_type_refinement_dont_skip_type_discriminator_when_identical_selections() {
    let input = include_str!("compile_relay_artifacts/fixtures/abstract-type-refinement-dont-skip-type-discriminator-when-identical-selections.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/abstract-type-refinement-dont-skip-type-discriminator-when-identical-selections.expected");
    test_fixture(transform_fixture, file!(), "abstract-type-refinement-dont-skip-type-discriminator-when-identical-selections.graphql", "compile_relay_artifacts/fixtures/abstract-type-refinement-dont-skip-type-discriminator-when-identical-selections.expected", input, expected).await;
}

#[tokio::test]
async fn abstract_type_refinement_no_unnecessary_type_discriminator_under_condition_incorrect() {
    let input = include_str!("compile_relay_artifacts/fixtures/abstract-type-refinement-no-unnecessary-type-discriminator-under-condition_incorrect.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/abstract-type-refinement-no-unnecessary-type-discriminator-under-condition_incorrect.expected");
    test_fixture(transform_fixture, file!(), "abstract-type-refinement-no-unnecessary-type-discriminator-under-condition_incorrect.graphql", "compile_relay_artifacts/fixtures/abstract-type-refinement-no-unnecessary-type-discriminator-under-condition_incorrect.expected", input, expected).await;
}

#[tokio::test]
async fn actor_change_simple_query() {
    let input = include_str!("compile_relay_artifacts/fixtures/actor-change-simple-query.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/actor-change-simple-query.expected");
    test_fixture(transform_fixture, file!(), "actor-change-simple-query.graphql", "compile_relay_artifacts/fixtures/actor-change-simple-query.expected", input, expected).await;
}

#[tokio::test]
async fn alias_same_as_name() {
    let input = include_str!("compile_relay_artifacts/fixtures/alias-same-as-name.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/alias-same-as-name.expected");
    test_fixture(transform_fixture, file!(), "alias-same-as-name.graphql", "compile_relay_artifacts/fixtures/alias-same-as-name.expected", input, expected).await;
}

#[tokio::test]
async fn aliased_fragment_in_inline_fragment() {
    let input = include_str!("compile_relay_artifacts/fixtures/aliased_fragment_in_inline_fragment.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/aliased_fragment_in_inline_fragment.expected");
    test_fixture(transform_fixture, file!(), "aliased_fragment_in_inline_fragment.graphql", "compile_relay_artifacts/fixtures/aliased_fragment_in_inline_fragment.expected", input, expected).await;
}

#[tokio::test]
async fn append_edge() {
    let input = include_str!("compile_relay_artifacts/fixtures/append-edge.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/append-edge.expected");
    test_fixture(transform_fixture, file!(), "append-edge.graphql", "compile_relay_artifacts/fixtures/append-edge.expected", input, expected).await;
}

#[tokio::test]
async fn append_edge_on_interface() {
    let input = include_str!("compile_relay_artifacts/fixtures/append-edge-on-interface.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/append-edge-on-interface.expected");
    test_fixture(transform_fixture, file!(), "append-edge-on-interface.graphql", "compile_relay_artifacts/fixtures/append-edge-on-interface.expected", input, expected).await;
}

#[tokio::test]
async fn append_node() {
    let input = include_str!("compile_relay_artifacts/fixtures/append-node.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/append-node.expected");
    test_fixture(transform_fixture, file!(), "append-node.graphql", "compile_relay_artifacts/fixtures/append-node.expected", input, expected).await;
}

#[tokio::test]
async fn append_node_literal_edge_type_name() {
    let input = include_str!("compile_relay_artifacts/fixtures/append-node-literal-edge-type-name.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/append-node-literal-edge-type-name.expected");
    test_fixture(transform_fixture, file!(), "append-node-literal-edge-type-name.graphql", "compile_relay_artifacts/fixtures/append-node-literal-edge-type-name.expected", input, expected).await;
}

#[tokio::test]
async fn append_node_literal_edge_type_name_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/append-node-literal-edge-type-name-invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/append-node-literal-edge-type-name-invalid.expected");
    test_fixture(transform_fixture, file!(), "append-node-literal-edge-type-name-invalid.graphql", "compile_relay_artifacts/fixtures/append-node-literal-edge-type-name-invalid.expected", input, expected).await;
}

#[tokio::test]
async fn append_node_literal_edge_type_name_not_object_type() {
    let input = include_str!("compile_relay_artifacts/fixtures/append-node-literal-edge-type-name-not-object-type.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/append-node-literal-edge-type-name-not-object-type.expected");
    test_fixture(transform_fixture, file!(), "append-node-literal-edge-type-name-not-object-type.graphql", "compile_relay_artifacts/fixtures/append-node-literal-edge-type-name-not-object-type.expected", input, expected).await;
}

#[tokio::test]
async fn append_node_literal_edge_type_name_variable() {
    let input = include_str!("compile_relay_artifacts/fixtures/append-node-literal-edge-type-name-variable.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/append-node-literal-edge-type-name-variable.expected");
    test_fixture(transform_fixture, file!(), "append-node-literal-edge-type-name-variable.graphql", "compile_relay_artifacts/fixtures/append-node-literal-edge-type-name-variable.expected", input, expected).await;
}

#[tokio::test]
async fn auto_filled_argument_on_defer() {
    let input = include_str!("compile_relay_artifacts/fixtures/auto-filled-argument-on-defer.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/auto-filled-argument-on-defer.expected");
    test_fixture(transform_fixture, file!(), "auto-filled-argument-on-defer.graphql", "compile_relay_artifacts/fixtures/auto-filled-argument-on-defer.expected", input, expected).await;
}

#[tokio::test]
async fn auto_filled_argument_on_match() {
    let input = include_str!("compile_relay_artifacts/fixtures/auto-filled-argument-on-match.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/auto-filled-argument-on-match.expected");
    test_fixture(transform_fixture, file!(), "auto-filled-argument-on-match.graphql", "compile_relay_artifacts/fixtures/auto-filled-argument-on-match.expected", input, expected).await;
}

#[tokio::test]
async fn catch_directive_mutation() {
    let input = include_str!("compile_relay_artifacts/fixtures/catch_directive_mutation.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/catch_directive_mutation.expected");
    test_fixture(transform_fixture, file!(), "catch_directive_mutation.graphql", "compile_relay_artifacts/fixtures/catch_directive_mutation.expected", input, expected).await;
}

#[tokio::test]
async fn catch_directive_query() {
    let input = include_str!("compile_relay_artifacts/fixtures/catch_directive_query.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/catch_directive_query.expected");
    test_fixture(transform_fixture, file!(), "catch_directive_query.graphql", "compile_relay_artifacts/fixtures/catch_directive_query.expected", input, expected).await;
}

#[tokio::test]
async fn circular_fragment() {
    let input = include_str!("compile_relay_artifacts/fixtures/circular-fragment.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/circular-fragment.expected");
    test_fixture(transform_fixture, file!(), "circular-fragment.graphql", "compile_relay_artifacts/fixtures/circular-fragment.expected", input, expected).await;
}

#[tokio::test]
async fn circular_inline_fragment_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/circular-inline-fragment.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/circular-inline-fragment.invalid.expected");
    test_fixture(transform_fixture, file!(), "circular-inline-fragment.invalid.graphql", "compile_relay_artifacts/fixtures/circular-inline-fragment.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn circular_no_inline_fragment() {
    let input = include_str!("compile_relay_artifacts/fixtures/circular-no-inline-fragment.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/circular-no-inline-fragment.expected");
    test_fixture(transform_fixture, file!(), "circular-no-inline-fragment.graphql", "compile_relay_artifacts/fixtures/circular-no-inline-fragment.expected", input, expected).await;
}

#[tokio::test]
async fn client_3d_resolvers_enabled_client_3d_fragment() {
    let input = include_str!("compile_relay_artifacts/fixtures/client-3D-resolvers-enabled-client-3D-fragment.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/client-3D-resolvers-enabled-client-3D-fragment.expected");
    test_fixture(transform_fixture, file!(), "client-3D-resolvers-enabled-client-3D-fragment.graphql", "compile_relay_artifacts/fixtures/client-3D-resolvers-enabled-client-3D-fragment.expected", input, expected).await;
}

#[tokio::test]
async fn client_3d_resolvers_enabled_server_3d_fragment() {
    let input = include_str!("compile_relay_artifacts/fixtures/client-3D-resolvers-enabled-server-3D-fragment.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/client-3D-resolvers-enabled-server-3D-fragment.expected");
    test_fixture(transform_fixture, file!(), "client-3D-resolvers-enabled-server-3D-fragment.graphql", "compile_relay_artifacts/fixtures/client-3D-resolvers-enabled-server-3D-fragment.expected", input, expected).await;
}

#[tokio::test]
async fn client_conditions() {
    let input = include_str!("compile_relay_artifacts/fixtures/client-conditions.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/client-conditions.expected");
    test_fixture(transform_fixture, file!(), "client-conditions.graphql", "compile_relay_artifacts/fixtures/client-conditions.expected", input, expected).await;
}

#[tokio::test]
async fn client_edge_from_client_type_to_client_type() {
    let input = include_str!("compile_relay_artifacts/fixtures/client_edge_from_client_type_to_client_type.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/client_edge_from_client_type_to_client_type.expected");
    test_fixture(transform_fixture, file!(), "client_edge_from_client_type_to_client_type.graphql", "compile_relay_artifacts/fixtures/client_edge_from_client_type_to_client_type.expected", input, expected).await;
}

#[tokio::test]
async fn client_edge_from_client_type_to_client_type_terse() {
    let input = include_str!("compile_relay_artifacts/fixtures/client_edge_from_client_type_to_client_type_terse.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/client_edge_from_client_type_to_client_type_terse.expected");
    test_fixture(transform_fixture, file!(), "client_edge_from_client_type_to_client_type_terse.graphql", "compile_relay_artifacts/fixtures/client_edge_from_client_type_to_client_type_terse.expected", input, expected).await;
}

#[tokio::test]
async fn client_edge_from_client_type_to_client_type_terse_live() {
    let input = include_str!("compile_relay_artifacts/fixtures/client_edge_from_client_type_to_client_type_terse_live.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/client_edge_from_client_type_to_client_type_terse_live.expected");
    test_fixture(transform_fixture, file!(), "client_edge_from_client_type_to_client_type_terse_live.graphql", "compile_relay_artifacts/fixtures/client_edge_from_client_type_to_client_type_terse_live.expected", input, expected).await;
}

#[tokio::test]
async fn client_edge_from_client_type_to_client_type_terse_plural() {
    let input = include_str!("compile_relay_artifacts/fixtures/client_edge_from_client_type_to_client_type_terse_plural.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/client_edge_from_client_type_to_client_type_terse_plural.expected");
    test_fixture(transform_fixture, file!(), "client_edge_from_client_type_to_client_type_terse_plural.graphql", "compile_relay_artifacts/fixtures/client_edge_from_client_type_to_client_type_terse_plural.expected", input, expected).await;
}

#[tokio::test]
async fn client_edge_from_client_type_to_client_type_terse_scalar() {
    let input = include_str!("compile_relay_artifacts/fixtures/client_edge_from_client_type_to_client_type_terse_scalar.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/client_edge_from_client_type_to_client_type_terse_scalar.expected");
    test_fixture(transform_fixture, file!(), "client_edge_from_client_type_to_client_type_terse_scalar.graphql", "compile_relay_artifacts/fixtures/client_edge_from_client_type_to_client_type_terse_scalar.expected", input, expected).await;
}

#[tokio::test]
async fn client_edge_from_server_type_to_client_type() {
    let input = include_str!("compile_relay_artifacts/fixtures/client_edge_from_server_type_to_client_type.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/client_edge_from_server_type_to_client_type.expected");
    test_fixture(transform_fixture, file!(), "client_edge_from_server_type_to_client_type.graphql", "compile_relay_artifacts/fixtures/client_edge_from_server_type_to_client_type.expected", input, expected).await;
}

#[tokio::test]
async fn client_edge_from_server_type_to_client_type_fragment_reads_client_field() {
    let input = include_str!("compile_relay_artifacts/fixtures/client_edge_from_server_type_to_client_type_fragment_reads_client_field.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/client_edge_from_server_type_to_client_type_fragment_reads_client_field.expected");
    test_fixture(transform_fixture, file!(), "client_edge_from_server_type_to_client_type_fragment_reads_client_field.graphql", "compile_relay_artifacts/fixtures/client_edge_from_server_type_to_client_type_fragment_reads_client_field.expected", input, expected).await;
}

#[tokio::test]
async fn client_fields_in_inline_fragments() {
    let input = include_str!("compile_relay_artifacts/fixtures/client-fields-in-inline-fragments.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/client-fields-in-inline-fragments.expected");
    test_fixture(transform_fixture, file!(), "client-fields-in-inline-fragments.graphql", "compile_relay_artifacts/fixtures/client-fields-in-inline-fragments.expected", input, expected).await;
}

#[tokio::test]
async fn client_fields_of_client_type() {
    let input = include_str!("compile_relay_artifacts/fixtures/client-fields-of-client-type.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/client-fields-of-client-type.expected");
    test_fixture(transform_fixture, file!(), "client-fields-of-client-type.graphql", "compile_relay_artifacts/fixtures/client-fields-of-client-type.expected", input, expected).await;
}

#[tokio::test]
async fn client_fields_on_roots() {
    let input = include_str!("compile_relay_artifacts/fixtures/client-fields-on-roots.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/client-fields-on-roots.expected");
    test_fixture(transform_fixture, file!(), "client-fields-on-roots.graphql", "compile_relay_artifacts/fixtures/client-fields-on-roots.expected", input, expected).await;
}

#[tokio::test]
async fn client_fields_only_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/client_fields_only_invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/client_fields_only_invalid.expected");
    test_fixture(transform_fixture, file!(), "client_fields_only_invalid.graphql", "compile_relay_artifacts/fixtures/client_fields_only_invalid.expected", input, expected).await;
}

#[tokio::test]
async fn client_fields_only_no_fragment_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/client_fields_only_no_fragment_invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/client_fields_only_no_fragment_invalid.expected");
    test_fixture(transform_fixture, file!(), "client_fields_only_no_fragment_invalid.graphql", "compile_relay_artifacts/fixtures/client_fields_only_no_fragment_invalid.expected", input, expected).await;
}

#[tokio::test]
async fn client_fields_overlapping_error_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/client-fields-overlapping-error.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/client-fields-overlapping-error.invalid.expected");
    test_fixture(transform_fixture, file!(), "client-fields-overlapping-error.invalid.graphql", "compile_relay_artifacts/fixtures/client-fields-overlapping-error.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn client_fields_overlapping_with_nulls() {
    let input = include_str!("compile_relay_artifacts/fixtures/client-fields-overlapping-with-nulls.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/client-fields-overlapping-with-nulls.expected");
    test_fixture(transform_fixture, file!(), "client-fields-overlapping-with-nulls.graphql", "compile_relay_artifacts/fixtures/client-fields-overlapping-with-nulls.expected", input, expected).await;
}

#[tokio::test]
async fn client_fields_with_undefined_global_variables_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/client-fields-with-undefined-global-variables.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/client-fields-with-undefined-global-variables.invalid.expected");
    test_fixture(transform_fixture, file!(), "client-fields-with-undefined-global-variables.invalid.graphql", "compile_relay_artifacts/fixtures/client-fields-with-undefined-global-variables.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn client_fragment_spreads() {
    let input = include_str!("compile_relay_artifacts/fixtures/client-fragment-spreads.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/client-fragment-spreads.expected");
    test_fixture(transform_fixture, file!(), "client-fragment-spreads.graphql", "compile_relay_artifacts/fixtures/client-fragment-spreads.expected", input, expected).await;
}

#[tokio::test]
async fn client_fragment_spreads_in_query() {
    let input = include_str!("compile_relay_artifacts/fixtures/client-fragment-spreads-in-query.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/client-fragment-spreads-in-query.expected");
    test_fixture(transform_fixture, file!(), "client-fragment-spreads-in-query.graphql", "compile_relay_artifacts/fixtures/client-fragment-spreads-in-query.expected", input, expected).await;
}

#[tokio::test]
async fn client_inline_fragments() {
    let input = include_str!("compile_relay_artifacts/fixtures/client-inline-fragments.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/client-inline-fragments.expected");
    test_fixture(transform_fixture, file!(), "client-inline-fragments.graphql", "compile_relay_artifacts/fixtures/client-inline-fragments.expected", input, expected).await;
}

#[tokio::test]
async fn client_inline_fragments_duplicate() {
    let input = include_str!("compile_relay_artifacts/fixtures/client-inline-fragments-duplicate.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/client-inline-fragments-duplicate.expected");
    test_fixture(transform_fixture, file!(), "client-inline-fragments-duplicate.graphql", "compile_relay_artifacts/fixtures/client-inline-fragments-duplicate.expected", input, expected).await;
}

#[tokio::test]
async fn client_inline_fragments_in_query() {
    let input = include_str!("compile_relay_artifacts/fixtures/client-inline-fragments-in-query.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/client-inline-fragments-in-query.expected");
    test_fixture(transform_fixture, file!(), "client-inline-fragments-in-query.graphql", "compile_relay_artifacts/fixtures/client-inline-fragments-in-query.expected", input, expected).await;
}

#[tokio::test]
async fn client_interfaces() {
    let input = include_str!("compile_relay_artifacts/fixtures/client-interfaces.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/client-interfaces.expected");
    test_fixture(transform_fixture, file!(), "client-interfaces.graphql", "compile_relay_artifacts/fixtures/client-interfaces.expected", input, expected).await;
}

#[tokio::test]
async fn client_interfaces_implemented_wrong_type_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/client-interfaces-implemented-wrong-type.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/client-interfaces-implemented-wrong-type.invalid.expected");
    test_fixture(transform_fixture, file!(), "client-interfaces-implemented-wrong-type.invalid.graphql", "compile_relay_artifacts/fixtures/client-interfaces-implemented-wrong-type.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn client_interfaces_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/client-interfaces.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/client-interfaces.invalid.expected");
    test_fixture(transform_fixture, file!(), "client-interfaces.invalid.graphql", "compile_relay_artifacts/fixtures/client-interfaces.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn client_interfaces_no_inline() {
    let input = include_str!("compile_relay_artifacts/fixtures/client-interfaces-no-inline.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/client-interfaces-no-inline.expected");
    test_fixture(transform_fixture, file!(), "client-interfaces-no-inline.graphql", "compile_relay_artifacts/fixtures/client-interfaces-no-inline.expected", input, expected).await;
}

#[tokio::test]
async fn client_interfaces_no_inline_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/client-interfaces-no-inline.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/client-interfaces-no-inline.invalid.expected");
    test_fixture(transform_fixture, file!(), "client-interfaces-no-inline.invalid.graphql", "compile_relay_artifacts/fixtures/client-interfaces-no-inline.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn client_linked_fields() {
    let input = include_str!("compile_relay_artifacts/fixtures/client-linked-fields.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/client-linked-fields.expected");
    test_fixture(transform_fixture, file!(), "client-linked-fields.graphql", "compile_relay_artifacts/fixtures/client-linked-fields.expected", input, expected).await;
}

#[tokio::test]
async fn client_only_query() {
    let input = include_str!("compile_relay_artifacts/fixtures/client-only-query.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/client-only-query.expected");
    test_fixture(transform_fixture, file!(), "client-only-query.graphql", "compile_relay_artifacts/fixtures/client-only-query.expected", input, expected).await;
}

#[tokio::test]
async fn client_only_query_with_scalar_extension() {
    let input = include_str!("compile_relay_artifacts/fixtures/client-only-query-with-scalar-extension.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/client-only-query-with-scalar-extension.expected");
    test_fixture(transform_fixture, file!(), "client-only-query-with-scalar-extension.graphql", "compile_relay_artifacts/fixtures/client-only-query-with-scalar-extension.expected", input, expected).await;
}

#[tokio::test]
async fn client_scalar_fields() {
    let input = include_str!("compile_relay_artifacts/fixtures/client-scalar-fields.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/client-scalar-fields.expected");
    test_fixture(transform_fixture, file!(), "client-scalar-fields.graphql", "compile_relay_artifacts/fixtures/client-scalar-fields.expected", input, expected).await;
}

#[tokio::test]
async fn complex_arguments() {
    let input = include_str!("compile_relay_artifacts/fixtures/complex-arguments.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/complex-arguments.expected");
    test_fixture(transform_fixture, file!(), "complex-arguments.graphql", "compile_relay_artifacts/fixtures/complex-arguments.expected", input, expected).await;
}

#[tokio::test]
async fn complex_arguments_in_list() {
    let input = include_str!("compile_relay_artifacts/fixtures/complex-arguments-in-list.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/complex-arguments-in-list.expected");
    test_fixture(transform_fixture, file!(), "complex-arguments-in-list.graphql", "compile_relay_artifacts/fixtures/complex-arguments-in-list.expected", input, expected).await;
}

#[tokio::test]
async fn complex_arguments_with_mutliple_variables() {
    let input = include_str!("compile_relay_artifacts/fixtures/complex-arguments-with-mutliple-variables.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/complex-arguments-with-mutliple-variables.expected");
    test_fixture(transform_fixture, file!(), "complex-arguments-with-mutliple-variables.graphql", "compile_relay_artifacts/fixtures/complex-arguments-with-mutliple-variables.expected", input, expected).await;
}

#[tokio::test]
async fn conflicting_selections_with_actor_change_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/conflicting-selections-with-actor-change.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/conflicting-selections-with-actor-change.invalid.expected");
    test_fixture(transform_fixture, file!(), "conflicting-selections-with-actor-change.invalid.graphql", "compile_relay_artifacts/fixtures/conflicting-selections-with-actor-change.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn conflicting_selections_with_defer_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/conflicting-selections-with-defer.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/conflicting-selections-with-defer.invalid.expected");
    test_fixture(transform_fixture, file!(), "conflicting-selections-with-defer.invalid.graphql", "compile_relay_artifacts/fixtures/conflicting-selections-with-defer.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn conflicting_selections_with_no_inline_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/conflicting-selections-with-no-inline.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/conflicting-selections-with-no-inline.invalid.expected");
    test_fixture(transform_fixture, file!(), "conflicting-selections-with-no-inline.invalid.graphql", "compile_relay_artifacts/fixtures/conflicting-selections-with-no-inline.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn connection() {
    let input = include_str!("compile_relay_artifacts/fixtures/connection.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/connection.expected");
    test_fixture(transform_fixture, file!(), "connection.graphql", "compile_relay_artifacts/fixtures/connection.expected", input, expected).await;
}

#[tokio::test]
async fn connection_field_required() {
    let input = include_str!("compile_relay_artifacts/fixtures/connection-field-required.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/connection-field-required.expected");
    test_fixture(transform_fixture, file!(), "connection-field-required.graphql", "compile_relay_artifacts/fixtures/connection-field-required.expected", input, expected).await;
}

#[tokio::test]
async fn connection_name_matches_fragment_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/connection-name-matches-fragment.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/connection-name-matches-fragment.invalid.expected");
    test_fixture(transform_fixture, file!(), "connection-name-matches-fragment.invalid.graphql", "compile_relay_artifacts/fixtures/connection-name-matches-fragment.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn connection_with_aliased_edges_page_info() {
    let input = include_str!("compile_relay_artifacts/fixtures/connection-with-aliased-edges-page_info.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/connection-with-aliased-edges-page_info.expected");
    test_fixture(transform_fixture, file!(), "connection-with-aliased-edges-page_info.graphql", "compile_relay_artifacts/fixtures/connection-with-aliased-edges-page_info.expected", input, expected).await;
}

#[tokio::test]
async fn connection_with_dynamic_key() {
    let input = include_str!("compile_relay_artifacts/fixtures/connection-with-dynamic-key.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/connection-with-dynamic-key.expected");
    test_fixture(transform_fixture, file!(), "connection-with-dynamic-key.graphql", "compile_relay_artifacts/fixtures/connection-with-dynamic-key.expected", input, expected).await;
}

#[tokio::test]
async fn connection_with_dynamic_key_missing_variable_definition_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/connection-with-dynamic-key-missing-variable-definition.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/connection-with-dynamic-key-missing-variable-definition.invalid.expected");
    test_fixture(transform_fixture, file!(), "connection-with-dynamic-key-missing-variable-definition.invalid.graphql", "compile_relay_artifacts/fixtures/connection-with-dynamic-key-missing-variable-definition.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn constant_variable_matches_constant_value() {
    let input = include_str!("compile_relay_artifacts/fixtures/constant_variable_matches_constant_value.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/constant_variable_matches_constant_value.expected");
    test_fixture(transform_fixture, file!(), "constant_variable_matches_constant_value.graphql", "compile_relay_artifacts/fixtures/constant_variable_matches_constant_value.expected", input, expected).await;
}

#[tokio::test]
async fn defer_if_arguments() {
    let input = include_str!("compile_relay_artifacts/fixtures/defer_if_arguments.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/defer_if_arguments.expected");
    test_fixture(transform_fixture, file!(), "defer_if_arguments.graphql", "compile_relay_artifacts/fixtures/defer_if_arguments.expected", input, expected).await;
}

#[tokio::test]
async fn defer_multiple_fragments_same_parent() {
    let input = include_str!("compile_relay_artifacts/fixtures/defer-multiple-fragments-same-parent.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/defer-multiple-fragments-same-parent.expected");
    test_fixture(transform_fixture, file!(), "defer-multiple-fragments-same-parent.graphql", "compile_relay_artifacts/fixtures/defer-multiple-fragments-same-parent.expected", input, expected).await;
}

#[tokio::test]
async fn delete_edge() {
    let input = include_str!("compile_relay_artifacts/fixtures/delete-edge.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/delete-edge.expected");
    test_fixture(transform_fixture, file!(), "delete-edge.graphql", "compile_relay_artifacts/fixtures/delete-edge.expected", input, expected).await;
}

#[tokio::test]
async fn delete_edge_plural() {
    let input = include_str!("compile_relay_artifacts/fixtures/delete-edge-plural.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/delete-edge-plural.expected");
    test_fixture(transform_fixture, file!(), "delete-edge-plural.graphql", "compile_relay_artifacts/fixtures/delete-edge-plural.expected", input, expected).await;
}

#[tokio::test]
async fn directive_with_conditions() {
    let input = include_str!("compile_relay_artifacts/fixtures/directive_with_conditions.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/directive_with_conditions.expected");
    test_fixture(transform_fixture, file!(), "directive_with_conditions.graphql", "compile_relay_artifacts/fixtures/directive_with_conditions.expected", input, expected).await;
}

#[tokio::test]
async fn duplicate_directive_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/duplicate-directive.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/duplicate-directive.invalid.expected");
    test_fixture(transform_fixture, file!(), "duplicate-directive.invalid.graphql", "compile_relay_artifacts/fixtures/duplicate-directive.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn duplicate_fragment_name() {
    let input = include_str!("compile_relay_artifacts/fixtures/duplicate_fragment_name.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/duplicate_fragment_name.expected");
    test_fixture(transform_fixture, file!(), "duplicate_fragment_name.graphql", "compile_relay_artifacts/fixtures/duplicate_fragment_name.expected", input, expected).await;
}

#[tokio::test]
async fn duplicate_query_name() {
    let input = include_str!("compile_relay_artifacts/fixtures/duplicate_query_name.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/duplicate_query_name.expected");
    test_fixture(transform_fixture, file!(), "duplicate_query_name.graphql", "compile_relay_artifacts/fixtures/duplicate_query_name.expected", input, expected).await;
}

#[tokio::test]
async fn exec_time_experimental_provider() {
    let input = include_str!("compile_relay_artifacts/fixtures/exec-time-experimental-provider.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/exec-time-experimental-provider.expected");
    test_fixture(transform_fixture, file!(), "exec-time-experimental-provider.graphql", "compile_relay_artifacts/fixtures/exec-time-experimental-provider.expected", input, expected).await;
}

#[tokio::test]
async fn explicit_null_argument() {
    let input = include_str!("compile_relay_artifacts/fixtures/explicit-null-argument.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/explicit-null-argument.expected");
    test_fixture(transform_fixture, file!(), "explicit-null-argument.graphql", "compile_relay_artifacts/fixtures/explicit-null-argument.expected", input, expected).await;
}

#[tokio::test]
async fn explicit_null_default_value() {
    let input = include_str!("compile_relay_artifacts/fixtures/explicit-null-default-value.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/explicit-null-default-value.expected");
    test_fixture(transform_fixture, file!(), "explicit-null-default-value.graphql", "compile_relay_artifacts/fixtures/explicit-null-default-value.expected", input, expected).await;
}

#[tokio::test]
async fn false_positive_circular_fragment_reference_regression() {
    let input = include_str!("compile_relay_artifacts/fixtures/false-positive-circular-fragment-reference-regression.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/false-positive-circular-fragment-reference-regression.expected");
    test_fixture(transform_fixture, file!(), "false-positive-circular-fragment-reference-regression.graphql", "compile_relay_artifacts/fixtures/false-positive-circular-fragment-reference-regression.expected", input, expected).await;
}

#[tokio::test]
async fn fields_with_null_argument_values() {
    let input = include_str!("compile_relay_artifacts/fixtures/fields-with-null-argument-values.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/fields-with-null-argument-values.expected");
    test_fixture(transform_fixture, file!(), "fields-with-null-argument-values.graphql", "compile_relay_artifacts/fixtures/fields-with-null-argument-values.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_alias() {
    let input = include_str!("compile_relay_artifacts/fixtures/fragment-alias.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/fragment-alias.expected");
    test_fixture(transform_fixture, file!(), "fragment-alias.graphql", "compile_relay_artifacts/fixtures/fragment-alias.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_alias_on_inline_fragment_does_not_get_flattened() {
    let input = include_str!("compile_relay_artifacts/fixtures/fragment-alias-on-inline-fragment-does-not-get-flattened.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/fragment-alias-on-inline-fragment-does-not-get-flattened.expected");
    test_fixture(transform_fixture, file!(), "fragment-alias-on-inline-fragment-does-not-get-flattened.graphql", "compile_relay_artifacts/fixtures/fragment-alias-on-inline-fragment-does-not-get-flattened.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_alias_with_inline() {
    let input = include_str!("compile_relay_artifacts/fixtures/fragment-alias-with-inline.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/fragment-alias-with-inline.expected");
    test_fixture(transform_fixture, file!(), "fragment-alias-with-inline.graphql", "compile_relay_artifacts/fixtures/fragment-alias-with-inline.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_arg_passed_to_resolver_rutime_arg() {
    let input = include_str!("compile_relay_artifacts/fixtures/fragment-arg-passed-to-resolver-rutime-arg.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/fragment-arg-passed-to-resolver-rutime-arg.expected");
    test_fixture(transform_fixture, file!(), "fragment-arg-passed-to-resolver-rutime-arg.graphql", "compile_relay_artifacts/fixtures/fragment-arg-passed-to-resolver-rutime-arg.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_on_node_interface() {
    let input = include_str!("compile_relay_artifacts/fixtures/fragment-on-node-interface.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/fragment-on-node-interface.expected");
    test_fixture(transform_fixture, file!(), "fragment-on-node-interface.graphql", "compile_relay_artifacts/fixtures/fragment-on-node-interface.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_on_non_node_fetchable_type() {
    let input = include_str!("compile_relay_artifacts/fixtures/fragment-on-non-node-fetchable-type.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/fragment-on-non-node-fetchable-type.expected");
    test_fixture(transform_fixture, file!(), "fragment-on-non-node-fetchable-type.graphql", "compile_relay_artifacts/fixtures/fragment-on-non-node-fetchable-type.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_on_object_implementing_node_interface() {
    let input = include_str!("compile_relay_artifacts/fixtures/fragment-on-object-implementing-node-interface.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/fragment-on-object-implementing-node-interface.expected");
    test_fixture(transform_fixture, file!(), "fragment-on-object-implementing-node-interface.graphql", "compile_relay_artifacts/fixtures/fragment-on-object-implementing-node-interface.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_on_query() {
    let input = include_str!("compile_relay_artifacts/fixtures/fragment-on-query.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/fragment-on-query.expected");
    test_fixture(transform_fixture, file!(), "fragment-on-query.graphql", "compile_relay_artifacts/fixtures/fragment-on-query.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_on_query_commonjs() {
    let input = include_str!("compile_relay_artifacts/fixtures/fragment-on-query-commonjs.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/fragment-on-query-commonjs.expected");
    test_fixture(transform_fixture, file!(), "fragment-on-query-commonjs.graphql", "compile_relay_artifacts/fixtures/fragment-on-query-commonjs.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_on_query_commonjs_relativize_disabled() {
    let input = include_str!("compile_relay_artifacts/fixtures/fragment-on-query-commonjs-relativize-disabled.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/fragment-on-query-commonjs-relativize-disabled.expected");
    test_fixture(transform_fixture, file!(), "fragment-on-query-commonjs-relativize-disabled.graphql", "compile_relay_artifacts/fixtures/fragment-on-query-commonjs-relativize-disabled.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_on_query_with_cycle_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/fragment-on-query-with-cycle.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/fragment-on-query-with-cycle.invalid.expected");
    test_fixture(transform_fixture, file!(), "fragment-on-query-with-cycle.invalid.graphql", "compile_relay_artifacts/fixtures/fragment-on-query-with-cycle.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_on_viewer() {
    let input = include_str!("compile_relay_artifacts/fixtures/fragment-on-viewer.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/fragment-on-viewer.expected");
    test_fixture(transform_fixture, file!(), "fragment-on-viewer.graphql", "compile_relay_artifacts/fixtures/fragment-on-viewer.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_with_defer_arguments() {
    let input = include_str!("compile_relay_artifacts/fixtures/fragment-with-defer-arguments.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/fragment-with-defer-arguments.expected");
    test_fixture(transform_fixture, file!(), "fragment-with-defer-arguments.graphql", "compile_relay_artifacts/fixtures/fragment-with-defer-arguments.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_with_defer_arguments_without_label() {
    let input = include_str!("compile_relay_artifacts/fixtures/fragment-with-defer-arguments-without-label.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/fragment-with-defer-arguments-without-label.expected");
    test_fixture(transform_fixture, file!(), "fragment-with-defer-arguments-without-label.graphql", "compile_relay_artifacts/fixtures/fragment-with-defer-arguments-without-label.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_with_defer_in_stream() {
    let input = include_str!("compile_relay_artifacts/fixtures/fragment-with-defer-in-stream.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/fragment-with-defer-in-stream.expected");
    test_fixture(transform_fixture, file!(), "fragment-with-defer-in-stream.graphql", "compile_relay_artifacts/fixtures/fragment-with-defer-in-stream.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_with_defer_on_abstract_type() {
    let input = include_str!("compile_relay_artifacts/fixtures/fragment-with-defer-on-abstract-type.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/fragment-with-defer-on-abstract-type.expected");
    test_fixture(transform_fixture, file!(), "fragment-with-defer-on-abstract-type.graphql", "compile_relay_artifacts/fixtures/fragment-with-defer-on-abstract-type.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_with_match_directive() {
    let input = include_str!("compile_relay_artifacts/fixtures/fragment-with-match-directive.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/fragment-with-match-directive.expected");
    test_fixture(transform_fixture, file!(), "fragment-with-match-directive.graphql", "compile_relay_artifacts/fixtures/fragment-with-match-directive.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_with_stream() {
    let input = include_str!("compile_relay_artifacts/fixtures/fragment-with-stream.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/fragment-with-stream.expected");
    test_fixture(transform_fixture, file!(), "fragment-with-stream.graphql", "compile_relay_artifacts/fixtures/fragment-with-stream.expected", input, expected).await;
}

#[tokio::test]
async fn id_as_alias_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/id-as-alias.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/id-as-alias.invalid.expected");
    test_fixture(transform_fixture, file!(), "id-as-alias.invalid.graphql", "compile_relay_artifacts/fixtures/id-as-alias.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn incompatible_variable_usage_across_documents() {
    let input = include_str!("compile_relay_artifacts/fixtures/incompatible-variable-usage-across-documents.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/incompatible-variable-usage-across-documents.expected");
    test_fixture(transform_fixture, file!(), "incompatible-variable-usage-across-documents.graphql", "compile_relay_artifacts/fixtures/incompatible-variable-usage-across-documents.expected", input, expected).await;
}

#[tokio::test]
async fn inline_and_mask_are_incompatible_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/inline-and-mask-are-incompatible.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/inline-and-mask-are-incompatible.invalid.expected");
    test_fixture(transform_fixture, file!(), "inline-and-mask-are-incompatible.invalid.graphql", "compile_relay_artifacts/fixtures/inline-and-mask-are-incompatible.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn inline_data_fragment() {
    let input = include_str!("compile_relay_artifacts/fixtures/inline-data-fragment.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/inline-data-fragment.expected");
    test_fixture(transform_fixture, file!(), "inline-data-fragment.graphql", "compile_relay_artifacts/fixtures/inline-data-fragment.expected", input, expected).await;
}

#[tokio::test]
async fn inline_data_fragment_global_vars() {
    let input = include_str!("compile_relay_artifacts/fixtures/inline-data-fragment-global-vars.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/inline-data-fragment-global-vars.expected");
    test_fixture(transform_fixture, file!(), "inline-data-fragment-global-vars.graphql", "compile_relay_artifacts/fixtures/inline-data-fragment-global-vars.expected", input, expected).await;
}

#[tokio::test]
async fn inline_data_fragment_local_args() {
    let input = include_str!("compile_relay_artifacts/fixtures/inline-data-fragment-local-args.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/inline-data-fragment-local-args.expected");
    test_fixture(transform_fixture, file!(), "inline-data-fragment-local-args.graphql", "compile_relay_artifacts/fixtures/inline-data-fragment-local-args.expected", input, expected).await;
}

#[tokio::test]
async fn inline_fragment_on_abstract_client_type_nested_in_resolver_client_edge() {
    let input = include_str!("compile_relay_artifacts/fixtures/inline-fragment-on-abstract-client-type-nested-in-resolver-client-edge.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/inline-fragment-on-abstract-client-type-nested-in-resolver-client-edge.expected");
    test_fixture(transform_fixture, file!(), "inline-fragment-on-abstract-client-type-nested-in-resolver-client-edge.graphql", "compile_relay_artifacts/fixtures/inline-fragment-on-abstract-client-type-nested-in-resolver-client-edge.expected", input, expected).await;
}

#[tokio::test]
async fn invalid_alias_on_match_fragment() {
    let input = include_str!("compile_relay_artifacts/fixtures/invalid-alias-on-match-fragment.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/invalid-alias-on-match-fragment.expected");
    test_fixture(transform_fixture, file!(), "invalid-alias-on-match-fragment.graphql", "compile_relay_artifacts/fixtures/invalid-alias-on-match-fragment.expected", input, expected).await;
}

#[tokio::test]
async fn kitchen_sink() {
    let input = include_str!("compile_relay_artifacts/fixtures/kitchen-sink.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/kitchen-sink.expected");
    test_fixture(transform_fixture, file!(), "kitchen-sink.graphql", "compile_relay_artifacts/fixtures/kitchen-sink.expected", input, expected).await;
}

#[tokio::test]
async fn linked_handle_field() {
    let input = include_str!("compile_relay_artifacts/fixtures/linked-handle-field.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/linked-handle-field.expected");
    test_fixture(transform_fixture, file!(), "linked-handle-field.graphql", "compile_relay_artifacts/fixtures/linked-handle-field.expected", input, expected).await;
}

#[tokio::test]
async fn match_field_overlap_across_documents() {
    let input = include_str!("compile_relay_artifacts/fixtures/match-field-overlap-across-documents.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/match-field-overlap-across-documents.expected");
    test_fixture(transform_fixture, file!(), "match-field-overlap-across-documents.graphql", "compile_relay_artifacts/fixtures/match-field-overlap-across-documents.expected", input, expected).await;
}

#[tokio::test]
async fn match_on_child_of_plural() {
    let input = include_str!("compile_relay_artifacts/fixtures/match-on-child-of-plural.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/match-on-child-of-plural.expected");
    test_fixture(transform_fixture, file!(), "match-on-child-of-plural.graphql", "compile_relay_artifacts/fixtures/match-on-child-of-plural.expected", input, expected).await;
}

#[tokio::test]
async fn match_with_invalid_key_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/match-with-invalid-key.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/match-with-invalid-key.invalid.expected");
    test_fixture(transform_fixture, file!(), "match-with-invalid-key.invalid.graphql", "compile_relay_artifacts/fixtures/match-with-invalid-key.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn missing_argument_on_field_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/missing-argument-on-field.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/missing-argument-on-field.invalid.expected");
    test_fixture(transform_fixture, file!(), "missing-argument-on-field.invalid.graphql", "compile_relay_artifacts/fixtures/missing-argument-on-field.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn module_deduping() {
    let input = include_str!("compile_relay_artifacts/fixtures/module-deduping.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/module-deduping.expected");
    test_fixture(transform_fixture, file!(), "module-deduping.graphql", "compile_relay_artifacts/fixtures/module-deduping.expected", input, expected).await;
}

#[tokio::test]
async fn module_in_inline_fragment() {
    let input = include_str!("compile_relay_artifacts/fixtures/module-in-inline-fragment.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/module-in-inline-fragment.expected");
    test_fixture(transform_fixture, file!(), "module-in-inline-fragment.graphql", "compile_relay_artifacts/fixtures/module-in-inline-fragment.expected", input, expected).await;
}

#[tokio::test]
async fn module_overlap_across_documents() {
    let input = include_str!("compile_relay_artifacts/fixtures/module-overlap-across-documents.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/module-overlap-across-documents.expected");
    test_fixture(transform_fixture, file!(), "module-overlap-across-documents.graphql", "compile_relay_artifacts/fixtures/module-overlap-across-documents.expected", input, expected).await;
}

#[tokio::test]
async fn module_overlap_within_document() {
    let input = include_str!("compile_relay_artifacts/fixtures/module-overlap-within-document.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/module-overlap-within-document.expected");
    test_fixture(transform_fixture, file!(), "module-overlap-within-document.graphql", "compile_relay_artifacts/fixtures/module-overlap-within-document.expected", input, expected).await;
}

#[tokio::test]
async fn module_with_alias() {
    let input = include_str!("compile_relay_artifacts/fixtures/module-with-alias.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/module-with-alias.expected");
    test_fixture(transform_fixture, file!(), "module-with-alias.graphql", "compile_relay_artifacts/fixtures/module-with-alias.expected", input, expected).await;
}

#[tokio::test]
async fn module_with_defer() {
    let input = include_str!("compile_relay_artifacts/fixtures/module-with-defer.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/module-with-defer.expected");
    test_fixture(transform_fixture, file!(), "module-with-defer.graphql", "compile_relay_artifacts/fixtures/module-with-defer.expected", input, expected).await;
}

#[tokio::test]
async fn multiple_client_edges() {
    let input = include_str!("compile_relay_artifacts/fixtures/multiple-client-edges.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/multiple-client-edges.expected");
    test_fixture(transform_fixture, file!(), "multiple-client-edges.graphql", "compile_relay_artifacts/fixtures/multiple-client-edges.expected", input, expected).await;
}

#[tokio::test]
async fn multiple_conditions() {
    let input = include_str!("compile_relay_artifacts/fixtures/multiple_conditions.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/multiple_conditions.expected");
    test_fixture(transform_fixture, file!(), "multiple_conditions.graphql", "compile_relay_artifacts/fixtures/multiple_conditions.expected", input, expected).await;
}

#[tokio::test]
async fn multiple_module_with_alias() {
    let input = include_str!("compile_relay_artifacts/fixtures/multiple-module-with-alias.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/multiple-module-with-alias.expected");
    test_fixture(transform_fixture, file!(), "multiple-module-with-alias.graphql", "compile_relay_artifacts/fixtures/multiple-module-with-alias.expected", input, expected).await;
}

#[tokio::test]
async fn multiple_module_with_aliased_inline_fragment() {
    let input = include_str!("compile_relay_artifacts/fixtures/multiple-module-with-aliased-inline-fragment.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/multiple-module-with-aliased-inline-fragment.expected");
    test_fixture(transform_fixture, file!(), "multiple-module-with-aliased-inline-fragment.graphql", "compile_relay_artifacts/fixtures/multiple-module-with-aliased-inline-fragment.expected", input, expected).await;
}

#[tokio::test]
async fn multiple_modules_different_component_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/multiple-modules-different-component.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/multiple-modules-different-component.invalid.expected");
    test_fixture(transform_fixture, file!(), "multiple-modules-different-component.invalid.graphql", "compile_relay_artifacts/fixtures/multiple-modules-different-component.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn multiple_modules_different_fragment_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/multiple-modules-different-fragment.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/multiple-modules-different-fragment.invalid.expected");
    test_fixture(transform_fixture, file!(), "multiple-modules-different-fragment.invalid.graphql", "compile_relay_artifacts/fixtures/multiple-modules-different-fragment.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn multiple_modules_same_selections() {
    let input = include_str!("compile_relay_artifacts/fixtures/multiple-modules-same-selections.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/multiple-modules-same-selections.expected");
    test_fixture(transform_fixture, file!(), "multiple-modules-same-selections.graphql", "compile_relay_artifacts/fixtures/multiple-modules-same-selections.expected", input, expected).await;
}

#[tokio::test]
async fn multiple_modules_with_key() {
    let input = include_str!("compile_relay_artifacts/fixtures/multiple-modules-with-key.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/multiple-modules-with-key.expected");
    test_fixture(transform_fixture, file!(), "multiple-modules-with-key.graphql", "compile_relay_artifacts/fixtures/multiple-modules-with-key.expected", input, expected).await;
}

#[tokio::test]
async fn multiple_modules_without_key_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/multiple-modules-without-key.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/multiple-modules-without-key.invalid.expected");
    test_fixture(transform_fixture, file!(), "multiple-modules-without-key.invalid.graphql", "compile_relay_artifacts/fixtures/multiple-modules-without-key.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn nested_conditions() {
    let input = include_str!("compile_relay_artifacts/fixtures/nested_conditions.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/nested_conditions.expected");
    test_fixture(transform_fixture, file!(), "nested_conditions.graphql", "compile_relay_artifacts/fixtures/nested_conditions.expected", input, expected).await;
}

#[tokio::test]
async fn nested_conditions_2() {
    let input = include_str!("compile_relay_artifacts/fixtures/nested-conditions-2.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/nested-conditions-2.expected");
    test_fixture(transform_fixture, file!(), "nested-conditions-2.graphql", "compile_relay_artifacts/fixtures/nested-conditions-2.expected", input, expected).await;
}

#[tokio::test]
async fn no_inline_abstract_fragment() {
    let input = include_str!("compile_relay_artifacts/fixtures/no-inline-abstract-fragment.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/no-inline-abstract-fragment.expected");
    test_fixture(transform_fixture, file!(), "no-inline-abstract-fragment.graphql", "compile_relay_artifacts/fixtures/no-inline-abstract-fragment.expected", input, expected).await;
}

#[tokio::test]
async fn no_inline_fragment() {
    let input = include_str!("compile_relay_artifacts/fixtures/no-inline-fragment.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/no-inline-fragment.expected");
    test_fixture(transform_fixture, file!(), "no-inline-fragment.graphql", "compile_relay_artifacts/fixtures/no-inline-fragment.expected", input, expected).await;
}

#[tokio::test]
async fn no_inline_fragment_and_module() {
    let input = include_str!("compile_relay_artifacts/fixtures/no-inline-fragment-and-module.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/no-inline-fragment-and-module.expected");
    test_fixture(transform_fixture, file!(), "no-inline-fragment-and-module.graphql", "compile_relay_artifacts/fixtures/no-inline-fragment-and-module.expected", input, expected).await;
}

#[tokio::test]
async fn no_inline_fragment_in_raw_response_query() {
    let input = include_str!("compile_relay_artifacts/fixtures/no-inline-fragment-in-raw-response-query.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/no-inline-fragment-in-raw-response-query.expected");
    test_fixture(transform_fixture, file!(), "no-inline-fragment-in-raw-response-query.graphql", "compile_relay_artifacts/fixtures/no-inline-fragment-in-raw-response-query.expected", input, expected).await;
}

#[tokio::test]
async fn original_client_fields_test() {
    let input = include_str!("compile_relay_artifacts/fixtures/original-client-fields-test.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/original-client-fields-test.expected");
    test_fixture(transform_fixture, file!(), "original-client-fields-test.graphql", "compile_relay_artifacts/fixtures/original-client-fields-test.expected", input, expected).await;
}

#[tokio::test]
async fn plural_fragment() {
    let input = include_str!("compile_relay_artifacts/fixtures/plural-fragment.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/plural-fragment.expected");
    test_fixture(transform_fixture, file!(), "plural-fragment.graphql", "compile_relay_artifacts/fixtures/plural-fragment.expected", input, expected).await;
}

#[tokio::test]
async fn prefetchable_pagination_query_with_conflicting_args_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/prefetchable-pagination-query-with-conflicting-args.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/prefetchable-pagination-query-with-conflicting-args.invalid.expected");
    test_fixture(transform_fixture, file!(), "prefetchable-pagination-query-with-conflicting-args.invalid.graphql", "compile_relay_artifacts/fixtures/prefetchable-pagination-query-with-conflicting-args.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn prefetchable_pagination_query_without_conflicting_args() {
    let input = include_str!("compile_relay_artifacts/fixtures/prefetchable-pagination-query-without-conflicting-args.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/prefetchable-pagination-query-without-conflicting-args.expected");
    test_fixture(transform_fixture, file!(), "prefetchable-pagination-query-without-conflicting-args.graphql", "compile_relay_artifacts/fixtures/prefetchable-pagination-query-without-conflicting-args.expected", input, expected).await;
}

#[tokio::test]
async fn prefetchable_refetchable_fragment_with_connection() {
    let input = include_str!("compile_relay_artifacts/fixtures/prefetchable-refetchable-fragment-with-connection.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/prefetchable-refetchable-fragment-with-connection.expected");
    test_fixture(transform_fixture, file!(), "prefetchable-refetchable-fragment-with-connection.graphql", "compile_relay_artifacts/fixtures/prefetchable-refetchable-fragment-with-connection.expected", input, expected).await;
}

#[tokio::test]
async fn prepend_node() {
    let input = include_str!("compile_relay_artifacts/fixtures/prepend-node.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/prepend-node.expected");
    test_fixture(transform_fixture, file!(), "prepend-node.graphql", "compile_relay_artifacts/fixtures/prepend-node.expected", input, expected).await;
}

#[tokio::test]
async fn provided_variable_directive() {
    let input = include_str!("compile_relay_artifacts/fixtures/provided-variable-directive.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/provided-variable-directive.expected");
    test_fixture(transform_fixture, file!(), "provided-variable-directive.graphql", "compile_relay_artifacts/fixtures/provided-variable-directive.expected", input, expected).await;
}

#[tokio::test]
async fn provided_variable_directive_commonjs() {
    let input = include_str!("compile_relay_artifacts/fixtures/provided-variable-directive-commonjs.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/provided-variable-directive-commonjs.expected");
    test_fixture(transform_fixture, file!(), "provided-variable-directive-commonjs.graphql", "compile_relay_artifacts/fixtures/provided-variable-directive-commonjs.expected", input, expected).await;
}

#[tokio::test]
async fn provided_variable_directive_commonjs_relativize_disabled() {
    let input = include_str!("compile_relay_artifacts/fixtures/provided-variable-directive-commonjs-relativize-disabled.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/provided-variable-directive-commonjs-relativize-disabled.expected");
    test_fixture(transform_fixture, file!(), "provided-variable-directive-commonjs-relativize-disabled.graphql", "compile_relay_artifacts/fixtures/provided-variable-directive-commonjs-relativize-disabled.expected", input, expected).await;
}

#[tokio::test]
async fn provided_variable_directive_commonjs_relativize_enabled() {
    let input = include_str!("compile_relay_artifacts/fixtures/provided-variable-directive-commonjs-relativize-enabled.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/provided-variable-directive-commonjs-relativize-enabled.expected");
    test_fixture(transform_fixture, file!(), "provided-variable-directive-commonjs-relativize-enabled.graphql", "compile_relay_artifacts/fixtures/provided-variable-directive-commonjs-relativize-enabled.expected", input, expected).await;
}

#[tokio::test]
async fn provided_variable_in_fragment() {
    let input = include_str!("compile_relay_artifacts/fixtures/provided-variable-in-fragment.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/provided-variable-in-fragment.expected");
    test_fixture(transform_fixture, file!(), "provided-variable-in-fragment.graphql", "compile_relay_artifacts/fixtures/provided-variable-in-fragment.expected", input, expected).await;
}

#[tokio::test]
async fn provided_variable_multiple_queries() {
    let input = include_str!("compile_relay_artifacts/fixtures/provided-variable-multiple-queries.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/provided-variable-multiple-queries.expected");
    test_fixture(transform_fixture, file!(), "provided-variable-multiple-queries.graphql", "compile_relay_artifacts/fixtures/provided-variable-multiple-queries.expected", input, expected).await;
}

#[tokio::test]
async fn provided_variable_nested_split_operation() {
    let input = include_str!("compile_relay_artifacts/fixtures/provided-variable-nested-split-operation.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/provided-variable-nested-split-operation.expected");
    test_fixture(transform_fixture, file!(), "provided-variable-nested-split-operation.graphql", "compile_relay_artifacts/fixtures/provided-variable-nested-split-operation.expected", input, expected).await;
}

#[tokio::test]
async fn provided_variable_no_inline_fragment() {
    let input = include_str!("compile_relay_artifacts/fixtures/provided-variable-no-inline-fragment.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/provided-variable-no-inline-fragment.expected");
    test_fixture(transform_fixture, file!(), "provided-variable-no-inline-fragment.graphql", "compile_relay_artifacts/fixtures/provided-variable-no-inline-fragment.expected", input, expected).await;
}

#[tokio::test]
async fn provided_variable_passed_in_argument_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/provided-variable-passed-in-argument-invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/provided-variable-passed-in-argument-invalid.expected");
    test_fixture(transform_fixture, file!(), "provided-variable-passed-in-argument-invalid.graphql", "compile_relay_artifacts/fixtures/provided-variable-passed-in-argument-invalid.expected", input, expected).await;
}

#[tokio::test]
async fn provided_variable_passed_in_argument_refetchable_fragment_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/provided-variable-passed-in-argument-refetchable-fragment-invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/provided-variable-passed-in-argument-refetchable-fragment-invalid.expected");
    test_fixture(transform_fixture, file!(), "provided-variable-passed-in-argument-refetchable-fragment-invalid.graphql", "compile_relay_artifacts/fixtures/provided-variable-passed-in-argument-refetchable-fragment-invalid.expected", input, expected).await;
}

#[tokio::test]
async fn provided_variable_refetchable_fragment() {
    let input = include_str!("compile_relay_artifacts/fixtures/provided-variable-refetchable-fragment.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/provided-variable-refetchable-fragment.expected");
    test_fixture(transform_fixture, file!(), "provided-variable-refetchable-fragment.graphql", "compile_relay_artifacts/fixtures/provided-variable-refetchable-fragment.expected", input, expected).await;
}

#[tokio::test]
async fn provided_variable_refetchable_fragment_combination() {
    let input = include_str!("compile_relay_artifacts/fixtures/provided-variable-refetchable-fragment-combination.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/provided-variable-refetchable-fragment-combination.expected");
    test_fixture(transform_fixture, file!(), "provided-variable-refetchable-fragment-combination.graphql", "compile_relay_artifacts/fixtures/provided-variable-refetchable-fragment-combination.expected", input, expected).await;
}

#[tokio::test]
async fn provided_variable_reused_nested_fragment() {
    let input = include_str!("compile_relay_artifacts/fixtures/provided-variable-reused-nested-fragment.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/provided-variable-reused-nested-fragment.expected");
    test_fixture(transform_fixture, file!(), "provided-variable-reused-nested-fragment.graphql", "compile_relay_artifacts/fixtures/provided-variable-reused-nested-fragment.expected", input, expected).await;
}

#[tokio::test]
async fn provided_variable_reused_nested_linked_fragment() {
    let input = include_str!("compile_relay_artifacts/fixtures/provided-variable-reused-nested-linked-fragment.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/provided-variable-reused-nested-linked-fragment.expected");
    test_fixture(transform_fixture, file!(), "provided-variable-reused-nested-linked-fragment.graphql", "compile_relay_artifacts/fixtures/provided-variable-reused-nested-linked-fragment.expected", input, expected).await;
}

#[tokio::test]
async fn provided_variable_split_operation() {
    let input = include_str!("compile_relay_artifacts/fixtures/provided-variable-split-operation.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/provided-variable-split-operation.expected");
    test_fixture(transform_fixture, file!(), "provided-variable-split-operation.graphql", "compile_relay_artifacts/fixtures/provided-variable-split-operation.expected", input, expected).await;
}

#[tokio::test]
async fn query_with_and_without_module_directive() {
    let input = include_str!("compile_relay_artifacts/fixtures/query-with-and-without-module-directive.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/query-with-and-without-module-directive.expected");
    test_fixture(transform_fixture, file!(), "query-with-and-without-module-directive.graphql", "compile_relay_artifacts/fixtures/query-with-and-without-module-directive.expected", input, expected).await;
}

#[tokio::test]
async fn query_with_conditional_module() {
    let input = include_str!("compile_relay_artifacts/fixtures/query-with-conditional-module.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/query-with-conditional-module.expected");
    test_fixture(transform_fixture, file!(), "query-with-conditional-module.graphql", "compile_relay_artifacts/fixtures/query-with-conditional-module.expected", input, expected).await;
}

#[tokio::test]
async fn query_with_fragment_variables() {
    let input = include_str!("compile_relay_artifacts/fixtures/query-with-fragment-variables.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/query-with-fragment-variables.expected");
    test_fixture(transform_fixture, file!(), "query-with-fragment-variables.graphql", "compile_relay_artifacts/fixtures/query-with-fragment-variables.expected", input, expected).await;
}

#[tokio::test]
async fn query_with_match_directive() {
    let input = include_str!("compile_relay_artifacts/fixtures/query-with-match-directive.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/query-with-match-directive.expected");
    test_fixture(transform_fixture, file!(), "query-with-match-directive.graphql", "compile_relay_artifacts/fixtures/query-with-match-directive.expected", input, expected).await;
}

#[tokio::test]
async fn query_with_match_directive_no_inline_experimental() {
    let input = include_str!("compile_relay_artifacts/fixtures/query-with-match-directive-no-inline-experimental.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/query-with-match-directive-no-inline-experimental.expected");
    test_fixture(transform_fixture, file!(), "query-with-match-directive-no-inline-experimental.graphql", "compile_relay_artifacts/fixtures/query-with-match-directive-no-inline-experimental.expected", input, expected).await;
}

#[tokio::test]
async fn query_with_match_directive_no_modules_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/query-with-match-directive-no-modules.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/query-with-match-directive-no-modules.invalid.expected");
    test_fixture(transform_fixture, file!(), "query-with-match-directive-no-modules.invalid.graphql", "compile_relay_artifacts/fixtures/query-with-match-directive-no-modules.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn query_with_match_directive_with_extra_argument() {
    let input = include_str!("compile_relay_artifacts/fixtures/query-with-match-directive-with-extra-argument.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/query-with-match-directive-with-extra-argument.expected");
    test_fixture(transform_fixture, file!(), "query-with-match-directive-with-extra-argument.graphql", "compile_relay_artifacts/fixtures/query-with-match-directive-with-extra-argument.expected", input, expected).await;
}

#[tokio::test]
async fn query_with_match_directive_with_typename() {
    let input = include_str!("compile_relay_artifacts/fixtures/query-with-match-directive-with-typename.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/query-with-match-directive-with-typename.expected");
    test_fixture(transform_fixture, file!(), "query-with-match-directive-with-typename.graphql", "compile_relay_artifacts/fixtures/query-with-match-directive-with-typename.expected", input, expected).await;
}

#[tokio::test]
async fn query_with_module_directive() {
    let input = include_str!("compile_relay_artifacts/fixtures/query-with-module-directive.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/query-with-module-directive.expected");
    test_fixture(transform_fixture, file!(), "query-with-module-directive.graphql", "compile_relay_artifacts/fixtures/query-with-module-directive.expected", input, expected).await;
}

#[tokio::test]
async fn query_with_module_directive_and_arguments() {
    let input = include_str!("compile_relay_artifacts/fixtures/query-with-module-directive-and-arguments.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/query-with-module-directive-and-arguments.expected");
    test_fixture(transform_fixture, file!(), "query-with-module-directive-and-arguments.graphql", "compile_relay_artifacts/fixtures/query-with-module-directive-and-arguments.expected", input, expected).await;
}

#[tokio::test]
async fn query_with_module_directive_custom_import() {
    let input = include_str!("compile_relay_artifacts/fixtures/query-with-module-directive-custom-import.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/query-with-module-directive-custom-import.expected");
    test_fixture(transform_fixture, file!(), "query-with-module-directive-custom-import.graphql", "compile_relay_artifacts/fixtures/query-with-module-directive-custom-import.expected", input, expected).await;
}

#[tokio::test]
async fn query_with_module_directive_jsresource_import() {
    let input = include_str!("compile_relay_artifacts/fixtures/query-with-module-directive-jsresource-import.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/query-with-module-directive-jsresource-import.expected");
    test_fixture(transform_fixture, file!(), "query-with-module-directive-jsresource-import.graphql", "compile_relay_artifacts/fixtures/query-with-module-directive-jsresource-import.expected", input, expected).await;
}

#[tokio::test]
async fn query_with_raw_response_type_directive() {
    let input = include_str!("compile_relay_artifacts/fixtures/query-with-raw-response-type-directive.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/query-with-raw-response-type-directive.expected");
    test_fixture(transform_fixture, file!(), "query-with-raw-response-type-directive.graphql", "compile_relay_artifacts/fixtures/query-with-raw-response-type-directive.expected", input, expected).await;
}

#[tokio::test]
async fn redundant_selection_in_inline_fragments() {
    let input = include_str!("compile_relay_artifacts/fixtures/redundant-selection-in-inline-fragments.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/redundant-selection-in-inline-fragments.expected");
    test_fixture(transform_fixture, file!(), "redundant-selection-in-inline-fragments.graphql", "compile_relay_artifacts/fixtures/redundant-selection-in-inline-fragments.expected", input, expected).await;
}

#[tokio::test]
async fn refetchable_conflict_with_operation_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/refetchable_conflict_with_operation.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/refetchable_conflict_with_operation.invalid.expected");
    test_fixture(transform_fixture, file!(), "refetchable_conflict_with_operation.invalid.graphql", "compile_relay_artifacts/fixtures/refetchable_conflict_with_operation.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn refetchable_conflict_with_refetchable_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/refetchable_conflict_with_refetchable.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/refetchable_conflict_with_refetchable.invalid.expected");
    test_fixture(transform_fixture, file!(), "refetchable_conflict_with_refetchable.invalid.graphql", "compile_relay_artifacts/fixtures/refetchable_conflict_with_refetchable.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn refetchable_connection() {
    let input = include_str!("compile_relay_artifacts/fixtures/refetchable-connection.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/refetchable-connection.expected");
    test_fixture(transform_fixture, file!(), "refetchable-connection.graphql", "compile_relay_artifacts/fixtures/refetchable-connection.expected", input, expected).await;
}

#[tokio::test]
async fn refetchable_connection_custom_handler() {
    let input = include_str!("compile_relay_artifacts/fixtures/refetchable-connection-custom-handler.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/refetchable-connection-custom-handler.expected");
    test_fixture(transform_fixture, file!(), "refetchable-connection-custom-handler.graphql", "compile_relay_artifacts/fixtures/refetchable-connection-custom-handler.expected", input, expected).await;
}

#[tokio::test]
async fn refetchable_fragment_directives_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/refetchable_fragment_directives.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/refetchable_fragment_directives.invalid.expected");
    test_fixture(transform_fixture, file!(), "refetchable_fragment_directives.invalid.graphql", "compile_relay_artifacts/fixtures/refetchable_fragment_directives.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn refetchable_fragment_on_node_and_fetchable() {
    let input = include_str!("compile_relay_artifacts/fixtures/refetchable-fragment-on-node-and-fetchable.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/refetchable-fragment-on-node-and-fetchable.expected");
    test_fixture(transform_fixture, file!(), "refetchable-fragment-on-node-and-fetchable.graphql", "compile_relay_artifacts/fixtures/refetchable-fragment-on-node-and-fetchable.expected", input, expected).await;
}

#[tokio::test]
async fn refetchable_fragment_on_node_and_fetchable_arg() {
    let input = include_str!("compile_relay_artifacts/fixtures/refetchable-fragment-on-node-and-fetchable-arg.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/refetchable-fragment-on-node-and-fetchable-arg.expected");
    test_fixture(transform_fixture, file!(), "refetchable-fragment-on-node-and-fetchable-arg.graphql", "compile_relay_artifacts/fixtures/refetchable-fragment-on-node-and-fetchable-arg.expected", input, expected).await;
}

#[tokio::test]
async fn refetchable_fragment_on_node_and_fetchable_no_flag() {
    let input = include_str!("compile_relay_artifacts/fixtures/refetchable-fragment-on-node-and-fetchable-no-flag.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/refetchable-fragment-on-node-and-fetchable-no-flag.expected");
    test_fixture(transform_fixture, file!(), "refetchable-fragment-on-node-and-fetchable-no-flag.graphql", "compile_relay_artifacts/fixtures/refetchable-fragment-on-node-and-fetchable-no-flag.expected", input, expected).await;
}

#[tokio::test]
async fn refetchable_fragment_on_node_with_missing_id() {
    let input = include_str!("compile_relay_artifacts/fixtures/refetchable-fragment-on-node-with-missing-id.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/refetchable-fragment-on-node-with-missing-id.expected");
    test_fixture(transform_fixture, file!(), "refetchable-fragment-on-node-with-missing-id.graphql", "compile_relay_artifacts/fixtures/refetchable-fragment-on-node-with-missing-id.expected", input, expected).await;
}

#[tokio::test]
async fn refetchable_fragment_with_connection() {
    let input = include_str!("compile_relay_artifacts/fixtures/refetchable-fragment-with-connection.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/refetchable-fragment-with-connection.expected");
    test_fixture(transform_fixture, file!(), "refetchable-fragment-with-connection.graphql", "compile_relay_artifacts/fixtures/refetchable-fragment-with-connection.expected", input, expected).await;
}

#[tokio::test]
async fn refetchable_fragment_with_connection_bidirectional() {
    let input = include_str!("compile_relay_artifacts/fixtures/refetchable-fragment-with-connection-bidirectional.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/refetchable-fragment-with-connection-bidirectional.expected");
    test_fixture(transform_fixture, file!(), "refetchable-fragment-with-connection-bidirectional.graphql", "compile_relay_artifacts/fixtures/refetchable-fragment-with-connection-bidirectional.expected", input, expected).await;
}

#[tokio::test]
async fn refetchable_fragment_with_connection_es_modules() {
    let input = include_str!("compile_relay_artifacts/fixtures/refetchable-fragment-with-connection-es-modules.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/refetchable-fragment-with-connection-es-modules.expected");
    test_fixture(transform_fixture, file!(), "refetchable-fragment-with-connection-es-modules.graphql", "compile_relay_artifacts/fixtures/refetchable-fragment-with-connection-es-modules.expected", input, expected).await;
}

#[tokio::test]
async fn refetchable_fragment_with_connection_with_stream() {
    let input = include_str!("compile_relay_artifacts/fixtures/refetchable-fragment-with-connection-with-stream.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/refetchable-fragment-with-connection-with-stream.expected");
    test_fixture(transform_fixture, file!(), "refetchable-fragment-with-connection-with-stream.graphql", "compile_relay_artifacts/fixtures/refetchable-fragment-with-connection-with-stream.expected", input, expected).await;
}

#[tokio::test]
async fn refetchable_with_arguments_conflicting_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/refetchable-with-arguments-conflicting.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/refetchable-with-arguments-conflicting.invalid.expected");
    test_fixture(transform_fixture, file!(), "refetchable-with-arguments-conflicting.invalid.graphql", "compile_relay_artifacts/fixtures/refetchable-with-arguments-conflicting.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn relay_client_id_field() {
    let input = include_str!("compile_relay_artifacts/fixtures/relay-client-id-field.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/relay-client-id-field.expected");
    test_fixture(transform_fixture, file!(), "relay-client-id-field.graphql", "compile_relay_artifacts/fixtures/relay-client-id-field.expected", input, expected).await;
}

#[tokio::test]
async fn relay_live_resolver() {
    let input = include_str!("compile_relay_artifacts/fixtures/relay-live-resolver.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/relay-live-resolver.expected");
    test_fixture(transform_fixture, file!(), "relay-live-resolver.graphql", "compile_relay_artifacts/fixtures/relay-live-resolver.expected", input, expected).await;
}

#[tokio::test]
async fn relay_live_resolver_without_fragment() {
    let input = include_str!("compile_relay_artifacts/fixtures/relay-live-resolver-without-fragment.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/relay-live-resolver-without-fragment.expected");
    test_fixture(transform_fixture, file!(), "relay-live-resolver-without-fragment.graphql", "compile_relay_artifacts/fixtures/relay-live-resolver-without-fragment.expected", input, expected).await;
}

#[tokio::test]
async fn relay_model_resolver() {
    let input = include_str!("compile_relay_artifacts/fixtures/relay-model-resolver.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/relay-model-resolver.expected");
    test_fixture(transform_fixture, file!(), "relay-model-resolver.graphql", "compile_relay_artifacts/fixtures/relay-model-resolver.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver() {
    let input = include_str!("compile_relay_artifacts/fixtures/relay-resolver.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/relay-resolver.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver.graphql", "compile_relay_artifacts/fixtures/relay-resolver.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_alias() {
    let input = include_str!("compile_relay_artifacts/fixtures/relay-resolver-alias.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/relay-resolver-alias.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-alias.graphql", "compile_relay_artifacts/fixtures/relay-resolver-alias.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_backing_client_edge() {
    let input = include_str!("compile_relay_artifacts/fixtures/relay-resolver-backing-client-edge.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/relay-resolver-backing-client-edge.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-backing-client-edge.graphql", "compile_relay_artifacts/fixtures/relay-resolver-backing-client-edge.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_edge_to_interface() {
    let input = include_str!("compile_relay_artifacts/fixtures/relay-resolver-edge-to-interface.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/relay-resolver-edge-to-interface.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-edge-to-interface.graphql", "compile_relay_artifacts/fixtures/relay-resolver-edge-to-interface.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_edge_to_interface_with_child_interface_and_no_implementors() {
    let input = include_str!("compile_relay_artifacts/fixtures/relay-resolver-edge-to-interface-with-child-interface-and-no-implementors.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/relay-resolver-edge-to-interface-with-child-interface-and-no-implementors.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-edge-to-interface-with-child-interface-and-no-implementors.graphql", "compile_relay_artifacts/fixtures/relay-resolver-edge-to-interface-with-child-interface-and-no-implementors.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_edge_to_interface_with_no_implementors() {
    let input = include_str!("compile_relay_artifacts/fixtures/relay-resolver-edge-to-interface-with-no-implementors.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/relay-resolver-edge-to-interface-with-no-implementors.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-edge-to-interface-with-no-implementors.graphql", "compile_relay_artifacts/fixtures/relay-resolver-edge-to-interface-with-no-implementors.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_es_modules() {
    let input = include_str!("compile_relay_artifacts/fixtures/relay-resolver-es-modules.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/relay-resolver-es-modules.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-es-modules.graphql", "compile_relay_artifacts/fixtures/relay-resolver-es-modules.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_fragment_on_interface() {
    let input = include_str!("compile_relay_artifacts/fixtures/relay-resolver-fragment-on-interface.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/relay-resolver-fragment-on-interface.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-fragment-on-interface.graphql", "compile_relay_artifacts/fixtures/relay-resolver-fragment-on-interface.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_live_weak_object() {
    let input = include_str!("compile_relay_artifacts/fixtures/relay-resolver-live-weak-object.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/relay-resolver-live-weak-object.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-live-weak-object.graphql", "compile_relay_artifacts/fixtures/relay-resolver-live-weak-object.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_named_import() {
    let input = include_str!("compile_relay_artifacts/fixtures/relay-resolver-named-import.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/relay-resolver-named-import.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-named-import.graphql", "compile_relay_artifacts/fixtures/relay-resolver-named-import.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_on_abstract_client_type() {
    let input = include_str!("compile_relay_artifacts/fixtures/relay-resolver-on-abstract-client-type.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/relay-resolver-on-abstract-client-type.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-on-abstract-client-type.graphql", "compile_relay_artifacts/fixtures/relay-resolver-on-abstract-client-type.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_plural_fragment_on_interface() {
    let input = include_str!("compile_relay_artifacts/fixtures/relay-resolver-plural-fragment-on-interface.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/relay-resolver-plural-fragment-on-interface.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-plural-fragment-on-interface.graphql", "compile_relay_artifacts/fixtures/relay-resolver-plural-fragment-on-interface.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_required() {
    let input = include_str!("compile_relay_artifacts/fixtures/relay-resolver-required.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/relay-resolver-required.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-required.graphql", "compile_relay_artifacts/fixtures/relay-resolver-required.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_weak_object() {
    let input = include_str!("compile_relay_artifacts/fixtures/relay-resolver-weak-object.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/relay-resolver-weak-object.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-weak-object.graphql", "compile_relay_artifacts/fixtures/relay-resolver-weak-object.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_weak_object_normalization_ast() {
    let input = include_str!("compile_relay_artifacts/fixtures/relay-resolver-weak-object-normalization-ast.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/relay-resolver-weak-object-normalization-ast.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-weak-object-normalization-ast.graphql", "compile_relay_artifacts/fixtures/relay-resolver-weak-object-normalization-ast.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_weak_object_plural() {
    let input = include_str!("compile_relay_artifacts/fixtures/relay-resolver-weak-object-plural.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/relay-resolver-weak-object-plural.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-weak-object-plural.graphql", "compile_relay_artifacts/fixtures/relay-resolver-weak-object-plural.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_with_args() {
    let input = include_str!("compile_relay_artifacts/fixtures/relay-resolver-with-args.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/relay-resolver-with-args.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-with-args.graphql", "compile_relay_artifacts/fixtures/relay-resolver-with-args.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_with_args_and_alias() {
    let input = include_str!("compile_relay_artifacts/fixtures/relay-resolver-with-args-and-alias.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/relay-resolver-with-args-and-alias.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-with-args-and-alias.graphql", "compile_relay_artifacts/fixtures/relay-resolver-with-args-and-alias.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_with_args_and_alias_no_fragment() {
    let input = include_str!("compile_relay_artifacts/fixtures/relay-resolver-with-args-and-alias-no-fragment.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/relay-resolver-with-args-and-alias-no-fragment.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-with-args-and-alias-no-fragment.graphql", "compile_relay_artifacts/fixtures/relay-resolver-with-args-and-alias-no-fragment.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_with_args_fragment_spread_using_undefined_global_variable_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/relay-resolver-with-args-fragment-spread-using-undefined-global-variable.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/relay-resolver-with-args-fragment-spread-using-undefined-global-variable.invalid.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-with-args-fragment-spread-using-undefined-global-variable.invalid.graphql", "compile_relay_artifacts/fixtures/relay-resolver-with-args-fragment-spread-using-undefined-global-variable.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_with_fragment_on_client_type() {
    let input = include_str!("compile_relay_artifacts/fixtures/relay-resolver-with-fragment-on-client-type.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/relay-resolver-with-fragment-on-client-type.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-with-fragment-on-client-type.graphql", "compile_relay_artifacts/fixtures/relay-resolver-with-fragment-on-client-type.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_with_output_type_client_object() {
    let input = include_str!("compile_relay_artifacts/fixtures/relay-resolver-with-output-type-client-object.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/relay-resolver-with-output-type-client-object.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-with-output-type-client-object.graphql", "compile_relay_artifacts/fixtures/relay-resolver-with-output-type-client-object.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_with_output_type_scalar() {
    let input = include_str!("compile_relay_artifacts/fixtures/relay-resolver-with-output-type-scalar.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/relay-resolver-with-output-type-scalar.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-with-output-type-scalar.graphql", "compile_relay_artifacts/fixtures/relay-resolver-with-output-type-scalar.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_with_required_client_edge() {
    let input = include_str!("compile_relay_artifacts/fixtures/relay-resolver-with-required-client-edge.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/relay-resolver-with-required-client-edge.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-with-required-client-edge.graphql", "compile_relay_artifacts/fixtures/relay-resolver-with-required-client-edge.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_with_spread_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/relay-resolver-with-spread.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/relay-resolver-with-spread.invalid.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-with-spread.invalid.graphql", "compile_relay_artifacts/fixtures/relay-resolver-with-spread.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_with_undefined_field_and_fragment_args_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/relay-resolver-with-undefined-field-and-fragment-args.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/relay-resolver-with-undefined-field-and-fragment-args.invalid.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-with-undefined-field-and-fragment-args.invalid.graphql", "compile_relay_artifacts/fixtures/relay-resolver-with-undefined-field-and-fragment-args.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_with_undefined_field_args_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/relay-resolver-with-undefined-field-args.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/relay-resolver-with-undefined-field-args.invalid.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-with-undefined-field-args.invalid.graphql", "compile_relay_artifacts/fixtures/relay-resolver-with-undefined-field-args.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_with_undefined_field_args_linked_field_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/relay-resolver-with-undefined-field-args-linked-field.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/relay-resolver-with-undefined-field-args-linked-field.invalid.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-with-undefined-field-args-linked-field.invalid.graphql", "compile_relay_artifacts/fixtures/relay-resolver-with-undefined-field-args-linked-field.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_with_undefined_field_args_scalar_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/relay-resolver-with-undefined-field-args-scalar.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/relay-resolver-with-undefined-field-args-scalar.invalid.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-with-undefined-field-args-scalar.invalid.graphql", "compile_relay_artifacts/fixtures/relay-resolver-with-undefined-field-args-scalar.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_with_undefined_fragment_args_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/relay-resolver-with-undefined-fragment-args.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/relay-resolver-with-undefined-fragment-args.invalid.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-with-undefined-fragment-args.invalid.graphql", "compile_relay_artifacts/fixtures/relay-resolver-with-undefined-fragment-args.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_with_undefined_fragment_args_linked_field_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/relay-resolver-with-undefined-fragment-args-linked-field.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/relay-resolver-with-undefined-fragment-args-linked-field.invalid.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-with-undefined-fragment-args-linked-field.invalid.graphql", "compile_relay_artifacts/fixtures/relay-resolver-with-undefined-fragment-args-linked-field.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_without_fragment_on_client_type() {
    let input = include_str!("compile_relay_artifacts/fixtures/relay-resolver-without-fragment-on-client-type.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/relay-resolver-without-fragment-on-client-type.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-without-fragment-on-client-type.graphql", "compile_relay_artifacts/fixtures/relay-resolver-without-fragment-on-client-type.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolvers_with_different_field_args_are_not_merged() {
    let input = include_str!("compile_relay_artifacts/fixtures/relay-resolvers-with-different-field-args-are-not-merged.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/relay-resolvers-with-different-field-args-are-not-merged.expected");
    test_fixture(transform_fixture, file!(), "relay-resolvers-with-different-field-args-are-not-merged.graphql", "compile_relay_artifacts/fixtures/relay-resolvers-with-different-field-args-are-not-merged.expected", input, expected).await;
}

#[tokio::test]
async fn relay_test_operation() {
    let input = include_str!("compile_relay_artifacts/fixtures/relay-test-operation.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/relay-test-operation.expected");
    test_fixture(transform_fixture, file!(), "relay-test-operation.graphql", "compile_relay_artifacts/fixtures/relay-test-operation.expected", input, expected).await;
}

#[tokio::test]
async fn required_argument_not_passed_default_value() {
    let input = include_str!("compile_relay_artifacts/fixtures/required_argument_not_passed_default_value.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/required_argument_not_passed_default_value.expected");
    test_fixture(transform_fixture, file!(), "required_argument_not_passed_default_value.graphql", "compile_relay_artifacts/fixtures/required_argument_not_passed_default_value.expected", input, expected).await;
}

#[tokio::test]
async fn required_argument_not_passed_no_args_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/required_argument_not_passed_no_args.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/required_argument_not_passed_no_args.invalid.expected");
    test_fixture(transform_fixture, file!(), "required_argument_not_passed_no_args.invalid.graphql", "compile_relay_artifacts/fixtures/required_argument_not_passed_no_args.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn required_argument_not_passed_other_args_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/required_argument_not_passed_other_args.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/required_argument_not_passed_other_args.invalid.expected");
    test_fixture(transform_fixture, file!(), "required_argument_not_passed_other_args.invalid.graphql", "compile_relay_artifacts/fixtures/required_argument_not_passed_other_args.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn required_bubbles_to_client_edge() {
    let input = include_str!("compile_relay_artifacts/fixtures/required-bubbles-to-client-edge.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/required-bubbles-to-client-edge.expected");
    test_fixture(transform_fixture, file!(), "required-bubbles-to-client-edge.graphql", "compile_relay_artifacts/fixtures/required-bubbles-to-client-edge.expected", input, expected).await;
}

#[tokio::test]
async fn required_bubbles_to_inline_aliased_fragment() {
    let input = include_str!("compile_relay_artifacts/fixtures/required-bubbles-to-inline-aliased-fragment.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/required-bubbles-to-inline-aliased-fragment.expected");
    test_fixture(transform_fixture, file!(), "required-bubbles-to-inline-aliased-fragment.graphql", "compile_relay_artifacts/fixtures/required-bubbles-to-inline-aliased-fragment.expected", input, expected).await;
}

#[tokio::test]
async fn required_directive() {
    let input = include_str!("compile_relay_artifacts/fixtures/required-directive.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/required-directive.expected");
    test_fixture(transform_fixture, file!(), "required-directive.graphql", "compile_relay_artifacts/fixtures/required-directive.expected", input, expected).await;
}

#[tokio::test]
async fn required_directive_on_conditional_field() {
    let input = include_str!("compile_relay_artifacts/fixtures/required-directive-on-conditional-field.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/required-directive-on-conditional-field.expected");
    test_fixture(transform_fixture, file!(), "required-directive-on-conditional-field.graphql", "compile_relay_artifacts/fixtures/required-directive-on-conditional-field.expected", input, expected).await;
}

#[tokio::test]
async fn resolver_field_with_all_fragment_args_omitted() {
    let input = include_str!("compile_relay_artifacts/fixtures/resolver-field-with-all-fragment-args-omitted.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/resolver-field-with-all-fragment-args-omitted.expected");
    test_fixture(transform_fixture, file!(), "resolver-field-with-all-fragment-args-omitted.graphql", "compile_relay_artifacts/fixtures/resolver-field-with-all-fragment-args-omitted.expected", input, expected).await;
}

#[tokio::test]
async fn resolver_field_with_all_runtime_args_omitted() {
    let input = include_str!("compile_relay_artifacts/fixtures/resolver-field-with-all-runtime-args-omitted.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/resolver-field-with-all-runtime-args-omitted.expected");
    test_fixture(transform_fixture, file!(), "resolver-field-with-all-runtime-args-omitted.graphql", "compile_relay_artifacts/fixtures/resolver-field-with-all-runtime-args-omitted.expected", input, expected).await;
}

#[tokio::test]
async fn resolver_with_root_fragment_on_model_type() {
    let input = include_str!("compile_relay_artifacts/fixtures/resolver-with-root-fragment-on-model-type.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/resolver-with-root-fragment-on-model-type.expected");
    test_fixture(transform_fixture, file!(), "resolver-with-root-fragment-on-model-type.graphql", "compile_relay_artifacts/fixtures/resolver-with-root-fragment-on-model-type.expected", input, expected).await;
}

#[tokio::test]
async fn same_fields_with_different_args_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/same-fields-with-different-args.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/same-fields-with-different-args.invalid.expected");
    test_fixture(transform_fixture, file!(), "same-fields-with-different-args.invalid.graphql", "compile_relay_artifacts/fixtures/same-fields-with-different-args.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn same_fields_with_different_args_variables_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/same_fields_with_different_args_variables.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/same_fields_with_different_args_variables.invalid.expected");
    test_fixture(transform_fixture, file!(), "same_fields_with_different_args_variables.invalid.graphql", "compile_relay_artifacts/fixtures/same_fields_with_different_args_variables.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn scalar_handle_field() {
    let input = include_str!("compile_relay_artifacts/fixtures/scalar-handle-field.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/scalar-handle-field.expected");
    test_fixture(transform_fixture, file!(), "scalar-handle-field.graphql", "compile_relay_artifacts/fixtures/scalar-handle-field.expected", input, expected).await;
}

#[tokio::test]
async fn selection_set_conflict_added_argument() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_added_argument.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_added_argument.expected");
    test_fixture(transform_fixture, file!(), "selection_set_conflict_added_argument.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_added_argument.expected", input, expected).await;
}

#[tokio::test]
async fn selection_set_conflict_alias_covering_name() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_alias_covering_name.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_alias_covering_name.expected");
    test_fixture(transform_fixture, file!(), "selection_set_conflict_alias_covering_name.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_alias_covering_name.expected", input, expected).await;
}

#[tokio::test]
async fn selection_set_conflict_composite_vs_noncomposite() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_composite_vs_noncomposite.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_composite_vs_noncomposite.expected");
    test_fixture(transform_fixture, file!(), "selection_set_conflict_composite_vs_noncomposite.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_composite_vs_noncomposite.expected", input, expected).await;
}

#[tokio::test]
async fn selection_set_conflict_conflicting_list_and_non_list_types() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_conflicting_list_and_non_list_types.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_conflicting_list_and_non_list_types.expected");
    test_fixture(transform_fixture, file!(), "selection_set_conflict_conflicting_list_and_non_list_types.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_conflicting_list_and_non_list_types.expected", input, expected).await;
}

#[tokio::test]
async fn selection_set_conflict_conflicting_list_and_non_list_types_opposite_order() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_conflicting_list_and_non_list_types_opposite_order.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_conflicting_list_and_non_list_types_opposite_order.expected");
    test_fixture(transform_fixture, file!(), "selection_set_conflict_conflicting_list_and_non_list_types_opposite_order.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_conflicting_list_and_non_list_types_opposite_order.expected", input, expected).await;
}

#[tokio::test]
async fn selection_set_conflict_conflicting_nullable_and_non_nullable_types() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_conflicting_nullable_and_non_nullable_types.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_conflicting_nullable_and_non_nullable_types.expected");
    test_fixture(transform_fixture, file!(), "selection_set_conflict_conflicting_nullable_and_non_nullable_types.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_conflicting_nullable_and_non_nullable_types.expected", input, expected).await;
}

#[tokio::test]
async fn selection_set_conflict_conflicting_selection_sets_inside_list_type() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_conflicting_selection_sets_inside_list_type.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_conflicting_selection_sets_inside_list_type.expected");
    test_fixture(transform_fixture, file!(), "selection_set_conflict_conflicting_selection_sets_inside_list_type.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_conflicting_selection_sets_inside_list_type.expected", input, expected).await;
}

#[tokio::test]
async fn selection_set_conflict_conflicting_selection_sets_inside_list_type_multiple_conflicts() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_conflicting_selection_sets_inside_list_type_multiple_conflicts.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_conflicting_selection_sets_inside_list_type_multiple_conflicts.expected");
    test_fixture(transform_fixture, file!(), "selection_set_conflict_conflicting_selection_sets_inside_list_type_multiple_conflicts.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_conflicting_selection_sets_inside_list_type_multiple_conflicts.expected", input, expected).await;
}

#[tokio::test]
async fn selection_set_conflict_different_aliases() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_different_aliases.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_different_aliases.expected");
    test_fixture(transform_fixture, file!(), "selection_set_conflict_different_aliases.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_different_aliases.expected", input, expected).await;
}

#[tokio::test]
async fn selection_set_conflict_different_arguments() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_different_arguments.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_different_arguments.expected");
    test_fixture(transform_fixture, file!(), "selection_set_conflict_different_arguments.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_different_arguments.expected", input, expected).await;
}

#[tokio::test]
async fn selection_set_conflict_different_arguments_with_list() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_different_arguments_with_list.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_different_arguments_with_list.expected");
    test_fixture(transform_fixture, file!(), "selection_set_conflict_different_arguments_with_list.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_different_arguments_with_list.expected", input, expected).await;
}

#[tokio::test]
async fn selection_set_conflict_different_name() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_different_name.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_different_name.expected");
    test_fixture(transform_fixture, file!(), "selection_set_conflict_different_name.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_different_name.expected", input, expected).await;
}

#[tokio::test]
async fn selection_set_conflict_different_return_types_for_field_but_same_shape() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_different_return_types_for_field_but_same_shape.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_different_return_types_for_field_but_same_shape.expected");
    test_fixture(transform_fixture, file!(), "selection_set_conflict_different_return_types_for_field_but_same_shape.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_different_return_types_for_field_but_same_shape.expected", input, expected).await;
}

#[tokio::test]
async fn selection_set_conflict_different_types_with_conflict() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_different_types_with_conflict.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_different_types_with_conflict.expected");
    test_fixture(transform_fixture, file!(), "selection_set_conflict_different_types_with_conflict.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_different_types_with_conflict.expected", input, expected).await;
}

#[tokio::test]
async fn selection_set_conflict_different_types_with_conflict_different_shape() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_different_types_with_conflict_different_shape.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_different_types_with_conflict_different_shape.expected");
    test_fixture(transform_fixture, file!(), "selection_set_conflict_different_types_with_conflict_different_shape.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_different_types_with_conflict_different_shape.expected", input, expected).await;
}

#[tokio::test]
async fn selection_set_conflict_different_types_with_conflict_in_typeless_inline_fragments() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_different_types_with_conflict_in_typeless_inline_fragments.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_different_types_with_conflict_in_typeless_inline_fragments.expected");
    test_fixture(transform_fixture, file!(), "selection_set_conflict_different_types_with_conflict_in_typeless_inline_fragments.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_different_types_with_conflict_in_typeless_inline_fragments.expected", input, expected).await;
}

#[tokio::test]
async fn selection_set_conflict_different_types_without_conflict() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_different_types_without_conflict.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_different_types_without_conflict.expected");
    test_fixture(transform_fixture, file!(), "selection_set_conflict_different_types_without_conflict.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_different_types_without_conflict.expected", input, expected).await;
}

#[tokio::test]
async fn selection_set_conflict_different_types_without_conflict_1() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_different_types_without_conflict_1.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_different_types_without_conflict_1.expected");
    test_fixture(transform_fixture, file!(), "selection_set_conflict_different_types_without_conflict_1.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_different_types_without_conflict_1.expected", input, expected).await;
}

#[tokio::test]
async fn selection_set_conflict_different_types_without_conflict_in_typeless_inline_fragments() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_different_types_without_conflict_in_typeless_inline_fragments.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_different_types_without_conflict_in_typeless_inline_fragments.expected");
    test_fixture(transform_fixture, file!(), "selection_set_conflict_different_types_without_conflict_in_typeless_inline_fragments.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_different_types_without_conflict_in_typeless_inline_fragments.expected", input, expected).await;
}

#[tokio::test]
async fn selection_set_conflict_inconsistent_stream_usage_1() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_inconsistent_stream_usage_1.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_inconsistent_stream_usage_1.expected");
    test_fixture(transform_fixture, file!(), "selection_set_conflict_inconsistent_stream_usage_1.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_inconsistent_stream_usage_1.expected", input, expected).await;
}

#[tokio::test]
async fn selection_set_conflict_inconsistent_stream_usage_2() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_inconsistent_stream_usage_2.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_inconsistent_stream_usage_2.expected");
    test_fixture(transform_fixture, file!(), "selection_set_conflict_inconsistent_stream_usage_2.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_inconsistent_stream_usage_2.expected", input, expected).await;
}

#[tokio::test]
async fn selection_set_conflict_invalid_same_fragments_in_different_contexts() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_invalid_same_fragments_in_different_contexts.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_invalid_same_fragments_in_different_contexts.expected");
    test_fixture(transform_fixture, file!(), "selection_set_conflict_invalid_same_fragments_in_different_contexts.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_invalid_same_fragments_in_different_contexts.expected", input, expected).await;
}

#[tokio::test]
async fn selection_set_conflict_missing_argument() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_missing_argument.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_missing_argument.expected");
    test_fixture(transform_fixture, file!(), "selection_set_conflict_missing_argument.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_missing_argument.expected", input, expected).await;
}

#[tokio::test]
async fn selection_set_conflict_multiple_conflicts() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_multiple_conflicts.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_multiple_conflicts.expected");
    test_fixture(transform_fixture, file!(), "selection_set_conflict_multiple_conflicts.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_multiple_conflicts.expected", input, expected).await;
}

#[tokio::test]
async fn selection_set_conflict_multiple_conflicts_with_different_args() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_multiple_conflicts_with_different_args.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_multiple_conflicts_with_different_args.expected");
    test_fixture(transform_fixture, file!(), "selection_set_conflict_multiple_conflicts_with_different_args.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_multiple_conflicts_with_different_args.expected", input, expected).await;
}

#[tokio::test]
async fn selection_set_conflict_nested_conflict() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_nested_conflict.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_nested_conflict.expected");
    test_fixture(transform_fixture, file!(), "selection_set_conflict_nested_conflict.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_nested_conflict.expected", input, expected).await;
}

#[tokio::test]
async fn selection_set_conflict_stream_on_nodes_or_edges() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_stream_on_nodes_or_edges.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_stream_on_nodes_or_edges.expected");
    test_fixture(transform_fixture, file!(), "selection_set_conflict_stream_on_nodes_or_edges.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_stream_on_nodes_or_edges.expected", input, expected).await;
}

#[tokio::test]
async fn selection_set_conflict_stream_on_nodes_or_edges_without_defer_on_page_info() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_stream_on_nodes_or_edges_without_defer_on_page_info.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_stream_on_nodes_or_edges_without_defer_on_page_info.expected");
    test_fixture(transform_fixture, file!(), "selection_set_conflict_stream_on_nodes_or_edges_without_defer_on_page_info.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_stream_on_nodes_or_edges_without_defer_on_page_info.expected", input, expected).await;
}

#[tokio::test]
async fn selection_set_conflict_stream_on_nodes_or_edges_without_defer_on_page_info_and_page_info_alias() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_stream_on_nodes_or_edges_without_defer_on_page_info_and_page_info_alias.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_stream_on_nodes_or_edges_without_defer_on_page_info_and_page_info_alias.expected");
    test_fixture(transform_fixture, file!(), "selection_set_conflict_stream_on_nodes_or_edges_without_defer_on_page_info_and_page_info_alias.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_stream_on_nodes_or_edges_without_defer_on_page_info_and_page_info_alias.expected", input, expected).await;
}

#[tokio::test]
async fn selection_set_conflict_valid() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_valid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_valid.expected");
    test_fixture(transform_fixture, file!(), "selection_set_conflict_valid.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_valid.expected", input, expected).await;
}

#[tokio::test]
async fn selection_set_conflict_valid_stream() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_valid_stream.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_valid_stream.expected");
    test_fixture(transform_fixture, file!(), "selection_set_conflict_valid_stream.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_valid_stream.expected", input, expected).await;
}

#[tokio::test]
async fn selection_set_conflict_with_fragment() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_with_fragment.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_with_fragment.expected");
    test_fixture(transform_fixture, file!(), "selection_set_conflict_with_fragment.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_with_fragment.expected", input, expected).await;
}

#[tokio::test]
async fn selection_set_conflict_with_inline_fragment() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_with_inline_fragment.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_with_inline_fragment.expected");
    test_fixture(transform_fixture, file!(), "selection_set_conflict_with_inline_fragment.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_with_inline_fragment.expected", input, expected).await;
}

#[tokio::test]
async fn selection_set_conflict_with_nested_fragments() {
    let input = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_with_nested_fragments.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selection_set_conflict_with_nested_fragments.expected");
    test_fixture(transform_fixture, file!(), "selection_set_conflict_with_nested_fragments.graphql", "compile_relay_artifacts/fixtures/selection_set_conflict_with_nested_fragments.expected", input, expected).await;
}

#[tokio::test]
async fn selections_on_interface() {
    let input = include_str!("compile_relay_artifacts/fixtures/selections-on-interface.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/selections-on-interface.expected");
    test_fixture(transform_fixture, file!(), "selections-on-interface.graphql", "compile_relay_artifacts/fixtures/selections-on-interface.expected", input, expected).await;
}

#[tokio::test]
async fn sibling_client_selections() {
    let input = include_str!("compile_relay_artifacts/fixtures/sibling-client-selections.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/sibling-client-selections.expected");
    test_fixture(transform_fixture, file!(), "sibling-client-selections.graphql", "compile_relay_artifacts/fixtures/sibling-client-selections.expected", input, expected).await;
}

#[tokio::test]
async fn spread_of_assignable_fragment() {
    let input = include_str!("compile_relay_artifacts/fixtures/spread-of-assignable-fragment.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/spread-of-assignable-fragment.expected");
    test_fixture(transform_fixture, file!(), "spread-of-assignable-fragment.graphql", "compile_relay_artifacts/fixtures/spread-of-assignable-fragment.expected", input, expected).await;
}

#[tokio::test]
async fn stable_literals() {
    let input = include_str!("compile_relay_artifacts/fixtures/stable-literals.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/stable-literals.expected");
    test_fixture(transform_fixture, file!(), "stable-literals.graphql", "compile_relay_artifacts/fixtures/stable-literals.expected", input, expected).await;
}

#[tokio::test]
async fn stream_and_handle() {
    let input = include_str!("compile_relay_artifacts/fixtures/stream-and-handle.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/stream-and-handle.expected");
    test_fixture(transform_fixture, file!(), "stream-and-handle.graphql", "compile_relay_artifacts/fixtures/stream-and-handle.expected", input, expected).await;
}

#[tokio::test]
async fn stream_connection() {
    let input = include_str!("compile_relay_artifacts/fixtures/stream-connection.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/stream-connection.expected");
    test_fixture(transform_fixture, file!(), "stream-connection.graphql", "compile_relay_artifacts/fixtures/stream-connection.expected", input, expected).await;
}

#[tokio::test]
async fn stream_connection_conditional() {
    let input = include_str!("compile_relay_artifacts/fixtures/stream-connection-conditional.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/stream-connection-conditional.expected");
    test_fixture(transform_fixture, file!(), "stream-connection-conditional.graphql", "compile_relay_artifacts/fixtures/stream-connection-conditional.expected", input, expected).await;
}

#[tokio::test]
async fn stream_if_arguments() {
    let input = include_str!("compile_relay_artifacts/fixtures/stream_if_arguments.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/stream_if_arguments.expected");
    test_fixture(transform_fixture, file!(), "stream_if_arguments.graphql", "compile_relay_artifacts/fixtures/stream_if_arguments.expected", input, expected).await;
}

#[tokio::test]
async fn supported_arg() {
    let input = include_str!("compile_relay_artifacts/fixtures/supported_arg.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/supported_arg.expected");
    test_fixture(transform_fixture, file!(), "supported_arg.graphql", "compile_relay_artifacts/fixtures/supported_arg.expected", input, expected).await;
}

#[tokio::test]
async fn supported_arg_non_static_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/supported_arg_non_static.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/supported_arg_non_static.invalid.expected");
    test_fixture(transform_fixture, file!(), "supported_arg_non_static.invalid.graphql", "compile_relay_artifacts/fixtures/supported_arg_non_static.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn todo_multiple_overlapping_modules() {
    let input = include_str!("compile_relay_artifacts/fixtures/TODO-multiple-overlapping-modules.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/TODO-multiple-overlapping-modules.expected");
    test_fixture(transform_fixture, file!(), "TODO-multiple-overlapping-modules.graphql", "compile_relay_artifacts/fixtures/TODO-multiple-overlapping-modules.expected", input, expected).await;
}

#[tokio::test]
async fn unions() {
    let input = include_str!("compile_relay_artifacts/fixtures/unions.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/unions.expected");
    test_fixture(transform_fixture, file!(), "unions.graphql", "compile_relay_artifacts/fixtures/unions.expected", input, expected).await;
}

#[tokio::test]
async fn unknown_root_variable_in_fragment_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/unknown-root-variable-in-fragment.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/unknown-root-variable-in-fragment.invalid.expected");
    test_fixture(transform_fixture, file!(), "unknown-root-variable-in-fragment.invalid.graphql", "compile_relay_artifacts/fixtures/unknown-root-variable-in-fragment.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn unmasked_fragment_spreads_dup_arguments() {
    let input = include_str!("compile_relay_artifacts/fixtures/unmasked-fragment-spreads-dup-arguments.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/unmasked-fragment-spreads-dup-arguments.expected");
    test_fixture(transform_fixture, file!(), "unmasked-fragment-spreads-dup-arguments.graphql", "compile_relay_artifacts/fixtures/unmasked-fragment-spreads-dup-arguments.expected", input, expected).await;
}

#[tokio::test]
async fn unmasked_fragment_spreads_global_arguments() {
    let input = include_str!("compile_relay_artifacts/fixtures/unmasked-fragment-spreads-global-arguments.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/unmasked-fragment-spreads-global-arguments.expected");
    test_fixture(transform_fixture, file!(), "unmasked-fragment-spreads-global-arguments.graphql", "compile_relay_artifacts/fixtures/unmasked-fragment-spreads-global-arguments.expected", input, expected).await;
}

#[tokio::test]
async fn unmasked_fragment_spreads_local_arguments_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/unmasked-fragment-spreads-local-arguments.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/unmasked-fragment-spreads-local-arguments.invalid.expected");
    test_fixture(transform_fixture, file!(), "unmasked-fragment-spreads-local-arguments.invalid.graphql", "compile_relay_artifacts/fixtures/unmasked-fragment-spreads-local-arguments.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn unmasked_fragment_spreads_on_query() {
    let input = include_str!("compile_relay_artifacts/fixtures/unmasked-fragment-spreads-on-query.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/unmasked-fragment-spreads-on-query.expected");
    test_fixture(transform_fixture, file!(), "unmasked-fragment-spreads-on-query.graphql", "compile_relay_artifacts/fixtures/unmasked-fragment-spreads-on-query.expected", input, expected).await;
}

#[tokio::test]
async fn unmasked_fragment_spreads_recursive() {
    let input = include_str!("compile_relay_artifacts/fixtures/unmasked-fragment-spreads-recursive.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/unmasked-fragment-spreads-recursive.expected");
    test_fixture(transform_fixture, file!(), "unmasked-fragment-spreads-recursive.graphql", "compile_relay_artifacts/fixtures/unmasked-fragment-spreads-recursive.expected", input, expected).await;
}

#[tokio::test]
async fn unused_fragment_arg_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/unused_fragment_arg.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/unused_fragment_arg.invalid.expected");
    test_fixture(transform_fixture, file!(), "unused_fragment_arg.invalid.graphql", "compile_relay_artifacts/fixtures/unused_fragment_arg.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn unused_fragment_arg_unchecked() {
    let input = include_str!("compile_relay_artifacts/fixtures/unused_fragment_arg_unchecked.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/unused_fragment_arg_unchecked.expected");
    test_fixture(transform_fixture, file!(), "unused_fragment_arg_unchecked.graphql", "compile_relay_artifacts/fixtures/unused_fragment_arg_unchecked.expected", input, expected).await;
}

#[tokio::test]
async fn unused_fragment_argdef_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/unused_fragment_argdef.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/unused_fragment_argdef.invalid.expected");
    test_fixture(transform_fixture, file!(), "unused_fragment_argdef.invalid.graphql", "compile_relay_artifacts/fixtures/unused_fragment_argdef.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn unused_fragment_argdef_invalid_suppression_arg_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/unused_fragment_argdef_invalid_suppression_arg.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/unused_fragment_argdef_invalid_suppression_arg.invalid.expected");
    test_fixture(transform_fixture, file!(), "unused_fragment_argdef_invalid_suppression_arg.invalid.graphql", "compile_relay_artifacts/fixtures/unused_fragment_argdef_invalid_suppression_arg.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn unused_variables_removed_from_print_not_codegen() {
    let input = include_str!("compile_relay_artifacts/fixtures/unused-variables-removed-from-print-not-codegen.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/unused-variables-removed-from-print-not-codegen.expected");
    test_fixture(transform_fixture, file!(), "unused-variables-removed-from-print-not-codegen.graphql", "compile_relay_artifacts/fixtures/unused-variables-removed-from-print-not-codegen.expected", input, expected).await;
}

#[tokio::test]
async fn updatable_fragment_spread() {
    let input = include_str!("compile_relay_artifacts/fixtures/updatable-fragment-spread.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/updatable-fragment-spread.expected");
    test_fixture(transform_fixture, file!(), "updatable-fragment-spread.graphql", "compile_relay_artifacts/fixtures/updatable-fragment-spread.expected", input, expected).await;
}

#[tokio::test]
async fn updatable_fragment_spread_with_dangerously_unaliased_fixme() {
    let input = include_str!("compile_relay_artifacts/fixtures/updatable-fragment-spread-with-dangerously-unaliased-fixme.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/updatable-fragment-spread-with-dangerously-unaliased-fixme.expected");
    test_fixture(transform_fixture, file!(), "updatable-fragment-spread-with-dangerously-unaliased-fixme.graphql", "compile_relay_artifacts/fixtures/updatable-fragment-spread-with-dangerously-unaliased-fixme.expected", input, expected).await;
}

#[tokio::test]
async fn updatable_fragment_spread_with_defer_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/updatable-fragment-spread-with-defer.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/updatable-fragment-spread-with-defer.invalid.expected");
    test_fixture(transform_fixture, file!(), "updatable-fragment-spread-with-defer.invalid.graphql", "compile_relay_artifacts/fixtures/updatable-fragment-spread-with-defer.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn updatable_fragment_spread_with_include_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/updatable-fragment-spread-with-include.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/updatable-fragment-spread-with-include.invalid.expected");
    test_fixture(transform_fixture, file!(), "updatable-fragment-spread-with-include.invalid.graphql", "compile_relay_artifacts/fixtures/updatable-fragment-spread-with-include.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn updatable_fragment_spread_with_typename_sibling() {
    let input = include_str!("compile_relay_artifacts/fixtures/updatable-fragment-spread-with-typename-sibling.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/updatable-fragment-spread-with-typename-sibling.expected");
    test_fixture(transform_fixture, file!(), "updatable-fragment-spread-with-typename-sibling.graphql", "compile_relay_artifacts/fixtures/updatable-fragment-spread-with-typename-sibling.expected", input, expected).await;
}

#[tokio::test]
async fn updatable_fragment_spread_with_unused_variables() {
    let input = include_str!("compile_relay_artifacts/fixtures/updatable-fragment-spread-with-unused-variables.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/updatable-fragment-spread-with-unused-variables.expected");
    test_fixture(transform_fixture, file!(), "updatable-fragment-spread-with-unused-variables.graphql", "compile_relay_artifacts/fixtures/updatable-fragment-spread-with-unused-variables.expected", input, expected).await;
}

#[tokio::test]
async fn updatable_fragment_spread_with_variables() {
    let input = include_str!("compile_relay_artifacts/fixtures/updatable-fragment-spread-with-variables.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/updatable-fragment-spread-with-variables.expected");
    test_fixture(transform_fixture, file!(), "updatable-fragment-spread-with-variables.graphql", "compile_relay_artifacts/fixtures/updatable-fragment-spread-with-variables.expected", input, expected).await;
}

#[tokio::test]
async fn validate_array_arguments_usage_in_fragments_with_client_edge_reads() {
    let input = include_str!("compile_relay_artifacts/fixtures/validate-array-arguments-usage-in-fragments-with-client-edge-reads.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/validate-array-arguments-usage-in-fragments-with-client-edge-reads.expected");
    test_fixture(transform_fixture, file!(), "validate-array-arguments-usage-in-fragments-with-client-edge-reads.graphql", "compile_relay_artifacts/fixtures/validate-array-arguments-usage-in-fragments-with-client-edge-reads.expected", input, expected).await;
}

#[tokio::test]
async fn validate_global_variables_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/validate-global-variables.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/validate-global-variables.invalid.expected");
    test_fixture(transform_fixture, file!(), "validate-global-variables.invalid.graphql", "compile_relay_artifacts/fixtures/validate-global-variables.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn validate_global_variables_shared_fragment_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/validate-global-variables-shared-fragment.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/validate-global-variables-shared-fragment.invalid.expected");
    test_fixture(transform_fixture, file!(), "validate-global-variables-shared-fragment.invalid.graphql", "compile_relay_artifacts/fixtures/validate-global-variables-shared-fragment.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn validate_global_variables_undefined_invalid() {
    let input = include_str!("compile_relay_artifacts/fixtures/validate-global-variables-undefined.invalid.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/validate-global-variables-undefined.invalid.expected");
    test_fixture(transform_fixture, file!(), "validate-global-variables-undefined.invalid.graphql", "compile_relay_artifacts/fixtures/validate-global-variables-undefined.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn viewer_query() {
    let input = include_str!("compile_relay_artifacts/fixtures/viewer-query.graphql");
    let expected = include_str!("compile_relay_artifacts/fixtures/viewer-query.expected");
    test_fixture(transform_fixture, file!(), "viewer-query.graphql", "compile_relay_artifacts/fixtures/viewer-query.expected", input, expected).await;
}
