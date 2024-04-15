/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::collections::HashSet;
use std::path::Path;
use std::path::PathBuf;

use common::PerfLogEvent;
use common::PerfLogger;
use log::debug;
use relay_typegen::TypegenLanguage;
use walkdir::WalkDir;

use super::File;
use crate::compiler_state::CompilerState;
use crate::config::Config;
use crate::errors::Result;
use crate::FileSourceResult;

#[derive(Debug)]
pub struct WalkDirFileSourceResult {
    pub files: Vec<File>,
    pub resolved_root: PathBuf,
}

pub struct WalkDirFileSource<'config> {
    pub config: &'config Config,
    expected_file_extensions: HashSet<&'config str>,
}

fn get_expected_file_extensions(config: &Config) -> HashSet<&str> {
    let mut file_extensions = HashSet::<&str>::with_capacity(6);
    file_extensions.insert("graphql");
    file_extensions.insert("gql");

    for project in config.enabled_projects() {
        match project.typegen_config.language {
            TypegenLanguage::Flow | TypegenLanguage::JavaScript => {
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

impl<'config> WalkDirFileSource<'config> {
    pub fn new(config: &'config Config) -> Self {
        debug!(
            "Watchman server is disabled, or not available. Using GlobFileSource to find files."
        );
        Self {
            config,
            expected_file_extensions: get_expected_file_extensions(config),
        }
    }

    fn should_include_file(&self, name: &Path) -> bool {
        matches!(
            name.extension().map(|extension| self
                .expected_file_extensions
                .contains(extension.to_str().unwrap())),
            Some(true)
        )
    }

    fn find_files(&self) -> Vec<File> {
        WalkDir::new(self.config.root_dir.clone())
            .into_iter()
            .filter_map(|entry| {
                let dir_entry = entry.ok()?;
                let relative_path = dir_entry
                    .path()
                    .strip_prefix(self.config.root_dir.clone())
                    .ok()?
                    .to_path_buf();

                self.should_include_file(&relative_path).then_some(File {
                    name: relative_path,
                    exists: true,
                })
            })
            .collect::<Vec<_>>()
    }

    pub fn create_compiler_state(&self, perf_logger: &impl PerfLogger) -> Result<CompilerState> {
        let setup_event = perf_logger.create_event("Glob_file_source_create_compiler_state");
        let timer = setup_event.start("create_compiler_state_file_files");
        let file_source_changes = FileSourceResult::WalkDir(WalkDirFileSourceResult {
            files: self.find_files(),
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
