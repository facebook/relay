/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::{
    collections::HashMap,
    path::PathBuf,
    sync::{Arc, RwLock},
};

use crate::{
    lsp_process_error::{LSPProcessError, LSPProcessResult},
    lsp_runtime_error::LSPRuntimeResult,
    node_resolution_info::{get_node_resolution_info, NodeResolutionInfo},
    status_reporting::LSPStatusReporter,
    utils::extract_executable_document_from_text,
};
use common::{PerfLogger, Span};
use crossbeam::Sender;
use graphql_ir::Program;
use graphql_syntax::{ExecutableDocument, GraphQLSource};
use interner::StringKey;
use lsp_server::Message;
use lsp_types::{TextDocumentPositionParams, Url};
use relay_compiler::{compiler::Compiler, config::Config, FileCategorizer};
use schema::Schema;

pub trait LSPExtraDataProvider {
    fn fetch_query_stats(&self, search_token: String) -> Vec<String>;
}

pub(crate) struct LSPState<TPerfLogger: PerfLogger + 'static> {
    schemas: Arc<RwLock<HashMap<StringKey, Arc<Schema>>>>,
    synced_graphql_documents: HashMap<Url, Vec<GraphQLSource>>,
    file_categorizer: FileCategorizer,
    source_programs: Arc<RwLock<HashMap<StringKey, Program>>>,
    compiler: Option<Compiler<TPerfLogger>>,
    root_dir: PathBuf,
    pub extra_data_provider: Box<dyn LSPExtraDataProvider>,
}

impl<TPerfLogger: PerfLogger + 'static> LSPState<TPerfLogger> {
    pub(crate) async fn create_state(
        mut config: Config,
        sender: &Sender<Message>,
        perf_logger: Arc<TPerfLogger>,
        extra_data_provider: Box<dyn LSPExtraDataProvider + Send + Sync>,
    ) -> LSPProcessResult<Self> {
        // Force the compiler to compile everything initially,
        // so that schemas and programs will be populated.
        config.compile_everything = true;

        config.status_reporter = Box::new(LSPStatusReporter::new(
            config.root_dir.clone(),
            sender.clone(),
        ));
        let source_programs: Arc<RwLock<HashMap<StringKey, Program>>> = Default::default();
        let source_programs_clone = Arc::clone(&source_programs);
        config.on_build_project_success = Some(Box::new(move |project_name, _, source_program| {
            source_programs_clone
                .write()
                .unwrap()
                .insert(project_name, source_program.clone());
            log::info!("Build succeeded for project {}", project_name);
        }));
        let root_dir = &config.root_dir.clone();
        let file_categorizer = FileCategorizer::from_config(&config);

        let lsp_setup_event = perf_logger.create_event("lsp_state_setup");
        let compiler = Compiler::new(config, Arc::clone(&perf_logger));

        let compiler_state = compiler
            .create_compiler_state(Arc::clone(&perf_logger), &lsp_setup_event)
            .await
            .map_err(LSPProcessError::CompilerError)?;


        let schemas = Arc::new(RwLock::new(
            compiler
                .build_schemas(&compiler_state, &lsp_setup_event)
                .map_err(LSPProcessError::Diagnostics)?,
        ));

        perf_logger.complete_event(lsp_setup_event);
        perf_logger.flush();


        Ok(LSPState {
            synced_graphql_documents: Default::default(),
            schemas,
            file_categorizer,
            source_programs,
            root_dir: root_dir.clone(),
            compiler: Some(compiler),
            extra_data_provider,
        })
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

    fn start_compiler_once(&mut self) {
        if let Some(compiler) = self.compiler.take() {
            tokio::spawn(async move { compiler.watch().await });
        }
    }
}
