/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::build_project::{build_project, build_schema, commit_project, BuildProjectFailure};
use crate::compiler_state::{ArtifactMapKind, CompilerState, ProjectName};
use crate::config::Config;
use crate::errors::{Error, Result};
use crate::graphql_asts::GraphQLAsts;
use crate::red_to_green::RedToGreen;
use crate::watchman::FileSource;
use common::{DiagnosticsResult, PerfLogEvent, PerfLogger};
use futures::future::join_all;
use log::info;
use rayon::prelude::*;
use schema::Schema;
use std::{collections::HashMap, sync::Arc};
use tokio::{sync::Notify, task};

pub struct Compiler<TPerfLogger>
where
    TPerfLogger: PerfLogger + 'static,
{
    config: Arc<Config>,
    perf_logger: Arc<TPerfLogger>,
}

impl<TPerfLogger: PerfLogger> Compiler<TPerfLogger> {
    pub fn new(config: Config, perf_logger: Arc<TPerfLogger>) -> Self {
        Self {
            config: Arc::new(config),
            perf_logger,
        }
    }

    pub async fn create_compiler_state(
        &self,
        perf_logger: Arc<TPerfLogger>,
        setup_event: &impl PerfLogEvent,
    ) -> Result<CompilerState> {
        let file_source = FileSource::connect(&self.config, setup_event).await?;
        let compiler_state = file_source.query(setup_event, perf_logger.as_ref()).await?;

        Ok(compiler_state)
    }

    pub async fn compile(&self) -> Result<CompilerState> {
        let setup_event = self.perf_logger.create_event("compiler_setup");

        let mut compiler_state = self
            .create_compiler_state(Arc::clone(&self.perf_logger), &setup_event)
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
    ) -> DiagnosticsResult<HashMap<ProjectName, Arc<Schema>>> {
        let timer = setup_event.start("build_schemas");
        let mut schemas = HashMap::new();
        for project_config in self.config.enabled_projects() {
            let schema = build_schema(compiler_state, project_config)?;
            schemas.insert(project_config.name, schema);
        }
        setup_event.stop(timer);
        Ok(schemas)
    }

    pub async fn watch(&self) -> Result<()> {
        let setup_event = self.perf_logger.create_event("compiler_setup");

        let file_source = FileSource::connect(&self.config, &setup_event).await?;

        let (mut compiler_state, mut subscription) = file_source
            .subscribe(&setup_event, self.perf_logger.as_ref())
            .await?;

        let mut red_to_green = RedToGreen::new();

        if self
            .build_projects(&mut compiler_state, &setup_event)
            .await
            .is_err()
        {
            // build_projects should have logged already
            red_to_green.log_error()
        } else {
            info!("Compilation completed.");
        }
        self.perf_logger.complete_event(setup_event);
        info!("Waiting for changes...");

        let pending_file_source_changes = compiler_state.pending_file_source_changes.clone();
        let notify_sender = Arc::new(Notify::new());
        let notify_receiver = notify_sender.clone();
        task::spawn(async move {
            loop {
                if let Some(file_source_changes) = subscription.next_change().await.unwrap() {
                    pending_file_source_changes
                        .write()
                        .unwrap()
                        .push(file_source_changes);
                    notify_sender.notify();
                }
            }
        });

        loop {
            notify_receiver.notified().await;
            // Single change to file sometimes produces 2 watchman change events for the same file
            // wait for 50ms in case there is a subsequent request
            tokio::time::delay_for(std::time::Duration::from_millis(50)).await;
            if compiler_state.has_pending_file_source_changes() {
                let incremental_build_event =
                    self.perf_logger.create_event("incremental_build_event");
                let incremental_build_time =
                    incremental_build_event.start("incremental_build_time");

                let had_new_changes = compiler_state.merge_file_source_changes(
                    &self.config,
                    &incremental_build_event,
                    self.perf_logger.as_ref(),
                    false,
                )?;

                if had_new_changes {
                    info!("Change detected, start compiling...");
                    if self
                        .build_projects(&mut compiler_state, &incremental_build_event)
                        .await
                        .is_err()
                    {
                        // build_projects should have logged already
                        red_to_green.log_error()
                    } else {
                        info!("Compilation completed.");
                        red_to_green.clear_error_and_log(self.perf_logger.as_ref());
                    }
                    incremental_build_event.stop(incremental_build_time);
                    info!("Waiting for changes...");
                } else {
                    incremental_build_event.stop(incremental_build_time);
                }
                self.perf_logger.complete_event(incremental_build_event);
                // We probably don't want the messages queue to grow indefinitely
                // and we need to flush then, as the check/build is completed
                self.perf_logger.flush();
            }
        }
    }

