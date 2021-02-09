/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::LSPExtraDataProvider;
use crate::{
    lsp_process_error::LSPProcessResult,
    lsp_runtime_error::LSPRuntimeResult,
    node_resolution_info::{get_node_resolution_info, NodeResolutionInfo},
    utils::{extract_executable_definitions_from_text, extract_executable_document_from_text},
};
use common::{PerfLogger, Span};
use crossbeam::Sender;
use graphql_ir::Program;
use graphql_syntax::{ExecutableDefinition, ExecutableDocument, GraphQLSource};
use interner::StringKey;
use lsp_server::Message;
use lsp_types::{TextDocumentPositionParams, Url};
use relay_compiler::{compiler::Compiler, config::Config, FileCategorizer};
use schema::SDLSchema;
use std::{
    collections::HashMap,
    path::PathBuf,
    sync::{Arc, RwLock},
};
use tokio::task;

use super::lsp_state_resources::LSPStateResources;

/// This structure contains all available resources that we may use in the Relay LSP message/notification
/// handlers. Such as schema, programs, extra_data_providers, etc...
pub(crate) struct LSPState<TPerfLogger: PerfLogger + 'static> {
    config: Arc<Config>,
    compiler: Option<Compiler<TPerfLogger>>,
    root_dir: PathBuf,
    pub extra_data_provider: Box<dyn LSPExtraDataProvider>,
    file_categorizer: FileCategorizer,
    schemas: Arc<RwLock<HashMap<StringKey, Arc<SDLSchema>>>>,
    source_programs: Arc<RwLock<HashMap<StringKey, Program>>>,
    synced_graphql_documents: HashMap<Url, Vec<GraphQLSource>>,
    perf_logger: Arc<TPerfLogger>,
}

impl<TPerfLogger: PerfLogger + 'static> LSPState<TPerfLogger> {
    /// Private constructor
    fn new(
        config: Arc<Config>,
        perf_logger: Arc<TPerfLogger>,
        extra_data_provider: Box<dyn LSPExtraDataProvider>,
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
            perf_logger,
        }
    }

    /// This method is responsible for creating schema/source_programs for LSP internal state
    /// - so the LSP can provide these to Hover/Completion/GoToDefinition requests.
    /// It also creates a watchman subscription that is responsible for keeping these resources up-to-date.
    pub(crate) fn create_state(
        config: Arc<Config>,
        perf_logger: Arc<TPerfLogger>,
        extra_data_provider: Box<dyn LSPExtraDataProvider>,
        sender: Sender<Message>,
    ) -> LSPProcessResult<Self> {
        let mut lsp_state = Self::new(config, perf_logger, extra_data_provider);

        // Preload schema documentation - this will warm-up schema documentation cache in the LSP Extra Data providers
        lsp_state.preload_documentation();

        let config_clone = Arc::clone(&lsp_state.config);
        let perf_logger_clone = Arc::clone(&lsp_state.perf_logger);
        let schemas = Arc::clone(&lsp_state.schemas);
        let source_programs = Arc::clone(&lsp_state.source_programs);

        task::spawn(async move {
            let resources = LSPStateResources::new(
                config_clone,
                perf_logger_clone,
                schemas,
                source_programs,
                sender,
            );
            resources.watch().await.unwrap();
        });

        lsp_state.compiler = Some(Compiler::new(
            Arc::clone(&lsp_state.config),
            Arc::clone(&lsp_state.perf_logger),
        ));

        Ok(lsp_state)
    }

    pub(crate) fn get_schemas(&self) -> Arc<RwLock<HashMap<StringKey, Arc<SDLSchema>>>> {
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

    pub(crate) fn resolve_executable_definitions(
        &self,
        params: &TextDocumentPositionParams,
    ) -> LSPRuntimeResult<Vec<ExecutableDefinition>> {
        extract_executable_definitions_from_text(params, &self.synced_graphql_documents)
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
        index_offset: usize,
    ) -> LSPRuntimeResult<(ExecutableDocument, Span, StringKey)> {
        extract_executable_document_from_text(
            position,
            &self.synced_graphql_documents,
            &self.file_categorizer,
            &self.root_dir,
            index_offset,
        )
    }

    fn start_compiler_once(&mut self) {
        if let Some(compiler) = self.compiler.take() {
            tokio::spawn(async move { compiler.watch().await });
        }
    }

    fn preload_documentation(&self) {
        for project_config in self.config.enabled_projects() {
            self.extra_data_provider
                .get_schema_documentation(self.get_schema_name_for_project(&project_config.name));
        }
    }

    pub fn get_schema_name_for_project(&self, project_name: &StringKey) -> String {
        for project_config in self.config.enabled_projects() {
            if project_name == &project_config.name {
                return project_config
                    .schema_name
                    .clone()
                    .unwrap_or_else(|| project_name.lookup().to_string());
            }
        }

        panic!("Expected to find project with name {}", project_name)
    }
}
