/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::{Arc, RwLock};

use common::{PerfLogEvent, PerfLogger};
use crossbeam::Sender;
use dashmap::mapref::entry::Entry;
use fnv::FnvHashMap;
use log::{debug, info};
use lsp_server::Message;
use rayon::iter::ParallelIterator;
use relay_compiler::{
    build_raw_program, build_schema, compiler_state::CompilerState, compiler_state::SourceSetName,
    config::Config, config::ProjectConfig, errors::BuildProjectError, errors::Error,
    transform_program, validate_program, BuildProjectFailure, FileSource, FileSourceResult,
    FileSourceSubscription, FileSourceSubscriptionNextChange, GraphQLAsts,
    SourceControlUpdateStatus,
};
use schema::SDLSchema;
use tokio::{sync::Notify, task, task::JoinHandle};

use crate::{
    diagnostic_reporter::DiagnosticReporter,
    lsp::set_ready_status,
    lsp::update_in_progress_status,
    lsp_process_error::{LSPProcessError, LSPProcessResult},
};

use super::lsp_state::{Schemas, SourcePrograms};

/// This structure is responsible for keeping schemas/programs in sync with the current state of the world
pub(crate) struct LSPStateResources<TPerfLogger: PerfLogger + 'static> {
    config: Arc<Config>,
    perf_logger: Arc<TPerfLogger>,
    schemas: Schemas,
    source_programs: SourcePrograms,
    errors: Arc<RwLock<Vec<String>>>,
    notify_sender: Arc<Notify>,
    notify_receiver: Arc<Notify>,
    sender: Sender<Message>,
    diagnostic_reporter: Arc<DiagnosticReporter>,
}

