/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b79ece844b76ca22207725fcb597f8ce>>
 */

mod react_flight_codegen;

use react_flight_codegen::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn flight_invalid() {
    let input = include_str!("react_flight_codegen/fixtures/flight.invalid.graphql");
    let expected = include_str!("react_flight_codegen/fixtures/flight.invalid.expected");
    test_fixture(transform_fixture, "flight.invalid.graphql", "react_flight_codegen/fixtures/flight.invalid.expected", input, expected);
}

#[test]
fn flight_props() {
    let input = include_str!("react_flight_codegen/fixtures/flight-props.graphql");
    let expected = include_str!("react_flight_codegen/fixtures/flight-props.expected");
    test_fixture(transform_fixture, "flight-props.graphql", "react_flight_codegen/fixtures/flight-props.expected", input, expected);
}
