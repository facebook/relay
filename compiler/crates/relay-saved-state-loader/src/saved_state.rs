/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::path::PathBuf;

use serde_bser::value::Value;

use crate::config::SavedStateConfig;

pub trait SavedStateLoader {
    fn load(&self, saved_state_info: &Value, config: &SavedStateConfig) -> Option<PathBuf>;
}
