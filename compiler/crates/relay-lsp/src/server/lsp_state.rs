/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::LSPExtraDataProvider;
use crate::{
    diagnostic_reporter::{get_diagnostics_data, DiagnosticReporter},
    js_language_server::JSLanguageServer,
    lsp_runtime_error::LSPRuntimeResult,
    node_resolution_info::{get_node_resolution_info, NodeResolutionInfo},
    utils::extract_project_name_from_url,
    utils::{extract_executable_definitions_from_text, extract_executable_document_from_text},
};
use common::{Diagnostic as CompilerDiagnostic, PerfLogger, SourceLocationKey, Span};
use crossbeam::channel::Sender;
use dashmap::{mapref::entry::Entry, DashMap};
use fnv::FnvBuildHasher;
use graphql_ir::{
    build_ir_with_extra_features, BuilderOptions, FragmentVariablesSemantic, Program,
};
use graphql_syntax::{
    parse_executable_with_error_recovery, ExecutableDefinition, ExecutableDocument, GraphQLSource,
};
use interner::{Intern, StringKey};
use log::debug;
use lsp_server::Message;
use lsp_types::{Diagnostic, DiagnosticTag, Range, TextDocumentPositionParams, Url};
use relay_compiler::{
    config::{Config, ProjectConfig},
    FileCategorizer,
};
use relay_transforms::deprecated_fields_for_executable_definition;
use schema::SDLSchema;
use schema_documentation::{
    CombinedSchemaDocumentation, SchemaDocumentation, SchemaDocumentationLoader,
};
use std::{collections::HashMap, path::PathBuf, sync::Arc};
use tokio::{sync::Notify, task};

use super::lsp_state_resources::LSPStateResources;

pub type Schemas = Arc<DashMap<StringKey, Arc<SDLSchema>, FnvBuildHasher>>;
pub type SourcePrograms = Arc<DashMap<StringKey, Program, FnvBuildHasher>>;
pub type ProjectStatusMap = Arc<DashMap<StringKey, ProjectStatus, FnvBuildHasher>>;

#[derive(Eq, PartialEq)]
pub enum ProjectStatus {
    Activated,
    Completed,
}

/// This structure contains all available resources that we may use in the Relay LSP message/notification
/// handlers. Such as schema, programs, extra_data_providers, etc...
pub struct LSPState<TPerfLogger: PerfLogger + 'static, TSchemaDocumentation: SchemaDocumentation> {
    config: Arc<Config>,
    root_dir: PathBuf,
    root_dir_str: String,
    pub extra_data_provider: Box<dyn LSPExtraDataProvider>,
    file_categorizer: FileCategorizer,
    schemas: Schemas,
    schema_documentation_loader: Option<Box<dyn SchemaDocumentationLoader<TSchemaDocumentation>>>,
    source_programs: SourcePrograms,
    synced_graphql_documents: HashMap<Url, Vec<GraphQLSource>>,
    perf_logger: Arc<TPerfLogger>,
    diagnostic_reporter: Arc<DiagnosticReporter>,
    notify_sender: Arc<Notify>,
    project_status: ProjectStatusMap,
    pub js_resource: Box<dyn JSLanguageServer<TPerfLogger, TSchemaDocumentation>>,
}

