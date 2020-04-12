/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::errors::{Error, Result};
use serde::Deserialize;
use watchman_client::prelude::*;

query_result_type! {
    pub struct WatchmanFile {
        pub name: NameField,
        pub exists: ExistsField,
        pub hash: ContentSha1HexField,
    }
}

/// Reads a file into a string.
pub fn read_to_string(resolved_root: &ResolvedRoot, file: &WatchmanFile) -> Result<String> {
    if !(*file.exists) {
        unreachable!("Can't read from non-existent file: {:?}", *file.name);
    }
    let mut absolute_path = resolved_root.path();
    absolute_path.push(&*file.name);
    std::fs::read_to_string(&absolute_path).map_err(|err| Error::FileRead {
        file: absolute_path.clone(),
        source: err,
    })
}
