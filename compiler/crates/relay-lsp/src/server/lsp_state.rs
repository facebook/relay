/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::{
    diagnostic_reporter::DiagnosticReporter,
    lsp_runtime_error::LSPRuntimeResult,
    node_resolution_info::{get_node_resolution_info, NodeResolutionInfo},
    utils::extract_project_name_from_url,
    utils::{extract_executable_definitions_from_text, extract_executable_document_from_text},
};
use crate::{ExtensionConfig, LSPExtraDataProvider};
use common::{Diagnostic as CompilerDiagnostic, PerfLogger, SourceLocationKey, Span};
use crossbeam::Sender;
use fnv::FnvHashMap;
use graphql_ir::{
    build_ir_with_extra_features, BuilderOptions, FragmentVariablesSemantic, Program,
};
use graphql_syntax::{
    parse_executable_with_error_recovery, ExecutableDefinition, ExecutableDocument, GraphQLSource,
};
use interner::StringKey;
use log::info;
use lsp_server::Message;
use lsp_types::{Diagnostic, DiagnosticSeverity, TextDocumentPositionParams, Url};
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
    root_dir_str: String,
    pub extra_data_provider: Box<dyn LSPExtraDataProvider>,
    file_categorizer: FileCategorizer,
    schemas: Arc<RwLock<FnvHashMap<StringKey, Arc<SDLSchema>>>>,
    source_programs: Arc<RwLock<FnvHashMap<StringKey, Program>>>,
    synced_graphql_documents: HashMap<Url, Vec<GraphQLSource>>,
    perf_logger: Arc<TPerfLogger>,
    diagnostic_reporter: Arc<DiagnosticReporter>,
}

impl<TPerfLogger: PerfLogger + 'static> LSPState<TPerfLogger> {
    /// Private constructor
    fn new(
        config: Arc<Config>,
        perf_logger: Arc<TPerfLogger>,
        extra_data_provider: Box<dyn LSPExtraDataProvider>,
        sender: Sender<Message>,
    ) -> Self {
        let file_categorizer = FileCategorizer::from_config(&config);
        let root_dir = &config.root_dir.clone();
        let diagnostic_reporter =
            Arc::new(DiagnosticReporter::new(config.root_dir.clone(), sender));

        Self {
            config,
            compiler: None,
            extra_data_provider,
            file_categorizer,
            root_dir_str: root_dir.to_string_lossy().to_string(),
            root_dir: root_dir.clone(),
            schemas: Default::default(),
            source_programs: Default::default(),
            synced_graphql_documents: Default::default(),
            perf_logger,
            diagnostic_reporter,
        }
    }

    /// This method is responsible for creating schema/source_programs for LSP internal state
    /// - so the LSP can provide these to Hover/Completion/GoToDefinition requests.
    /// It also creates a watchman subscription that is responsible for keeping these resources up-to-date.
    pub(crate) fn create_state(
        config: Arc<Config>,
        perf_logger: Arc<TPerfLogger>,
        extra_data_provider: Box<dyn LSPExtraDataProvider>,
        extensions_config: &ExtensionConfig,
        sender: Sender<Message>,
    ) -> Self {
        info!("Creating lsp_state...");
        let mut lsp_state = Self::new(config, perf_logger, extra_data_provider, sender.clone());

        // Preload schema documentation - this will warm-up schema documentation cache in the LSP Extra Data providers
        lsp_state.preload_documentation();

        let config_clone = Arc::clone(&lsp_state.config);
        let perf_logger_clone = Arc::clone(&lsp_state.perf_logger);
        let schemas = Arc::clone(&lsp_state.schemas);
        let source_programs = Arc::clone(&lsp_state.source_programs);
        let diagnostic_reporter = Arc::clone(&lsp_state.diagnostic_reporter);

        task::spawn(async move {
            let resources = LSPStateResources::new(
                config_clone,
                perf_logger_clone,
                schemas,
                source_programs,
                sender,
                diagnostic_reporter,
            );
            resources.watch().await.unwrap();
        });

        lsp_state.compiler = if extensions_config.enable_compiler {
            info!("extensions_config.enable_compiler = true");
            Some(Compiler::new(
                Arc::clone(&lsp_state.config),
                Arc::clone(&lsp_state.perf_logger),
            ))
        } else {
            None
        };

        info!("Creating lsp_state created!");
        lsp_state
    }

    pub(crate) fn get_schemas(&self) -> Arc<RwLock<FnvHashMap<StringKey, Arc<SDLSchema>>>> {
        self.schemas.clone()
    }

    pub(crate) fn get_source_programs_ref(&self) -> &Arc<RwLock<FnvHashMap<StringKey, Program>>> {
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

    pub(crate) fn root_dir_str(&self) -> &str {
        &self.root_dir_str
    }

    pub(crate) fn insert_synced_sources(&mut self, url: Url, sources: Vec<GraphQLSource>) {
        self.start_compiler_once();
        self.synced_graphql_documents.insert(url, sources);
    }

    pub(crate) fn remove_synced_sources(&mut self, url: &Url) {
        self.synced_graphql_documents.remove(url);
        self.diagnostic_reporter
            .clear_quick_diagnostics_for_url(url);
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

    pub(crate) fn validate_synced_sources(
        &mut self,
        url: Url,
        graphql_sources: &[GraphQLSource],
    ) -> LSPRuntimeResult<()> {
        let mut diagnostics = vec![];

        let url_str = url.to_string();
        let project_name =
            extract_project_name_from_url(&self.file_categorizer, &url, &self.root_dir)?;

        for graphql_source in graphql_sources {
            let result = parse_executable_with_error_recovery(
                &graphql_source.text,
                SourceLocationKey::standalone(&url_str),
            );

            diagnostics.extend(
                result
                    .errors
                    .into_iter()
                    .map(|diagnostic| convert_diagnostic(graphql_source, diagnostic)),
            );
            if let Some(schema) = self
                .schemas
                .read()
                .expect(
                    "validate_synced_sources: could not acquire read lock for state.get_schemas",
                )
                .get(&project_name)
            {
                if let Err(errors) = build_ir_with_extra_features(
                    schema,
                    &result.item.definitions,
                    BuilderOptions {
                        allow_undefined_fragment_spreads: true,
                        fragment_variables_semantic: FragmentVariablesSemantic::PassedValue,
                        relay_mode: true,
                    },
                ) {
                    diagnostics.extend(
                        errors
                            .into_iter()
                            .map(|diagnostic| convert_diagnostic(graphql_source, diagnostic)),
                    );
                }
            }
        }
        self.diagnostic_reporter
            .update_quick_diagnostics_for_url(url, diagnostics);
        Ok(())
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

fn convert_diagnostic(
    graphql_source: &GraphQLSource,
    diagnostic: CompilerDiagnostic,
) -> Diagnostic {
    Diagnostic {
        code: None,
        message: diagnostic.message().to_string(),
        range: diagnostic.location().span().to_range(
            &graphql_source.text,
            graphql_source.line_index,
            graphql_source.column_index,
        ),
        related_information: None,
        severity: Some(DiagnosticSeverity::Error),
        source: None,
        tags: None,
    }
}
