/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use intern::string_key::Intern;
use intern::string_key::StringKey;
use md5::Digest;
use md5::Md5;
use serde::Deserialize;
use serde::Serialize;

#[derive(
    Serialize,
    Deserialize,
    Debug,
    Clone,
    Copy,
    Eq,
    PartialEq,
    Hash,
    PartialOrd,
    Ord
)]
pub struct ResolverSourceHash(StringKey);

impl ResolverSourceHash {
    pub fn new(source: &str) -> Self {
        Self(md5(source).intern())
    }

    pub fn from_raw(source: StringKey) -> Self {
        Self(source)
    }

    pub fn value(&self) -> StringKey {
        self.0
    }
}

fn md5(data: &str) -> String {
    let mut md5 = Md5::new();
    md5.update(data);
    hex::encode(md5.finalize())
}
