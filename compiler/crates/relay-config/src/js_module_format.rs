/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use schemars::JsonSchema;
use serde::Deserialize;
use serde::Serialize;

/// Formatting style for generated files.
#[derive(Copy, Clone, Debug, Deserialize, Serialize, JsonSchema)]
#[serde(rename_all = "lowercase")]
pub enum JsModuleFormat {
    /// Common JS style, e.g. `require('../path/MyModule')`
    CommonJS,
    /// Facebook style, e.g. `require('MyModule')`
    Haste,
}

impl Default for JsModuleFormat {
    fn default() -> Self {
        JsModuleFormat::CommonJS
    }
}
