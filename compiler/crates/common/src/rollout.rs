/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use md5::Digest;
use md5::Md5;
use schemars::JsonSchema;
use serde::Deserialize;
use serde::Serialize;

/// A utility to enable gradual rollout of large codegen changes.
/// Can be constructed as the Default which passes or a percentage between 0 and
/// 100.
#[derive(
    Default,
    Debug,
    Serialize,
    Deserialize,
    Clone,
    Copy,
    PartialEq,
    JsonSchema
)]
pub struct Rollout(pub Option<u8>);

impl Rollout {
    /// Checks some key deterministically and passes on average the given
    /// percentage of the rollout.
    /// A typical key to pass in could be the fragment or operation name.
    pub fn check(&self, key: impl AsRef<[u8]>) -> bool {
        if let Some(percentage) = self.0 {
            let hash = Md5::digest(key.as_ref());
            let hash: u16 = ((hash[1] as u16) << 8) | (hash[0] as u16);
            (hash % 100) < (percentage as u16)
        } else {
            true
        }
    }
}

/// A utility to enable gradual rollout of large codegen changes. Allows you to
/// specify a range of percentages to rollout.
#[derive(Debug, Serialize, Deserialize, Clone, Copy, PartialEq, JsonSchema)]
pub struct RolloutRange {
    pub start: u8,
    pub end: u8,
}

impl RolloutRange {
    /// Checks some key deterministically and passes on average the given
    /// percentage of the rollout.
    /// A typical key to pass in could be the fragment or operation name.
    pub fn check(&self, key: impl AsRef<[u8]>) -> bool {
        let hash = Md5::digest(key.as_ref());
        let hash: u16 = ((hash[1] as u16) << 8) | (hash[0] as u16);
        let percent = hash % 100;
        (percent) <= (self.end as u16) && (percent) >= (self.start as u16)
    }
}