impl<TPerfLogger: PerfLogger + 'static, TSchemaDocumentation: SchemaDocumentation>
    LSPState<TPerfLogger, TSchemaDocumentation>
{
    /// Private constructor
    fn new(
        config: Arc<Config>,
        perf_logger: Arc<TPerfLogger>,
        extra_data_provider: Box<dyn LSPExtraDataProvider>,
        schema_documentation_loader: Option<
            Box<dyn SchemaDocumentationLoader<TSchemaDocumentation>>,
        >,
        js_resource: Box<dyn JSLanguageServer<TPerfLogger, TSchemaDocumentation>>,
        sender: Sender<Message>,
    ) -> Self {
        let file_categorizer = FileCategorizer::from_config(&config);
        let root_dir = &config.root_dir.clone();
        let diagnostic_reporter =
            Arc::new(DiagnosticReporter::new(config.root_dir.clone(), sender));

        Self {
            config,
            diagnostic_reporter,
            extra_data_provider,
            file_categorizer,
            notify_sender: Arc::new(Notify::new()),
            perf_logger,
            project_status: Arc::new(DashMap::with_hasher(FnvBuildHasher::default())),
            root_dir_str: root_dir.to_string_lossy().to_string(),
            root_dir: root_dir.clone(),
            schemas: Arc::new(DashMap::with_hasher(FnvBuildHasher::default())),
            schema_documentation_loader,
            source_programs: Arc::new(DashMap::with_hasher(FnvBuildHasher::default())),
            synced_graphql_documents: Default::default(),
            js_resource,
        }
    }

    /// This method is responsible for creating schema/source_programs for LSP internal state
    /// - so the LSP can provide these to Hover/Completion/GoToDefinition requests.
    /// It also creates a watchman subscription that is responsible for keeping these resources up-to-date.
    pub(crate) fn create_state(
        config: Arc<Config>,
        perf_logger: Arc<TPerfLogger>,
        extra_data_provider: Box<dyn LSPExtraDataProvider>,
        schema_documentation_loader: Option<
            Box<dyn SchemaDocumentationLoader<TSchemaDocumentation>>,
        >,
        js_resource: Box<dyn JSLanguageServer<TPerfLogger, TSchemaDocumentation>>,
        sender: Sender<Message>,
    ) -> Self {
        debug!("Creating lsp_state...");
        let lsp_state = Self::new(
            config,
            perf_logger,
            extra_data_provider,
            schema_documentation_loader,
            js_resource,
            sender.clone(),
        );

        // Preload schema documentation - this will warm-up schema documentation cache in the LSP Extra Data providers
        lsp_state.preload_documentation();

        let config_clone = Arc::clone(&lsp_state.config);
        let perf_logger_clone = Arc::clone(&lsp_state.perf_logger);
        let schemas = Arc::clone(&lsp_state.schemas);
        let source_programs = Arc::clone(&lsp_state.source_programs);
        let diagnostic_reporter = Arc::clone(&lsp_state.diagnostic_reporter);
        let notify_sender = Arc::clone(&lsp_state.notify_sender);
        let project_status = Arc::clone(&lsp_state.project_status);

        task::spawn(async move {
            let resources = LSPStateResources::new(
                config_clone,
                perf_logger_clone,
                schemas,
                source_programs,
                sender,
                diagnostic_reporter,
                notify_sender,
                project_status,
            );
            resources.watch().await.unwrap();
        });

        debug!("Creating lsp_state created!");
        lsp_state
    }

    pub fn get_schemas(&self) -> Schemas {
        self.schemas.clone()
    }

    pub(crate) fn get_source_programs_ref(&self) -> &SourcePrograms {
        &self.source_programs
    }

    pub(crate) fn resolve_node(
        &self,
        text_document_position: &TextDocumentPositionParams,
    ) -> LSPRuntimeResult<NodeResolutionInfo> {
        get_node_resolution_info(
            text_document_position,
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

    pub(crate) fn remove_synced_sources(&mut self, url: &Url) {
        self.synced_graphql_documents.remove(url);
        self.diagnostic_reporter
            .clear_quick_diagnostics_for_url(url);
    }

    pub(crate) fn extract_executable_document_from_text(
        &mut self,
        position: &TextDocumentPositionParams,
        index_offset: usize,
    ) -> LSPRuntimeResult<(ExecutableDocument, Span, StringKey)> {
        extract_executable_document_from_text(
            &position,
            &self.synced_graphql_documents,
            &self.file_categorizer,
            &self.root_dir,
            index_offset,
        )
    }

    pub(crate) fn process_synced_sources(
        &mut self,
        url: Url,
        sources: Vec<GraphQLSource>,
    ) -> LSPRuntimeResult<()> {
        let project_name = self.extract_project_name_from_url(&url)?;

        if let Entry::Vacant(e) = self.project_status.entry(project_name) {
            e.insert(ProjectStatus::Activated);
            self.notify_sender.notify_one();
        }

        self.validate_synced_sources(url.clone(), project_name, &sources);
        self.insert_synced_sources(url, sources);
        Ok(())
    }

    pub fn extract_project_name_from_url(&self, url: &Url) -> LSPRuntimeResult<StringKey> {
        extract_project_name_from_url(&self.file_categorizer, url, &self.root_dir)
    }

    fn insert_synced_sources(&mut self, url: Url, sources: Vec<GraphQLSource>) {
        self.synced_graphql_documents.insert(url, sources);
    }

    fn validate_synced_sources(
        &mut self,
        url: Url,
        project_name: StringKey,
        graphql_sources: &[GraphQLSource],
    ) {
        let mut diagnostics = vec![];
        for graphql_source in graphql_sources {
            let result = parse_executable_with_error_recovery(
                &graphql_source.text,
                SourceLocationKey::standalone(&url.to_string()),
            );

            diagnostics.extend(
                result
                    .errors
                    .iter()
                    .map(|diagnostic| convert_diagnostic(graphql_source, diagnostic)),
            );
            if let Some(schema) = self.schemas.get(&project_name) {
                let compiler_diagnostics = match build_ir_with_extra_features(
                    &schema,
                    &result.item.definitions,
                    BuilderOptions {
                        allow_undefined_fragment_spreads: true,
                        fragment_variables_semantic: FragmentVariablesSemantic::PassedValue,
                        relay_mode: true,
                        default_anonymous_operation_name: None,
                    },
                )
                .and_then(|documents| {
                    let mut warnings = vec![];
                    for document in documents {
                        // Today the only warning we check for is deprecated
                        // fields, but in the future we could check for more
                        // things here by making this more generic.
                        warnings.extend(deprecated_fields_for_executable_definition(
                            &schema, &document,
                        )?)
                    }
                    Ok(warnings)
                }) {
                    Ok(warnings) => warnings,
                    Err(errors) => errors,
                };

                diagnostics.extend(
                    compiler_diagnostics
                        .iter()
                        .map(|diagnostic| convert_diagnostic(graphql_source, diagnostic)),
                );
            }
        }
        self.diagnostic_reporter
            .update_quick_diagnostics_for_url(url, diagnostics);
    }

    fn preload_documentation(&self) {
        for project_config in self.config.enabled_projects() {
            self.get_schema_documentation(&project_config.name.to_string());
        }
    }

    pub fn get_project_config_ref(&self, project_name: StringKey) -> Option<&ProjectConfig> {
        self.config
            .enabled_projects()
            .find(|project_config| project_config.name == project_name)
    }

    pub fn get_config(&self) -> Arc<Config> {
        self.config.clone()
    }

    pub fn get_logger(&self) -> Arc<TPerfLogger> {
        self.perf_logger.clone()
    }

    pub fn get_schema_documentation(&self, schema_name: &str) -> impl SchemaDocumentation {
        let primary = self
            .schemas
            .get(&schema_name.intern())
            .map(|x| Arc::clone(x.value()));
        let secondary = self
            .schema_documentation_loader
            .as_ref()
            .map(|loader| loader.get_schema_documentation(schema_name));

        CombinedSchemaDocumentation::new(primary, secondary)
    }

    /// Given a Range return first available diagnostic message for it
    pub(crate) fn get_diagnostic_for_range(&self, url: &Url, range: Range) -> Option<Diagnostic> {
        self.diagnostic_reporter
            .get_diagnostics_for_range(url, range)
    }
}

pub fn convert_diagnostic(
    graphql_source: &GraphQLSource,
    diagnostic: &CompilerDiagnostic,
) -> Diagnostic {
    let tags: Vec<DiagnosticTag> = diagnostic.tags();

    Diagnostic {
        code: None,
        data: get_diagnostics_data(&diagnostic),
        message: diagnostic.message().to_string(),
        range: diagnostic.location().span().to_range(
            &graphql_source.text,
            graphql_source.line_index,
            graphql_source.column_index,
        ),
        related_information: None,
        severity: Some(diagnostic.severity()),
        tags: if tags.len() == 0 { None } else { Some(tags) },
        source: None,
        ..Default::default()
    }
}
