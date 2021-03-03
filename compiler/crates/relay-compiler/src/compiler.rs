/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::config::Config;
use crate::errors::{Error, Result};
use crate::graphql_asts::GraphQLAsts;
use crate::red_to_green::RedToGreen;
use crate::watchman::FileSource;
use crate::{
    build_project::{
        build_project, build_raw_program, build_schema, commit_project, BuildProjectFailure,
    },
    errors::BuildProjectError,
};
use crate::{
    compiler_state::{ArtifactMapKind, CompilerState, ProjectName},
    watchman::FileSourceSubscriptionNextChange,
};
use common::{Diagnostic, PerfLogEvent, PerfLogger};
use fnv::FnvHashMap;
use futures::future::join_all;
use graphql_ir::Program;
use log::{debug, info};
use rayon::prelude::*;
use schema::SDLSchema;
use std::{collections::HashMap, sync::Arc};
use tokio::{
    sync::Notify,
    task::{self, JoinHandle},
};

pub struct Compiler<TPerfLogger>
where
    TPerfLogger: PerfLogger + 'static,
{
    config: Arc<Config>,
    perf_logger: Arc<TPerfLogger>,
}

impl<TPerfLogger: PerfLogger> Compiler<TPerfLogger> {
    pub fn new(config: Arc<Config>, perf_logger: Arc<TPerfLogger>) -> Self {
        Self {
            config,
            perf_logger,
        }
    }

    pub async fn compile(&self) -> Result<CompilerState> {
        let setup_event = self.perf_logger.create_event("compiler_setup");
        let file_source = FileSource::connect(&self.config, &setup_event).await?;
        let mut compiler_state = file_source
            .query(&setup_event, self.perf_logger.as_ref())
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
    ) -> (HashMap<ProjectName, Arc<SDLSchema>>, Vec<Diagnostic>) {
        let mut errors: Vec<Diagnostic> = vec![];
        let timer = setup_event.start("build_schemas");
        let mut schemas = HashMap::default();
        for project_config in self.config.enabled_projects() {
            match build_schema(compiler_state, project_config) {
                Ok(schema) => {
                    schemas.insert(project_config.name, schema);
                }
                Err(diagnostics) => {
                    for err in diagnostics {
                        errors.push(err);
                    }
                }
            };
        }
        setup_event.stop(timer);

        (schemas, errors)
    }

    pub async fn watch(&self) -> Result<()> {
        loop {
            let setup_event = self.perf_logger.create_event("compiler_setup");
            let file_source = FileSource::connect(&self.config, &setup_event).await?;

            let (mut compiler_state, mut subscription) = file_source
                .subscribe(&setup_event, self.perf_logger.as_ref())
                .await?;

            let pending_file_source_changes = compiler_state.pending_file_source_changes.clone();
            let source_control_update_status =
                Arc::clone(&compiler_state.source_control_update_status);

            let notify_sender = Arc::new(Notify::new());
            let notify_receiver = notify_sender.clone();

            // First, set up watchman subscription
            let subscription_handle = task::spawn(async move {
                loop {
                    let next_change = subscription.next_change().await;
                    match next_change {
                        Ok(FileSourceSubscriptionNextChange::Result(file_source_changes)) => {
                            pending_file_source_changes
                                .write()
                                .unwrap()
                                .push(file_source_changes);
                            notify_sender.notify_one();
                        }
                        Ok(FileSourceSubscriptionNextChange::SourceControlUpdateEnter) => {
                            info!("hg.update started...");
                            source_control_update_status.mark_as_started();
                        }
                        Ok(FileSourceSubscriptionNextChange::SourceControlUpdateLeave) => {
                            info!("hg.update completed.");
                            source_control_update_status.set_to_default();
                        }
                        Ok(FileSourceSubscriptionNextChange::SourceControlUpdate) => {
                            info!("hg.update completed. Detected new base revision...");
                            source_control_update_status.mark_as_completed();
                            notify_sender.notify_one();
                            break;
                        }
                        Ok(FileSourceSubscriptionNextChange::None) => {}
                        Err(err) => {
                            panic!("Watchman subscription error: {}", err);
                        }
                    }
                }
            });

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

            self.incremental_build_loop(compiler_state, notify_receiver, &subscription_handle)
                .await?
        }
    }

