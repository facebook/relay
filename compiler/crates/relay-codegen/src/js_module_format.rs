/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use serde::{Deserialize, Serialize};

#[derive(Copy, Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum JsModuleFormat {
    CommonJS,
    Haste,
}

impl Default for JsModuleFormat {
    fn default() -> Self {
        JsModuleFormat::Haste
    }
}
