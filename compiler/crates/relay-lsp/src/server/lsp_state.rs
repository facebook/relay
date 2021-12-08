/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::{
    diagnostic_reporter::{get_diagnostics_data, DiagnosticReporter},
    graphql_tools::get_query_text,
    js_language_server::JSLanguageServer,
    lsp_runtime_error::LSPRuntimeResult,
    node_resolution_info::{create_node_resolution_info, NodeResolutionInfo},
    utils::extract_project_name_from_url,
    utils::{
        extract_executable_definitions_from_text_document, extract_executable_document_from_text,
    },
    ContentConsumerType,
};
use crate::{LSPExtraDataProvider, LSPRuntimeError};
use common::{Diagnostic as CompilerDiagnostic, PerfLogger, SourceLocationKey, Span};
use crossbeam::channel::{SendError, Sender};
use dashmap::{mapref::entry::Entry, DashMap};
use fnv::FnvBuildHasher;
use graphql_ir::{
    build_ir_with_extra_features, BuilderOptions, FragmentVariablesSemantic, Program, RelayMode,
};
use graphql_syntax::{
    parse_executable_with_error_recovery, ExecutableDefinition, ExecutableDocument, GraphQLSource,
};
use intern::string_key::{Intern, StringKey};
use log::debug;
use lsp_server::Message;
use lsp_types::{Diagnostic, DiagnosticTag, Range, TextDocumentPositionParams, Url};
use relay_compiler::{config::Config, FileCategorizer};
use relay_transforms::deprecated_fields_for_executable_definition;
use schema::SDLSchema;
use schema_documentation::{
    CombinedSchemaDocumentation, SchemaDocumentation, SchemaDocumentationLoader,
};
use std::{path::PathBuf, sync::Arc};
use tokio::sync::Notify;

use super::task_queue::TaskScheduler;

pub type Schemas = Arc<DashMap<StringKey, Arc<SDLSchema>, FnvBuildHasher>>;
pub type SourcePrograms = Arc<DashMap<StringKey, Program, FnvBuildHasher>>;
pub type ProjectStatusMap = Arc<DashMap<StringKey, ProjectStatus, FnvBuildHasher>>;

#[derive(Eq, PartialEq)]
pub enum ProjectStatus {
    Activated,
    Completed,
}

pub trait GlobalState {
    type TSchemaDocumentation: SchemaDocumentation;

    fn get_schema(&self, project_name: &StringKey) -> LSPRuntimeResult<Arc<SDLSchema>>;

    fn get_program(&self, project_name: &StringKey) -> LSPRuntimeResult<Program>;

    fn resolve_node(
        &self,
        text_document_position: &TextDocumentPositionParams,
    ) -> LSPRuntimeResult<NodeResolutionInfo>;

    fn root_dir(&self) -> PathBuf;

    fn extract_executable_document_from_text(
        &self,
        position: &TextDocumentPositionParams,
        index_offset: usize,
    ) -> LSPRuntimeResult<(ExecutableDocument, Span)>;

    fn get_schema_documentation(&self, schema_name: &str) -> Self::TSchemaDocumentation;

    fn get_extra_data_provider(&self) -> &dyn LSPExtraDataProvider;

    fn resolve_executable_definitions(
        &self,
        text_document_uri: &Url,
    ) -> LSPRuntimeResult<Vec<ExecutableDefinition>>;

    fn get_diagnostic_for_range(&self, url: &Url, range: Range) -> Option<Diagnostic>;

    /// For Relay - project_name is an human-readable identifier of a set of configurations,
    /// source files, schema extensions, etc, that are compiled together using a single GraphQL
    /// Schema. project_name typically the same as the schema name: facebook, intern, etc.
    /// For Native - it may be a BuildConfigName.
    fn extract_project_name_from_url(&self, url: &Url) -> LSPRuntimeResult<StringKey>;

    /// Experimental (Relay-only) JS Language Server instance
    fn get_js_language_sever(&self) -> Option<&dyn JSLanguageServer<TState = Self>>;

    /// This is powering the functionality of executing GraphQL query from the IDE
    fn get_full_query_text(
        &self,
        query_text: String,
        project_name: &StringKey,
    ) -> LSPRuntimeResult<String>;

