/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::build_project::{build_project, WrittenArtifacts};
use crate::compiler_state::{CompilerState, ProjectName};
use crate::config::Config;
use crate::errors::{Error, Result};
use crate::parse_sources::parse_sources;
use crate::watchman::{FileSource, FileSourceResult, QueryParams};
use std::collections::HashMap;
use std::path::PathBuf;

pub struct Compiler {
    config: Config,
}

impl Compiler {
    pub fn new(config: Config) -> Self {
        Self { config }
    }

    /// This function will create an instance of CompilerState:
    ///
    /// - if the state is restored from the local saved state (see `optional_serialized_state_path`),
    /// the files_source_result should contain only files changed
    /// since the creation of the saved_state.
    ///
    /// - otherwise, it will send a base watchman query
    /// (to fetch all files, currently)
    async fn create_compiler_state_and_file_source_result(
        &self,
        file_source: &FileSource<'_>,
        optional_serialized_state_path: Option<PathBuf>,
    ) -> Result<(CompilerState, FileSourceResult)> {
        match optional_serialized_state_path {
            Some(saved_state_path) => {
                let mut compiler_state = CompilerState::deserialize_from_file(&saved_state_path)?;
                let metadata = compiler_state.metadata.clone();
                let initial_file_source_result = file_source
                    .query(metadata.map(|metadata| QueryParams {
                        since: metadata.clock,
                    }))
                    .await?;

                compiler_state
                    .add_pending_file_source_changes(&self.config, &initial_file_source_result)?;

                Ok((compiler_state, initial_file_source_result))
            }
            None => {
                let initial_file_source_result = file_source.query(None).await?;
                let compiler_state = CompilerState::from_file_source_changes(
                    &self.config,
                    &initial_file_source_result,
                )?;

                Ok((compiler_state, initial_file_source_result))
            }
        }
    }

    pub async fn compile(
        &self,
        optional_serialized_state_path: Option<PathBuf>,
    ) -> Result<CompilerState> {
        let file_source = FileSource::connect(&self.config).await?;
        let (mut compiler_state, _) = self
            .create_compiler_state_and_file_source_result(
                &file_source,
                optional_serialized_state_path,
            )
            .await?;
        self.build_projects(&mut compiler_state).await?;

        Ok(compiler_state)
    }

    pub async fn watch(&self, optional_serialized_state_path: Option<PathBuf>) -> Result<()> {
        let file_source = FileSource::connect(&self.config).await?;
        let (mut compiler_state, initial_file_source_result) = self
            .create_compiler_state_and_file_source_result(
                &file_source,
                optional_serialized_state_path,
            )
            .await?;

        if let Err(errors) = self.build_projects(&mut compiler_state).await {
            // TODO correctly print errors
            println!("Errors: {:#?}", errors)
        }

        let mut subscription = file_source.subscribe(initial_file_source_result).await?;
        loop {
            if let Some(file_source_changes) = subscription.next_change().await? {
                // TODO Single change to file in VSCode sometimes produces
                // 2 watchman change events for the same file

                println!("\n\n[watch-mode] Change detected");
                let had_new_changes = compiler_state
                    .add_pending_file_source_changes(&self.config, &file_source_changes)?;

                if had_new_changes {
                    if let Err(errors) = self.build_projects(&mut compiler_state).await {
                        // TODO correctly print errors
                        println!("Errors: {:#?}", errors)
                    }
                } else {
                    println!("[watch-mode] No re-compilation required");
                }
            }
        }
    }

    async fn build_projects(&self, compiler_state: &mut CompilerState) -> Result<()> {
        let graphql_asts = parse_sources(&compiler_state)?;
        let mut build_project_errors = vec![];
        let mut next_artifacts: HashMap<ProjectName, WrittenArtifacts> = Default::default();

        for project_config in self.config.projects.values() {
            if compiler_state.project_has_pending_changes(project_config.name) {
                // TODO: consider running all projects in parallel
                match build_project(&self.config, project_config, compiler_state, &graphql_asts)
                    .await
                {
                    Ok(written_artifacts) => {
                        next_artifacts.insert(project_config.name, written_artifacts);
                    }
                    Err(err) => build_project_errors.push(err),
                }
            }
        }

        if build_project_errors.is_empty() {
            compiler_state.complete_compilation(next_artifacts);
            Ok(())
        } else {
            Err(Error::BuildProjectsErrors {
                errors: build_project_errors,
            })
        }
    }
}
