/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

mod generate_flow;

use fixture_tests::test_fixture;
use generate_flow::transform_fixture;

#[test]
fn conditional() {
    let input = include_str!("generate_flow/fixtures/conditional.graphql");
    let expected = include_str!("generate_flow/fixtures/conditional.expected");
    test_fixture(
        transform_fixture,
        "conditional.graphql",
        "generate_flow/fixtures/conditional.expected",
        input,
        expected,
    );
}

#[test]
fn fragment_spread() {
    let input = include_str!("generate_flow/fixtures/fragment-spread.graphql");
    let expected = include_str!("generate_flow/fixtures/fragment-spread.expected");
    test_fixture(
        transform_fixture,
        "fragment-spread.graphql",
        "generate_flow/fixtures/fragment-spread.expected",
        input,
        expected,
    );
}

#[test]
fn inline_fragment() {
    let input = include_str!("generate_flow/fixtures/inline-fragment.graphql");
    let expected = include_str!("generate_flow/fixtures/inline-fragment.expected");
    test_fixture(
        transform_fixture,
        "inline-fragment.graphql",
        "generate_flow/fixtures/inline-fragment.expected",
        input,
        expected,
    );
}

#[test]
fn linked_field() {
    let input = include_str!("generate_flow/fixtures/linked-field.graphql");
    let expected = include_str!("generate_flow/fixtures/linked-field.expected");
    test_fixture(
        transform_fixture,
        "linked-field.graphql",
        "generate_flow/fixtures/linked-field.expected",
        input,
        expected,
    );
}

// #[test]
// fn match_field() {
//     let input = include_str!("generate_flow/fixtures/match-field.graphql");
//     let expected = include_str!("generate_flow/fixtures/match-field.expected");
//     test_fixture(
//         transform_fixture,
//         "match-field.graphql",
//         "generate_flow/fixtures/match-field.expected",
//         input,
//         expected,
//     );
// }

// #[test]
// fn match_field_in_query() {
//     let input = include_str!("generate_flow/fixtures/match-field-in-query.graphql");
//     let expected = include_str!("generate_flow/fixtures/match-field-in-query.expected");
//     test_fixture(
//         transform_fixture,
//         "match-field-in-query.graphql",
//         "generate_flow/fixtures/match-field-in-query.expected",
//         input,
//         expected,
//     );
// }

// #[test]
// fn mutaion_with_client_extension() {
//     let input = include_str!("generate_flow/fixtures/mutaion-with-client-extension.graphql");
//     let expected = include_str!("generate_flow/fixtures/mutaion-with-client-extension.expected");
//     test_fixture(
//         transform_fixture,
//         "mutaion-with-client-extension.graphql",
//         "generate_flow/fixtures/mutaion-with-client-extension.expected",
//         input,
//         expected,
//     );
// }

// #[test]
// fn mutaion_with_response_on_inline_fragments() {
//     let input =
//         include_str!("generate_flow/fixtures/mutaion-with-response-on-inline-fragments.graphql");
//     let expected =
//         include_str!("generate_flow/fixtures/mutaion-with-response-on-inline-fragments.expected");
//     test_fixture(
//         transform_fixture,
//         "mutaion-with-response-on-inline-fragments.graphql",
//         "generate_flow/fixtures/mutaion-with-response-on-inline-fragments.expected",
//         input,
//         expected,
//     );
// }

#[test]
fn mutation() {
    let input = include_str!("generate_flow/fixtures/mutation.graphql");
    let expected = include_str!("generate_flow/fixtures/mutation.expected");
    test_fixture(
        transform_fixture,
        "mutation.graphql",
        "generate_flow/fixtures/mutation.expected",
        input,
        expected,
    );
}

// #[test]
// fn mutation_input_has_array() {
//     let input = include_str!("generate_flow/fixtures/mutation-input-has-array.graphql");
//     let expected = include_str!("generate_flow/fixtures/mutation-input-has-array.expected");
//     test_fixture(
//         transform_fixture,
//         "mutation-input-has-array.graphql",
//         "generate_flow/fixtures/mutation-input-has-array.expected",
//         input,
//         expected,
//     );
// }

