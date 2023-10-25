/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Utilities for providing the rename feature

use std::collections::HashMap;
use std::path::PathBuf;

use common::Location as IRLocation;
use common::SourceLocationKey;
use common::Span;
use extract_graphql::JavaScriptSourceFeature;
use graphql_ir::FragmentDefinition;
use graphql_ir::FragmentSpread;
use graphql_ir::Program;
use graphql_ir::Visitor;
use graphql_syntax::parse_executable_with_error_recovery;
use graphql_syntax::ExecutableDefinition;
use graphql_syntax::OperationDefinition;
use intern::string_key::Intern;
use intern::string_key::StringKey;
use lsp_types::request::PrepareRenameRequest;
use lsp_types::request::Rename;
use lsp_types::request::Request;
use lsp_types::request::WillRenameFiles;
use lsp_types::PrepareRenameResponse;
use lsp_types::TextEdit;
use lsp_types::Url;
use lsp_types::WorkspaceEdit;
use rayon::prelude::IntoParallelRefIterator;
use rayon::prelude::ParallelIterator;
use relay_docblock::DocblockIr;
use relay_docblock::On;
use relay_transforms::extract_module_name;
use resolution_path::ArgumentParent;
use resolution_path::ArgumentPath;
use resolution_path::IdentParent;
use resolution_path::IdentPath;
use resolution_path::ResolutionPath;
use resolution_path::ResolvePosition;
use resolution_path::VariableIdentifierPath;

use crate::docblock_resolution_info::create_docblock_resolution_info;
use crate::docblock_resolution_info::DocblockResolutionInfo;
use crate::find_field_usages::find_field_locations;
use crate::location::get_file_contents;
use crate::location::transform_relay_location_to_lsp_location;
use crate::utils::is_file_uri_in_dir;
use crate::Feature;
use crate::GlobalState;
use crate::LSPRuntimeError;
use crate::LSPRuntimeResult;
use lazy_static::lazy_static;

lazy_static! {
    static ref ARGUMENTS_DIRECTIVE: StringKey = "arguments".intern();
    static ref ARGUMENTDEFINITIONS_DIRECTIVE: StringKey = "argumentDefinitions".intern();
}

/// Resolve a [`Rename`] request to workspace edits
pub fn on_rename(
    state: &impl GlobalState,
    params: <Rename as Request>::Params,
) -> LSPRuntimeResult<<Rename as Request>::Result> {
    let uri = &params.text_document_position.text_document.uri;
    let (feature, location) = state.extract_feature_from_text(&params.text_document_position, 1)?;

    let program = &state.get_program(&state.extract_project_name_from_url(&uri)?)?;
    let root_dir = &state.root_dir();

    let rename_request = create_rename_request(feature, location)?;
    let changes = process_rename_request(rename_request, params.new_name, program, root_dir)?;

    Ok(Some(WorkspaceEdit {
        changes: Some(changes),
        ..Default::default()
    }))
}

/// Resolve a [`PrepareRenameRequest`] to a [`PrepareRenameResponse`]
pub fn on_prepare_rename(
    state: &impl GlobalState,
    params: <PrepareRenameRequest as Request>::Params,
) -> LSPRuntimeResult<<PrepareRenameRequest as Request>::Result> {
    let root_dir = &state.root_dir();
    let (feature, location) = state.extract_feature_from_text(&params, 1)?;

    let rename_request = create_rename_request(feature, location)?;

    // TODO: Remove the condition, once https://github.com/facebook/relay/issues/4447 is resolved
    match rename_request.kind {
        RenameKind::ResolverName { .. } => Err(LSPRuntimeError::UnexpectedError(String::from(
            "Relay Resolvers can not yet be reliably renamed",
        ))),
        _ => {
            let lsp_location =
                transform_relay_location_to_lsp_location(root_dir, rename_request.location)?;

            Ok(Some(PrepareRenameResponse::Range(lsp_location.range)))
        }
    }
}

