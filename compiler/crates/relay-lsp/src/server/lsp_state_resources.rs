/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::{Arc, RwLock};

use common::{FeatureFlags, PerfLogEvent, PerfLogger};
use dashmap::mapref::entry::Entry;
use fnv::FnvHashMap;
use graphql_watchman::WatchmanFileSourceSubscriptionNextChange;
use intern::string_key::StringKey;
use log::debug;
use rayon::iter::ParallelIterator;
use relay_compiler::{
    build_raw_program, build_schema, compiler_state::CompilerState, compiler_state::SourceSetName,
    config::ProjectConfig, errors::BuildProjectError, errors::Error, transform_program,
    validate_program, BuildProjectFailure, FileSource, FileSourceResult, FileSourceSubscription,
    FileSourceSubscriptionNextChange, GraphQLAsts, SourceControlUpdateStatus,
};
use schema::SDLSchema;
use schema_documentation::SchemaDocumentation;
use tokio::{task, task::JoinHandle};

use crate::{
    status_updater::set_ready_status, status_updater::update_in_progress_status, LSPState,
};

use super::lsp_state::{ProjectStatus, Task};

/// This structure is responsible for keeping schemas/programs in sync with the current state of the world
pub(crate) struct LSPStateResources<
    TPerfLogger: PerfLogger + 'static,
    TSchemaDocumentation: SchemaDocumentation + 'static,
> {
    lsp_state: Arc<LSPState<TPerfLogger, TSchemaDocumentation>>,
}

