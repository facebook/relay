// @generated SignedSource<<27cd5cfde00c0eff750ce7c2bff06a8d>>

mod react_flight_codegen;

use react_flight_codegen::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn flight_props() {
    let input = include_str!("react_flight_codegen/fixtures/flight-props.graphql");
    let expected = include_str!("react_flight_codegen/fixtures/flight-props.expected");
    test_fixture(transform_fixture, "flight-props.graphql", "react_flight_codegen/fixtures/flight-props.expected", input, expected);
}
