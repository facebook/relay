/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::collections::HashSet;
use std::sync::Arc;

use common::Diagnostic;
use common::PerfLogEvent;
use common::PerfLogger;
use common::WithDiagnostics;
use docblock_shared::ResolverSourceHash;
use futures::future::join_all;
use graphql_watchman::WatchmanFileSourceSubscriptionNextChange;
use log::debug;
use log::info;
use rayon::prelude::*;
use tokio::sync::Notify;
use tokio::task;
use tokio::task::JoinHandle;

use crate::artifact_map::ArtifactSourceKey;
use crate::build_project::build_project;
use crate::build_project::commit_project;
use crate::build_project::BuildProjectFailure;
use crate::compiler_state::ArtifactMapKind;
use crate::compiler_state::CompilerState;
use crate::compiler_state::DocblockSources;
use crate::config::Config;
use crate::errors::Error;
use crate::errors::Result;
use crate::file_source::FileSource;
use crate::file_source::FileSourceSubscriptionNextChange;
use crate::file_source::LocatedDocblockSource;
use crate::graphql_asts::GraphQLAsts;
use crate::red_to_green::RedToGreen;
use crate::FileSourceResult;

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
        self.config.status_reporter.build_starts();
        let result: Result<(CompilerState, Vec<Diagnostic>)> = async {
            if let Some(initialize_resources) = &self.config.initialize_resources {
                let timer = setup_event.start("load_resources");
                initialize_resources();
                setup_event.stop(timer);
            }
            let file_source = FileSource::connect(&self.config, &setup_event).await?;
            let mut compiler_state = file_source
                .query(&setup_event, self.perf_logger.as_ref())
                .await?;

            let diagnostics = self
                .build_projects(&mut compiler_state, &setup_event)
                .await?;

            Ok((compiler_state, diagnostics))
        }
        .await;
        setup_event.complete();

        match result {
            Ok((compiler_state, non_fatal_diagnostics)) => {
                self.config
                    .status_reporter
                    .build_completes(&non_fatal_diagnostics);
                Ok(compiler_state)
            }
            Err(error) => {
                self.config.status_reporter.build_errors(&error);
                Err(error)
            }
        }
    }

    pub async fn watch(&self) -> Result<()> {
        'watch: loop {
            let setup_event = self.perf_logger.create_event("compiler_setup");
            self.config.status_reporter.build_starts();
            let result: Result<(CompilerState, Arc<Notify>, JoinHandle<()>)> = async {
                if let Some(initialize_resources) = &self.config.initialize_resources {
                    let timer = setup_event.start("load_resources");
                    initialize_resources();
                    setup_event.stop(timer);
                }
                let file_source = FileSource::connect(&self.config, &setup_event).await?;

                let (compiler_state, mut subscription) = file_source
                    .subscribe(&setup_event, self.perf_logger.as_ref())
                    .await?;

                let pending_file_source_changes =
                    compiler_state.pending_file_source_changes.clone();
                let source_control_update_status =
                    Arc::clone(&compiler_state.source_control_update_status);

                let notify_sender = Arc::new(Notify::new());
                let notify_receiver = notify_sender.clone();

                // First, set up watchman subscription
                let subscription_handle = task::spawn(async move {
                    loop {
                        let next_change = subscription.next_change().await;
                        match next_change {
                            Ok(FileSourceSubscriptionNextChange::Watchman(watchman_next_change)) => {
                                match watchman_next_change {
                                    WatchmanFileSourceSubscriptionNextChange::Result(file_source_changes) => {
                                        pending_file_source_changes
                                            .write()
                                            .unwrap()
                                            .push(FileSourceResult::Watchman(file_source_changes));
                                        notify_sender.notify_one();
                                    }
                                    WatchmanFileSourceSubscriptionNextChange::SourceControlUpdateEnter => {
                                        info!("hg.update started...");
                                        source_control_update_status.mark_as_started();
                                    }
                                    WatchmanFileSourceSubscriptionNextChange::SourceControlUpdateLeave => {
                                        info!("hg.update completed.");
                                        source_control_update_status.set_to_default();
                                    }
                                    WatchmanFileSourceSubscriptionNextChange::SourceControlUpdate => {
                                        info!("hg.update completed. Detected new base revision...");
                                        source_control_update_status.mark_as_completed();
                                        notify_sender.notify_one();
                                        break;
                                    }
                                    WatchmanFileSourceSubscriptionNextChange::None => {}
                                }
                            }
                            Err(err) => {
                                panic!("Watchman subscription error: {}", err);
                            }
                        }
                    }
                });

                Ok((compiler_state, notify_receiver, subscription_handle))

            }
            .await;

            match result {
                Ok((mut compiler_state, notify_receiver, subscription_handle)) => {
                    let mut red_to_green = RedToGreen::new();
                    match self.build_projects(&mut compiler_state, &setup_event).await {
                        Ok(diagnostics) => {
                            self.config.status_reporter.build_completes(&diagnostics);
                        }
                        Err(err) => {
                            red_to_green.log_error();
                            self.config.status_reporter.build_errors(&err);
                        }
                    };

                    setup_event.complete();
                    info!("Watching for new changes...");

                    self.incremental_build_loop(
                        compiler_state,
                        notify_receiver,
                        &subscription_handle,
                    )
                    .await;
                }
                Err(err) => {
                    self.config.status_reporter.build_errors(&err);
                    break 'watch Err(err);
                }
            }
        }
    }

    async fn incremental_build_loop(
        &self,
        mut compiler_state: CompilerState,
        notify_receiver: Arc<Notify>,
        subscription_handle: &JoinHandle<()>,
    ) {
        let mut red_to_green = RedToGreen::new();

        loop {
            notify_receiver.notified().await;

            if compiler_state.source_control_update_status.is_started() {
                continue;
            }

            if compiler_state.source_control_update_status.is_completed() {
                subscription_handle.abort();
                return;
            }

            // Single change to file sometimes produces 2 watchman change events for the same file
            // wait for 50ms in case there is a subsequent request
            tokio::time::sleep(std::time::Duration::from_millis(50)).await;

            if compiler_state.has_pending_file_source_changes() {
                let incremental_build_event =
                    self.perf_logger.create_event("incremental_build_event");
                let incremental_build_time =
                    incremental_build_event.start("incremental_build_time");

                let had_new_changes = match compiler_state.merge_file_source_changes(
                    &self.config,
                    self.perf_logger.as_ref(),
                    false,
                ) {
                    Ok(b) => b,
                    Err(err) => {
                        let error_event = self.perf_logger.create_event("watch_build_error");
                        error_event.string("error", format!("Ignored Compilation Error: {}", err));
                        error_event.complete();
                        return;
                    }
                };

                if had_new_changes {
                    self.config.status_reporter.build_starts();
                    info!("Change detected, start compiling...");

                    match self
                        .build_projects(&mut compiler_state, &incremental_build_event)
                        .await
                    {
                        Ok(diagnostics) => {
                            self.config.status_reporter.build_completes(&diagnostics);
                            red_to_green.clear_error_and_log(self.perf_logger.as_ref());
                        }
                        Err(err) => {
                            red_to_green.log_error();
                            self.config.status_reporter.build_errors(&err);
                        }
                    }

                    incremental_build_event.stop(incremental_build_time);
                    info!("Watching for new changes...");
                } else {
                    debug!("No new changes detected.");
                    incremental_build_event.stop(incremental_build_time);
                }
                incremental_build_event.complete();
            }
        }
    }

    async fn build_projects(
        &self,
        compiler_state: &mut CompilerState,
        setup_event: &impl PerfLogEvent,
    ) -> Result<Vec<Diagnostic>> {
        let build_projects_time = setup_event.start("build_projects_time");
        let result = build_projects(
            Arc::clone(&self.config),
            Arc::clone(&self.perf_logger),
            setup_event,
            compiler_state,
        )
        .await;
        setup_event.stop(build_projects_time);
        setup_event.time("post_build_projects_time", || {
            result.and_then(|diagnostics| {
                compiler_state.complete_compilation();
                self.config.artifact_writer.finalize()?;
                if let Some(post_artifacts_write) = &self.config.post_artifacts_write {
                    post_artifacts_write(&self.config)
                        .map_err(|error| Error::PostArtifactsError { error })?;
                }

                Ok(diagnostics)
            })
        })
    }
}

