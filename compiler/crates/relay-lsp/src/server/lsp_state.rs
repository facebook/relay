/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::path::PathBuf;
use std::sync::Arc;

use common::DiagnosticsResult;
use common::Location;
use common::PerfLogger;
use common::SourceLocationKey;
use common::Span;
use crossbeam::channel::SendError;
use crossbeam::channel::Sender;
use dashmap::mapref::entry::Entry;
use dashmap::DashMap;
use docblock_syntax::parse_docblock;
use extract_graphql::JavaScriptSourceFeature;
use fnv::FnvBuildHasher;
use graphql_ir::build_ir_with_extra_features;
use graphql_ir::BuilderOptions;
use graphql_ir::FragmentVariablesSemantic;
use graphql_ir::Program;
use graphql_ir::RelayMode;
use graphql_syntax::parse_executable_with_error_recovery_and_parser_features;
use graphql_syntax::ExecutableDefinition;
use graphql_syntax::ExecutableDocument;
use graphql_syntax::GraphQLSource;
use intern::string_key::Intern;
use intern::string_key::StringKey;
use log::debug;
use lsp_server::Message;
use lsp_types::Diagnostic;
use lsp_types::Range;
use lsp_types::TextDocumentPositionParams;
use lsp_types::Url;
use relay_compiler::config::Config;
use relay_compiler::get_parser_features;
use relay_compiler::FileCategorizer;
use relay_compiler::FileGroup;
use relay_compiler::ProjectName;
use relay_docblock::parse_docblock_ast;
use relay_docblock::ParseOptions;
use relay_transforms::deprecated_fields_for_executable_definition;
use schema::SDLSchema;
use schema_documentation::CombinedSchemaDocumentation;
use schema_documentation::SchemaDocumentation;
use schema_documentation::SchemaDocumentationLoader;
use tokio::sync::Notify;

