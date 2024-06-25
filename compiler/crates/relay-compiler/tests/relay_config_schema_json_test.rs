/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use fixture_tests::assert_file_contains;
use fixture_tests::workspace_root;
use relay_compiler::ConfigFile;
use schemars::gen::SchemaSettings;
use schemars::gen::{self};

#[tokio::test]
async fn json_schema() {
    let mut settings: SchemaSettings = Default::default();
    settings.inline_subschemas = true;
    let generator = gen::SchemaGenerator::from(settings);
    let schema = generator.into_root_schema_for::<ConfigFile>();
    let actual = serde_json::to_string_pretty(&schema).unwrap();
    let expected = include_str!("../relay-compiler-config-schema.json");
    let source_file_path = file!();

    let expected_file_path = workspace_root()
        .join(source_file_path)
        .with_file_name("../relay-compiler-config-schema.json");
    assert_file_contains(&actual, expected_file_path, expected)
}
