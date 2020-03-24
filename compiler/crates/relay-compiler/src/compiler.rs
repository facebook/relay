/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::build_project::build_project;
use crate::compiler_state::CompilerState;
use crate::config::Config;
use crate::errors::{Error, Result};
use crate::parse_sources::parse_sources;
use crate::watchman::FileSource;

pub struct Compiler {
    config: Config,
}

impl Compiler {
    pub fn new(config: Config) -> Self {
        Self { config }
    }

    pub async fn compile(&self) -> Result<()> {
        let file_source = FileSource::connect(&self.config).await?;
        let initial_file_source_result = file_source.query().await?;
        let compiler_state =
            CompilerState::from_file_source_changes(&self.config, &initial_file_source_result)?;

        self.build_projects(&compiler_state).await?;

        Ok(())
    }

    pub async fn watch(&self) -> Result<()> {
        let file_source = FileSource::connect(&self.config).await?;
        let initial_file_source_result = file_source.query().await?;
        let mut compiler_state =
            CompilerState::from_file_source_changes(&self.config, &initial_file_source_result)?;
        match self.build_projects(&compiler_state).await {
            Ok(_) => compiler_state.commit_pending_file_source_changes(),
            Err(errors) => {
                // TODO correctly print errors
                println!("Errors: {:#?}", errors)
            }
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
                    match self.build_projects(&compiler_state).await {
                        Ok(_) => compiler_state.commit_pending_file_source_changes(),
                        Err(errors) => {
                            // TODO correctly print errors
                            println!("Errors: {:#?}", errors)
                        }
                    }
                } else {
                    println!("[watch-mode] No re-compilation required");
                }
            }
        }
    }

    async fn build_projects(&self, compiler_state: &CompilerState) -> Result<()> {
        let graphql_asts = parse_sources(&compiler_state)?;
        let mut build_project_errors = vec![];
        for project_config in self.config.projects.values() {
            if compiler_state.project_has_pending_changes(project_config.name) {
                // TODO: consider running all projects in parallel
                match build_project(&self.config, project_config, compiler_state, &graphql_asts)
                    .await
                {
                    Ok(()) => {}
                    Err(err) => build_project_errors.push(err),
                }
            }
        }

        if build_project_errors.is_empty() {
            Ok(())
        } else {
            Err(Error::BuildProjectsErrors {
                errors: build_project_errors,
            })
        }
    }
}