    async fn incremental_build_loop(
        &self,
        mut compiler_state: CompilerState,
        notify_receiver: Arc<Notify>,
        subscription_handle: &JoinHandle<()>,
    ) -> Result<()> {
        let mut red_to_green = RedToGreen::new();

        loop {
            notify_receiver.notified().await;

            if compiler_state.source_control_update_status.is_started() {
                continue;
            }

            if compiler_state.source_control_update_status.is_completed() {
                subscription_handle.abort();
                return Ok(());
            }

            // Single change to file sometimes produces 2 watchman change events for the same file
            // wait for 50ms in case there is a subsequent request
            tokio::time::sleep(std::time::Duration::from_millis(50)).await;

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
                        red_to_green.log_error()
                    } else {
                        info!("Compilation completed.");
                        red_to_green.clear_error_and_log(self.perf_logger.as_ref());
                    }
                    incremental_build_event.stop(incremental_build_time);
                    info!("Waiting for changes...");
                } else {
                    debug!("No new changes detected.");
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
        let build_projects_time = setup_event.start("build_projects_time");
        let result = build_projects(
            Arc::clone(&self.config),
            Arc::clone(&self.perf_logger),
            setup_event,
            compiler_state,
        )
        .await;
        setup_event.stop(build_projects_time);
        let result = setup_event.time("post_build_projects_time", || match result {
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
        });
        self.config.status_reporter.build_finishes(&result);
        result
    }
}

type AstMap = FnvHashMap<ProjectName, GraphQLAsts>;
type ProgramMap = FnvHashMap<ProjectName, Program>;

pub fn build_raw_programs(
    config: &Config,
    compiler_state: &CompilerState,
    schemas: &FnvHashMap<ProjectName, Arc<SDLSchema>>,
    log_event: &impl PerfLogEvent,
) -> Result<(ProgramMap, AstMap, Vec<BuildProjectError>)> {
    let graphql_asts = log_event.time("parse_sources_time", || {
        GraphQLAsts::from_graphql_sources_map(
            &compiler_state.graphql_sources,
            &compiler_state.get_dirty_definitions(config),
        )
    })?;

    let timer = log_event.start("build_raw_programs");

    let programs: Vec<(ProjectName, _)> = config
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
            let project_name = project_config.name;
            let is_incremental_build = compiler_state.has_processed_changes()
                && !compiler_state.has_breaking_schema_change(project_name)
                && if let Some(base) = project_config.base {
                    !compiler_state.has_breaking_schema_change(base)
                } else {
                    true
                };
            if let Some(schema) = schemas.get(&project_name) {
                (
                    project_config.name,
                    build_raw_program(
                        project_config,
                        &graphql_asts,
                        Arc::clone(schema),
                        log_event,
                        is_incremental_build,
                    ),
                )
            } else {
                (
                    project_name,
                    Err(BuildProjectError::SchemaNotFoundForProject { project_name }),
                )
            }
        })
        .collect();

    let mut errors: Vec<BuildProjectError> = vec![];
    let mut program_map: FnvHashMap<ProjectName, Program> = Default::default();

    for (program_name, program_result) in programs {
        match program_result {
            Ok(program) => {
                program_map.insert(program_name, program);
            }
            Err(error) => {
                errors.push(error);
            }
        };
    }

    log_event.stop(timer);

    Ok((program_map, graphql_asts, errors))
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

    if compiler_state.should_cancel_current_build() {
        debug!("Build is cancelled: new file changes are pending.");
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

    let mut build_cancelled_during_commit = false;
    if errors.is_empty() {
        if compiler_state.should_cancel_current_build() {
            debug!("Build is cancelled: updates in source code/or new file changes are pending.");
            return Err(Error::Cancelled);
        }

        let mut handles: Vec<JoinHandle<std::result::Result<_, BuildProjectFailure>>> = Vec::new();
        for (project_name, schema, programs, artifacts) in results {
            let config = Arc::clone(&config);
            let perf_logger = Arc::clone(&perf_logger);
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

            let source_control_update_status =
                Arc::clone(&compiler_state.source_control_update_status);
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
                        source_control_update_status,
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
                Err(BuildProjectFailure::Error(error)) => {
                    errors.push(error);
                }
                Err(BuildProjectFailure::Cancelled) => {
                    build_cancelled_during_commit = true;
                }
            }
        }
    }

    if errors.is_empty() {
        match build_cancelled_during_commit {
            true => Err(Error::Cancelled),
            false => Ok(()),
        }
    } else {
        Err(Error::BuildProjectsErrors { errors })
    }
}