impl<TPerfLogger: PerfLogger + 'static> LSPStateResources<TPerfLogger> {
    pub(crate) fn new(
        config: Arc<Config>,
        perf_logger: Arc<TPerfLogger>,
        schemas: Schemas,
        source_programs: SourcePrograms,
        sender: Sender<Message>,
        diagnostic_reporter: Arc<DiagnosticReporter>,
    ) -> Self {
        let notify_sender = Arc::new(Notify::new());
        let notify_receiver = notify_sender.clone();

        Self {
            config,
            perf_logger,
            schemas,
            source_programs,
            errors: Default::default(),
            sender,
            notify_sender,
            notify_receiver,
            diagnostic_reporter,
        }
    }

    /// Create an end-less loop of keeping the resources up-to-date with the source control changes
    pub(crate) async fn watch(&self) -> LSPProcessResult<()> {
        'outer: loop {
            info!("Initializing resources for LSP server");

            update_in_progress_status(
                "Relay: watchman...",
                Some("Sending watchman query to get source files and possible saved state"),
                &self.sender,
            );
            let setup_event = self
                .perf_logger
                .create_event("lsp_state_initialize_resources");
            let timer = setup_event.start("lsp_state_initialize_resources_time");

            let file_source = FileSource::connect(&self.config, &setup_event)
                .await
                .map_err(LSPProcessError::CompilerError)?;
            let (mut compiler_state, file_source_subscription) = file_source
                .subscribe(&setup_event, self.perf_logger.as_ref())
                .await
                .map_err(LSPProcessError::CompilerError)?;

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
                &self.sender,
            );

            self.diagnostic_reporter.clear_regular_diagnostics();

            // Run initial build, before entering the watch changes loop
            if let Err(err) = self.build_projects(&mut compiler_state, &setup_event) {
                self.report_error(err);
            }

            setup_event.stop(timer);
            self.perf_logger.complete_event(setup_event);

            self.publish_errors("lsp_state_error");
            set_ready_status(&self.sender);

            info!("LSP server initialization completed!");

            // Here we will wait for changes from watchman
            'inner: loop {
                self.notify_receiver.notified().await;

                // Source control update started, we can ignore all pending changes, and wait for it to complete,
                // we may change the status bar to `Source Control Update...`
                if compiler_state.source_control_update_status.is_started() {
                    update_in_progress_status(
                        "Relay: hg update...",
                        Some("Waiting for source control update"),
                        &self.sender,
                    );
                    continue 'inner;
                }

                // SC Update completed, we need to abort current subscription, and re-initialize resource for LSP
                if compiler_state.source_control_update_status.is_completed() {
                    debug!("Watchman indicated the the source control update has completed!");
                    subscription_handle.abort();
                    continue 'outer;
                }

                let log_event = self.perf_logger.create_event("lsp_state_watchman_event");
                let log_time = log_event.start("lsp_state_watchman_event_time");

                if let Err(error) = self.incremental_build(&mut compiler_state, &log_event) {
                    self.report_error(error);
                }

                log_event.stop(log_time);
                self.perf_logger.complete_event(log_event);
                self.perf_logger.flush();

                self.publish_errors("lsp_state_user_error");

                set_ready_status(&self.sender);
            }
        }
    }

    fn incremental_build(
        &self,
        compiler_state: &mut CompilerState,
        log_event: &impl PerfLogEvent,
    ) -> Result<(), Error> {
        let has_new_changes = compiler_state.merge_file_source_changes(
            &self.config,
            log_event,
            self.perf_logger.as_ref(),
            false,
        )?;

        // If changes contains schema files we need to rebuild schemas
        if has_new_changes {
            info!("LSP server detected changes...");

            self.diagnostic_reporter.clear_regular_diagnostics();

            update_in_progress_status(
                "Relay: checking...",
                Some("Validating changes, and updating source programs with the latest changes."),
                &self.sender,
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
                &compiler_state.get_dirty_definitions(&self.config),
            )
        })?;

        if compiler_state.should_cancel_current_build() {
            debug!("Build is cancelled: new file changes are pending.");
            return Err(Error::Cancelled);
        }

        // When the source programs is empty, we need to compile all source programs once
        let compile_everything = self.source_programs.is_empty();

        let timer = log_event.start("build_lsp_projects");
        let build_results: Vec<_> = self
            .config
            .par_enabled_projects()
            .filter(|project_config| {
                if compile_everything {
                    return true;
                }
                if let Some(base) = project_config.base {
                    if compiler_state.project_has_pending_changes(base) {
                        return true;
                    }
                }
                compiler_state.project_has_pending_changes(project_config.name)
            })
            .map(|project_config| {
                self.build_project(
                    project_config,
                    compiler_state,
                    &graphql_asts,
                    compile_everything,
                )
            })
            .collect();
        log_event.stop(timer);

        let mut errors = vec![];
        for build_result in build_results {
            if let Err(BuildProjectFailure::Error(err)) = build_result {
                errors.push(err);
            }
        }
        if errors.is_empty() {
            compiler_state.complete_compilation();
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
        compile_everything: bool,
    ) -> Result<(), BuildProjectFailure> {
        let log_event = self.perf_logger.create_event("build_lsp_project");
        let project_name = project_config.name;
        let build_time = log_event.start("build_lsp_project_time");
        log_event.string("project", project_name.to_string());

        let schema = log_event.time("build_schema_time", || {
            self.build_schema(compiler_state, project_config)
        })?;

        let is_incremental_build = !compile_everything
            && compiler_state.has_processed_changes()
            && !compiler_state.has_breaking_schema_change(project_name)
            && if let Some(base) = project_config.base {
                !compiler_state.has_breaking_schema_change(base)
            } else {
                true
            };
        self.build_programs(
            project_config,
            compiler_state,
            graphql_asts,
            schema,
            &log_event,
            is_incremental_build,
        )?;

        log_event.stop(build_time);
        Ok(())
    }

    fn build_schema(
        &self,
        compiler_state: &CompilerState,
        project_config: &ProjectConfig,
    ) -> Result<Arc<SDLSchema>, BuildProjectFailure> {
        match self.schemas.get(&project_config.name) {
            Some(schema)
                if !compiler_state.project_has_pending_schema_changes(project_config.name) =>
            {
                Ok(Arc::clone(&schema))
            }
            _ => {
                let schema = build_schema(compiler_state, project_config).map_err(|errors| {
                    BuildProjectFailure::Error(BuildProjectError::ValidationErrors { errors })
                })?;
                self.schemas
                    .insert(project_config.name, Arc::clone(&schema));
                Ok(schema)
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
        is_incremental_build: bool,
    ) -> Result<(), BuildProjectFailure> {
        let (base_program, base_fragment_names, _) = build_raw_program(
            project_config,
            graphql_asts,
            schema,
            log_event,
            is_incremental_build,
        )?;

        if compiler_state.should_cancel_current_build() {
            debug!("Build is cancelled: updates in source code/or new file changes are pending.");
            return Err(BuildProjectFailure::Cancelled);
        }

        match self.source_programs.entry(project_config.name) {
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

        validate_program(&self.config, &base_program, log_event)?;

        transform_program(
            &self.config,
            project_config,
            Arc::new(base_program),
            Arc::new(base_fragment_names),
            Arc::clone(&self.perf_logger),
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
        let notify_sender = self.notify_sender.clone();
        task::spawn(async move {
            loop {
                match file_source_subscription.next_change().await {
                    Err(_) => {
                        // do nothing? compiler should panic, and restart the lsp
                    }
                    Ok(FileSourceSubscriptionNextChange::None) => {}
                    Ok(FileSourceSubscriptionNextChange::SourceControlUpdateEnter) => {
                        source_code_update_status.mark_as_started();
                    }
                    Ok(FileSourceSubscriptionNextChange::SourceControlUpdateLeave) => {
                        source_code_update_status.set_to_default();
                    }
                    Ok(FileSourceSubscriptionNextChange::SourceControlUpdate) => {
                        source_code_update_status.mark_as_completed();
                        notify_sender.notify_one();
                        break;
                    }
                    Ok(FileSourceSubscriptionNextChange::Result(file_source_changes)) => {
                        pending_file_source_changes
                            .write()
                            .expect("LSPState::watch_and_update_schemas: expect to acquire write lock on pending_file_source_changes")
                            .push(file_source_changes);

                        notify_sender.notify_one();
                    }
                }
            }
        })
    }

    fn report_error(&self, error: Error) {
        self.diagnostic_reporter.report_error(&error);
        self.errors.write().unwrap().push(error.to_string());
    }

    fn log_errors(&self, log_event_name: &str) {
        if let Ok(read_lock) = self.errors.try_read() {
            if !read_lock.is_empty() {
                let error_message = read_lock
                    .iter()
                    .map(|err| format!("{:?}", err))
                    .collect::<Vec<String>>()
                    .join("\n");
                let error_event = self.perf_logger.create_event(log_event_name);
                error_event.string("error", error_message);
                self.perf_logger.complete_event(error_event);
                self.perf_logger.flush();
            }
        }
    }

    fn clear_errors(&self) {
        if let Ok(mut write_lock) = self.errors.try_write() {
            write_lock.clear();
        }
    }

    /// This method, will log errors (if there were errors)
    /// and report the diagnostics to IDE
    fn publish_errors(&self, log_event_name: &str) {
        self.log_errors(log_event_name);
        self.clear_errors();
        self.diagnostic_reporter.commit_diagnostics();
    }
}
