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

use crate::{
    lsp_runtime_error::LSPRuntimeResult,
    node_resolution_info::{get_node_resolution_info, NodeResolutionInfo},
    status_reporting::LSPStatusReporter,
    utils::extract_executable_document_from_text,
};

pub(crate) struct LSPState<TPerfLogger: PerfLogger + 'static> {
    schemas: Arc<RwLock<HashMap<StringKey, Arc<Schema>>>>,
    synced_graphql_documents: HashMap<Url, Vec<GraphQLSource>>,
    file_categorizer: FileCategorizer,
    source_programs: Arc<RwLock<HashMap<StringKey, Program>>>,
    config: Option<Config>,
    root_dir: PathBuf,
    perf_logger: Arc<TPerfLogger>,
    pub extra_data_provider: Box<dyn LSPExtraDataProvider>,
}

impl<TPerfLogger: PerfLogger + 'static> LSPState<TPerfLogger> {
    pub(crate) fn new(
        mut config: Config,
        sender: &Sender<Message>,
        perf_logger: Arc<TPerfLogger>,
        extra_data_provider: Box<dyn LSPExtraDataProvider + Send + Sync>,
    ) -> Self {
        // Force the compiler to compile everything initially,
        // so that schemas and programs will be populated.
        config.compile_everything = true;

        config.status_reporter = Box::new(LSPStatusReporter::new(
            config.root_dir.clone(),
            sender.clone(),
        ));

        let schemas: Arc<RwLock<HashMap<StringKey, Arc<Schema>>>> = Default::default();
        let source_programs: Arc<RwLock<HashMap<StringKey, Program>>> = Default::default();

        let schemas_clone = Arc::clone(&schemas);
        let source_programs_clone = Arc::clone(&source_programs);
        config.on_build_project_success = Some(Box::new(
            move |project_name, schema, source_program| {
                schemas_clone
                    .write()
                    .expect(
                        "on_build_project_success: could not acquire write lock for schemas_clone",
                    )
                    .insert(project_name, schema.clone());
                source_programs_clone
                    .write()
                    .expect("on_build_project_success: could not acquire write lock for source_programs_clone")
                    .insert(project_name, source_program.clone());
                log::info!("Build succeeded for project {}", project_name);
            },
        ));

        LSPState {
            synced_graphql_documents: Default::default(),
            schemas,
            file_categorizer: FileCategorizer::from_config(&config),
            source_programs,
            root_dir: config.root_dir.clone(),
            config: Some(config),
            perf_logger,
            extra_data_provider,
        }
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
        if let Some(config) = self.config.take() {
            let perf_logger = Arc::clone(&self.perf_logger);
            tokio::spawn(async move {
                let compiler = Compiler::new(config, perf_logger);
                compiler.watch().await
            });
        }
    }
}
