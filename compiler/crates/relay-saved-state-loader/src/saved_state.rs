/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::path::PathBuf;

use async_trait::async_trait;
use serde_bser::value::Value;

use crate::config::SavedStateConfig;

#[async_trait]
pub trait SavedStateLoader {
    async fn load(&self, saved_state_info: &Value, config: &SavedStateConfig) -> Option<PathBuf>;
}
