/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<fbb84200234cfe7d4293dd0c63574aab>>
 */

mod generate_typescript_import_syntax;

use generate_typescript_import_syntax::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn simple() {
    let input = include_str!("generate_typescript_import_syntax/fixtures/simple.graphql");
    let expected = include_str!("generate_typescript_import_syntax/fixtures/simple.expected");
    test_fixture(transform_fixture, "simple.graphql", "generate_typescript_import_syntax/fixtures/simple.expected", input, expected);
}