use super::task_queue::TaskScheduler;
use crate::diagnostic_reporter::DiagnosticReporter;
use crate::docblock_resolution_info::create_docblock_resolution_info;
use crate::graphql_tools::get_query_text;
use crate::location::transform_relay_location_to_lsp_location_with_cache;
use crate::lsp_runtime_error::LSPRuntimeResult;
use crate::node_resolution_info::create_node_resolution_info;
use crate::utils::extract_executable_definitions_from_text_document;
use crate::utils::extract_feature_from_text;
use crate::utils::get_file_group_from_uri;
use crate::utils::get_project_name_from_file_group;
use crate::ContentConsumerType;
use crate::DocblockNode;
use crate::Feature;
use crate::FeatureResolutionInfo;
use crate::LSPExtraDataProvider;
use crate::LSPRuntimeError;

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
    ) -> LSPRuntimeResult<FeatureResolutionInfo>;

    fn root_dir(&self) -> PathBuf;

    fn extract_executable_document_from_text(
        &self,
        position: &TextDocumentPositionParams,
        index_offset: usize,
    ) -> LSPRuntimeResult<(ExecutableDocument, Span)>;

    fn extract_feature_from_text(
        &self,
        position: &TextDocumentPositionParams,
        index_offset: usize,
    ) -> LSPRuntimeResult<(Feature, Span)>;

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

    /// This is powering the functionality of executing GraphQL query from the IDE
    fn get_full_query_text(
        &self,
        query_text: String,
        project_name: &StringKey,
    ) -> LSPRuntimeResult<String>;

    fn document_opened(&self, url: &Url, text: &str) -> LSPRuntimeResult<()>;

    fn document_changed(&self, url: &Url, text: &str) -> LSPRuntimeResult<()>;

    fn document_closed(&self, url: &Url) -> LSPRuntimeResult<()>;

    /// To distinguish content, that we show to consumers
    /// we may need to know who's our current consumer.
    /// This is mostly for hover handler (where we render markup)
    fn get_content_consumer_type(&self) -> ContentConsumerType;

    /// Transform Relay location to LSP location. This involves converting
    /// character offsets to line/column numbers which means we need access to
    /// the text of the file.
    ///
    /// This variant should be used when the Relay location was derived from an
    /// open file which might not have been written to disk.
    fn transform_relay_location_in_editor_to_lsp_location(
        &self,
        location: Location,
    ) -> LSPRuntimeResult<lsp_types::Location>;
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
    synced_javascript_sources: DashMap<Url, Vec<JavaScriptSourceFeature>>,
    synced_schema_sources: DashMap<Url, GraphQLSource>,
    pub(crate) perf_logger: Arc<TPerfLogger>,
    pub(crate) diagnostic_reporter: Arc<DiagnosticReporter>,
    pub(crate) notify_lsp_state_resources: Arc<Notify>,
    pub(crate) project_status: ProjectStatusMap,
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
            synced_javascript_sources: Default::default(),
            synced_schema_sources: Default::default(),
        };

        // Preload schema documentation - this will warm-up schema documentation cache in the LSP Extra Data providers
        // TODO: Find a better place for this
        lsp_state.preload_documentation();

        debug!("Creating lsp_state created!");
        lsp_state
    }

    fn insert_synced_js_sources(&self, url: &Url, sources: Vec<JavaScriptSourceFeature>) {
        self.synced_javascript_sources.insert(url.clone(), sources);
    }

    fn validate_synced_js_sources(&self, url: &Url) -> LSPRuntimeResult<()> {
        let mut diagnostics = vec![];
        let javascript_features = self.synced_javascript_sources.get(url).ok_or_else(|| {
            LSPRuntimeError::UnexpectedError(format!("Expected GraphQL sources for URL {}", url))
        })?;
        let project_name = self.extract_project_name_from_url(url)?;
        let project_config = self
            .config
            .projects
            .get(&ProjectName::from(project_name))
            .unwrap();
        let schema = self
            .schemas
            .get(&project_name)
            .ok_or(LSPRuntimeError::ExpectedError)?;

        let mut executable_definitions = vec![];
        let mut docblock_sources = vec![];

        for (index, feature) in javascript_features.iter().enumerate() {
            match feature {
                JavaScriptSourceFeature::GraphQL(graphql_source) => {
                    let source_location_key = SourceLocationKey::embedded(url.as_ref(), index);
                    let result = parse_executable_with_error_recovery_and_parser_features(
                        &graphql_source.text_source().text,
                        source_location_key,
                        get_parser_features(project_config),
                    );
                    diagnostics.extend(result.diagnostics.iter().map(|diagnostic| {
                        self.diagnostic_reporter
                            .convert_diagnostic(graphql_source.text_source(), diagnostic)
                    }));
                    let get_errors_or_warnings = |documents| {
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
                    };
                    let compiler_diagnostics =
                        match build_ir_for_lsp(&schema, &result.item.definitions)
                            .and_then(get_errors_or_warnings)
                        {
                            Ok(warnings) => warnings,
                            Err(errors) => errors,
                        };

                    diagnostics.extend(compiler_diagnostics.iter().map(|diagnostic| {
                        self.diagnostic_reporter
                            .convert_diagnostic(graphql_source.text_source(), diagnostic)
                    }));

                    executable_definitions.extend(result.item.definitions);
                }
                JavaScriptSourceFeature::Docblock(docblock_source) => {
                    docblock_sources.push(docblock_source);
                }
            }
        }

        for (index, docblock_source) in docblock_sources.iter().enumerate() {
            let source_location_key = SourceLocationKey::embedded(url.as_ref(), index);
            let text_source = docblock_source.text_source();
            let text = &text_source.text;
            let result = parse_docblock(text, source_location_key).and_then(|ast| {
                parse_docblock_ast(
                    &project_config.name,
                    &ast,
                    Some(&executable_definitions),
                    &ParseOptions {
                        enable_interface_output_type: &project_config
                            .feature_flags
                            .relay_resolver_enable_interface_output_type,
                        allow_resolver_non_nullable_return_type: &project_config
                            .feature_flags
                            .allow_resolver_non_nullable_return_type,
                    },
                )
            });

            if let Err(errors) = result {
                diagnostics.extend(errors.iter().map(|diagnostic| {
                    self.diagnostic_reporter
                        .convert_diagnostic(text_source, diagnostic)
                }));
            }
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

    fn process_synced_js_sources(&self, uri: &Url, sources: Vec<JavaScriptSourceFeature>) {
        self.insert_synced_js_sources(uri, sources);
        self.schedule_task(Task::ValidateSyncedSource(uri.clone()));
    }

    fn remove_synced_js_sources(&self, url: &Url) {
        self.synced_javascript_sources.remove(url);
        self.diagnostic_reporter
            .clear_quick_diagnostics_for_url(url);
    }

    fn insert_synced_schema_source(&self, url: &Url, graphql_source: GraphQLSource) {
        self.synced_schema_sources
            .insert(url.clone(), graphql_source);
    }

    fn remove_synced_schema_source(&self, url: &Url) {
        self.synced_schema_sources.remove(url);
    }

    fn initialize_lsp_state_resources(&self, project_name: StringKey) {
        if let Entry::Vacant(e) = self.project_status.entry(project_name) {
            e.insert(ProjectStatus::Activated);
            self.notify_lsp_state_resources.notify_one();
        }
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
    ) -> LSPRuntimeResult<FeatureResolutionInfo> {
        let (feature, position_span) = self.extract_feature_from_text(
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

        match feature {
            Feature::ExecutableDocument(executable_document) => {
                Ok(FeatureResolutionInfo::GraphqlNode(
                    create_node_resolution_info(executable_document, position_span)?,
                ))
            }
            Feature::DocblockIr(docblock_ir) => {
                Ok(FeatureResolutionInfo::DocblockNode(DocblockNode {
                    resolution_info: create_docblock_resolution_info(&docblock_ir, position_span)
                        .ok_or(LSPRuntimeError::ExpectedError)?,
                    ir: docblock_ir,
                }))
            }
            Feature::SchemaDocument(_) => Err(LSPRuntimeError::ExpectedError),
        }
    }

    /// Return a parsed executable document for this LSP request, only if the request occurs
    /// within a GraphQL document.
    fn extract_executable_document_from_text(
        &self,
        position: &TextDocumentPositionParams,
        index_offset: usize,
    ) -> LSPRuntimeResult<(ExecutableDocument, Span)> {
        let (feature, span) = self.extract_feature_from_text(position, index_offset)?;
        match feature {
            Feature::ExecutableDocument(document) => Ok((document, span)),
            Feature::DocblockIr(_) => Err(LSPRuntimeError::ExpectedError),
            Feature::SchemaDocument(_) => Err(LSPRuntimeError::ExpectedError),
        }
    }

    /// Return a parsed executable document, or parsed Docblock IR for this LSP
    /// request, only if the request occurs within a GraphQL document or Docblock.
    fn extract_feature_from_text(
        &self,
        position: &TextDocumentPositionParams,
        index_offset: usize,
    ) -> LSPRuntimeResult<(Feature, Span)> {
        let project_name: ProjectName = self
            .extract_project_name_from_url(&position.text_document.uri)?
            .into();
        let project_config = self.config.projects.get(&project_name).unwrap();

        extract_feature_from_text(
            project_config,
            &self.synced_javascript_sources,
            &self.synced_schema_sources,
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
        let file_group = get_file_group_from_uri(&self.file_categorizer, url, &self.root_dir)?;

        get_project_name_from_file_group(&file_group).map_err(|msg| {
            LSPRuntimeError::UnexpectedError(format!(
                "Could not determine project name for \"{}\": {}",
                url, msg
            ))
        })
    }

    fn get_extra_data_provider(&self) -> &dyn LSPExtraDataProvider {
        self.extra_data_provider.as_ref()
    }

    fn resolve_executable_definitions(
        &self,
        text_document_uri: &Url,
    ) -> LSPRuntimeResult<Vec<ExecutableDefinition>> {
        let project_name: ProjectName = self
            .extract_project_name_from_url(text_document_uri)?
            .into();
        let project_config = self.config.projects.get(&project_name).unwrap();

        extract_executable_definitions_from_text_document(
            text_document_uri,
            &self.synced_javascript_sources,
            get_parser_features(project_config),
        )
    }

    fn get_diagnostic_for_range(&self, url: &Url, range: Range) -> Option<Diagnostic> {
        self.diagnostic_reporter
            .get_diagnostics_for_range(url, range)
    }

    fn get_full_query_text(
        &self,
        query_text: String,
        project_name: &StringKey,
    ) -> LSPRuntimeResult<String> {
        get_query_text(self, query_text, (*project_name).into())
    }

    fn document_opened(&self, uri: &Url, text: &str) -> LSPRuntimeResult<()> {
        let file_group = get_file_group_from_uri(&self.file_categorizer, uri, &self.root_dir)?;
        let project_name = get_project_name_from_file_group(&file_group).map_err(|msg| {
            LSPRuntimeError::UnexpectedError(format!(
                "Could not determine project name for \"{}\": {}",
                uri, msg
            ))
        })?;

        match file_group {
            FileGroup::Schema { project_set: _ } | FileGroup::Extension { project_set: _ } => {
                self.initialize_lsp_state_resources(project_name);
                self.insert_synced_schema_source(uri, GraphQLSource::new(text, 0, 0));

                Ok(())
            }
            FileGroup::Source { project_set: _ } => {
                let mut embedded_sources = extract_graphql::extract(text);
                if text.contains("relay:enable-new-relay-resolver") {
                    embedded_sources
                        .retain(|source| !matches!(source, JavaScriptSourceFeature::Docblock(_)));
                }

                if !embedded_sources.is_empty() {
                    self.initialize_lsp_state_resources(project_name);
                    self.process_synced_js_sources(uri, embedded_sources);
                }

                Ok(())
            }
            _ => Err(LSPRuntimeError::ExpectedError),
        }
    }

    fn document_changed(&self, uri: &Url, text: &str) -> LSPRuntimeResult<()> {
        let file_group = get_file_group_from_uri(&self.file_categorizer, uri, &self.root_dir)?;

        match file_group {
            FileGroup::Schema { project_set: _ } | FileGroup::Extension { project_set: _ } => {
                self.insert_synced_schema_source(uri, GraphQLSource::new(text, 0, 0));

                Ok(())
            }
            FileGroup::Source { project_set: _ } => {
                let mut embedded_sources = extract_graphql::extract(text);
                if text.contains("relay:enable-new-relay-resolver") {
                    embedded_sources
                        .retain(|source| !matches!(source, JavaScriptSourceFeature::Docblock(_)));
                }
                if embedded_sources.is_empty() {
                    self.remove_synced_js_sources(uri);
                } else {
                    self.process_synced_js_sources(uri, embedded_sources);
                }

                Ok(())
            }
            _ => Err(LSPRuntimeError::ExpectedError),
        }
    }

    fn document_closed(&self, uri: &Url) -> LSPRuntimeResult<()> {
        self.remove_synced_schema_source(uri);
        self.remove_synced_js_sources(uri);
        Ok(())
    }

    fn get_content_consumer_type(&self) -> ContentConsumerType {
        ContentConsumerType::Relay
    }

    fn transform_relay_location_in_editor_to_lsp_location(
        &self,
        location: Location,
    ) -> LSPRuntimeResult<lsp_types::Location> {
        transform_relay_location_to_lsp_location_with_cache(
            &self.root_dir(),
            location,
            Some(&self.synced_javascript_sources),
            Some(&self.synced_schema_sources),
        )
    }
}

pub fn build_ir_for_lsp(
    schema: &SDLSchema,
    definitions: &[ExecutableDefinition],
) -> DiagnosticsResult<Vec<graphql_ir::ExecutableDefinition>> {
    build_ir_with_extra_features(
        schema,
        definitions,
        &BuilderOptions {
            allow_undefined_fragment_spreads: true,
            fragment_variables_semantic: FragmentVariablesSemantic::PassedValue,
            relay_mode: Some(RelayMode),
            default_anonymous_operation_name: None,
            allow_custom_scalar_literals: true, // for compatibility
        },
    )
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
            state.validate_synced_js_sources(&url).ok();
        }
        Task::ValidateSyncedSources => {
            for item in &state.synced_javascript_sources {
                state.schedule_task(Task::ValidateSyncedSource(item.key().clone()));
            }
        }
    }
}
