/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::config::Config;
use serde_bser::value::Value;
use std::path::PathBuf;

pub trait SavedStateLoader {
    fn load(&self, saved_state_info: &Value, config: &Config) -> Option<PathBuf>;
}
