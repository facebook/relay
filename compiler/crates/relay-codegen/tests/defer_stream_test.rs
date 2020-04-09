// @generated SignedSource<<b5a93d562f67bea5533a2ab903f7d0f9>>

mod defer_stream;

use defer_stream::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn fragment_with_defer_default_label() {
    let input = include_str!("defer_stream/fixtures/fragment-with-defer-default-label.graphql");
    let expected = include_str!("defer_stream/fixtures/fragment-with-defer-default-label.expected");
    test_fixture(transform_fixture, "fragment-with-defer-default-label.graphql", "defer_stream/fixtures/fragment-with-defer-default-label.expected", input, expected);
}