// #[test]
// fn mutation_with_enums_on_fragment() {
//     let input = include_str!("generate_flow/fixtures/mutation-with-enums-on-fragment.graphql");
//     let expected = include_str!("generate_flow/fixtures/mutation-with-enums-on-fragment.expected");
//     test_fixture(
//         transform_fixture,
//         "mutation-with-enums-on-fragment.graphql",
//         "generate_flow/fixtures/mutation-with-enums-on-fragment.expected",
//         input,
//         expected,
//     );
// }

// #[test]
// fn mutation_with_nested_fragments() {
//     let input = include_str!("generate_flow/fixtures/mutation-with-nested-fragments.graphql");
//     let expected = include_str!("generate_flow/fixtures/mutation-with-nested-fragments.expected");
//     test_fixture(
//         transform_fixture,
//         "mutation-with-nested-fragments.graphql",
//         "generate_flow/fixtures/mutation-with-nested-fragments.expected",
//         input,
//         expected,
//     );
// }

// #[test]
// fn plural_fragment() {
//     let input = include_str!("generate_flow/fixtures/plural-fragment.graphql");
//     let expected = include_str!("generate_flow/fixtures/plural-fragment.expected");
//     test_fixture(
//         transform_fixture,
//         "plural-fragment.graphql",
//         "generate_flow/fixtures/plural-fragment.expected",
//         input,
//         expected,
//     );
// }

// #[test]
// fn query_with_handles() {
//     let input = include_str!("generate_flow/fixtures/query-with-handles.graphql");
//     let expected = include_str!("generate_flow/fixtures/query-with-handles.expected");
//     test_fixture(
//         transform_fixture,
//         "query-with-handles.graphql",
//         "generate_flow/fixtures/query-with-handles.expected",
//         input,
//         expected,
//     );
// }

// #[test]
// fn query_with_match_fields() {
//     let input = include_str!("generate_flow/fixtures/query-with-match-fields.graphql");
//     let expected = include_str!("generate_flow/fixtures/query-with-match-fields.expected");
//     test_fixture(
//         transform_fixture,
//         "query-with-match-fields.graphql",
//         "generate_flow/fixtures/query-with-match-fields.expected",
//         input,
//         expected,
//     );
// }

// #[test]
// fn query_with_module_field() {
//     let input = include_str!("generate_flow/fixtures/query-with-module-field.graphql");
//     let expected = include_str!("generate_flow/fixtures/query-with-module-field.expected");
//     test_fixture(
//         transform_fixture,
//         "query-with-module-field.graphql",
//         "generate_flow/fixtures/query-with-module-field.expected",
//         input,
//         expected,
//     );
// }

// #[test]
// fn query_with_multiple_match_fields() {
//     let input = include_str!("generate_flow/fixtures/query-with-multiple-match-fields.graphql");
//     let expected = include_str!("generate_flow/fixtures/query-with-multiple-match-fields.expected");
//     test_fixture(
//         transform_fixture,
//         "query-with-multiple-match-fields.graphql",
//         "generate_flow/fixtures/query-with-multiple-match-fields.expected",
//         input,
//         expected,
//     );
// }

// #[test]
// fn query_with_raw_response_on_conditional() {
//     let input =
//         include_str!("generate_flow/fixtures/query-with-raw-response-on-conditional.graphql");
//     let expected =
//         include_str!("generate_flow/fixtures/query-with-raw-response-on-conditional.expected");
//     test_fixture(
//         transform_fixture,
//         "query-with-raw-response-on-conditional.graphql",
//         "generate_flow/fixtures/query-with-raw-response-on-conditional.expected",
//         input,
//         expected,
//     );
// }

// #[test]
// fn query_with_raw_response_on_literal_conditional() {
//     let input = include_str!(
//         "generate_flow/fixtures/query-with-raw-response-on-literal-conditional.graphql"
//     );
//     let expected = include_str!(
//         "generate_flow/fixtures/query-with-raw-response-on-literal-conditional.expected"
//     );
//     test_fixture(
//         transform_fixture,
//         "query-with-raw-response-on-literal-conditional.graphql",
//         "generate_flow/fixtures/query-with-raw-response-on-literal-conditional.expected",
//         input,
//         expected,
//     );
// }

