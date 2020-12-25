/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::{
    lsp_process_error::{LSPProcessError, LSPProcessResult},
    lsp_runtime_error::LSPRuntimeResult,
    node_resolution_info::{get_node_resolution_info, NodeResolutionInfo},
    utils::extract_executable_document_from_text,
};
use common::{PerfLogEvent, PerfLogger, Span};
use graphql_ir::Program;
use graphql_syntax::{ExecutableDocument, GraphQLSource};
use interner::StringKey;
use lsp_types::{TextDocumentPositionParams, Url};
use relay_compiler::{
    compiler::Compiler, compiler_state::CompilerState, config::Config, FileCategorizer, FileSource,
    FileSourceSubscription,
};
use schema::Schema;
use std::fmt;
use std::{
    collections::{HashMap, HashSet},
    path::PathBuf,
    sync::{Arc, RwLock},
};
#[derive(Debug)]
pub enum LSPStateError {
    BuildSchemaError,
    /// For the initial build, if we have validation errors in the program -
    /// we won't be able to create a correct state
    InitialBuildError,
    /// But for the `watch` mode - it may break, only there were infra errors (IO, De/Serialization).
    /// IR, GraphQL validation errors won't be reported here.
    WatchBuildError,
}

impl fmt::Display for LSPStateError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "{}",
            match self {
                LSPStateError::BuildSchemaError =>
                    "Unable to parse/create an instance of the GraphQL Schema for Relay LSP Server State.",
                LSPStateError::InitialBuildError =>
                    "Validation errors in documents. Please, fix the errors reported in the diagnostics panel.",
                LSPStateError::WatchBuildError =>
                    "Incremental changes broke the internal Relay LSP Server State. This is probably a transient issue; try restarting the Relay VSCode extension.",
            }
        )
    }
}

pub trait LSPExtraDataProvider {
    fn fetch_query_stats(&self, search_token: String) -> Vec<String>;
    fn resolve_field_definition(
        &self,
        project_name: String,
        root_dir: &PathBuf,
        parent_type: String,
        field_name: Option<String>,
    ) -> Option<Result<(String, u64), String>>;
}

pub(crate) struct LSPState<TPerfLogger: PerfLogger + 'static> {
    config: Arc<Config>,
    compiler: Option<Compiler<TPerfLogger>>,
    root_dir: PathBuf,
    pub extra_data_provider: Box<dyn LSPExtraDataProvider>,
    file_categorizer: FileCategorizer,
    schemas: Arc<RwLock<HashMap<StringKey, Arc<Schema>>>>,
    source_programs: Arc<RwLock<HashMap<StringKey, Program>>>,
    synced_graphql_documents: HashMap<Url, Vec<GraphQLSource>>,
    errors: Arc<RwLock<Vec<LSPStateError>>>,
}