async fn build_projects<TPerfLogger: PerfLogger + 'static>(
    config: Arc<Config>,
    perf_logger: Arc<TPerfLogger>,
    setup_event: &impl PerfLogEvent,
    compiler_state: &mut CompilerState,
) -> Result<Vec<Diagnostic>> {
    let dirty_artifact_sources = compiler_state.get_dirty_artifact_sources(&config);
    let mut graphql_asts = setup_event.time("parse_sources_time", || {
        GraphQLAsts::from_graphql_sources_map(
            &compiler_state.graphql_sources,
            &dirty_artifact_sources,
            &config,
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

    if !errors.is_empty() {
        return Err(Error::BuildProjectsErrors { errors });
    }

    if compiler_state.should_cancel_current_build() {
        debug!("Build is cancelled: updates in source code/or new file changes are pending.");
        return Err(Error::Cancelled);
    }

    let mut handles: Vec<JoinHandle<std::result::Result<_, BuildProjectFailure>>> = Vec::new();
    for WithDiagnostics {
        item: (project_name, schema, programs, artifacts),
        diagnostics,
    } in results
    {
        let config = Arc::clone(&config);
        let perf_logger = Arc::clone(&perf_logger);
        let artifact_map = compiler_state
            .artifacts
            .get(&project_name)
            .cloned()
            .unwrap_or_else(|| Arc::new(ArtifactMapKind::Unconnected(Default::default())));
        let mut removed_artifact_sources = graphql_asts
            .remove(&project_name)
            .expect("Expect GraphQLAsts to exist.")
            .removed_definition_names;

        let removed_docblock_artifact_sources =
            get_removed_docblock_artifact_source_keys(compiler_state.docblocks.get(&project_name));

        removed_artifact_sources.extend(removed_docblock_artifact_sources);

        let dirty_artifact_paths = compiler_state
            .dirty_artifact_paths
            .get(&project_name)
            .cloned()
            .unwrap_or_default();

        let source_control_update_status = Arc::clone(&compiler_state.source_control_update_status);
        handles.push(task::spawn(async move {
            let project_config = &config.projects[&project_name];
            Ok((
                (
                    project_name,
                    commit_project(
                        &config,
                        project_config,
                        perf_logger,
                        &schema,
                        programs,
                        artifacts,
                        artifact_map,
                        removed_artifact_sources,
                        dirty_artifact_paths,
                        source_control_update_status,
                    )
                    .await?,
                    schema,
                ),
                diagnostics,
            ))
        }));
    }

    let mut build_cancelled_during_commit = false;
    let mut all_diagnostics: Vec<Diagnostic> = Vec::new();
    for commit_result in join_all(handles).await {
        let commit_result: std::result::Result<std::result::Result<_, _>, _> = commit_result;
        let mut inner_result = commit_result.map_err(|e| Error::JoinError {
            error: e.to_string(),
        })?;
        match inner_result {
            Ok(((project_name, next_artifact_map, schema), ref mut diagnostics)) => {
                let next_artifact_map = Arc::new(ArtifactMapKind::Mapping(next_artifact_map));
                compiler_state
                    .artifacts
                    .insert(project_name, next_artifact_map);
                compiler_state.schema_cache.insert(project_name, schema);

                all_diagnostics.append(diagnostics);
            }
            Err(BuildProjectFailure::Error(error)) => {
                errors.push(error);
            }
            Err(BuildProjectFailure::Cancelled) => {
                build_cancelled_during_commit = true;
            }
        }
    }

    if !errors.is_empty() {
        return Err(Error::BuildProjectsErrors { errors });
    }

    if build_cancelled_during_commit {
        return Err(Error::Cancelled);
    }

    Ok(all_diagnostics)
}

/// Get the list of removed docblock sources.
fn get_removed_docblock_artifact_source_keys(
    docblock_sources: Option<&DocblockSources>,
) -> Vec<ArtifactSourceKey> {
    let mut removed_docblocks: Vec<ArtifactSourceKey> = vec![];

    if let Some(docblock_sources) = docblock_sources {
        for (file_name, pending_docblock_sources_for_file) in docblock_sources.pending.iter() {
            let mut docblocks_in_file = HashSet::new();

            for LocatedDocblockSource {
                docblock_source, ..
            } in pending_docblock_sources_for_file
            {
                docblocks_in_file.insert(&docblock_source.text_source().text);
            }

            if let Some(processed) = docblock_sources.processed.get(file_name) {
                for LocatedDocblockSource {
                    docblock_source, ..
                } in processed
                {
                    // If new content of the file doesn't contain the docblock, we should remove
                    // the generated artifacts for this docblock.
                    if !docblocks_in_file.contains(&docblock_source.text_source().text) {
                        removed_docblocks.push(ArtifactSourceKey::ResolverHash(
                            ResolverSourceHash::new(&docblock_source.text_source().text),
                        ));
                    }
                }
            }
        }

        removed_docblocks
    } else {
        vec![]
    }
}