    fn document_opened(&self, url: &Url, text: &str) -> LSPRuntimeResult<()>;

    fn document_changed(&self, url: &Url, full_text: &str) -> LSPRuntimeResult<()>;

    fn document_closed(&self, url: &Url) -> LSPRuntimeResult<()>;

    /// To distinguish content, that we show to consumers
    /// we may need to know who's our current consumer.
    /// This is mostly for hover handler (where we render markup)
    fn get_content_consumer_type(&self) -> ContentConsumerType;
}

/// This structure contains all available resources that we may use in the Relay LSP message/notification
/// handlers. Such as schema, programs, extra_data_providers, etc...
pub struct LSPState<
    TPerfLogger: PerfLogger + 'static,
    TSchemaDocumentation: SchemaDocumentation + 'static,
> {
    pub(crate) config: Arc<Config>,
    pub(crate) sender: Sender<Message>,
    task_scheduler: Arc<TaskScheduler<super::Task>>,
    root_dir: PathBuf,
    extra_data_provider: Box<dyn LSPExtraDataProvider>,
    file_categorizer: FileCategorizer,
    pub(crate) schemas: Schemas,
    schema_documentation_loader: Option<Box<dyn SchemaDocumentationLoader<TSchemaDocumentation>>>,
    pub(crate) source_programs: SourcePrograms,
    synced_graphql_documents: DashMap<Url, Vec<GraphQLSource>>,
    pub(crate) perf_logger: Arc<TPerfLogger>,
    pub(crate) diagnostic_reporter: Arc<DiagnosticReporter>,
    pub(crate) notify_lsp_state_resources: Arc<Notify>,
    pub(crate) project_status: ProjectStatusMap,
    js_resource: Option<Box<dyn JSLanguageServer<TState = Self>>>,
}

