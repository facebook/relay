/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<a8d10df46d5a680807a1a641cdb1f157>>
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
fn missing_fragment_invalid() {
    let input = include_str!("relay_resolvers/fixtures/missing-fragment.invalid.graphql");
    let expected = include_str!("relay_resolvers/fixtures/missing-fragment.invalid.expected");
    test_fixture(transform_fixture, "missing-fragment.invalid.graphql", "relay_resolvers/fixtures/missing-fragment.invalid.expected", input, expected);
}

#[test]
fn missing_fragment_name_invalid() {
    let input = include_str!("relay_resolvers/fixtures/missing-fragment-name.invalid.graphql");
    let expected = include_str!("relay_resolvers/fixtures/missing-fragment-name.invalid.expected");
    test_fixture(transform_fixture, "missing-fragment-name.invalid.graphql", "relay_resolvers/fixtures/missing-fragment-name.invalid.expected", input, expected);
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
fn unexpected_directive_invalid() {
    let input = include_str!("relay_resolvers/fixtures/unexpected-directive.invalid.graphql");
    let expected = include_str!("relay_resolvers/fixtures/unexpected-directive.invalid.expected");
    test_fixture(transform_fixture, "unexpected-directive.invalid.graphql", "relay_resolvers/fixtures/unexpected-directive.invalid.expected", input, expected);
}
