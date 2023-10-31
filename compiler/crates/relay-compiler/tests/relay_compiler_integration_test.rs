/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<6a4360c4cb2d5b7641f3a41ae33f6a27>>
 */

mod relay_compiler_integration;

use relay_compiler_integration::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn client_mutation_extension() {
    let input = include_str!("relay_compiler_integration/fixtures/client_mutation_extension.input");
    let expected = include_str!("relay_compiler_integration/fixtures/client_mutation_extension.expected");
    test_fixture(transform_fixture, "client_mutation_extension.input", "relay_compiler_integration/fixtures/client_mutation_extension.expected", input, expected).await;
}

#[tokio::test]
async fn client_mutation_resolver() {
    let input = include_str!("relay_compiler_integration/fixtures/client_mutation_resolver.input");
    let expected = include_str!("relay_compiler_integration/fixtures/client_mutation_resolver.expected");
    test_fixture(transform_fixture, "client_mutation_resolver.input", "relay_compiler_integration/fixtures/client_mutation_resolver.expected", input, expected).await;
}

#[tokio::test]
async fn simple_fragment() {
    let input = include_str!("relay_compiler_integration/fixtures/simple_fragment.input");
    let expected = include_str!("relay_compiler_integration/fixtures/simple_fragment.expected");
    test_fixture(transform_fixture, "simple_fragment.input", "relay_compiler_integration/fixtures/simple_fragment.expected", input, expected).await;
}

#[tokio::test]
async fn typescript_resolver_type_import() {
    let input = include_str!("relay_compiler_integration/fixtures/typescript_resolver_type_import.input");
    let expected = include_str!("relay_compiler_integration/fixtures/typescript_resolver_type_import.expected");
    test_fixture(transform_fixture, "typescript_resolver_type_import.input", "relay_compiler_integration/fixtures/typescript_resolver_type_import.expected", input, expected).await;
}
