/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<663a08ce2f55bbc992ce9c3920d8ab88>>
 */

mod react_flight_codegen;

use react_flight_codegen::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn flight_props() {
    let input = include_str!("react_flight_codegen/fixtures/flight-props.graphql");
    let expected = include_str!("react_flight_codegen/fixtures/flight-props.expected");
    test_fixture(transform_fixture, "flight-props.graphql", "react_flight_codegen/fixtures/flight-props.expected", input, expected);
}
