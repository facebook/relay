// @generated SignedSource<<868ccdedc424ba016c59f6c6ed772aee>>

mod required_directive;

use required_directive::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn required_directive() {
    let input = include_str!("required_directive/fixtures/required_directive.graphql");
    let expected = include_str!("required_directive/fixtures/required_directive.expected");
    test_fixture(transform_fixture, "required_directive.graphql", "required_directive/fixtures/required_directive.expected", input, expected);
}