    async fn build_projects(
        &self,
        compiler_state: &mut CompilerState,
        setup_event: &impl PerfLogEvent,
    ) -> Result<()> {
        self.config.status_reporter.build_starts();
        let result = build_projects(
            Arc::clone(&self.config),
            Arc::clone(&self.perf_logger),
            setup_event,
            compiler_state,
        )
        .await;
        let result = match result {
            Ok(()) => {
                compiler_state.complete_compilation();
                self.config.artifact_writer.finalize()?;
                if let Some(post_artifacts_write) = &self.config.post_artifacts_write {
                    if let Err(error) = post_artifacts_write(&self.config) {
                        let error = Error::PostArtifactsError { error };
                        Err(error)
                    } else {
                        Ok(())
                    }
                } else {
                    Ok(())
                }
            }
            Err(error) => Err(error),
        };
        self.config.status_reporter.build_finishes(&result);
        result
    }
}

async fn build_projects<TPerfLogger: PerfLogger + 'static>(
    config: Arc<Config>,
    perf_logger: Arc<TPerfLogger>,
    setup_event: &impl PerfLogEvent,
    compiler_state: &mut CompilerState,
) -> Result<()> {
    let mut graphql_asts = setup_event.time("parse_sources_time", || {
        GraphQLAsts::from_graphql_sources_map(
            &compiler_state.graphql_sources,
            &compiler_state.get_dirty_definitions(&config),
        )
    })?;

    if compiler_state.has_pending_file_source_changes() {
        return Err(Error::Cancelled);
    }

    let build_results: Vec<_> = config
        .par_enabled_projects()
        .filter(|project_config| {
            if let Some(base) = project_config.base {
                if compiler_state.project_has_pending_changes(base) {
                    return true;
                }
            }
            compiler_state.project_has_pending_changes(project_config.name)
        })
        .map(|project_config| {
            build_project(
                &config,
                project_config,
                compiler_state,
                &graphql_asts,
                Arc::clone(&perf_logger),
            )
        })
        .collect();
    let mut results = Vec::new();
    let mut errors = Vec::new();
    for result in build_results {
        match result {
            Ok(result) => results.push(result),
            Err(error) => match error {
                BuildProjectFailure::Error(error) => errors.push(error),
                BuildProjectFailure::Cancelled => {
                    return Err(Error::Cancelled);
                }
            },
        }
    }

    if errors.is_empty() {
        let mut handles = Vec::new();
        for (project_name, schema, programs, artifacts) in results {
            let config = Arc::clone(&config);
            let perf_logger = Arc::clone(&perf_logger);
            if let Some(on_build_project_success) = &config.on_build_project_success {
                on_build_project_success(project_name, &schema, &programs.source);
            }
            let artifact_map = compiler_state
                .artifacts
                .get(&project_name)
                .cloned()
                .unwrap_or_else(|| Arc::new(ArtifactMapKind::Unconnected(Default::default())));
            let removed_definition_names = graphql_asts
                .remove(&project_name)
                .expect("Expect GraphQLAsts to exist.")
                .removed_definition_names;
            let dirty_artifact_paths = compiler_state
                .dirty_artifact_paths
                .get(&project_name)
                .cloned()
                .unwrap_or_default();
            handles.push(task::spawn(async move {
                let project_config = &config.projects[&project_name];
                Ok((
                    project_name,
                    commit_project(
                        &config,
                        project_config,
                        perf_logger,
                        &schema,
                        programs,
                        artifacts,
                        artifact_map,
                        removed_definition_names,
                        dirty_artifact_paths,
                    )
                    .await?,
                    schema,
                ))
            }));
        }
        for commit_result in join_all(handles).await {
            let commit_result: std::result::Result<std::result::Result<_, _>, _> = commit_result;
            let inner_result = commit_result.map_err(|e| Error::JoinError {
                error: e.to_string(),
            })?;
            match inner_result {
                Ok((project_name, next_artifact_map, schema)) => {
                    let next_artifact_map = Arc::new(ArtifactMapKind::Mapping(next_artifact_map));
                    compiler_state
                        .artifacts
                        .insert(project_name, next_artifact_map);
                    compiler_state.schema_cache.insert(project_name, schema);
                }
                Err(error) => {
                    errors.push(error);
                }
            }
        }
    }

    if errors.is_empty() {
        Ok(())
    } else {
        Err(Error::BuildProjectsErrors { errors })
    }
}
