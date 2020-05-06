/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::build_project::{build_project, build_schema, check_project, WrittenArtifacts};
use crate::compiler_state::{CompilerState, ProjectName};
use crate::config::Config;
use crate::errors::{Error, Result};
use crate::parse_sources::parse_sources;
use crate::watchman::{FileSource, FileSourceResult, QueryParams};
use common::{PerfLogEvent, PerfLogger};
use log::{error, info};
use schema::Schema;
use std::collections::HashMap;
use std::path::PathBuf;

pub struct Compiler<'perf, T>
where
    T: PerfLogger,
{
    config: Config,
    perf_logger: &'perf T,
}

impl<'perf, T: PerfLogger> Compiler<'perf, T> {
    pub fn new(config: Config, perf_logger: &'perf T) -> Self {
        Self {
            config,
            perf_logger,
        }
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
        setup_event: &impl PerfLogEvent,
    ) -> Result<(CompilerState, FileSourceResult)> {
        match optional_serialized_state_path {
            Some(saved_state_path) => {
                let mut compiler_state = CompilerState::deserialize_from_file(&saved_state_path)?;
                let metadata = compiler_state.metadata.clone();
                let initial_file_source_result = file_source
                    .query(
                        metadata.map(|metadata| QueryParams {
                            since: metadata.clock,
                        }),
                        setup_event,
                    )
                    .await?;

                compiler_state.add_pending_file_source_changes(
                    &self.config,
                    &initial_file_source_result,
                    setup_event,
                    self.perf_logger,
                )?;

                Ok((compiler_state, initial_file_source_result))
            }
            None => {
                let initial_file_source_result = file_source.query(None, setup_event).await?;
                let compiler_state = CompilerState::from_file_source_changes(
                    &self.config,
                    &initial_file_source_result,
                    setup_event,
                    self.perf_logger,
                )?;

                Ok((compiler_state, initial_file_source_result))
            }
        }
    }

    pub async fn compile(
        &self,
        optional_serialized_state_path: Option<PathBuf>,
    ) -> Result<CompilerState> {
        let setup_event = self.perf_logger.create_event("compiler_setup");
        let file_source = FileSource::connect(&self.config, &setup_event).await?;
        let (mut compiler_state, _) = self
            .create_compiler_state_and_file_source_result(
                &file_source,
                optional_serialized_state_path,
                &setup_event,
            )
            .await?;
        self.build_projects(&mut compiler_state, &setup_event)
            .await?;
        self.perf_logger.complete_event(setup_event);

        Ok(compiler_state)
    }

    pub fn build_schemas(
        &self,
        compiler_state: &CompilerState,
        setup_event: &impl PerfLogEvent,
    ) -> HashMap<ProjectName, Schema> {
        let timer = setup_event.start("build_schemas");
        let mut schemas = HashMap::new();
        match self.config.only_project {
            Some(project_key) => {
                let project_config =
                    self.config.projects.get(&project_key).unwrap_or_else(|| {
                        panic!("Expected the project {} to exist", &project_key)
                    });
                let schema = build_schema(compiler_state, project_config);
                schemas.insert(project_config.name, schema);
            }
            None => {
                for project_config in self.config.projects.values() {
                    let schema = build_schema(compiler_state, project_config);
                    schemas.insert(project_config.name, schema);
                }
            }
        }
        setup_event.stop(timer);
        schemas
    }

    pub async fn watch_with_callback<F: FnMut(Result<()>)>(&self, mut callback: F) -> Result<()> {
        let setup_event = self.perf_logger.create_event("compiler_setup");
        let file_source = FileSource::connect(&self.config, &setup_event).await?;
        let (mut compiler_state, initial_file_source_result) = self
            .create_compiler_state_and_file_source_result(&file_source, None, &setup_event)
            .await?;
        let schemas = self.build_schemas(&compiler_state, &setup_event);
        callback(
            self.check_projects(&mut compiler_state, &schemas, &setup_event)
                .await,
        );

        self.perf_logger.complete_event(setup_event);

        let mut subscription = file_source.subscribe(initial_file_source_result).await?;
        loop {
            if let Some(file_source_changes) = subscription.next_change().await? {
                let incremental_check_event =
                    self.perf_logger.create_event("incremental_check_event");
                let incremental_check_time =
                    incremental_check_event.start("incremental_check_time");

                // TODO Single change to file in VSCode sometimes produces
                // 2 watchman change events for the same file
                let had_new_changes = compiler_state.add_pending_file_source_changes(
                    &self.config,
                    &file_source_changes,
                    &incremental_check_event,
                    self.perf_logger,
                )?;
                if had_new_changes {
                    // Clear out existing errors
                    callback(Ok(()));
                    // Report any new errors
                    callback(
                        self.check_projects(
                            &mut compiler_state,
                            &schemas,
                            &incremental_check_event,
                        )
                        .await,
                    );
                } else {
                    info!("[watch-mode] No re-compilation required");
                }
                incremental_check_event.stop(incremental_check_time);
                self.perf_logger.complete_event(incremental_check_event);
                // We probably don't want the messages queue to grow indefinitely
                // and we need to flush then, as the check/build is completed
                self.perf_logger.flush();
            }
        }
    }

