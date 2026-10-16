/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::File;
use crate::config::Config;
use crate::errors::Error;
use crate::errors::Result;

/// Reads a file into a string through the config's file system.
pub fn read_file_to_string(config: &Config, file: &File) -> Result<String> {
    assert!(
        file.exists,
        "Can't read from non-existent file: {:?}",
        file.name
    );
    config
        .file_system
        .read_to_string(&file.name)
        .map_err(|err| Error::FileRead {
            file: config.root_dir.join(&file.name),
            source: err,
        })
}

/// Reads a file's bytes through the config's file system.
pub fn read_file_to_bytes(config: &Config, file: &File) -> Result<Vec<u8>> {
    config
        .file_system
        .read(&file.name)
        .map_err(|err| Error::ReadFileError {
            file: config.root_dir.join(&file.name),
            source: err,
        })
}