// #[test]
// fn query_with_stream() {
//     let input = include_str!("generate_flow/fixtures/query-with-stream.graphql");
//     let expected = include_str!("generate_flow/fixtures/query-with-stream.expected");
//     test_fixture(
//         transform_fixture,
//         "query-with-stream.graphql",
//         "generate_flow/fixtures/query-with-stream.expected",
//         input,
//         expected,
//     );
// }

// #[test]
// fn query_with_stream_connection() {
//     let input = include_str!("generate_flow/fixtures/query-with-stream-connection.graphql");
//     let expected = include_str!("generate_flow/fixtures/query-with-stream-connection.expected");
//     test_fixture(
//         transform_fixture,
//         "query-with-stream-connection.graphql",
//         "generate_flow/fixtures/query-with-stream-connection.expected",
//         input,
//         expected,
//     );
// }

#[test]
fn recursive_fragments() {
    let input = include_str!("generate_flow/fixtures/recursive-fragments.graphql");
    let expected = include_str!("generate_flow/fixtures/recursive-fragments.expected");
    test_fixture(
        transform_fixture,
        "recursive-fragments.graphql",
        "generate_flow/fixtures/recursive-fragments.expected",
        input,
        expected,
    );
}

// #[test]
// fn refetchable_fragment() {
//     let input = include_str!("generate_flow/fixtures/refetchable-fragment.graphql");
//     let expected = include_str!("generate_flow/fixtures/refetchable-fragment.expected");
//     test_fixture(
//         transform_fixture,
//         "refetchable-fragment.graphql",
//         "generate_flow/fixtures/refetchable-fragment.expected",
//         input,
//         expected,
//     );
// }

#[test]
fn relay_client_id_field() {
    let input = include_str!("generate_flow/fixtures/relay-client-id-field.graphql");
    let expected = include_str!("generate_flow/fixtures/relay-client-id-field.expected");
    test_fixture(
        transform_fixture,
        "relay-client-id-field.graphql",
        "generate_flow/fixtures/relay-client-id-field.expected",
        input,
        expected,
    );
}

#[test]
fn roots() {
    let input = include_str!("generate_flow/fixtures/roots.graphql");
    let expected = include_str!("generate_flow/fixtures/roots.expected");
    test_fixture(
        transform_fixture,
        "roots.graphql",
        "generate_flow/fixtures/roots.expected",
        input,
        expected,
    );
}

#[test]
fn scalar_field() {
    let input = include_str!("generate_flow/fixtures/scalar-field.graphql");
    let expected = include_str!("generate_flow/fixtures/scalar-field.expected");
    test_fixture(
        transform_fixture,
        "scalar-field.graphql",
        "generate_flow/fixtures/scalar-field.expected",
        input,
        expected,
    );
}

#[test]
fn simple() {
    let input = include_str!("generate_flow/fixtures/simple.graphql");
    let expected = include_str!("generate_flow/fixtures/simple.expected");
    test_fixture(
        transform_fixture,
        "simple.graphql",
        "generate_flow/fixtures/simple.expected",
        input,
        expected,
    );
}

#[test]
fn typename_inside_with_overlapping_fields() {
    let input =
        include_str!("generate_flow/fixtures/typename-inside-with-overlapping-fields.graphql");
    let expected =
        include_str!("generate_flow/fixtures/typename-inside-with-overlapping-fields.expected");
    test_fixture(
        transform_fixture,
        "typename-inside-with-overlapping-fields.graphql",
        "generate_flow/fixtures/typename-inside-with-overlapping-fields.expected",
        input,
        expected,
    );
}

#[test]
fn typename_on_union() {
    let input = include_str!("generate_flow/fixtures/typename-on-union.graphql");
    let expected = include_str!("generate_flow/fixtures/typename-on-union.expected");
    test_fixture(
        transform_fixture,
        "typename-on-union.graphql",
        "generate_flow/fixtures/typename-on-union.expected",
        input,
        expected,
    );
}

// #[test]
// fn unmasked_fragment_spreads() {
//     let input = include_str!("generate_flow/fixtures/unmasked-fragment-spreads.graphql");
//     let expected = include_str!("generate_flow/fixtures/unmasked-fragment-spreads.expected");
//     test_fixture(
//         transform_fixture,
//         "unmasked-fragment-spreads.graphql",
//         "generate_flow/fixtures/unmasked-fragment-spreads.expected",
//         input,
//         expected,
//     );
// }