    pub async fn watch(&self, optional_serialized_state_path: Option<PathBuf>) -> Result<()> {
        let setup_event = self.perf_logger.create_event("compiler_setup");
        let file_source = FileSource::connect(&self.config, &setup_event).await?;
        let (mut compiler_state, initial_file_source_result) = self
            .create_compiler_state_and_file_source_result(
                &file_source,
                optional_serialized_state_path,
                &setup_event,
            )
            .await?;

        if let Err(errors) = self.build_projects(&mut compiler_state, &setup_event).await {
            // TODO correctly print errors
            error!("Errors: {:#?}", errors)
        }
        self.perf_logger.complete_event(setup_event);

        let mut subscription = file_source.subscribe(initial_file_source_result).await?;
        loop {
            if let Some(file_source_changes) = subscription.next_change().await? {
                let incremental_build_event =
                    self.perf_logger.create_event("incremental_build_event");
                let incremental_build_time =
                    incremental_build_event.start("incremental_build_time");

                // TODO Single change to file in VSCode sometimes produces
                // 2 watchman change events for the same file

                info!("\n\n[watch-mode] Change detected");
                let had_new_changes = compiler_state.add_pending_file_source_changes(
                    &self.config,
                    &file_source_changes,
                    &incremental_build_event,
                    self.perf_logger,
                )?;

                if had_new_changes {
                    if let Err(errors) = self
                        .build_projects(&mut compiler_state, &incremental_build_event)
                        .await
                    {
                        // TODO correctly print errors
                        error!("Errors: {:#?}", errors)
                    }
                } else {
                    info!("[watch-mode] No re-compilation required");
                }
                incremental_build_event.stop(incremental_build_time);
                self.perf_logger.complete_event(incremental_build_event);
                // We probably don't want the messages queue to grow indefinitely
                // and we need to flush then, as the check/build is completed
                self.perf_logger.flush();
            }
        }
    }

    async fn check_projects(
        &self,
        compiler_state: &mut CompilerState,
        schemas: &HashMap<ProjectName, Schema>,
        setup_event: &impl PerfLogEvent,
    ) -> Result<()> {
        let graphql_asts =
            setup_event.time("parse_sources_time", || parse_sources(&compiler_state))?;

        let mut build_project_errors = vec![];

        match self.config.only_project {
            Some(project_key) => {
                let project_config =
                    self.config.projects.get(&project_key).unwrap_or_else(|| {
                        panic!("Expected the project {} to exist", &project_key)
                    });
                let schema = schemas.get(&project_config.name).unwrap();
                check_project(
                    project_config,
                    compiler_state,
                    &graphql_asts,
                    schema,
                    self.perf_logger,
                )
                .await
                .map_err(|err| {
                    build_project_errors.push(err);
                })
                .ok();
            }
            None => {
                for project_config in self.config.projects.values() {
                    if compiler_state.project_has_pending_changes(project_config.name) {
                        let schema = schemas.get(&project_config.name).unwrap();
                        // TODO: consider running all projects in parallel
                        check_project(
                            project_config,
                            compiler_state,
                            &graphql_asts,
                            schema,
                            self.perf_logger,
                        )
                        .await
                        .map_err(|err| {
                            build_project_errors.push(err);
                        })
                        .ok();
                    }
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

    async fn build_projects(
        &self,
        compiler_state: &mut CompilerState,
        setup_event: &impl PerfLogEvent,
    ) -> Result<()> {
        let graphql_asts =
            setup_event.time("parse_sources_time", || parse_sources(&compiler_state))?;

        let mut build_project_errors = vec![];
        let mut next_artifacts: HashMap<ProjectName, WrittenArtifacts> = Default::default();

        let mut process_build_result = |result, name| match result {
            Ok(written_artifacts) => {
                next_artifacts.insert(name, written_artifacts);
            }
            Err(err) => build_project_errors.push(err),
        };

        match self.config.only_project {
            Some(project_key) => {
                let project_config =
                    self.config.projects.get(&project_key).unwrap_or_else(|| {
                        panic!("Expected the project {} to exist", &project_key)
                    });
                process_build_result(
                    build_project(
                        &self.config,
                        project_config,
                        compiler_state,
                        &graphql_asts,
                        self.perf_logger,
                    )
                    .await,
                    project_config.name,
                )
            }
            None => {
                for project_config in self.config.projects.values() {
                    if compiler_state.project_has_pending_changes(project_config.name) {
                        // TODO: consider running all projects in parallel
                        process_build_result(
                            build_project(
                                &self.config,
                                project_config,
                                compiler_state,
                                &graphql_asts,
                                self.perf_logger,
                            )
                            .await,
                            project_config.name,
                        )
                    }
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
