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
use crate::watchman::FileSource;
use std::collections::HashMap;

pub struct Compiler {
    config: Config,
}

impl Compiler {
    pub fn new(config: Config) -> Self {
        Self { config }
    }

    pub async fn compile(&self) -> Result<CompilerState> {
        let file_source = FileSource::connect(&self.config).await?;
        let initial_file_source_result = file_source.query().await?;
        let mut compiler_state =
            CompilerState::from_file_source_changes(&self.config, &initial_file_source_result)?;

        self.build_projects(&mut compiler_state).await?;
        Ok(compiler_state)
    }

    pub async fn watch(&self) -> Result<()> {
        let file_source = FileSource::connect(&self.config).await?;
        let initial_file_source_result = file_source.query().await?;
        let mut compiler_state =
            CompilerState::from_file_source_changes(&self.config, &initial_file_source_result)?;
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
