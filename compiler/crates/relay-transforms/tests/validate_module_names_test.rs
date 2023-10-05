/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<99d8c0571de566969a066829e630599d>>
 */

mod validate_module_names;

use validate_module_names::transform_fixture;
use fixture_tests::test_fixture;

#[tokio::test]
async fn fragment_with_valid_name() {
    let input = include_str!("validate_module_names/fixtures/fragment-with-valid-name.graphql");
    let expected = include_str!("validate_module_names/fixtures/fragment-with-valid-name.expected");
    test_fixture(transform_fixture, "fragment-with-valid-name.graphql", "validate_module_names/fixtures/fragment-with-valid-name.expected", input, expected).await;
}

#[tokio::test]
async fn fragmentwithinvalidlycapitalizedname_invalid() {
    let input = include_str!("validate_module_names/fixtures/FragmentWithInvalidlyCapitalizedName.invalid.graphql");
    let expected = include_str!("validate_module_names/fixtures/FragmentWithInvalidlyCapitalizedName.invalid.expected");
    test_fixture(transform_fixture, "FragmentWithInvalidlyCapitalizedName.invalid.graphql", "validate_module_names/fixtures/FragmentWithInvalidlyCapitalizedName.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn fragmentwithinvalidname_invalid() {
    let input = include_str!("validate_module_names/fixtures/FragmentWithInvalidName.invalid.graphql");
    let expected = include_str!("validate_module_names/fixtures/FragmentWithInvalidName.invalid.expected");
    test_fixture(transform_fixture, "FragmentWithInvalidName.invalid.graphql", "validate_module_names/fixtures/FragmentWithInvalidName.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn fragmentwithvalidname() {
    let input = include_str!("validate_module_names/fixtures/FragmentWithValidName.graphql");
    let expected = include_str!("validate_module_names/fixtures/FragmentWithValidName.expected");
    test_fixture(transform_fixture, "FragmentWithValidName.graphql", "validate_module_names/fixtures/FragmentWithValidName.expected", input, expected).await;
}

#[tokio::test]
async fn fragmentwithvalidname_android() {
    let input = include_str!("validate_module_names/fixtures/FragmentWithValidName.android.graphql");
    let expected = include_str!("validate_module_names/fixtures/FragmentWithValidName.android.expected");
    test_fixture(transform_fixture, "FragmentWithValidName.android.graphql", "validate_module_names/fixtures/FragmentWithValidName.android.expected", input, expected).await;
}

#[tokio::test]
async fn fragmentwithvalidname_ios() {
    let input = include_str!("validate_module_names/fixtures/FragmentWithValidName.ios.graphql");
    let expected = include_str!("validate_module_names/fixtures/FragmentWithValidName.ios.expected");
    test_fixture(transform_fixture, "FragmentWithValidName.ios.graphql", "validate_module_names/fixtures/FragmentWithValidName.ios.expected", input, expected).await;
}

#[tokio::test]
async fn fragmentwithvalidname_other_suffix() {
    let input = include_str!("validate_module_names/fixtures/FragmentWithValidName.other-suffix.graphql");
    let expected = include_str!("validate_module_names/fixtures/FragmentWithValidName.other-suffix.expected");
    test_fixture(transform_fixture, "FragmentWithValidName.other-suffix.graphql", "validate_module_names/fixtures/FragmentWithValidName.other-suffix.expected", input, expected).await;
}

#[tokio::test]
async fn fragmentwithvalidname_other_suffix_ios_and_another() {
    let input = include_str!("validate_module_names/fixtures/FragmentWithValidName.other-suffix.ios.and-another.graphql");
    let expected = include_str!("validate_module_names/fixtures/FragmentWithValidName.other-suffix.ios.and-another.expected");
    test_fixture(transform_fixture, "FragmentWithValidName.other-suffix.ios.and-another.graphql", "validate_module_names/fixtures/FragmentWithValidName.other-suffix.ios.and-another.expected", input, expected).await;
}

#[tokio::test]
async fn mutationwithinvalidname_invalid() {
    let input = include_str!("validate_module_names/fixtures/MutationWithInvalidName.invalid.graphql");
    let expected = include_str!("validate_module_names/fixtures/MutationWithInvalidName.invalid.expected");
    test_fixture(transform_fixture, "MutationWithInvalidName.invalid.graphql", "validate_module_names/fixtures/MutationWithInvalidName.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn mutationwithinvalidsuffix_invalid() {
    let input = include_str!("validate_module_names/fixtures/MutationWithInvalidSuffix.invalid.graphql");
    let expected = include_str!("validate_module_names/fixtures/MutationWithInvalidSuffix.invalid.expected");
    test_fixture(transform_fixture, "MutationWithInvalidSuffix.invalid.graphql", "validate_module_names/fixtures/MutationWithInvalidSuffix.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn mutationwithvalidname() {
    let input = include_str!("validate_module_names/fixtures/MutationWithValidName.graphql");
    let expected = include_str!("validate_module_names/fixtures/MutationWithValidName.expected");
    test_fixture(transform_fixture, "MutationWithValidName.graphql", "validate_module_names/fixtures/MutationWithValidName.expected", input, expected).await;
}

#[tokio::test]
async fn querywithinvalidname_invalid() {
    let input = include_str!("validate_module_names/fixtures/QueryWithInvalidName.invalid.graphql");
    let expected = include_str!("validate_module_names/fixtures/QueryWithInvalidName.invalid.expected");
    test_fixture(transform_fixture, "QueryWithInvalidName.invalid.graphql", "validate_module_names/fixtures/QueryWithInvalidName.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn querywithinvalidsuffix_invalid() {
    let input = include_str!("validate_module_names/fixtures/QueryWithInvalidSuffix.invalid.graphql");
    let expected = include_str!("validate_module_names/fixtures/QueryWithInvalidSuffix.invalid.expected");
    test_fixture(transform_fixture, "QueryWithInvalidSuffix.invalid.graphql", "validate_module_names/fixtures/QueryWithInvalidSuffix.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn querywithvalidname() {
    let input = include_str!("validate_module_names/fixtures/QueryWithValidName.graphql");
    let expected = include_str!("validate_module_names/fixtures/QueryWithValidName.expected");
    test_fixture(transform_fixture, "QueryWithValidName.graphql", "validate_module_names/fixtures/QueryWithValidName.expected", input, expected).await;
}

#[tokio::test]
async fn subscriptionwithinvalidname_invalid() {
    let input = include_str!("validate_module_names/fixtures/SubscriptionWithInvalidName.invalid.graphql");
    let expected = include_str!("validate_module_names/fixtures/SubscriptionWithInvalidName.invalid.expected");
    test_fixture(transform_fixture, "SubscriptionWithInvalidName.invalid.graphql", "validate_module_names/fixtures/SubscriptionWithInvalidName.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn subscriptionwithinvalidsuffix_invalid() {
    let input = include_str!("validate_module_names/fixtures/SubscriptionWithInvalidSuffix.invalid.graphql");
    let expected = include_str!("validate_module_names/fixtures/SubscriptionWithInvalidSuffix.invalid.expected");
    test_fixture(transform_fixture, "SubscriptionWithInvalidSuffix.invalid.graphql", "validate_module_names/fixtures/SubscriptionWithInvalidSuffix.invalid.expected", input, expected).await;
}

#[tokio::test]
async fn subscriptionwithvalidname() {
    let input = include_str!("validate_module_names/fixtures/SubscriptionWithValidName.graphql");
    let expected = include_str!("validate_module_names/fixtures/SubscriptionWithValidName.expected");
    test_fixture(transform_fixture, "SubscriptionWithValidName.graphql", "validate_module_names/fixtures/SubscriptionWithValidName.expected", input, expected).await;
}
