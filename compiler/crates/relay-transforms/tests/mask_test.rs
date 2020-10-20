// @generated SignedSource<<3d225aec53a4f9e74e4d4e83a8440f63>>

mod mask;

use mask::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn mask_mixed_null() {
    let input = include_str!("mask/fixtures/mask-mixed-null.graphql");
    let expected = include_str!("mask/fixtures/mask-mixed-null.expected");
    test_fixture(transform_fixture, "mask-mixed-null.graphql", "mask/fixtures/mask-mixed-null.expected", input, expected);
}

#[test]
fn relay_mask_transform() {
    let input = include_str!("mask/fixtures/relay-mask-transform.graphql");
    let expected = include_str!("mask/fixtures/relay-mask-transform.expected");
    test_fixture(transform_fixture, "relay-mask-transform.graphql", "mask/fixtures/relay-mask-transform.expected", input, expected);
}
