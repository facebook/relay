/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<1d04afc08ee7547cc923bc7dab37713c>>
 */

mod relay_resolvers;

use relay_resolvers::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn field_alias() {
    let input = include_str!("relay_resolvers/fixtures/field-alias.graphql");
    let expected = include_str!("relay_resolvers/fixtures/field-alias.expected");
    test_fixture(transform_fixture, "field-alias.graphql", "relay_resolvers/fixtures/field-alias.expected", input, expected);
}

#[test]
fn fragment_spread_usage_invalid() {
    let input = include_str!("relay_resolvers/fixtures/fragment-spread-usage.invalid.graphql");
    let expected = include_str!("relay_resolvers/fixtures/fragment-spread-usage.invalid.expected");
    test_fixture(transform_fixture, "fragment-spread-usage.invalid.graphql", "relay_resolvers/fixtures/fragment-spread-usage.invalid.expected", input, expected);
}

#[test]
fn missing_fragment_invalid() {
    let input = include_str!("relay_resolvers/fixtures/missing-fragment.invalid.graphql");
    let expected = include_str!("relay_resolvers/fixtures/missing-fragment.invalid.expected");
    test_fixture(transform_fixture, "missing-fragment.invalid.graphql", "relay_resolvers/fixtures/missing-fragment.invalid.expected", input, expected);
}

#[test]
fn missing_fragment_name() {
    let input = include_str!("relay_resolvers/fixtures/missing-fragment-name.graphql");
    let expected = include_str!("relay_resolvers/fixtures/missing-fragment-name.expected");
    test_fixture(transform_fixture, "missing-fragment-name.graphql", "relay_resolvers/fixtures/missing-fragment-name.expected", input, expected);
}

#[test]
fn missing_import_path_invalid() {
    let input = include_str!("relay_resolvers/fixtures/missing-import-path.invalid.graphql");
    let expected = include_str!("relay_resolvers/fixtures/missing-import-path.invalid.expected");
    test_fixture(transform_fixture, "missing-import-path.invalid.graphql", "relay_resolvers/fixtures/missing-import-path.invalid.expected", input, expected);
}

#[test]
fn multiple_relay_resolvers() {
    let input = include_str!("relay_resolvers/fixtures/multiple-relay-resolvers.graphql");
    let expected = include_str!("relay_resolvers/fixtures/multiple-relay-resolvers.expected");
    test_fixture(transform_fixture, "multiple-relay-resolvers.graphql", "relay_resolvers/fixtures/multiple-relay-resolvers.expected", input, expected);
}

#[test]
fn nested_relay_resolver() {
    let input = include_str!("relay_resolvers/fixtures/nested-relay-resolver.graphql");
    let expected = include_str!("relay_resolvers/fixtures/nested-relay-resolver.expected");
    test_fixture(transform_fixture, "nested-relay-resolver.graphql", "relay_resolvers/fixtures/nested-relay-resolver.expected", input, expected);
}

#[test]
fn relay_resolver() {
    let input = include_str!("relay_resolvers/fixtures/relay-resolver.graphql");
    let expected = include_str!("relay_resolvers/fixtures/relay-resolver.expected");
    test_fixture(transform_fixture, "relay-resolver.graphql", "relay_resolvers/fixtures/relay-resolver.expected", input, expected);
}

#[test]
fn relay_resolver_backing_client_edge() {
    let input = include_str!("relay_resolvers/fixtures/relay-resolver-backing-client-edge.graphql");
    let expected = include_str!("relay_resolvers/fixtures/relay-resolver-backing-client-edge.expected");
    test_fixture(transform_fixture, "relay-resolver-backing-client-edge.graphql", "relay_resolvers/fixtures/relay-resolver-backing-client-edge.expected", input, expected);
}

#[test]
fn relay_resolver_field_and_fragment_arguments() {
    let input = include_str!("relay_resolvers/fixtures/relay-resolver-field-and-fragment-arguments.graphql");
    let expected = include_str!("relay_resolvers/fixtures/relay-resolver-field-and-fragment-arguments.expected");
    test_fixture(transform_fixture, "relay-resolver-field-and-fragment-arguments.graphql", "relay_resolvers/fixtures/relay-resolver-field-and-fragment-arguments.expected", input, expected);
}

#[test]
fn relay_resolver_model() {
    let input = include_str!("relay_resolvers/fixtures/relay-resolver-model.graphql");
    let expected = include_str!("relay_resolvers/fixtures/relay-resolver-model.expected");
    test_fixture(transform_fixture, "relay-resolver-model.graphql", "relay_resolvers/fixtures/relay-resolver-model.expected", input, expected);
}

#[test]
fn relay_resolver_named_import() {
    let input = include_str!("relay_resolvers/fixtures/relay-resolver-named-import.graphql");
    let expected = include_str!("relay_resolvers/fixtures/relay-resolver-named-import.expected");
    test_fixture(transform_fixture, "relay-resolver-named-import.graphql", "relay_resolvers/fixtures/relay-resolver-named-import.expected", input, expected);
}

#[test]
fn relay_resolver_required() {
    let input = include_str!("relay_resolvers/fixtures/relay-resolver-required.graphql");
    let expected = include_str!("relay_resolvers/fixtures/relay-resolver-required.expected");
    test_fixture(transform_fixture, "relay-resolver-required.graphql", "relay_resolvers/fixtures/relay-resolver-required.expected", input, expected);
}

#[test]
fn relay_resolver_with_global_vars_directive_invalid() {
    let input = include_str!("relay_resolvers/fixtures/relay-resolver-with-global-vars-directive.invalid.graphql");
    let expected = include_str!("relay_resolvers/fixtures/relay-resolver-with-global-vars-directive.invalid.expected");
    test_fixture(transform_fixture, "relay-resolver-with-global-vars-directive.invalid.graphql", "relay_resolvers/fixtures/relay-resolver-with-global-vars-directive.invalid.expected", input, expected);
}

#[test]
fn relay_resolver_with_global_vars_invalid() {
    let input = include_str!("relay_resolvers/fixtures/relay-resolver-with-global-vars.invalid.graphql");
    let expected = include_str!("relay_resolvers/fixtures/relay-resolver-with-global-vars.invalid.expected");
    test_fixture(transform_fixture, "relay-resolver-with-global-vars.invalid.graphql", "relay_resolvers/fixtures/relay-resolver-with-global-vars.invalid.expected", input, expected);
}

#[test]
fn relay_resolver_within_named_inline_fragment() {
    let input = include_str!("relay_resolvers/fixtures/relay-resolver-within-named-inline-fragment.graphql");
    let expected = include_str!("relay_resolvers/fixtures/relay-resolver-within-named-inline-fragment.expected");
    test_fixture(transform_fixture, "relay-resolver-within-named-inline-fragment.graphql", "relay_resolvers/fixtures/relay-resolver-within-named-inline-fragment.expected", input, expected);
}

#[test]
fn unexpected_directive_invalid() {
    let input = include_str!("relay_resolvers/fixtures/unexpected-directive.invalid.graphql");
    let expected = include_str!("relay_resolvers/fixtures/unexpected-directive.invalid.expected");
    test_fixture(transform_fixture, "unexpected-directive.invalid.graphql", "relay_resolvers/fixtures/unexpected-directive.invalid.expected", input, expected);
}
