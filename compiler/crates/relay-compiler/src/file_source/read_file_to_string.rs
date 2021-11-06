/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::File;
use super::FileSourceResult;
use crate::errors::{Error, Result};

/// Reads a file into a string.
pub fn read_file_to_string(file_source_result: &FileSourceResult, file: &File) -> Result<String> {
    assert!(
        file.exists,
        "Can't read from non-existent file: {:?}",
        &file.name
    );
    let absolute_path = file.absolute_path(file_source_result.resolved_root());
    std::fs::read_to_string(&absolute_path).map_err(|err| Error::FileRead {
        file: absolute_path.clone(),
        source: err,
    })
}
