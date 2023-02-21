/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use intern::string_key::StringKey;
use schemars::JsonSchema;
use serde::Deserialize;
use serde::Serialize;

/// Configuration for @module.
#[derive(Debug, Deserialize, Serialize, Default, Copy, Clone, JsonSchema)]
#[serde(deny_unknown_fields, rename_all = "camelCase")]
pub struct ModuleImportConfig {
    /// Defines the custom import statement to be generated on the
    /// `ModuleImport` node in ASTs, used for dynamically loading
    /// components at runtime.
    pub dynamic_module_provider: Option<DynamicModuleProvider>,
}

#[derive(
    Debug,
    Deserialize,
    Serialize,
    Eq,
    Clone,
    Copy,
    PartialEq,
    Hash,
    JsonSchema
)]
#[serde(tag = "mode")]
pub enum DynamicModuleProvider {
    /// Generates a module provider using JSResource
    JSResource,
    /// Generates a custom JS import, Use `<$module>` as the placeholder
    /// for the actual module. e.g. `"() => import('<$module>')"`
    Custom { statement: StringKey },
}
