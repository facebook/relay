/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<7ffddcb334a047ed5d5b7f8b9e045c6e>>
 */

mod generate_data_driven_dependency_metadata;

use generate_data_driven_dependency_metadata::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn match_on_child_of_plural() {
    let input = include_str!("generate_data_driven_dependency_metadata/fixtures/match-on-child-of-plural.graphql");
    let expected = include_str!("generate_data_driven_dependency_metadata/fixtures/match-on-child-of-plural.expected");
    test_fixture(transform_fixture, file!(), "match-on-child-of-plural.graphql", "generate_data_driven_dependency_metadata/fixtures/match-on-child-of-plural.expected", input, expected).await;
}

#[tokio::test]
async fn match_with_extra_args() {
    let input = include_str!("generate_data_driven_dependency_metadata/fixtures/match-with-extra-args.graphql");
    let expected = include_str!("generate_data_driven_dependency_metadata/fixtures/match-with-extra-args.expected");
    test_fixture(transform_fixture, file!(), "match-with-extra-args.graphql", "generate_data_driven_dependency_metadata/fixtures/match-with-extra-args.expected", input, expected).await;
}

#[tokio::test]
async fn module_without_match() {
    let input = include_str!("generate_data_driven_dependency_metadata/fixtures/module-without-match.graphql");
    let expected = include_str!("generate_data_driven_dependency_metadata/fixtures/module-without-match.expected");
    test_fixture(transform_fixture, file!(), "module-without-match.graphql", "generate_data_driven_dependency_metadata/fixtures/module-without-match.expected", input, expected).await;
}

#[tokio::test]
async fn query_with_direct_and_transitive_module_dep() {
    let input = include_str!("generate_data_driven_dependency_metadata/fixtures/query-with-direct-and-transitive-module-dep.graphql");
    let expected = include_str!("generate_data_driven_dependency_metadata/fixtures/query-with-direct-and-transitive-module-dep.expected");
    test_fixture(transform_fixture, file!(), "query-with-direct-and-transitive-module-dep.graphql", "generate_data_driven_dependency_metadata/fixtures/query-with-direct-and-transitive-module-dep.expected", input, expected).await;
}

#[tokio::test]
async fn query_with_direct_module_dep() {
    let input = include_str!("generate_data_driven_dependency_metadata/fixtures/query-with-direct-module-dep.graphql");
    let expected = include_str!("generate_data_driven_dependency_metadata/fixtures/query-with-direct-module-dep.expected");
    test_fixture(transform_fixture, file!(), "query-with-direct-module-dep.graphql", "generate_data_driven_dependency_metadata/fixtures/query-with-direct-module-dep.expected", input, expected).await;
}

#[tokio::test]
async fn query_with_transitive_module_dep() {
    let input = include_str!("generate_data_driven_dependency_metadata/fixtures/query-with-transitive-module-dep.graphql");
    let expected = include_str!("generate_data_driven_dependency_metadata/fixtures/query-with-transitive-module-dep.expected");
    test_fixture(transform_fixture, file!(), "query-with-transitive-module-dep.graphql", "generate_data_driven_dependency_metadata/fixtures/query-with-transitive-module-dep.expected", input, expected).await;
}

#[tokio::test]
async fn relay_match_on_interface() {
    let input = include_str!("generate_data_driven_dependency_metadata/fixtures/relay-match-on-interface.graphql");
    let expected = include_str!("generate_data_driven_dependency_metadata/fixtures/relay-match-on-interface.expected");
    test_fixture(transform_fixture, file!(), "relay-match-on-interface.graphql", "generate_data_driven_dependency_metadata/fixtures/relay-match-on-interface.expected", input, expected).await;
}

#[tokio::test]
async fn relay_match_on_union() {
    let input = include_str!("generate_data_driven_dependency_metadata/fixtures/relay-match-on-union.graphql");
    let expected = include_str!("generate_data_driven_dependency_metadata/fixtures/relay-match-on-union.expected");
    test_fixture(transform_fixture, file!(), "relay-match-on-union.graphql", "generate_data_driven_dependency_metadata/fixtures/relay-match-on-union.expected", input, expected).await;
}

#[tokio::test]
async fn relay_match_on_union_plural() {
    let input = include_str!("generate_data_driven_dependency_metadata/fixtures/relay-match-on-union-plural.graphql");
    let expected = include_str!("generate_data_driven_dependency_metadata/fixtures/relay-match-on-union-plural.expected");
    test_fixture(transform_fixture, file!(), "relay-match-on-union-plural.graphql", "generate_data_driven_dependency_metadata/fixtures/relay-match-on-union-plural.expected", input, expected).await;
}
