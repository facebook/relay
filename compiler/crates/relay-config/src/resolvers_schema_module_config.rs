/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::path::PathBuf;

use schemars::JsonSchema;
use serde::Deserialize;
use serde::Serialize;

/// Configuration for resolvers_schema_module generation
#[derive(Default, Serialize, Deserialize, Debug, JsonSchema)]
#[serde(deny_unknown_fields, rename_all = "camelCase")]
pub struct ResolversSchemaModuleConfig {
    #[serde(default)]
    pub apply_to_normalization_ast: bool,
    #[serde(default)]
    pub path: PathBuf,
}
