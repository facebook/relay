/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::collections::HashSet;
use std::path::Path;
use std::path::PathBuf;
use std::sync::Arc;

use common::PerfLogEvent;
use common::PerfLogger;
use log::debug;
use relay_typegen::TypegenLanguage;

use super::File;
use crate::FileSourceResult;
use crate::compiler_state::CompilerState;
use crate::config::Config;
use crate::errors::Result;

#[derive(Debug)]
pub struct WalkDirFileSourceResult {
    pub files: Vec<File>,
    pub resolved_root: PathBuf,
}

pub struct WalkDirFileSource {
    pub config: Arc<Config>,
    expected_file_extensions: HashSet<&'static str>,
}

fn get_expected_file_extensions(config: &Config) -> HashSet<&'static str> {
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

impl WalkDirFileSource {
    pub fn new(config: Arc<Config>) -> Self {
        debug!(
            "Watchman server is disabled, or not available. Using GlobFileSource to find files."
        );
        let expected_file_extensions = get_expected_file_extensions(&config);
        Self {
            config,
            expected_file_extensions,
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
        self.config
            .get_all_roots()
            .iter()
            .map(|source| self.config.root_dir.join(source))
            .flat_map(|abs_root| {
                let root_dir = self.config.root_dir.clone();
                match self.config.vfs.read_dir_recursive(&abs_root) {
                    Ok(relative_paths) => relative_paths
                        .into_iter()
                        .filter_map(move |rel_to_abs_root| {
                            // rel_to_abs_root is relative to abs_root;
                            // we need relative to root_dir
                            let abs_path = abs_root.join(&rel_to_abs_root);
                            abs_path
                                .strip_prefix(&root_dir)
                                .ok()
                                .map(|p| p.to_path_buf())
                        })
                        .collect::<Vec<_>>()
                        .into_iter(),
                    Err(_) => Vec::new().into_iter(),
                }
            })
            .filter_map(|relative_path| {
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
            &self.config,
            &file_source_changes,
            &setup_event,
            perf_logger,
        )?;

        setup_event.complete();

        Ok(compiler_state)
    }

    /// Query all files in the configured roots.
    /// This is used by the test file source subscription for rescanning.
    pub fn query_files(&self) -> Result<WalkDirFileSourceResult> {
        Ok(WalkDirFileSourceResult {
            files: self.find_files(),
            resolved_root: self.config.root_dir.clone(),
        })
    }
}
