/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::path::PathBuf;

use crate::{compiler_state::CompilerState, config::Config};

/// The purpose of this module is to handle saved state and list of changed files
/// from the external source, and not from the watchman
pub struct ExternalFileSource {
    _compiler_state: CompilerState,
}
#[derive(Debug, Clone)]
pub struct ExternalFile {
    pub name: PathBuf,
    pub exists: bool,
}

#[derive(Debug)]
pub struct ExternalFileSourceResult {
    pub files: Vec<ExternalFile>,
    pub resolved_root: PathBuf,
}

impl ExternalFileSource {
    pub fn new(config: &Config) -> Self {
        if let Some(saved_state_path) = &config.load_saved_state_file {
            let compiler_state = CompilerState::deserialize_from_file(saved_state_path).unwrap();
            // let file_source_result = config.list_of_changed_files;
            Self {
                _compiler_state: compiler_state,
            }
        } else {
            panic!("expect a file with saved state");
        }
    }
}