impl<TPerfLogger: PerfLogger + 'static, TSchemaDocumentation: SchemaDocumentation>
    LSPState<TPerfLogger, TSchemaDocumentation>
{
    /// Private constructor
    pub fn new(
        config: Arc<Config>,
        sender: Sender<Message>,
        task_scheduler: Arc<TaskScheduler<super::Task>>,
        perf_logger: Arc<TPerfLogger>,
        extra_data_provider: Box<dyn LSPExtraDataProvider>,
        schema_documentation_loader: Option<
            Box<dyn SchemaDocumentationLoader<TSchemaDocumentation>>,
        >,
        js_resource: Option<Box<dyn JSLanguageServer<TState = Self>>>,
    ) -> Self {
        debug!("Creating lsp_state...");
        let file_categorizer = FileCategorizer::from_config(&config);
        let root_dir = &config.root_dir.clone();
        let diagnostic_reporter = Arc::new(DiagnosticReporter::new(
            config.root_dir.clone(),
            sender.clone(),
        ));

        let lsp_state = Self {
            config,
            sender,
            task_scheduler,
            diagnostic_reporter,
            extra_data_provider,
            file_categorizer,
            notify_lsp_state_resources: Arc::new(Notify::new()),
            perf_logger,
            project_status: Arc::new(DashMap::with_hasher(FnvBuildHasher::default())),
            root_dir: root_dir.clone(),
            schemas: Arc::new(DashMap::with_hasher(FnvBuildHasher::default())),
            schema_documentation_loader,
            source_programs: Arc::new(DashMap::with_hasher(FnvBuildHasher::default())),
            synced_graphql_documents: Default::default(),
            js_resource,
        };

        // Preload schema documentation - this will warm-up schema documentation cache in the LSP Extra Data providers
        // TODO: Find a better place for this
        lsp_state.preload_documentation();

        debug!("Creating lsp_state created!");
        lsp_state
    }

    fn insert_synced_sources(&self, url: &Url, sources: Vec<GraphQLSource>) {
        self.synced_graphql_documents.insert(url.clone(), sources);
    }

    fn validate_synced_sources(&self, url: &Url) -> LSPRuntimeResult<()> {
        let mut diagnostics = vec![];
        let graphql_sources = self.synced_graphql_documents.get(url).ok_or_else(|| {
            LSPRuntimeError::UnexpectedError(format!("Expected GraphQL sources for URL {}", url))
        })?;
        let project_name = self.extract_project_name_from_url(url)?;
        let project_config = self
            .config
            .enabled_projects()
            .find(|project_config| project_config.name == project_name)
            .ok_or_else(|| {
                LSPRuntimeError::UnexpectedError(format!(
                    "Expected project config for project {}",
                    project_name
                ))
            })?;

        let schema = self
            .schemas
            .get(&project_name)
            .ok_or(LSPRuntimeError::ExpectedError)?;

        for graphql_source in graphql_sources.iter() {
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

            let compiler_diagnostics = match build_ir_with_extra_features(
                &schema,
                &result.item.definitions,
                &BuilderOptions {
                    allow_undefined_fragment_spreads: true,
                    fragment_variables_semantic: FragmentVariablesSemantic::PassedValue,
                    relay_mode: Some(RelayMode {
                        enable_provided_variables: &project_config
                            .feature_flags
                            .enable_provided_variables,
                    }),
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
        self.diagnostic_reporter
            .update_quick_diagnostics_for_url(url, diagnostics);

        Ok(())
    }

    fn preload_documentation(&self) {
        for project_config in self.config.enabled_projects() {
            self.get_schema_documentation(&project_config.name.to_string());
        }
    }

    pub fn send_message(&self, message: Message) -> Result<(), SendError<Message>> {
        self.sender.send(message)
    }

    pub fn schedule_task(&self, task: Task) {
        self.task_scheduler.schedule(super::Task::LSPState(task));
    }

    fn process_synced_sources(
        &self,
        uri: &Url,
        sources: Vec<GraphQLSource>,
    ) -> LSPRuntimeResult<()> {
        let project_name = self.extract_project_name_from_url(uri)?;

        if let Entry::Vacant(e) = self.project_status.entry(project_name) {
            e.insert(ProjectStatus::Activated);
            self.notify_lsp_state_resources.notify_one();
        }

        self.insert_synced_sources(uri, sources);
        self.schedule_task(Task::ValidateSyncedSource(uri.clone()));

        Ok(())
    }

    fn remove_synced_sources(&self, url: &Url) {
        self.synced_graphql_documents.remove(url);
        self.diagnostic_reporter
            .clear_quick_diagnostics_for_url(url);
    }
}

pub fn convert_diagnostic(
    graphql_source: &GraphQLSource,
    diagnostic: &CompilerDiagnostic,
) -> Diagnostic {
    let tags: Vec<DiagnosticTag> = diagnostic.tags();

    Diagnostic {
        code: None,
        data: get_diagnostics_data(diagnostic),
        message: diagnostic.message().to_string(),
        range: diagnostic.location().span().to_range(
            &graphql_source.text,
            graphql_source.line_index,
            graphql_source.column_index,
        ),
        related_information: None,
        severity: Some(diagnostic.severity()),
        tags: if tags.is_empty() { None } else { Some(tags) },
        source: None,
        ..Default::default()
    }
}

impl<TPerfLogger: PerfLogger + 'static, TSchemaDocumentation: SchemaDocumentation + 'static>
    GlobalState for LSPState<TPerfLogger, TSchemaDocumentation>
{
    type TSchemaDocumentation =
        CombinedSchemaDocumentation<Option<Arc<SDLSchema>>, Option<Arc<TSchemaDocumentation>>>;

    fn root_dir(&self) -> PathBuf {
        self.root_dir.clone()
    }

    fn get_schema(&self, project_name: &StringKey) -> LSPRuntimeResult<Arc<SDLSchema>> {
        self.schemas
            .get(project_name)
            .as_deref()
            .cloned()
            .ok_or_else(|| {
                LSPRuntimeError::UnexpectedError(format!(
                    "get_schema: schema is missing (or not ready, yet) for the `{}` project.",
                    project_name
                ))
            })
    }

    fn get_program(&self, project_name: &StringKey) -> LSPRuntimeResult<Program> {
        self.source_programs
            .get(project_name)
            .map(|p| p.value().clone())
            .ok_or_else(|| {
                LSPRuntimeError::UnexpectedError(format!(
                    "get_program: program is missing (or not ready, yet) for the `{}` project.",
                    project_name
                ))
            })
    }

    fn resolve_node(
        &self,
        text_document_position: &TextDocumentPositionParams,
    ) -> LSPRuntimeResult<NodeResolutionInfo> {
        let (document, position_span) = extract_executable_document_from_text(
            &self.synced_graphql_documents,
            text_document_position,
            // For hovering, offset the index by 1
            // ```
            //  field
            //  ^ hover on f
            // ^ position returned by the client
            // ```
            // so the returned cursor is on the char `f`
            1,
        )?;

        create_node_resolution_info(document, position_span)
    }

    fn extract_executable_document_from_text(
        &self,
        position: &TextDocumentPositionParams,
        index_offset: usize,
    ) -> LSPRuntimeResult<(ExecutableDocument, Span)> {
        extract_executable_document_from_text(
            &self.synced_graphql_documents,
            position,
            index_offset,
        )
    }

    fn get_schema_documentation(&self, schema_name: &str) -> Self::TSchemaDocumentation {
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

    fn extract_project_name_from_url(&self, url: &Url) -> LSPRuntimeResult<StringKey> {
        extract_project_name_from_url(&self.file_categorizer, url, &self.root_dir)
    }

    fn get_extra_data_provider(&self) -> &dyn LSPExtraDataProvider {
        self.extra_data_provider.as_ref()
    }

    fn resolve_executable_definitions(
        &self,
        text_document_uri: &Url,
    ) -> LSPRuntimeResult<Vec<ExecutableDefinition>> {
        extract_executable_definitions_from_text_document(
            text_document_uri,
            &self.synced_graphql_documents,
        )
    }

    fn get_diagnostic_for_range(&self, url: &Url, range: Range) -> Option<Diagnostic> {
        self.diagnostic_reporter
            .get_diagnostics_for_range(url, range)
    }

    fn get_js_language_sever(&self) -> Option<&dyn JSLanguageServer<TState = Self>> {
        self.js_resource.as_deref()
    }

    fn get_full_query_text(
        &self,
        query_text: String,
        project_name: &StringKey,
    ) -> LSPRuntimeResult<String> {
        get_query_text(self, query_text, project_name)
    }

    fn document_opened(&self, uri: &Url, text: &str) -> LSPRuntimeResult<()> {
        if let Some(js_server) = self.get_js_language_sever() {
            js_server.process_js_source(uri, text);
        }

        // First we check to see if this document has any GraphQL documents.
        let graphql_sources = extract_graphql::parse_chunks(text);
        if graphql_sources.is_empty() {
            Ok(())
        } else {
            self.process_synced_sources(uri, graphql_sources)
        }
    }

    fn document_changed(&self, uri: &Url, full_text: &str) -> LSPRuntimeResult<()> {
        if let Some(js_server) = self.get_js_language_sever() {
            js_server.process_js_source(uri, full_text);
        }

        // First we check to see if this document has any GraphQL documents.
        let graphql_sources = extract_graphql::parse_chunks(full_text);
        if graphql_sources.is_empty() {
            self.remove_synced_sources(uri);
            Ok(())
        } else {
            self.process_synced_sources(uri, graphql_sources)
        }
    }

    fn document_closed(&self, uri: &Url) -> LSPRuntimeResult<()> {
        if let Some(js_server) = self.get_js_language_sever() {
            js_server.remove_js_source(uri);
        }
        self.remove_synced_sources(uri);
        Ok(())
    }

    fn get_content_consumer_type(&self) -> ContentConsumerType {
        ContentConsumerType::Relay
    }
}

#[derive(Debug)]
pub enum Task {
    ValidateSyncedSource(Url),
    ValidateSyncedSources,
}

pub(crate) fn handle_lsp_state_tasks<
    TPerfLogger: PerfLogger + 'static,
    TSchemaDocumentation: SchemaDocumentation + 'static,
>(
    state: Arc<LSPState<TPerfLogger, TSchemaDocumentation>>,
    task: Task,
) {
    match task {
        Task::ValidateSyncedSource(url) => {
            state.validate_synced_sources(&url).ok();
        }
        Task::ValidateSyncedSources => {
            for item in &state.synced_graphql_documents {
                state.schedule_task(Task::ValidateSyncedSource(item.key().clone()));
            }
        }
    }
}
