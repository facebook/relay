/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::collections::HashMap;

use intern::string_key::StringKey;
use schemars::JsonSchema;
use serde::Deserialize;
use serde::Serialize;

/// Configuration of Relay's validation for `id` fields outside of the `Node` interface.
#[derive(Debug, Default, Serialize, Deserialize, JsonSchema)]
#[serde(deny_unknown_fields, rename_all = "camelCase")]
pub struct NonNodeIdFieldsConfig {
    /// A map of parent type names to allowed type names for fields named `id`
    #[serde(default)]
    pub allowed_id_types: HashMap<StringKey, StringKey>,
}