/// Resolve a [`WillRenameFiles`] request to workspace edits
pub fn on_will_rename_files(
    state: &impl GlobalState,
    params: <WillRenameFiles as Request>::Params,
) -> LSPRuntimeResult<<WillRenameFiles as Request>::Result> {
    let mut rename_changes = HashMap::new();

    for file_rename in &params.files {
        let old_file_uri =
            Url::parse(&file_rename.old_uri).map_err(|_| LSPRuntimeError::ExpectedError)?;
        let new_file_uri =
            Url::parse(&file_rename.new_uri).map_err(|_| LSPRuntimeError::ExpectedError)?;

        if !is_file_uri_in_dir(state.root_dir(), &new_file_uri) {
            continue;
        }

        let old_path = old_file_uri
            .to_file_path()
            .map_err(|_| LSPRuntimeError::ExpectedError)?;
        let new_path = new_file_uri
            .to_file_path()
            .map_err(|_| LSPRuntimeError::ExpectedError)?;

        let old_prefix = get_module_name(&old_path)?;
        let new_prefix = get_module_name(&new_path)?;

        if old_prefix == new_prefix {
            continue;
        }

        let full_text = get_file_contents(&old_path)?;

        let embedded_sources = extract_graphql::extract(&full_text);
        if embedded_sources.is_empty() {
            continue;
        }

        let program = &state.get_program(&state.extract_project_name_from_url(&old_file_uri)?)?;
        let root_dir = &state.root_dir();

        for (index, embedded_source) in embedded_sources.iter().enumerate() {
            match embedded_source {
                JavaScriptSourceFeature::GraphQL(graphql_source) => {
                    let text_source = graphql_source.text_source();
                    let old_source_location =
                        SourceLocationKey::embedded(old_path.to_str().unwrap(), index);
                    let new_source_location =
                        SourceLocationKey::embedded(new_path.to_str().unwrap(), index);
                    let document = parse_executable_with_error_recovery(
                        &text_source.text,
                        new_source_location,
                    )
                    .item;

                    for definition in &document.definitions {
                        let (old_name, rename_request) = match definition {
                            ExecutableDefinition::Fragment(
                                graphql_syntax::FragmentDefinition {
                                    name: fragment_name,
                                    ..
                                },
                            ) => {
                                let old_frag_name = fragment_name.value;

                                Some((
                                    old_frag_name.to_string(),
                                    RenameRequest::new(
                                        RenameKind::FragmentName {
                                            fragment_name: old_frag_name,
                                        },
                                        IRLocation::new(old_source_location, fragment_name.span),
                                    ),
                                ))
                            }
                            ExecutableDefinition::Operation(OperationDefinition {
                                name: Some(operation_name),
                                ..
                            }) => Some((
                                operation_name.value.to_string(),
                                RenameRequest::new(
                                    RenameKind::OperationName,
                                    IRLocation::new(old_source_location, operation_name.span),
                                ),
                            )),
                            ExecutableDefinition::Operation(
                                graphql_syntax::OperationDefinition { name: None, .. },
                            ) => None,
                        }
                        .ok_or(LSPRuntimeError::ExpectedError)?;

                        let new_name = replace_prefix(&old_name, &old_prefix, &new_prefix);
                        let changes =
                            process_rename_request(rename_request, new_name, program, root_dir)?;

                        merge_text_changes(&mut rename_changes, changes);
                    }
                }
                _ => (),
            };
        }
    }

    Ok(Some(WorkspaceEdit {
        changes: Some(rename_changes),
        ..Default::default()
    }))
}

#[derive(Debug, Clone)]
pub enum RenameKind {
    OperationName,
    FragmentName {
        fragment_name: StringKey,
    },
    ResolverName {
        resolver_name: StringKey,
        parent_type: StringKey,
    },
    VariableName {
        variable_name: StringKey,
    },
    ArgumentDefinitionName {
        argument_name: StringKey,
    },
}

#[derive(Debug)]
pub struct RenameRequest {
    /// The type of the rename request we're responding to
    kind: RenameKind,
    location: IRLocation,
}

impl RenameRequest {
    fn new(kind: RenameKind, location: IRLocation) -> Self {
        Self { kind, location }
    }
}

