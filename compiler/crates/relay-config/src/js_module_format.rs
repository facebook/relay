/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use serde::Deserialize;
use serde::Serialize;

/// Formatting style for generated files.
#[derive(Copy, Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "lowercase")]
#[derive(Default)]
pub enum JsModuleFormat {
    /// Common JS style, e.g. `require('../path/MyModule')`
    #[default]
    CommonJS,
    /// Facebook style, e.g. `require('MyModule')`
    Haste,
}