impl<TPerfLogger: PerfLogger + 'static> LSPState<TPerfLogger> {
    /// Private constructor
    fn new(
        config: Arc<Config>,
        extra_data_provider: Box<dyn LSPExtraDataProvider>,
        lsp_state_errors: Arc<RwLock<Vec<LSPStateError>>>,
    ) -> Self {
        let file_categorizer = FileCategorizer::from_config(&config);
        let root_dir = &config.root_dir.clone();
        Self {
            config,
            compiler: None,
            extra_data_provider,
            file_categorizer,
            root_dir: root_dir.clone(),
            schemas: Default::default(),
            source_programs: Default::default(),
            synced_graphql_documents: Default::default(),
            errors: lsp_state_errors,
        }
    }

    /// This method is responsible for creating schema/source_programs for LSP internal state
    /// - so the LSP can provide these to Hover/Completion/GoToDefinition requests.
    /// It also creates a watchman subscription that is responsible for keeping these resources up-to-date.
    pub(crate) async fn create_state(
        config: Arc<Config>,
        lsp_state_errors: Arc<RwLock<Vec<LSPStateError>>>,
        extra_data_provider: Box<dyn LSPExtraDataProvider>,
        perf_logger: Arc<TPerfLogger>,
    ) -> LSPProcessResult<Self> {
        let mut lsp_state = Self::new(config, extra_data_provider, lsp_state_errors);

        let setup_event = perf_logger.create_event("lsp_state_initialize_resources");
        let log_time = setup_event.start("lsp_state_initialize_resources_time");

        let file_source = FileSource::connect(&lsp_state.config, &setup_event)
            .await
            .map_err(LSPProcessError::CompilerError)?;
        let (mut compiler_state, file_source_subscription) = file_source
            .subscribe(&setup_event, perf_logger.as_ref())
            .await
            .map_err(LSPProcessError::CompilerError)?;

        lsp_state.initial_build(&mut compiler_state, &setup_event, Arc::clone(&perf_logger))?;

        // Finally, start a dedicated watchman subscription, just for LSP to update schemas/programs in lsp_state
        lsp_state.watch_and_update_schemas(
            compiler_state,
            file_source_subscription,
            Arc::clone(&perf_logger),
        );

        // This is an instance of a regular Relay compiler that we will run in
        // watch mode in a separate future (it will report errors)
        setup_event.stop(log_time);
        perf_logger.complete_event(setup_event);
        perf_logger.flush();

        lsp_state.compiler = Some(Compiler::new(Arc::clone(&lsp_state.config), perf_logger));

        Ok(lsp_state)
    }

    fn watch_and_update_schemas(
        &mut self,
        mut compiler_state: CompilerState,
        mut subscription: FileSourceSubscription,
        perf_logger: Arc<TPerfLogger>,
    ) {
        let config = Arc::clone(&self.config);
        let compiler = Compiler::new(Arc::clone(&config), Arc::clone(&perf_logger));
        let source_programs = Arc::clone(&self.source_programs);
        let schemas = self.get_schemas();
        let errors = Arc::clone(&self.errors);

        tokio::spawn(async move {
            loop {
                if let Some(file_source_changes) = subscription.next_change().await.unwrap() {
                    let log_event = perf_logger.create_event("lsp_state_watchman_event");
                    let log_time = log_event.start("lsp_state_watchman_event_time");

                    compiler_state
                        .pending_file_source_changes
                        .write()
                        .expect("LSPState::watch_and_update_schemas: expect to acquire write lock on pending_file_source_changes")
                        .push(file_source_changes);

                    let has_new_changes = compiler_state
                        .merge_file_source_changes(&config, &log_event, perf_logger.as_ref(), false)
                        .unwrap_or_else(|err| {
                            Self::log_error(
                                &perf_logger,
                                format!("Unable to merge_file_source_changes: {:?}", err),
                            );
                            false
                        });


                    let mut errors_write_lock = errors.write().unwrap();

                    if has_new_changes {
                        errors_write_lock.clear();
                    }

                    // If changes contains schema files we need to rebuild schemas
                    if has_new_changes && compiler_state.has_schema_changes() {
                        log_event.number("has_schema_change", 1);
                        let (next_schemas, build_schema_errors) =
                            compiler.build_schemas(&compiler_state, &log_event);
                        if !build_schema_errors.is_empty() {
                            Self::log_errors(&perf_logger, &build_schema_errors);
                            errors_write_lock.push(LSPStateError::BuildSchemaError);
                        };

                        schemas.write().expect("LSPState::watch_and_update_schemas: expect to acquire write lock on schemas").clone_from(&next_schemas);
                    } else {
                        log_event.number("has_schema_change", 0);
                    }

                    // Rebuilding programs
                    if has_new_changes {
                        Self::build_in_watch_mode(
                            &config,
                            &compiler,
                            &mut compiler_state,
                            &schemas,
                            &source_programs,
                            Arc::clone(&perf_logger),
                            &log_event,
                        )
                        .unwrap_or_else(|err| {
                            Self::log_error(
                                &perf_logger,
                                format!("Error in build_in_watch_mode: {:?}", err),
                            );
                            errors_write_lock.push(LSPStateError::WatchBuildError);
                        });
                    }

                    log_event.stop(log_time);
                    perf_logger.complete_event(log_event);
                    perf_logger.flush();
                }
            }
        });
    }

    pub(crate) fn get_schemas(&self) -> Arc<RwLock<HashMap<StringKey, Arc<Schema>>>> {
        self.schemas.clone()
    }

    pub(crate) fn get_source_programs_ref(&self) -> &Arc<RwLock<HashMap<StringKey, Program>>> {
        &self.source_programs
    }

    pub(crate) fn resolve_node(
        &self,
        params: TextDocumentPositionParams,
    ) -> LSPRuntimeResult<NodeResolutionInfo> {
        get_node_resolution_info(
            params,
            &self.synced_graphql_documents,
            &self.file_categorizer,
            &self.root_dir,
        )
    }

    pub(crate) fn root_dir(&self) -> &PathBuf {
        &self.root_dir
    }

    pub(crate) fn insert_synced_sources(&mut self, url: Url, sources: Vec<GraphQLSource>) {
        self.start_compiler_once();
        self.synced_graphql_documents.insert(url, sources);
    }

    pub(crate) fn remove_synced_sources(&mut self, url: &Url) {
        self.synced_graphql_documents.remove(url);
    }

    pub(crate) fn extract_executable_document_from_text(
        &mut self,
        position: TextDocumentPositionParams,
    ) -> LSPRuntimeResult<(ExecutableDocument, Span, StringKey)> {
        extract_executable_document_from_text(
            position,
            &self.synced_graphql_documents,
            &self.file_categorizer,
            &self.root_dir,
            0,
        )
    }

    pub(crate) fn get_errors(&self) -> &Arc<RwLock<Vec<LSPStateError>>> {
        &self.errors
    }

    fn start_compiler_once(&mut self) {
        if let Some(compiler) = self.compiler.take() {
            tokio::spawn(async move { compiler.watch().await });
        }
    }

    fn initial_build(
        &mut self,
        compiler_state: &mut CompilerState,
        setup_event: &impl PerfLogEvent,
        perf_logger: Arc<TPerfLogger>,
    ) -> LSPProcessResult<()> {
        let compiler = Compiler::new(Arc::clone(&self.config), Arc::clone(&perf_logger));

        let (schemas, build_schema_errors) = compiler.build_schemas(&compiler_state, setup_event);

        if !build_schema_errors.is_empty() {
            Self::log_errors(&perf_logger, &build_schema_errors);
            self.errors
                .write()
                .unwrap()
                .push(LSPStateError::BuildSchemaError);
        }

        // This will build programs, but won't apply any transformations to them
        // that should be enough for LSP to start showing fragments information
        let (source_programs, build_raw_program_errors) =
            compiler.build_raw_programs(&compiler_state, &schemas, None, setup_event)?;

        if !build_raw_program_errors.is_empty() {
            Self::log_errors(&perf_logger, &build_raw_program_errors);
            self.errors
                .write()
                .unwrap()
                .push(LSPStateError::InitialBuildError);
        }

        compiler_state.complete_compilation();

        self.schemas = Arc::new(RwLock::new(schemas));
        self.source_programs = Arc::new(RwLock::new(source_programs));

        Ok(())
    }

    /// This function should handle internal watchman builds that will
    /// update schemas/source_programs every time those are created/updated
    fn build_in_watch_mode(
        config: &Arc<Config>,
        compiler: &Compiler<TPerfLogger>,
        compiler_state: &mut CompilerState,
        schemas: &Arc<RwLock<HashMap<StringKey, Arc<Schema>>>>,
        source_programs: &Arc<RwLock<HashMap<StringKey, Program>>>,
        perf_logger: Arc<TPerfLogger>,
        log_event: &impl PerfLogEvent,
    ) -> LSPProcessResult<()> {
        // we should trigger build only for changed projects
        // this set will be used in the `build_raw_programs` to ignore unchanged projects
        let affected_projects = config
            .projects
            .keys()
            .filter(|project_name| compiler_state.project_has_pending_changes(**project_name))
            .collect::<HashSet<_>>();

        // This will build programs, but won't apply any transformations to them
        // that should be enough for LSP to start showing fragments information
        let (programs, build_raw_programs_errors) = compiler.build_raw_programs(
            &compiler_state,
            &schemas
                .read()
                .expect("LSPState::build_in_watch_mode: expect to acquire read lock on schemas"),
            Some(affected_projects),
            log_event,
        )?;

        if !build_raw_programs_errors.is_empty() {
            Self::log_errors(&perf_logger, &build_raw_programs_errors)
        }
        let timer = log_event.start("lsp_build_in_watch_writing_programs_time");

        let mut source_programs_write_lock = source_programs.write().expect(
            "LSPState::build_in_watch_mode: expect to acquire write lock on source_programs",
        );
        for (program_name, program) in programs {
            // NOTE: Currently, we rely on the fact that `build_raw_programs`
            // will always return a full program, so we can safely replace it in the current
            // list of source_programs
            source_programs_write_lock.insert(program_name, program);
        }

        compiler_state.complete_compilation();

        log_event.stop(timer);
        Ok(())
    }

    fn log_errors<T: core::fmt::Debug>(logger: &Arc<TPerfLogger>, errors: &[T]) {
        Self::log_error(
            logger,
            errors
                .iter()
                .map(|err| format!("{:?}", err))
                .collect::<Vec<String>>()
                .join("\n"),
        );
    }

    /// A quick helper so we can unwrap things and log, if somethings isn't right
    fn log_error(logger: &Arc<TPerfLogger>, error_message: String) {
        let error_event = logger.create_event("lsp_state_error");
        error_event.string("message", error_message);
        logger.complete_event(error_event);
        logger.flush();
    }
}
