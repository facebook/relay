/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<c9768c7dbf870b21e26aa508af34c942>>
 */

mod parse;

use parse::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn edge_to_non_null_invalid() {
    let input = include_str!("parse/fixtures/edge-to-non-null.invalid.js");
    let expected = include_str!("parse/fixtures/edge-to-non-null.invalid.expected");
    test_fixture(transform_fixture, file!(), "edge-to-non-null.invalid.js", "parse/fixtures/edge-to-non-null.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn edge_to_non_null_plural_item_invalid() {
    let input = include_str!("parse/fixtures/edge-to-non-null-plural-item.invalid.js");
    let expected = include_str!("parse/fixtures/edge-to-non-null-plural-item.invalid.expected");
    test_fixture(transform_fixture, file!(), "edge-to-non-null-plural-item.invalid.js", "parse/fixtures/edge-to-non-null-plural-item.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn edge_to_not_identifier_invalid() {
    let input = include_str!("parse/fixtures/edge-to-not-identifier.invalid.js");
    let expected = include_str!("parse/fixtures/edge-to-not-identifier.invalid.expected");
    test_fixture(transform_fixture, file!(), "edge-to-not-identifier.invalid.js", "parse/fixtures/edge-to-not-identifier.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn output_type_edge_to_invalid() {
    let input = include_str!("parse/fixtures/output-type-edge-to-invalid.js");
    let expected = include_str!("parse/fixtures/output-type-edge-to-invalid.expected");
    test_fixture(transform_fixture, file!(), "output-type-edge-to-invalid.js", "parse/fixtures/output-type-edge-to-invalid.expected", input, expected).await;
}

#[tokio::test]
async fn output_type_invalid_type() {
    let input = include_str!("parse/fixtures/output-type-invalid-type.js");
    let expected = include_str!("parse/fixtures/output-type-invalid-type.expected");
    test_fixture(transform_fixture, file!(), "output-type-invalid-type.js", "parse/fixtures/output-type-invalid-type.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver() {
    let input = include_str!("parse/fixtures/relay-resolver.js");
    let expected = include_str!("parse/fixtures/relay-resolver.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver.js", "parse/fixtures/relay-resolver.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_deprecated() {
    let input = include_str!("parse/fixtures/relay-resolver-deprecated.js");
    let expected = include_str!("parse/fixtures/relay-resolver-deprecated.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-deprecated.js", "parse/fixtures/relay-resolver-deprecated.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_deprecated_no_description() {
    let input = include_str!("parse/fixtures/relay-resolver-deprecated-no-description.js");
    let expected = include_str!("parse/fixtures/relay-resolver-deprecated-no-description.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-deprecated-no-description.js", "parse/fixtures/relay-resolver-deprecated-no-description.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_invalid_field_invalid() {
    let input = include_str!("parse/fixtures/relay-resolver-invalid-field.invalid.js");
    let expected = include_str!("parse/fixtures/relay-resolver-invalid-field.invalid.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-invalid-field.invalid.js", "parse/fixtures/relay-resolver-invalid-field.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_live() {
    let input = include_str!("parse/fixtures/relay-resolver-live.js");
    let expected = include_str!("parse/fixtures/relay-resolver-live.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-live.js", "parse/fixtures/relay-resolver-live.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_live_with_text_invalid() {
    let input = include_str!("parse/fixtures/relay-resolver-live-with-text.invalid.js");
    let expected = include_str!("parse/fixtures/relay-resolver-live-with-text.invalid.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-live-with-text.invalid.js", "parse/fixtures/relay-resolver-live-with-text.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_missing_field_invalid() {
    let input = include_str!("parse/fixtures/relay-resolver-missing-field.invalid.js");
    let expected = include_str!("parse/fixtures/relay-resolver-missing-field.invalid.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-missing-field.invalid.js", "parse/fixtures/relay-resolver-missing-field.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_missing_multiple_fields_invalid() {
    let input = include_str!("parse/fixtures/relay-resolver-missing-multiple-fields.invalid.js");
    let expected = include_str!("parse/fixtures/relay-resolver-missing-multiple-fields.invalid.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-missing-multiple-fields.invalid.js", "parse/fixtures/relay-resolver-missing-multiple-fields.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_named_export() {
    let input = include_str!("parse/fixtures/relay-resolver-named-export.js");
    let expected = include_str!("parse/fixtures/relay-resolver-named-export.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-named-export.js", "parse/fixtures/relay-resolver-named-export.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_on_interface_mismatch_invalid() {
    let input = include_str!("parse/fixtures/relay-resolver-on-interface-mismatch.invalid.js");
    let expected = include_str!("parse/fixtures/relay-resolver-on-interface-mismatch.invalid.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-on-interface-mismatch.invalid.js", "parse/fixtures/relay-resolver-on-interface-mismatch.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_on_interface_no_value_invalid() {
    let input = include_str!("parse/fixtures/relay-resolver-on-interface-no-value.invalid.js");
    let expected = include_str!("parse/fixtures/relay-resolver-on-interface-no-value.invalid.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-on-interface-no-value.invalid.js", "parse/fixtures/relay-resolver-on-interface-no-value.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_on_interface_not_allowed_invalid() {
    let input = include_str!("parse/fixtures/relay-resolver-on-interface-not-allowed.invalid.js");
    let expected = include_str!("parse/fixtures/relay-resolver-on-interface-not-allowed.invalid.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-on-interface-not-allowed.invalid.js", "parse/fixtures/relay-resolver-on-interface-not-allowed.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_on_type_and_on_interface_invalid() {
    let input = include_str!("parse/fixtures/relay-resolver-on-type-and-on-interface.invalid.js");
    let expected = include_str!("parse/fixtures/relay-resolver-on-type-and-on-interface.invalid.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-on-type-and-on-interface.invalid.js", "parse/fixtures/relay-resolver-on-type-and-on-interface.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_on_type_mismatch_invalid() {
    let input = include_str!("parse/fixtures/relay-resolver-on-type-mismatch.invalid.js");
    let expected = include_str!("parse/fixtures/relay-resolver-on-type-mismatch.invalid.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-on-type-mismatch.invalid.js", "parse/fixtures/relay-resolver-on-type-mismatch.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_on_type_no_value_invalid() {
    let input = include_str!("parse/fixtures/relay-resolver-on-type-no-value.invalid.js");
    let expected = include_str!("parse/fixtures/relay-resolver-on-type-no-value.invalid.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-on-type-no-value.invalid.js", "parse/fixtures/relay-resolver-on-type-no-value.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_on_type_not_allowed_invalid() {
    let input = include_str!("parse/fixtures/relay-resolver-on-type-not-allowed.invalid.js");
    let expected = include_str!("parse/fixtures/relay-resolver-on-type-not-allowed.invalid.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-on-type-not-allowed.invalid.js", "parse/fixtures/relay-resolver-on-type-not-allowed.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_strong_object() {
    let input = include_str!("parse/fixtures/relay-resolver-strong-object.js");
    let expected = include_str!("parse/fixtures/relay-resolver-strong-object.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-strong-object.js", "parse/fixtures/relay-resolver-strong-object.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_strong_object_with_gibberish_invalid() {
    let input = include_str!("parse/fixtures/relay-resolver-strong-object-with-gibberish.invalid.js");
    let expected = include_str!("parse/fixtures/relay-resolver-strong-object-with-gibberish.invalid.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-strong-object-with-gibberish.invalid.js", "parse/fixtures/relay-resolver-strong-object-with-gibberish.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_strong_object_with_implements() {
    let input = include_str!("parse/fixtures/relay-resolver-strong-object-with-implements.js");
    let expected = include_str!("parse/fixtures/relay-resolver-strong-object-with-implements.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-strong-object-with-implements.js", "parse/fixtures/relay-resolver-strong-object-with-implements.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_terse_invalid_type_name() {
    let input = include_str!("parse/fixtures/relay-resolver-terse-invalid-type-name.js");
    let expected = include_str!("parse/fixtures/relay-resolver-terse-invalid-type-name.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-terse-invalid-type-name.js", "parse/fixtures/relay-resolver-terse-invalid-type-name.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_weak_object_with_gibberish_invalid() {
    let input = include_str!("parse/fixtures/relay-resolver-weak-object-with-gibberish.invalid.js");
    let expected = include_str!("parse/fixtures/relay-resolver-weak-object-with-gibberish.invalid.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-weak-object-with-gibberish.invalid.js", "parse/fixtures/relay-resolver-weak-object-with-gibberish.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_with_args() {
    let input = include_str!("parse/fixtures/relay-resolver-with-args.js");
    let expected = include_str!("parse/fixtures/relay-resolver-with-args.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-with-args.js", "parse/fixtures/relay-resolver-with-args.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_with_args_default_value_invalid() {
    let input = include_str!("parse/fixtures/relay-resolver-with-args-default-value.invalid.js");
    let expected = include_str!("parse/fixtures/relay-resolver-with-args-default-value.invalid.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-with-args-default-value.invalid.js", "parse/fixtures/relay-resolver-with-args-default-value.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_with_args_syntax_error_invalid() {
    let input = include_str!("parse/fixtures/relay-resolver-with-args-syntax-error.invalid.js");
    let expected = include_str!("parse/fixtures/relay-resolver-with-args-syntax-error.invalid.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-with-args-syntax-error.invalid.js", "parse/fixtures/relay-resolver-with-args-syntax-error.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_with_conflicting_args_invalid() {
    let input = include_str!("parse/fixtures/relay-resolver-with-conflicting-args.invalid.js");
    let expected = include_str!("parse/fixtures/relay-resolver-with-conflicting-args.invalid.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-with-conflicting-args.invalid.js", "parse/fixtures/relay-resolver-with-conflicting-args.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_with_field_and_fragment_args() {
    let input = include_str!("parse/fixtures/relay-resolver-with-field-and-fragment-args.js");
    let expected = include_str!("parse/fixtures/relay-resolver-with-field-and-fragment-args.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-with-field-and-fragment-args.js", "parse/fixtures/relay-resolver-with-field-and-fragment-args.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_with_field_args() {
    let input = include_str!("parse/fixtures/relay-resolver-with-field-args.js");
    let expected = include_str!("parse/fixtures/relay-resolver-with-field-args.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-with-field-args.js", "parse/fixtures/relay-resolver-with-field-args.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_with_fragment() {
    let input = include_str!("parse/fixtures/relay-resolver-with-fragment.js");
    let expected = include_str!("parse/fixtures/relay-resolver-with-fragment.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-with-fragment.js", "parse/fixtures/relay-resolver-with-fragment.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_with_fragment_invalid() {
    let input = include_str!("parse/fixtures/relay-resolver-with-fragment.invalid.js");
    let expected = include_str!("parse/fixtures/relay-resolver-with-fragment.invalid.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-with-fragment.invalid.js", "parse/fixtures/relay-resolver-with-fragment.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_with_output_type() {
    let input = include_str!("parse/fixtures/relay-resolver-with-output-type.js");
    let expected = include_str!("parse/fixtures/relay-resolver-with-output-type.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-with-output-type.js", "parse/fixtures/relay-resolver-with-output-type.expected", input, expected).await;
}

#[tokio::test]
async fn strict_flavors_live_resolver_with_root_fragment_invalid() {
    let input = include_str!("parse/fixtures/strict-flavors-live-resolver-with-root-fragment.invalid.js");
    let expected = include_str!("parse/fixtures/strict-flavors-live-resolver-with-root-fragment.invalid.expected");
    test_fixture(transform_fixture, file!(), "strict-flavors-live-resolver-with-root-fragment.invalid.js", "parse/fixtures/strict-flavors-live-resolver-with-root-fragment.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn strict_flavors_multiple_errors_invalid() {
    let input = include_str!("parse/fixtures/strict-flavors-multiple-errors.invalid.js");
    let expected = include_str!("parse/fixtures/strict-flavors-multiple-errors.invalid.expected");
    test_fixture(transform_fixture, file!(), "strict-flavors-multiple-errors.invalid.js", "parse/fixtures/strict-flavors-multiple-errors.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn strict_flavors_output_type_with_root_fragment_invalid() {
    let input = include_str!("parse/fixtures/strict-flavors-output-type-with-root-fragment.invalid.js");
    let expected = include_str!("parse/fixtures/strict-flavors-output-type-with-root-fragment.invalid.expected");
    test_fixture(transform_fixture, file!(), "strict-flavors-output-type-with-root-fragment.invalid.js", "parse/fixtures/strict-flavors-output-type-with-root-fragment.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn terse_relay_resolver() {
    let input = include_str!("parse/fixtures/terse-relay-resolver.js");
    let expected = include_str!("parse/fixtures/terse-relay-resolver.expected");
    test_fixture(transform_fixture, file!(), "terse-relay-resolver.js", "parse/fixtures/terse-relay-resolver.expected", input, expected).await;
}

#[tokio::test]
async fn terse_relay_resolver_forbidden_fields_invalid() {
    let input = include_str!("parse/fixtures/terse-relay-resolver-forbidden-fields.invalid.js");
    let expected = include_str!("parse/fixtures/terse-relay-resolver-forbidden-fields.invalid.expected");
    test_fixture(transform_fixture, file!(), "terse-relay-resolver-forbidden-fields.invalid.js", "parse/fixtures/terse-relay-resolver-forbidden-fields.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn terse_relay_resolver_fragment_type_does_not_match_parent_invalid() {
    let input = include_str!("parse/fixtures/terse-relay-resolver-fragment-type-does-not-match-parent.invalid.js");
    let expected = include_str!("parse/fixtures/terse-relay-resolver-fragment-type-does-not-match-parent.invalid.expected");
    test_fixture(transform_fixture, file!(), "terse-relay-resolver-fragment-type-does-not-match-parent.invalid.js", "parse/fixtures/terse-relay-resolver-fragment-type-does-not-match-parent.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn terse_relay_resolver_no_dot_2_invalid() {
    let input = include_str!("parse/fixtures/terse-relay-resolver-no-dot-2.invalid.js");
    let expected = include_str!("parse/fixtures/terse-relay-resolver-no-dot-2.invalid.expected");
    test_fixture(transform_fixture, file!(), "terse-relay-resolver-no-dot-2.invalid.js", "parse/fixtures/terse-relay-resolver-no-dot-2.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn terse_relay_resolver_no_dot_invalid() {
    let input = include_str!("parse/fixtures/terse-relay-resolver-no-dot.invalid.js");
    let expected = include_str!("parse/fixtures/terse-relay-resolver-no-dot.invalid.expected");
    test_fixture(transform_fixture, file!(), "terse-relay-resolver-no-dot.invalid.js", "parse/fixtures/terse-relay-resolver-no-dot.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn terse_relay_resolver_non_nullable() {
    let input = include_str!("parse/fixtures/terse-relay-resolver-non-nullable.js");
    let expected = include_str!("parse/fixtures/terse-relay-resolver-non-nullable.expected");
    test_fixture(transform_fixture, file!(), "terse-relay-resolver-non-nullable.js", "parse/fixtures/terse-relay-resolver-non-nullable.expected", input, expected).await;
}

#[tokio::test]
async fn terse_relay_resolver_non_nullable_list() {
    let input = include_str!("parse/fixtures/terse-relay-resolver-non-nullable-list.js");
    let expected = include_str!("parse/fixtures/terse-relay-resolver-non-nullable-list.expected");
    test_fixture(transform_fixture, file!(), "terse-relay-resolver-non-nullable-list.js", "parse/fixtures/terse-relay-resolver-non-nullable-list.expected", input, expected).await;
}

#[tokio::test]
async fn terse_relay_resolver_non_nullable_list_item() {
    let input = include_str!("parse/fixtures/terse-relay-resolver-non-nullable-list-item.js");
    let expected = include_str!("parse/fixtures/terse-relay-resolver-non-nullable-list-item.expected");
    test_fixture(transform_fixture, file!(), "terse-relay-resolver-non-nullable-list-item.js", "parse/fixtures/terse-relay-resolver-non-nullable-list-item.expected", input, expected).await;
}
