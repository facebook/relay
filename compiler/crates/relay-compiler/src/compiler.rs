/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::build_project::{build_project, build_schema, check_project};
use crate::compiler_state::{CompilerState, ProjectName};
use crate::config::Config;
use crate::errors::{Error, Result};
use crate::parse_sources::parse_sources;
use crate::{artifact_map::ArtifactMap, watchman::FileSource};
use common::{PerfLogEvent, PerfLogger};
use log::{error, info};
use schema::Schema;
use std::collections::HashMap;

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

    pub async fn compile(&self) -> Result<CompilerState> {
        let setup_event = self.perf_logger.create_event("compiler_setup");

        let file_source = FileSource::connect(&self.config, &setup_event).await?;
        let mut compiler_state = file_source.query(&setup_event, self.perf_logger).await?;
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
        self.config.for_each_project(|project_config| {
            let schema = build_schema(compiler_state, project_config);
            schemas.insert(project_config.name, schema);
        });
        setup_event.stop(timer);
        schemas
    }

    pub async fn watch_with_callback<F>(&self, mut callback: F) -> Result<()>
    where
        F: FnMut(Result<()>),
    {
        let setup_event = self.perf_logger.create_event("compiler_setup");

        let file_source = FileSource::connect(&self.config, &setup_event).await?;
        let (mut compiler_state, mut subscription) = file_source
            .subscribe(&setup_event, self.perf_logger)
            .await?;
        let schemas = self.build_schemas(&compiler_state, &setup_event);
        callback(
            self.check_projects(&mut compiler_state, &schemas, &setup_event)
                .await,
        );

        self.perf_logger.complete_event(setup_event);

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

    pub async fn watch(&self) -> Result<()> {
        let setup_event = self.perf_logger.create_event("compiler_setup");

        let file_source = FileSource::connect(&self.config, &setup_event).await?;

        let (mut compiler_state, mut subscription) = file_source
            .subscribe(&setup_event, self.perf_logger)
            .await?;

        if let Err(errors) = self.build_projects(&mut compiler_state, &setup_event).await {
            // TODO correctly print errors
            error!("Errors: {:#?}", errors)
        }
        self.perf_logger.complete_event(setup_event);

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
        let next_artifacts: ArtifactMap = Default::default();

        let mut process_build_result = |result, _name| match result {
            Ok(_written_artifacts) => {
                // next_artifacts.insert(name, written_artifacts);
            }
            Err(err) => build_project_errors.push(err),
        };

        if let Some(only_project) = self.config.only_project {
            let project_config = self
                .config
                .projects
                .get(&only_project)
                .unwrap_or_else(|| panic!("Expected the project {} to exist", &only_project));
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
        } else {
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
