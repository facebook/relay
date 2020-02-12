// @generated SignedSource<<283ad01cc8cebe0a6adf17c82a3d0297>>

mod uppercase;

use uppercase::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn hello() {
    let input = include_str!("uppercase/fixtures/hello.txt");
    let expected = include_str!("uppercase/fixtures/hello.expected");
    test_fixture(transform_fixture, "hello.txt", "uppercase/fixtures/hello.expected", input, expected);
}

#[test]
fn world() {
    let input = include_str!("uppercase/fixtures/world.txt");
    let expected = include_str!("uppercase/fixtures/world.expected");
    test_fixture(transform_fixture, "world.txt", "uppercase/fixtures/world.expected", input, expected);
}
