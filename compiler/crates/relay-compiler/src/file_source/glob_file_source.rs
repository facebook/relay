/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::collections::HashSet;
use std::path::{Path, PathBuf};

use crate::errors::{Error, Result};
use crate::FileSourceResult;
use crate::{compiler_state::CompilerState, config::Config};
use common::{PerfLogEvent, PerfLogger};
use glob::glob;
use relay_typegen::TypegenLanguage;

use super::File;

#[derive(Debug)]
pub struct GlobFileSourceResult {
    pub files: Vec<File>,
    pub resolved_root: PathBuf,
}

pub struct GlobFileSource<'config> {
    pub config: &'config Config,
    expected_file_extensions: HashSet<&'config str>,
}

impl<'config> GlobFileSource<'config> {
    pub fn new(config: &'config Config) -> Self {
        Self {
            config,
            expected_file_extensions: GlobFileSource::get_expected_file_extensions(config),
        }
    }

    fn get_expected_file_extensions(config: &Config) -> HashSet<&str> {
        let mut file_extensions = HashSet::<&str>::with_capacity(5);
        file_extensions.insert("graphql");
        for project in config.enabled_projects() {
            match project.typegen_config.language {
                TypegenLanguage::Flow => {
                    file_extensions.insert("js");
                    file_extensions.insert("jsx");
                }
                TypegenLanguage::TypeScript => {
                    file_extensions.insert("js");
                    file_extensions.insert("jsx");
                    file_extensions.insert("ts");
                    file_extensions.insert("tsx");
                }
            }
        }
        file_extensions
    }

    fn should_include_file(&self, name: &Path) -> bool {
        matches!(
            name.extension().map(|extension| self
                .expected_file_extensions
                .contains(extension.to_str().unwrap())),
            Some(true)
        )
    }

    fn find_files(&self) -> Result<Vec<File>> {
        Ok(glob(&format!("{}/**/*.*", self.config.root_dir.display()))
            .map_err(Error::PatternError)?
            .flatten()
            .filter(|path| self.should_include_file(path))
            .map(|path| {
                let name = path
                    .strip_prefix(self.config.root_dir.clone())
                    .unwrap()
                    .to_path_buf();

                File { name, exists: true }
            })
            .collect::<Vec<_>>())
    }

    pub fn create_compiler_state(&self, perf_logger: &impl PerfLogger) -> Result<CompilerState> {
        let setup_event = perf_logger.create_event("Glob_file_source_create_compiler_state");
        let timer = setup_event.start("create_compiler_state_file_files");
        let file_source_changes = FileSourceResult::Glob(GlobFileSourceResult {
            files: self.find_files()?,
            resolved_root: self.config.root_dir.clone(),
        });
        setup_event.stop(timer);
        let compiler_state = CompilerState::from_file_source_changes(
            self.config,
            &file_source_changes,
            &setup_event,
            perf_logger,
        )?;

        setup_event.complete();

        Ok(compiler_state)
    }
}