fn create_rename_request(
    feature: Feature,
    location: IRLocation,
) -> LSPRuntimeResult<RenameRequest> {
    match feature {
        Feature::GraphQLDocument(document) => {
            let node_path = document.resolve((), location.span());

            match node_path {
                ResolutionPath::VariableIdentifier(VariableIdentifierPath {
                    inner: variable,
                    ..
                }) => {
                    let span_without_dollar = Span::new(variable.span.start + 1, variable.span.end);
                    let location = IRLocation::new(location.source_location(), span_without_dollar);
                    let kind = RenameKind::VariableName {
                        variable_name: variable.name,
                    };

                    Ok(RenameRequest::new(kind, location))
                }
                ResolutionPath::Ident(IdentPath {
                    inner: argument_name,
                    parent:
                        IdentParent::ArgumentName(ArgumentPath {
                            parent: ArgumentParent::Directive(directive),
                            ..
                        }),
                }) => {
                    if directive.inner.name.value != *ARGUMENTS_DIRECTIVE
                        && directive.inner.name.value != *ARGUMENTDEFINITIONS_DIRECTIVE
                    {
                        return Err(LSPRuntimeError::ExpectedError);
                    }

                    let location = IRLocation::new(location.source_location(), argument_name.span);
                    let kind = RenameKind::ArgumentDefinitionName {
                        argument_name: argument_name.value,
                    };

                    Ok(RenameRequest::new(kind, location))
                }
                ResolutionPath::Ident(IdentPath {
                    inner: fragment_name,
                    parent:
                        IdentParent::FragmentSpreadName(_) | IdentParent::FragmentDefinitionName(_),
                }) => {
                    let location = IRLocation::new(location.source_location(), fragment_name.span);
                    let kind = RenameKind::FragmentName {
                        fragment_name: fragment_name.value,
                    };

                    Ok(RenameRequest::new(kind, location))
                }
                ResolutionPath::Ident(IdentPath {
                    inner: operation_name,
                    parent: IdentParent::OperationDefinitionName(_),
                }) => {
                    let location = IRLocation::new(location.source_location(), operation_name.span);

                    Ok(RenameRequest::new(RenameKind::OperationName, location))
                }
                _ => Err(LSPRuntimeError::ExpectedError),
            }
        }
        Feature::DocblockIr(docblock) => {
            let resolution_info = create_docblock_resolution_info(&docblock, location.span());

            match resolution_info {
                Some(DocblockResolutionInfo::FieldName(docblock_field)) => {
                    let location = IRLocation::new(location.source_location(), docblock_field.span);
                    let kind = RenameKind::ResolverName {
                        resolver_name: docblock_field.value,
                        parent_type: extract_parent_type(docblock),
                    };

                    Ok(RenameRequest::new(kind, location))
                }
                _ => Err(LSPRuntimeError::ExpectedError),
            }
        }
    }
}

fn process_rename_request(
    rename_request: RenameRequest,
    new_name: String,
    program: &Program,
    root_dir: &PathBuf,
) -> LSPRuntimeResult<HashMap<Url, Vec<TextEdit>>> {
    match rename_request.kind {
        RenameKind::VariableName { variable_name } => {
            let lsp_location =
                transform_relay_location_to_lsp_location(root_dir, rename_request.location)?;

            Ok(HashMap::from([(
                lsp_location.uri,
                vec![TextEdit {
                    new_text: new_name,
                    range: lsp_location.range,
                }],
            )]))
        }
        RenameKind::ArgumentDefinitionName { argument_name } => {
            let lsp_location =
                transform_relay_location_to_lsp_location(root_dir, rename_request.location)?;

            Ok(HashMap::from([(
                lsp_location.uri,
                vec![TextEdit {
                    new_text: new_name,
                    range: lsp_location.range,
                }],
            )]))
        }
        RenameKind::OperationName => {
            let lsp_location =
                transform_relay_location_to_lsp_location(root_dir, rename_request.location)?;

            Ok(HashMap::from([(
                lsp_location.uri,
                vec![TextEdit {
                    new_text: new_name,
                    range: lsp_location.range,
                }],
            )]))
        }
        RenameKind::FragmentName { fragment_name } => {
            Ok(rename_fragment(fragment_name, new_name, program, root_dir))
        }
        RenameKind::ResolverName {
            parent_type,
            resolver_name,
        } => Ok(rename_relay_resolver_field(
            resolver_name,
            parent_type,
            &new_name,
            rename_request.location,
            program,
            root_dir,
        )),
    }
}

