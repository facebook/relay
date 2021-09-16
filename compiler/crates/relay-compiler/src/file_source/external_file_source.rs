/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::io::BufReader;
use std::path::PathBuf;

use crate::errors::{Error, Result};
use crate::FileSourceResult;
use crate::{compiler_state::CompilerState, config::Config};
use common::PerfLogger;
use std::fs::File as FsFile;

use super::File;

/// The purpose of this module is to handle saved state and list of changed files
/// from the external source, and not from the watchman
pub struct ExternalFileSource<'config> {
    config: &'config Config,
}

#[derive(Debug)]
pub struct ExternalFileSourceResult {
    pub files: Vec<File>,
    pub resolved_root: PathBuf,
}

impl ExternalFileSourceResult {
    fn read_from_fs(path: &PathBuf, resolved_root: PathBuf) -> Result<Self> {
        let file = FsFile::open(path).map_err(|err| Error::ReadFileError {
            file: path.clone(),
            source: err,
        })?;
        let files: Vec<File> =
            serde_json::from_reader(BufReader::new(file)).map_err(|err| Error::SerdeError {
                file: path.clone(),
                source: err,
            })?;

        Ok(Self {
            files,
            resolved_root,
        })
    }
}

impl<'config> ExternalFileSource<'config> {
    pub fn new(config: &'config Config) -> Self {
        Self { config }
    }

    pub fn create_compiler_state(&self, perf_logger: &impl PerfLogger) -> Result<CompilerState> {
        let load_saved_state_file = self.config.load_saved_state_file.as_ref().unwrap();
        let changed_files_list = self.config.changed_files_list.as_ref().unwrap();
        let root_dir = &self.config.root_dir;

        let mut compiler_state = CompilerState::deserialize_from_file(&load_saved_state_file)?;
        compiler_state
            .pending_file_source_changes
            .write()
            .unwrap()
            .push(FileSourceResult::External(
                ExternalFileSourceResult::read_from_fs(changed_files_list, root_dir.clone())?,
            ));

        compiler_state.merge_file_source_changes(&self.config, perf_logger, true)?;

        Ok(compiler_state)
    }
}
