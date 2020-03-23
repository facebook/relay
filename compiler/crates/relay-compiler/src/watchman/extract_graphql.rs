/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::errors::{Error, Result};
use super::{read_to_string, WatchmanFile};
use watchman_client::prelude::*;

/// Reads and extracts `graphql` tagged literals from a file.
pub fn extract_graphql_strings_from_file(
    resolved_root: &ResolvedRoot,
    file: &WatchmanFile,
) -> Result<Vec<String>> {
    if !(*file.exists) {
        unreachable!("Can't read from non-existent file: {:?}", *file.name);
    }
    let contents = read_to_string(resolved_root, file)?;
    let definitions =
        extract_graphql::parse_chunks(&contents).map_err(|err| Error::Syntax { error: err })?;
    Ok(definitions
        .iter()
        .map(|chunk| (*chunk).to_string())
        .collect())
}
