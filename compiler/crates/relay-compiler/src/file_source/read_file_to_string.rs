/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::errors::Error;
use crate::errors::Result;
use crate::vfs::Vfs;

use super::File;
use super::FileSourceResult;

/// Reads a file into a string.
pub fn read_file_to_string(
    file_source_result: &FileSourceResult,
    file: &File,
    vfs: &dyn Vfs,
) -> Result<String> {
    assert!(
        file.exists,
        "Can't read from non-existent file: {:?}",
        &file.name
    );
    let absolute_path = file.absolute_path(file_source_result.resolved_root());
    vfs.read_to_string(&absolute_path).map_err(|err| Error::FileRead {
        file: absolute_path.clone(),
        source: err,
    })
}
