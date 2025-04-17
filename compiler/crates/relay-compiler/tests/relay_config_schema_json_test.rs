/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use fixture_tests::WORKSPACE_ROOT;
use fixture_tests::assert_file_contains;
use relay_compiler::ConfigFile;

#[tokio::test]
async fn json_schema() {
    let actual = ConfigFile::json_schema();
    let expected = include_str!("../relay-compiler-config-schema.json");
    let source_file_path = file!();

    let expected_file_path = WORKSPACE_ROOT
        .join(source_file_path)
        .with_file_name("../relay-compiler-config-schema.json");
    assert_file_contains(&actual, expected_file_path, expected)
}
