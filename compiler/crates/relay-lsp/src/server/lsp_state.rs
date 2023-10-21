/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::path::PathBuf;
use std::sync::Arc;

use common::PerfLogger;
use common::SourceLocationKey;
use common::Span;
use crossbeam::channel::SendError;
use crossbeam::channel::Sender;
use dashmap::mapref::entry::Entry;
use dashmap::mapref::one::Ref;
use dashmap::DashMap;
use docblock_syntax::parse_docblock;
use extract_graphql::JavaScriptSourceFeature;
use fnv::FnvBuildHasher;
use graphql_ir::build_ir_with_extra_features;
use graphql_ir::BuilderOptions;
use graphql_ir::FragmentVariablesSemantic;
use graphql_ir::Program;
use graphql_ir::RelayMode;
use graphql_syntax::parse_executable_with_error_recovery;
use graphql_syntax::ExecutableDefinition;
use graphql_syntax::ExecutableDocument;
use intern::string_key::Intern;
use intern::string_key::StringKey;
use log::debug;
use lsp_server::Message;
use lsp_types::Diagnostic;
use lsp_types::Position;
use lsp_types::Range;
use lsp_types::TextDocumentContentChangeEvent;
use lsp_types::TextDocumentItem;
use lsp_types::TextDocumentPositionParams;
use lsp_types::Url;
use relay_compiler::config::Config;
use relay_compiler::FileCategorizer;
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
use crate::js_language_server::JSLanguageServer;
use crate::lsp_runtime_error::LSPRuntimeResult;
use crate::node_resolution_info::create_node_resolution_info;
use crate::utils::extract_executable_definitions_from_text_document;
use crate::utils::extract_feature_from_text;
use crate::utils::extract_project_name_from_url;
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

    /// Experimental (Relay-only) JS Language Server instance
    fn get_js_language_sever(&self) -> Option<&dyn JSLanguageServer<TState = Self>>;

    /// This is powering the functionality of executing GraphQL query from the IDE
    fn get_full_query_text(
        &self,
        query_text: String,
        project_name: &StringKey,
    ) -> LSPRuntimeResult<String>;

    fn document_opened(&self, url: &Url, text_document: &TextDocumentItem) -> LSPRuntimeResult<()>;

    fn document_changed(
        &self,
        url: &Url,
        changes: Vec<TextDocumentContentChangeEvent>,
        version: i32,
    ) -> LSPRuntimeResult<()>;

    fn document_closed(&self, url: &Url) -> LSPRuntimeResult<()>;

    /// To distinguish content, that we show to consumers
    /// we may need to know who's our current consumer.
    /// This is mostly for hover handler (where we render markup)
    fn get_content_consumer_type(&self) -> ContentConsumerType;

    fn get_content_of_open_text_document(&self, url: &Url) -> LSPRuntimeResult<&str>;
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
    synced_javascript_features: DashMap<Url, Vec<JavaScriptSourceFeature>>,
    pub(crate) perf_logger: Arc<TPerfLogger>,
    pub(crate) diagnostic_reporter: Arc<DiagnosticReporter>,
    pub(crate) notify_lsp_state_resources: Arc<Notify>,
    pub(crate) project_status: ProjectStatusMap,
    js_resource: Option<Box<dyn JSLanguageServer<TState = Self>>>,
    open_text_documents: DashMap<Url, FullTextDocument>,
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
            synced_javascript_features: Default::default(),
            js_resource,
            open_text_documents: DashMap::new(),
        };

        // Preload schema documentation - this will warm-up schema documentation cache in the LSP Extra Data providers
        // TODO: Find a better place for this
        lsp_state.preload_documentation();

        debug!("Creating lsp_state created!");
        lsp_state
    }

    fn insert_synced_sources(&self, url: &Url, sources: Vec<JavaScriptSourceFeature>) {
        self.synced_javascript_features.insert(url.clone(), sources);
    }

    fn validate_synced_sources(&self, url: &Url) -> LSPRuntimeResult<()> {
        let mut diagnostics = vec![];
        let javascript_features = self.synced_javascript_features.get(url).ok_or_else(|| {
            LSPRuntimeError::UnexpectedError(format!("Expected GraphQL sources for URL {}", url))
        })?;
        let project_name = self.extract_project_name_from_url(url)?;
        let schema = self
            .schemas
            .get(&project_name)
            .ok_or(LSPRuntimeError::ExpectedError)?;

        let mut executable_definitions = vec![];
        let mut docblock_sources = vec![];

        for (index, feature) in javascript_features.iter().enumerate() {
            let source_location_key = SourceLocationKey::embedded(&url.to_string(), index);

            match feature {
                JavaScriptSourceFeature::GraphQL(graphql_source) => {
                    let result = parse_executable_with_error_recovery(
                        &graphql_source.text_source().text,
                        source_location_key,
                    );
                    diagnostics.extend(result.diagnostics.iter().map(|diagnostic| {
                        self.diagnostic_reporter
                            .convert_diagnostic(graphql_source.text_source(), diagnostic)
                    }));

                    let compiler_diagnostics = match build_ir_with_extra_features(
                        &schema,
                        &result.item.definitions,
                        &BuilderOptions {
                            allow_undefined_fragment_spreads: true,
                            fragment_variables_semantic: FragmentVariablesSemantic::PassedValue,
                            relay_mode: Some(RelayMode),
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

        let project_config = self
            .config
            .projects
            .get(&ProjectName::from(project_name))
            .unwrap();
        for (index, docblock_source) in docblock_sources.iter().enumerate() {
            let source_location_key = SourceLocationKey::embedded(url.as_ref(), index);
            let text_source = docblock_source.text_source();
            let text = &text_source.text;
            let result = parse_docblock(text, source_location_key).and_then(|ast| {
                parse_docblock_ast(
                    project_config.name,
                    &ast,
                    Some(&executable_definitions),
                    ParseOptions {
                        enable_output_type: &project_config
                            .feature_flags
                            .relay_resolver_enable_output_type,
                        enable_strict_resolver_flavors: &project_config
                            .feature_flags
                            .relay_resolvers_enable_strict_resolver_flavors,
                        allow_legacy_verbose_syntax: &project_config
                            .feature_flags
                            .relay_resolvers_allow_legacy_verbose_syntax,
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

    fn process_synced_sources(
        &self,
        uri: &Url,
        sources: Vec<JavaScriptSourceFeature>,
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
        self.synced_javascript_features.remove(url);
        self.diagnostic_reporter
            .clear_quick_diagnostics_for_url(url);
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

        let info = match feature {
            Feature::GraphQLDocument(executable_document) => FeatureResolutionInfo::GraphqlNode(
                create_node_resolution_info(executable_document, position_span)?,
            ),
            Feature::DocblockIr(docblock_ir) => FeatureResolutionInfo::DocblockNode(DocblockNode {
                resolution_info: create_docblock_resolution_info(&docblock_ir, position_span)
                    .ok_or(LSPRuntimeError::ExpectedError)?,
                ir: docblock_ir,
            }),
        };
        Ok(info)
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
            Feature::GraphQLDocument(document) => Ok((document, span)),
            Feature::DocblockIr(_) => Err(LSPRuntimeError::ExpectedError),
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
            &self.synced_javascript_features,
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
            &self.synced_javascript_features,
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
        get_query_text(self, query_text, (*project_name).into())
    }

    fn document_opened(&self, uri: &Url, text_document: &TextDocumentItem) -> LSPRuntimeResult<()> {
        let open_text_document = FullTextDocument::new(
            text_document.language_id.clone(),
            text_document.version,
            text_document.text.clone(),
        );

        self.open_text_documents
            .insert(uri.clone(), open_text_document);

        let text = open_text_document.get_content(None);

        if let Some(js_server) = self.get_js_language_sever() {
            js_server.process_js_source(uri, text);
        }

        // First we check to see if this document has any GraphQL documents.
        let embedded_sources = extract_graphql::extract(text);
        if embedded_sources.is_empty() {
            Ok(())
        } else {
            self.process_synced_sources(uri, embedded_sources)
        }
    }

    fn document_changed(
        &self,
        uri: &Url,
        changes: Vec<TextDocumentContentChangeEvent>,
        version: i32,
    ) -> LSPRuntimeResult<()> {
        let mut open_text_document = self
            .open_text_documents
            .get_mut(uri)
            .ok_or(LSPRuntimeError::ExpectedError)?;

        open_text_document.update(&changes, version);

        let full_text = open_text_document.get_content(None);

        if let Some(js_server) = self.get_js_language_sever() {
            js_server.process_js_source(uri, full_text);
        }

        // First we check to see if this document has any GraphQL documents.
        let embedded_sources = extract_graphql::extract(full_text);
        if embedded_sources.is_empty() {
            self.remove_synced_sources(uri);
            Ok(())
        } else {
            self.process_synced_sources(uri, embedded_sources)
        }
    }

    fn document_closed(&self, uri: &Url) -> LSPRuntimeResult<()> {
        self.open_text_documents.remove(uri);

        if let Some(js_server) = self.get_js_language_sever() {
            js_server.remove_js_source(uri);
        }
        self.remove_synced_sources(uri);
        Ok(())
    }

    fn get_content_consumer_type(&self) -> ContentConsumerType {
        ContentConsumerType::Relay
    }

    fn get_content_of_open_text_document(&self, url: &Url) -> LSPRuntimeResult<&str> {
        let open_text_document = self
            .open_text_documents
            .get(url)
            .ok_or(LSPRuntimeError::ExpectedError)?;

        let text = open_text_document.get_content(None);

        Ok(text)
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
            for item in &state.synced_javascript_features {
                state.schedule_task(Task::ValidateSyncedSource(item.key().clone()));
            }
        }
    }
}

// TODO: The below was taken from lsp-textdocument and will be replaced
//       once this package has published a new version with the removed unstable code.
#[derive(Debug)]
pub struct FullTextDocument {
    language_id: String,
    version: i32,
    content: String,

    /// The value at index `i` in `line_offsets` is the index into `content`
    /// that is the start of line `i`. As such, the first element of
    /// `line_offsets` is always 0.
    line_offsets: Vec<u32>,
}

fn computed_line_offsets(text: &str, is_at_line_start: bool, text_offset: Option<u32>) -> Vec<u32> {
    let text_offset = text_offset.unwrap_or(0);
    let mut line_offsets = if is_at_line_start {
        vec![text_offset]
    } else {
        vec![]
    };

    let mut chars = text.char_indices().peekable();
    while let Some((idx, char)) = chars.next() {
        let idx: u32 = idx
            .try_into()
            .expect("The length of the text involved in the calculation is too long");
        if char == '\r' && chars.peek() == Some(&(idx as usize + 1, '\n')) {
            chars.next();
            line_offsets.push(text_offset + idx + 2);
        } else if char == '\n' || char == '\r' {
            line_offsets.push(text_offset + idx + 1);
        }
    }

    line_offsets
}

/// given a string (in UTF-8) and a byte offset, returns the offset in UTF-16 code units
///
/// for example, consider a string containing a single 4-byte emoji. 4-byte characters
/// in UTF-8 are supplementary plane characters that require two UTF-16 code units
/// (surrogate pairs).
///
/// in this example:
/// - offset 4 returns 2;
/// - offsets 1, 2 or 3 return 0, because they are not on a character boundary and round down;
/// - offset 5+ will return 2, the length of the string in UTF-16
fn line_offset_utf16(line: &str, offset: u32) -> u32 {
    let mut c = 0;
    for (idx, char) in line.char_indices() {
        if idx + char.len_utf8() > offset as usize || idx == offset as usize {
            break;
        }
        c += char.len_utf16() as u32;
    }
    c
}

impl FullTextDocument {
    pub fn new(language_id: String, version: i32, content: String) -> Self {
        let line_offsets = computed_line_offsets(&content, true, None);
        Self {
            language_id,
            version,
            content,
            line_offsets,
        }
    }

    pub fn update(&mut self, changes: &[TextDocumentContentChangeEvent], version: i32) {
        for change in changes {
            let TextDocumentContentChangeEvent { range, text, .. } = change;
            match range {
                Some(range) => {
                    // update content
                    let Range { start, end } = range;
                    let (start, start_offset) = self.find_canonical_position(start);
                    let (end, end_offset) = self.find_canonical_position(end);
                    assert!(
                        start_offset <= end_offset,
                        "Start offset must be less than end offset. {}:{} (offset {}) is not <= {}:{} (offset {})",
                        start.line, start.character, start_offset,
                        end.line, end.character, end_offset
                    );
                    self.content
                        .replace_range((start_offset as usize)..(end_offset as usize), text);

                    let (start_line, end_line) = (start.line, end.line);
                    assert!(start_line <= end_line);
                    let added_line_offsets = computed_line_offsets(text, false, Some(start_offset));
                    let num_added_line_offsets = added_line_offsets.len();

                    let splice_start = start_line as usize + 1;
                    self.line_offsets
                        .splice(splice_start..=end_line as usize, added_line_offsets);

                    let diff =
                        (text.len() as i32).saturating_sub_unsigned(end_offset - start_offset);
                    if diff != 0 {
                        for i in
                            (splice_start + num_added_line_offsets)..(self.line_count() as usize)
                        {
                            self.line_offsets[i] = self.line_offsets[i].saturating_add_signed(diff);
                        }
                    }
                }
                None => {
                    // Full Text
                    // update line_offsets
                    self.line_offsets = computed_line_offsets(text, true, None);

                    // update content
                    self.content = text.to_owned();
                }
            }
        }

        self.version = version;
    }

    /// As demonstrated by test_multiple_position_same_offset(), in some cases,
    /// there are multiple ways to reference the same Position. We map to a
    /// "canonical Position" so we can avoid worrying about edge cases all over
    /// the place.
    fn find_canonical_position(&self, position: &Position) -> (Position, u32) {
        let offset = self.offset_at(*position);
        if offset == 0 {
            (
                Position {
                    line: 0,
                    character: 0,
                },
                0,
            )
        } else if self.content.as_bytes().get(offset as usize - 1) == Some(&b'\n') {
            if self.line_offsets[position.line as usize] == offset {
                (*position, offset)
            } else if self.line_offsets[position.line as usize + 1] == offset {
                (
                    Position {
                        line: position.line + 1,
                        character: 0,
                    },
                    offset,
                )
            } else {
                panic!(
                    "Could not determine canonical value for {position:?} in {:?}",
                    self.content
                )
            }
        } else {
            (*position, offset)
        }
    }

    /// Document's language id
    pub fn language_id(&self) -> &str {
        &self.language_id
    }

    /// Document's version
    pub fn version(&self) -> i32 {
        self.version
    }

    /// Get document content
    ///
    /// # Examples
    ///
    /// Basic usage:
    /// ```
    /// use lsp_textdocument::FullTextDocument;
    /// use lsp_types::{Range, Position};
    ///
    /// let text_documents = FullTextDocument::new("plain_text".to_string(), 1, "hello rust!".to_string());
    ///
    /// // get document all content
    /// let content = text_documents.get_content(None);
    /// assert_eq!(content, "hello rust!");
    ///
    /// // get document specify content by range
    /// let (start, end) = (Position::new(0, 1), Position::new(0, 9));
    /// let range = Range::new(start, end);
    /// let sub_content = text_documents.get_content(Some(range));
    /// assert_eq!(sub_content, "ello rus");
    /// ```
    pub fn get_content(&self, range: Option<Range>) -> &str {
        match range {
            Some(Range { start, end }) => {
                let start = self.offset_at(start);
                let end = self.offset_at(end).min(self.content_len());
                self.content.get(start as usize..end as usize).unwrap()
            }
            None => &self.content,
        }
    }

    fn get_line_and_offset(&self, line: u32) -> Option<(&str, u32)> {
        self.line_offsets.get(line as usize).map(|&line_offset| {
            let len: u32 = self.content_len();
            let eol_offset = self.line_offsets.get((line + 1) as usize).unwrap_or(&len);
            let line = &self.content[line_offset as usize..*eol_offset as usize];
            (line, line_offset)
        })
    }

    fn get_line(&self, line: u32) -> Option<&str> {
        self.get_line_and_offset(line).map(|(line, _)| line)
    }

    /// A amount of document content line
    pub fn line_count(&self) -> u32 {
        self.line_offsets
            .len()
            .try_into()
            .expect("The number of lines of text passed in is too long")
    }

    /// The length of the document content in UTF-8 bytes
    pub fn content_len(&self) -> u32 {
        self.content
            .len()
            .try_into()
            .expect("The length of the text passed in is too long")
    }

    /// Converts a zero-based byte offset in the UTF8-encoded content to a position
    ///
    /// the offset is in bytes, the position is in UTF16 code units. rounds down if
    /// the offset is not on a code unit boundary, or is beyond the end of the
    /// content.
    pub fn position_at(&self, offset: u32) -> Position {
        let offset = offset.min(self.content_len());
        let line_count = self.line_count();
        if line_count == 1 {
            // only one line
            return Position {
                line: 0,
                character: line_offset_utf16(self.get_line(0).unwrap(), offset),
            };
        }

        let (mut low, mut high) = (0, line_count);
        while low < high {
            let mid = (low + high) / 2;
            if offset
                > *self
                    .line_offsets
                    .get(mid as usize)
                    .expect("Unknown mid value")
            {
                low = mid + 1;
            } else {
                high = mid;
            }
        }

        if low == 0 {
            // offset is on the first line
            return Position {
                line: 0,
                character: line_offset_utf16(self.get_line(0).unwrap(), offset),
            };
        }

        let line = low - 1;

        Position {
            line,
            character: line_offset_utf16(
                self.get_line(line).unwrap(),
                offset - self.line_offsets[line as usize],
            ),
        }
    }

    /// Converts a position to a zero-based byte offset, suitable for slicing the
    /// UTF-8 encoded content.
    pub fn offset_at(&self, position: Position) -> u32 {
        let Position { line, character } = position;
        match self.get_line_and_offset(line) {
            Some((line, offset)) => {
                let mut c = 0;
                let iter = line.char_indices();
                for (idx, char) in iter {
                    if c == character {
                        return offset + idx as u32;
                    }
                    c += char.len_utf16() as u32;
                }
                offset + line.len() as u32
            }
            None => {
                if line >= self.line_count() {
                    self.content_len()
                } else {
                    0
                }
            }
        }
    }
}
