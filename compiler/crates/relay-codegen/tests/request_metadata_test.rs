/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<76caacf46605cb66a748e138f99fcc0a>>
 */

mod request_metadata;

use request_metadata::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn valid_documents() {
    let input = include_str!("request_metadata/fixtures/valid-documents.graphql");
    let expected = include_str!("request_metadata/fixtures/valid-documents.expected");
    test_fixture(transform_fixture, "valid-documents.graphql", "request_metadata/fixtures/valid-documents.expected", input, expected);
}
