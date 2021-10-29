/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::path::PathBuf;

use crate::errors::Result;
use crate::{compiler_state::CompilerState, config::Config};
use common::PerfLogger;

use super::File;

pub struct GlobFileSource<'config> {
    pub _config: &'config Config,
}

#[derive(Debug)]
pub struct GlobFileSourceResult {
    pub files: Vec<File>,
    pub resolved_root: PathBuf,
}

impl<'config> GlobFileSource<'config> {
    pub fn new(config: &'config Config) -> Self {
        Self { _config: config }
    }

    pub fn create_compiler_state(&self, _perf_logger: &impl PerfLogger) -> Result<CompilerState> {
        todo!()
    }
}