impl<TPerfLogger: PerfLogger + 'static, TSchemaDocumentation: SchemaDocumentation + 'static>
    LSPStateResources<TPerfLogger, TSchemaDocumentation>
{
    pub(crate) fn new(lsp_state: Arc<LSPState<TPerfLogger, TSchemaDocumentation>>) -> Self {
        Self { lsp_state }
    }

    pub(crate) fn watch(self) {
        tokio::spawn(async move {
            self.internal_watch().await;
        });
    }

    /// Create an end-less loop of keeping the resources up-to-date with the source control changes
    async fn internal_watch(&self) {
        'outer: loop {
            debug!("Initializing resources for LSP server");

            update_in_progress_status(
                "Relay: watchman...",
                Some("Sending watchman query to get source files and possible saved state"),
                &self.lsp_state.sender,
            );
            let setup_event = self
                .lsp_state
                .perf_logger
                .create_event("lsp_state_initialize_resources");
            let timer = setup_event.start("lsp_state_initialize_resources_time");

            let file_source = match FileSource::connect(&self.lsp_state.config, &setup_event).await
            {
                Ok(f) => f,
                Err(error) => {
                    self.log_errors("watch_build_error", &error);
                    continue;
                }
            };
            let (mut compiler_state, file_source_subscription) = match file_source
                .subscribe(&setup_event, self.lsp_state.perf_logger.as_ref())
                .await
            {
                Ok(f) => f,
                Err(error) => {
                    self.log_errors("watch_build_error", &error);
                    continue;
                }
            };

            let pending_file_source_changes =
                Arc::clone(&compiler_state.pending_file_source_changes);

            // Start a separate task to receive watchman subscription updates
            // this process will notify, when the change is detected.
            // If watchman detects the source control update, it will update the state
            // of the source_control_update_status, so we can cancel building schemas/
            // and programs earlier
            let subscription_handle = self.watchman_subscription_handler(
                file_source_subscription,
                pending_file_source_changes,
                Arc::clone(&compiler_state.source_control_update_status),
            );
            update_in_progress_status(
                "Relay: creating state...",
                Some("Building schemas and source programs for LSP"),
                &self.lsp_state.sender,
            );

            self.lsp_state
                .diagnostic_reporter
                .clear_regular_diagnostics();

            // Run initial build, before entering the watch changes loop
            if let Err(error) = self.build_projects(&mut compiler_state, &setup_event) {
                self.publish_errors(&error, "lsp_state_error");
            }
            set_ready_status(&self.lsp_state.sender);

            setup_event.stop(timer);
            setup_event.complete();

            debug!("LSP server initialization completed!");

            // Here we will wait for changes from watchman
            'inner: loop {
                self.lsp_state.notify_lsp_state_resources.notified().await;

                // Source control update started, we can ignore all pending changes, and wait for it to complete,
                // we may change the status bar to `Source Control Update...`
                if compiler_state.source_control_update_status.is_started() {
                    update_in_progress_status(
                        "Relay: hg update...",
                        Some("Waiting for source control update"),
                        &self.lsp_state.sender,
                    );
                    continue 'inner;
                }

                // SC Update completed, we need to abort current subscription, and re-initialize resource for LSP
                if compiler_state.source_control_update_status.is_completed() {
                    debug!("Watchman indicated the the source control update has completed!");
                    subscription_handle.abort();
                    continue 'outer;
                }

                let log_event = self
                    .lsp_state
                    .perf_logger
                    .create_event("lsp_state_watchman_event");
                let log_time = log_event.start("lsp_state_watchman_event_time");

                if let Err(error) = self.incremental_build(&mut compiler_state, &log_event) {
                    self.publish_errors(&error, "lsp_state_user_error");
                }
                set_ready_status(&self.lsp_state.sender);

                log_event.stop(log_time);
                log_event.complete();
            }
        }
    }

    fn incremental_build(
        &self,
        compiler_state: &mut CompilerState,
        log_event: &impl PerfLogEvent,
    ) -> Result<(), Error> {
        let has_new_changes = compiler_state.merge_file_source_changes(
            &self.lsp_state.config,
            self.lsp_state.perf_logger.as_ref(),
            false,
        )?;

        // Rebuild if there are pending files or if a new project is activated
        if has_new_changes
            || self
                .lsp_state
                .project_status
                .iter()
                .any(|r| r.value() == &ProjectStatus::Activated)
        {
            debug!("LSP server detected changes...");

            self.lsp_state
                .diagnostic_reporter
                .clear_regular_diagnostics();

            update_in_progress_status(
                "Relay: checking...",
                Some("Validating changes, and updating source programs with the latest changes."),
                &self.lsp_state.sender,
            );

            self.build_projects(compiler_state, log_event)?;
        }

        Ok(())
    }

    fn build_projects(
        &self,
        compiler_state: &mut CompilerState,
        log_event: &impl PerfLogEvent,
    ) -> Result<(), Error> {
        let graphql_asts = log_event.time("parse_sources_time", || {
            GraphQLAsts::from_graphql_sources_map(
                &compiler_state.graphql_sources,
                &compiler_state.get_dirty_definitions(&self.lsp_state.config),
            )
        })?;

        if compiler_state.should_cancel_current_build() {
            debug!("Build is cancelled: new file changes are pending.");
            return Err(Error::Cancelled);
        }

        let timer = log_event.start("build_lsp_projects");
        let build_results: Vec<_> = self
            .lsp_state
            .config
            .par_enabled_projects()
            .filter(|project_config| {
                // Filter inactive projects
                if !self
                    .lsp_state
                    .project_status
                    .contains_key(&project_config.name)
                {
                    return false;
                }
                // When the source programs is empty, we need to compile all source programs once
                if !self
                    .lsp_state
                    .source_programs
                    .contains_key(&project_config.name)
                {
                    return true;
                }
                if let Some(base) = project_config.base {
                    if compiler_state.project_has_pending_changes(base) {
                        return true;
                    }
                }
                compiler_state.project_has_pending_changes(project_config.name)
            })
            .map(|project_config| self.build_project(project_config, compiler_state, &graphql_asts))
            .collect();
        log_event.stop(timer);

        let mut errors = vec![];
        for build_result in build_results {
            match build_result {
                Err(BuildProjectFailure::Error(err)) => {
                    errors.push(err);
                }
                Ok(project_name) => {
                    compiler_state.complete_project_compilation(&project_name);
                }
                _ => {}
            }
        }
        if errors.is_empty() {
            Ok(())
        } else {
            Err(Error::BuildProjectsErrors { errors })
        }
    }

    fn build_project(
        &self,
        project_config: &ProjectConfig,
        compiler_state: &CompilerState,
        graphql_asts: &FnvHashMap<SourceSetName, GraphQLAsts>,
    ) -> Result<StringKey, BuildProjectFailure> {
        self.lsp_state
            .project_status
            .insert(project_config.name, ProjectStatus::Completed);
        let log_event = self.lsp_state.perf_logger.create_event("build_lsp_project");
        let project_name = project_config.name;
        let build_time = log_event.start("build_lsp_project_time");
        log_event.string("project", project_name.to_string());

        let schema = log_event.time("build_schema_time", || {
            self.build_schema(compiler_state, project_config)
        })?;

        // This will kick-off the validation for all synced sources
        self.lsp_state.schedule_task(Task::ValidateSyncedSources);

        self.build_programs(
            project_config,
            compiler_state,
            graphql_asts,
            schema,
            &log_event,
        )?;

        log_event.stop(build_time);
        Ok(project_name)
    }

    fn build_schema(
        &self,
        compiler_state: &CompilerState,
        project_config: &ProjectConfig,
    ) -> Result<Arc<SDLSchema>, BuildProjectFailure> {
        match self.lsp_state.schemas.entry(project_config.name) {
            Entry::Vacant(e) => {
                let schema = build_schema(compiler_state, project_config).map_err(|errors| {
                    BuildProjectFailure::Error(BuildProjectError::ValidationErrors { errors })
                })?;
                e.insert(Arc::clone(&schema));
                Ok(schema)
            }
            Entry::Occupied(mut e) => {
                if !compiler_state.project_has_pending_schema_changes(project_config.name) {
                    Ok(Arc::clone(e.get()))
                } else {
                    let schema =
                        build_schema(compiler_state, project_config).map_err(|errors| {
                            debug!("build error");
                            BuildProjectFailure::Error(BuildProjectError::ValidationErrors {
                                errors,
                            })
                        })?;
                    e.insert(Arc::clone(&schema));
                    Ok(schema)
                }
            }
        }
    }

    fn build_programs(
        &self,
        project_config: &ProjectConfig,
        compiler_state: &CompilerState,
        graphql_asts: &FnvHashMap<SourceSetName, GraphQLAsts>,
        schema: Arc<SDLSchema>,
        log_event: &impl PerfLogEvent,
    ) -> Result<(), BuildProjectFailure> {
        let is_incremental_build = self
            .lsp_state
            .source_programs
            .contains_key(&project_config.name)
            && compiler_state.has_processed_changes()
            && !compiler_state.has_breaking_schema_change(project_config.name)
            && if let Some(base) = project_config.base {
                !compiler_state.has_breaking_schema_change(base)
            } else {
                true
            };

        let (base_program, base_fragment_names, _) = build_raw_program(
            project_config,
            &compiler_state.implicit_dependencies.read().unwrap(),
            graphql_asts,
            schema,
            log_event,
            is_incremental_build,
        )?;

        if compiler_state.should_cancel_current_build() {
            debug!("Build is cancelled: updates in source code/or new file changes are pending.");
            return Err(BuildProjectFailure::Cancelled);
        }

        match self.lsp_state.source_programs.entry(project_config.name) {
            Entry::Vacant(e) => {
                e.insert(base_program.clone());
            }
            Entry::Occupied(mut e) => {
                let program = e.get_mut();
                let removed_definition_names = graphql_asts
                    .get(&project_config.name)
                    .map(|ast| ast.removed_definition_names.as_ref());
                program.merge_program(&base_program, removed_definition_names);
            }
        }

        validate_program(
            &self.lsp_state.config,
            &FeatureFlags::default(),
            &base_program,
            log_event,
        )?;

        transform_program(
            &self.lsp_state.config,
            project_config,
            Arc::new(base_program),
            Arc::new(base_fragment_names),
            Arc::clone(&self.lsp_state.perf_logger),
            log_event,
        )?;
        Ok(())
    }

    fn watchman_subscription_handler(
        &self,
        mut file_source_subscription: FileSourceSubscription,
        pending_file_source_changes: Arc<RwLock<Vec<FileSourceResult>>>,
        source_code_update_status: Arc<SourceControlUpdateStatus>,
    ) -> JoinHandle<()> {
        let notify_sender = self.lsp_state.notify_lsp_state_resources.clone();
        task::spawn(async move {
            loop {
                match file_source_subscription.next_change().await {
                    Err(_) => {
                        // do nothing? compiler should panic, and restart the lsp
                    }
                    Ok(FileSourceSubscriptionNextChange::Watchman(watchman_next_change)) => {
                        match watchman_next_change {
                            WatchmanFileSourceSubscriptionNextChange::None => {}
                            WatchmanFileSourceSubscriptionNextChange::SourceControlUpdateEnter => {
                                source_code_update_status.mark_as_started();
                            }
                            WatchmanFileSourceSubscriptionNextChange::SourceControlUpdateLeave => {
                                source_code_update_status.set_to_default();
                            }
                            WatchmanFileSourceSubscriptionNextChange::SourceControlUpdate => {
                                source_code_update_status.mark_as_completed();
                                notify_sender.notify_one();
                                break;
                            }
                            WatchmanFileSourceSubscriptionNextChange::Result(
                                file_source_changes,
                            ) => {
                                pending_file_source_changes
                                .write()
                                .expect("LSPState::watch_and_update_schemas: expect to acquire write lock on pending_file_source_changes")
                                .push(FileSourceResult::Watchman(file_source_changes));

                                notify_sender.notify_one();
                            }
                        }
                    }
                }
            }
        })
    }

    fn log_errors(&self, log_event_name: &'static str, error: &Error) {
        let error_event = self.lsp_state.perf_logger.create_event(log_event_name);
        error_event.string("error", error.to_string());
        error_event.complete();
    }

    /// Log errors and report the diagnostics to IDE
    fn publish_errors(&self, error: &Error, log_event_name: &'static str) {
        self.lsp_state.diagnostic_reporter.report_error(error);
        self.lsp_state.diagnostic_reporter.commit_diagnostics();
        self.log_errors(log_event_name, error)
    }
}
