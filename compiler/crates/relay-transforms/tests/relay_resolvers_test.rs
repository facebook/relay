/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<c4953c95b3cbfebed7b3bd1b96325e9d>>
 */

mod relay_resolvers;

use relay_resolvers::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn field_alias() {
    let input = include_str!("relay_resolvers/fixtures/field-alias.graphql");
    let expected = include_str!("relay_resolvers/fixtures/field-alias.expected");
    test_fixture(transform_fixture, file!(), "field-alias.graphql", "relay_resolvers/fixtures/field-alias.expected", input, expected).await;
}

#[tokio::test]
async fn fragment_spread_usage_invalid() {
    let input = include_str!("relay_resolvers/fixtures/fragment-spread-usage.invalid.graphql");
    let expected = include_str!("relay_resolvers/fixtures/fragment-spread-usage.invalid.expected");
    test_fixture(transform_fixture, file!(), "fragment-spread-usage.invalid.graphql", "relay_resolvers/fixtures/fragment-spread-usage.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn missing_fragment_invalid() {
    let input = include_str!("relay_resolvers/fixtures/missing-fragment.invalid.graphql");
    let expected = include_str!("relay_resolvers/fixtures/missing-fragment.invalid.expected");
    test_fixture(transform_fixture, file!(), "missing-fragment.invalid.graphql", "relay_resolvers/fixtures/missing-fragment.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn missing_fragment_name() {
    let input = include_str!("relay_resolvers/fixtures/missing-fragment-name.graphql");
    let expected = include_str!("relay_resolvers/fixtures/missing-fragment-name.expected");
    test_fixture(transform_fixture, file!(), "missing-fragment-name.graphql", "relay_resolvers/fixtures/missing-fragment-name.expected", input, expected).await;
}

#[tokio::test]
async fn missing_import_path_invalid() {
    let input = include_str!("relay_resolvers/fixtures/missing-import-path.invalid.graphql");
    let expected = include_str!("relay_resolvers/fixtures/missing-import-path.invalid.expected");
    test_fixture(transform_fixture, file!(), "missing-import-path.invalid.graphql", "relay_resolvers/fixtures/missing-import-path.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn multiple_relay_resolvers() {
    let input = include_str!("relay_resolvers/fixtures/multiple-relay-resolvers.graphql");
    let expected = include_str!("relay_resolvers/fixtures/multiple-relay-resolvers.expected");
    test_fixture(transform_fixture, file!(), "multiple-relay-resolvers.graphql", "relay_resolvers/fixtures/multiple-relay-resolvers.expected", input, expected).await;
}

#[tokio::test]
async fn nested_relay_resolver() {
    let input = include_str!("relay_resolvers/fixtures/nested-relay-resolver.graphql");
    let expected = include_str!("relay_resolvers/fixtures/nested-relay-resolver.expected");
    test_fixture(transform_fixture, file!(), "nested-relay-resolver.graphql", "relay_resolvers/fixtures/nested-relay-resolver.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver() {
    let input = include_str!("relay_resolvers/fixtures/relay-resolver.graphql");
    let expected = include_str!("relay_resolvers/fixtures/relay-resolver.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver.graphql", "relay_resolvers/fixtures/relay-resolver.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_backing_client_edge() {
    let input = include_str!("relay_resolvers/fixtures/relay-resolver-backing-client-edge.graphql");
    let expected = include_str!("relay_resolvers/fixtures/relay-resolver-backing-client-edge.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-backing-client-edge.graphql", "relay_resolvers/fixtures/relay-resolver-backing-client-edge.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_field_and_fragment_arguments() {
    let input = include_str!("relay_resolvers/fixtures/relay-resolver-field-and-fragment-arguments.graphql");
    let expected = include_str!("relay_resolvers/fixtures/relay-resolver-field-and-fragment-arguments.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-field-and-fragment-arguments.graphql", "relay_resolvers/fixtures/relay-resolver-field-and-fragment-arguments.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_model() {
    let input = include_str!("relay_resolvers/fixtures/relay-resolver-model.graphql");
    let expected = include_str!("relay_resolvers/fixtures/relay-resolver-model.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-model.graphql", "relay_resolvers/fixtures/relay-resolver-model.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_named_import() {
    let input = include_str!("relay_resolvers/fixtures/relay-resolver-named-import.graphql");
    let expected = include_str!("relay_resolvers/fixtures/relay-resolver-named-import.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-named-import.graphql", "relay_resolvers/fixtures/relay-resolver-named-import.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_required() {
    let input = include_str!("relay_resolvers/fixtures/relay-resolver-required.graphql");
    let expected = include_str!("relay_resolvers/fixtures/relay-resolver-required.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-required.graphql", "relay_resolvers/fixtures/relay-resolver-required.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_scalar_field_arguments() {
    let input = include_str!("relay_resolvers/fixtures/relay-resolver-scalar-field-arguments.graphql");
    let expected = include_str!("relay_resolvers/fixtures/relay-resolver-scalar-field-arguments.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-scalar-field-arguments.graphql", "relay_resolvers/fixtures/relay-resolver-scalar-field-arguments.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_scalar_field_arguments_with_alias() {
    let input = include_str!("relay_resolvers/fixtures/relay-resolver-scalar-field-arguments-with-alias.graphql");
    let expected = include_str!("relay_resolvers/fixtures/relay-resolver-scalar-field-arguments-with-alias.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-scalar-field-arguments-with-alias.graphql", "relay_resolvers/fixtures/relay-resolver-scalar-field-arguments-with-alias.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_with_global_vars_directive_invalid() {
    let input = include_str!("relay_resolvers/fixtures/relay-resolver-with-global-vars-directive.invalid.graphql");
    let expected = include_str!("relay_resolvers/fixtures/relay-resolver-with-global-vars-directive.invalid.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-with-global-vars-directive.invalid.graphql", "relay_resolvers/fixtures/relay-resolver-with-global-vars-directive.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_with_global_vars_invalid() {
    let input = include_str!("relay_resolvers/fixtures/relay-resolver-with-global-vars.invalid.graphql");
    let expected = include_str!("relay_resolvers/fixtures/relay-resolver-with-global-vars.invalid.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-with-global-vars.invalid.graphql", "relay_resolvers/fixtures/relay-resolver-with-global-vars.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn relay_resolver_within_named_inline_fragment() {
    let input = include_str!("relay_resolvers/fixtures/relay-resolver-within-named-inline-fragment.graphql");
    let expected = include_str!("relay_resolvers/fixtures/relay-resolver-within-named-inline-fragment.expected");
    test_fixture(transform_fixture, file!(), "relay-resolver-within-named-inline-fragment.graphql", "relay_resolvers/fixtures/relay-resolver-within-named-inline-fragment.expected", input, expected).await;
}

#[tokio::test]
async fn resolver_fragment_inline_spread() {
    let input = include_str!("relay_resolvers/fixtures/resolver-fragment-inline-spread.graphql");
    let expected = include_str!("relay_resolvers/fixtures/resolver-fragment-inline-spread.expected");
    test_fixture(transform_fixture, file!(), "resolver-fragment-inline-spread.graphql", "relay_resolvers/fixtures/resolver-fragment-inline-spread.expected", input, expected).await;
}

#[tokio::test]
async fn resolver_fragment_non_inline_spread_invalid() {
    let input = include_str!("relay_resolvers/fixtures/resolver-fragment-non-inline-spread.invalid.graphql");
    let expected = include_str!("relay_resolvers/fixtures/resolver-fragment-non-inline-spread.invalid.expected");
    test_fixture(transform_fixture, file!(), "resolver-fragment-non-inline-spread.invalid.graphql", "relay_resolvers/fixtures/resolver-fragment-non-inline-spread.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn resolver_fragment_unmasked_spread() {
    let input = include_str!("relay_resolvers/fixtures/resolver-fragment-unmasked-spread.graphql");
    let expected = include_str!("relay_resolvers/fixtures/resolver-fragment-unmasked-spread.expected");
    test_fixture(transform_fixture, file!(), "resolver-fragment-unmasked-spread.graphql", "relay_resolvers/fixtures/resolver-fragment-unmasked-spread.expected", input, expected).await;
}

#[tokio::test]
async fn unexpected_directive_invalid() {
    let input = include_str!("relay_resolvers/fixtures/unexpected-directive.invalid.graphql");
    let expected = include_str!("relay_resolvers/fixtures/unexpected-directive.invalid.expected");
    test_fixture(transform_fixture, file!(), "unexpected-directive.invalid.graphql", "relay_resolvers/fixtures/unexpected-directive.invalid.expected", input, expected).await;
}