fn rename_relay_resolver_field(
    field_name: StringKey,
    type_name: StringKey,
    new_field_name: &str,
    field_definition_location: IRLocation,
    program: &Program,
    root_dir: &PathBuf,
) -> HashMap<Url, Vec<TextEdit>> {
    let mut locations =
        find_field_locations(program, field_name, type_name).unwrap_or_else(|| vec![]);
    locations.push(field_definition_location);

    map_locations_to_text_edits(locations, new_field_name.to_owned(), root_dir)
}

fn rename_fragment(
    fragment_name: StringKey,
    new_fragment_name: String,
    program: &Program,
    root_dir: &PathBuf,
) -> HashMap<Url, Vec<TextEdit>> {
    let locations = FragmentFinder::get_fragment_usages(program, fragment_name);

    map_locations_to_text_edits(locations, new_fragment_name, root_dir)
}

fn map_locations_to_text_edits(
    locations: Vec<IRLocation>,
    new_text: String,
    root_dir: &PathBuf,
) -> HashMap<Url, Vec<TextEdit>> {
    let vec_res: Vec<(Url, TextEdit)> = locations
        .par_iter()
        .flat_map(|location| {
            let transformed = transform_relay_location_to_lsp_location(root_dir, *location);
            transformed.ok().map(|lsp_location| {
                let text_edit = TextEdit {
                    range: lsp_location.range,
                    new_text: new_text.to_owned(),
                };
                (lsp_location.uri, text_edit)
            })
        })
        .collect();

    let mut changes: HashMap<Url, Vec<TextEdit>> = HashMap::new();
    for (uri, text_edit) in vec_res {
        changes.entry(uri).or_default().push(text_edit);
    }

    changes
}

fn extract_parent_type(docblock: DocblockIr) -> StringKey {
    match docblock {
        DocblockIr::LegacyVerboseResolver(resolver_ir) => match resolver_ir.on {
            On::Type(on_type) => on_type.value.item,
            On::Interface(on_interface) => on_interface.value.item,
        },
        DocblockIr::TerseRelayResolver(resolver_ir) => resolver_ir.type_.item,
        DocblockIr::StrongObjectResolver(strong_object) => strong_object.type_name.value,
        DocblockIr::WeakObjectType(weak_type_ir) => weak_type_ir.type_name.value,
    }
}

#[derive(Debug, Clone)]
struct FragmentFinder {
    fragment_locations: Vec<IRLocation>,
    fragment_name: StringKey,
}

impl FragmentFinder {
    pub fn get_fragment_usages(program: &Program, name: StringKey) -> Vec<IRLocation> {
        let mut finder = FragmentFinder {
            fragment_locations: vec![],
            fragment_name: name,
        };
        finder.visit_program(program);
        finder.fragment_locations
    }
}

impl Visitor for FragmentFinder {
    const NAME: &'static str = "FragmentFinder";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn visit_fragment_spread(&mut self, spread: &FragmentSpread) {
        if spread.fragment.item.0 == self.fragment_name {
            self.fragment_locations.push(spread.fragment.location);
        }
    }

    fn visit_fragment(&mut self, fragment: &FragmentDefinition) {
        if fragment.name.item.0 == self.fragment_name {
            self.fragment_locations.push(fragment.name.location)
        }

        self.default_visit_fragment(fragment)
    }
}

fn merge_text_changes(
    source: &mut HashMap<Url, Vec<TextEdit>>,
    target: HashMap<Url, Vec<TextEdit>>,
) {
    for (uri, changes) in target {
        source.entry(uri).or_default().extend(changes);
    }
}

fn replace_prefix(s: &str, old_prefix: &str, new_prefix: &str) -> String {
    if let Some(rest) = s.strip_prefix(old_prefix) {
        let mut result = String::from(new_prefix);
        result.push_str(rest);
        return result;
    }

    s.to_string()
}

fn get_module_name(path: &PathBuf) -> LSPRuntimeResult<String> {
    let file_name = path
        .file_stem()
        .and_then(|s| s.to_str())
        .ok_or(LSPRuntimeError::ExpectedError)?;

    extract_module_name(file_name).ok_or(LSPRuntimeError::ExpectedError)
}
