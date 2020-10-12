/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Utilities for providing the completion language feature
#![allow(dead_code)]
use crate::lsp::Position;
use common::{SourceLocationKey, Span};
use graphql_syntax::{parse_executable, ExecutableDocument, GraphQLSource};
use interner::StringKey;
use log::info;

use relay_compiler::Programs;

use crate::lsp::{
    CompletionItem, CompletionParams, CompletionResponse, Connection, Message, ServerRequestId,
    ServerResponse, TextDocumentPositionParams, Url,
};
use schema::{Directive as SchemaDirective, Schema, Type, TypeReference, TypeWithFields};

use graphql_syntax::{
    Directive, DirectiveLocation, ExecutableDefinition, FragmentSpread, InlineFragment,
    LinkedField, List, OperationDefinition, OperationKind, ScalarField, Selection,
};

pub type GraphQLSourceCache = std::collections::HashMap<Url, Vec<GraphQLSource>>;

#[derive(Debug, Clone, Copy, Hash, PartialEq, Eq)]
pub enum CompletionKind {
    FieldName,
    FragmentSpread,
    DirectiveName { location: DirectiveLocation },
}

#[derive(Debug, Clone, Hash, PartialEq, Eq)]
pub struct CompletionRequest {
    /// The type of the completion request we're responding to
    kind: CompletionKind,
    /// A list of type metadata that we can use to resolve the leaf
    /// type the request is being made against
    type_path: Vec<TypePathItem>,
}

impl Default for CompletionRequest {
    fn default() -> Self {
        CompletionRequest {
            kind: CompletionKind::FieldName,
            type_path: vec![],
        }
    }
}

impl CompletionRequest {
    fn add_type(&mut self, type_path_item: TypePathItem) {
        self.type_path.push(type_path_item)
    }

    /// Returns the leaf type, which is the type that the completion request is being made against.
    fn resolve_leaf_type(self, schema: &Schema) -> Option<Type> {
        let mut type_path = self.type_path;
        type_path.reverse();
        let mut type_ =
            resolve_root_type(type_path.pop().expect("path must be non-empty"), schema)?;
        while let Some(path_item) = type_path.pop() {
            type_ = resolve_relative_type(type_, path_item, schema)?;
        }
        Some(type_)
    }
}

#[derive(Debug, Clone, Hash, PartialEq, Eq)]
pub enum TypePathItem {
    Operation(OperationKind),
    FragmentDefinition { type_name: StringKey },
    InlineFragment { type_name: StringKey },
    LinkedField { name: StringKey },
    ScalarField { name: StringKey },
}

pub fn create_completion_request(
    document: ExecutableDocument,
    position_span: Span,
) -> Option<CompletionRequest> {
    info!("Building completion path for {:#?}", document);
    let mut completion_request = CompletionRequest::default();

    for definition in document.definitions {
        match &definition {
            ExecutableDefinition::Operation(operation) => {
                if operation.location.contains(position_span) {
                    let (_, kind) = operation.operation.clone()?;
                    completion_request.add_type(TypePathItem::Operation(kind));

                    info!(
                        "Completion request is within operation: {:?}",
                        operation.name
                    );
                    let OperationDefinition {
                        selections,
                        directives,
                        ..
                    } = operation;

                    let directive_location = match kind {
                        OperationKind::Query => DirectiveLocation::Query,
                        OperationKind::Mutation => DirectiveLocation::Mutation,
                        OperationKind::Subscription => DirectiveLocation::Subscription,
                    };

                    build_request_from_selection_or_directives(
                        selections,
                        directives,
                        directive_location,
                        position_span,
                        &mut completion_request,
                    );
                }
                // Check if the position span is within this operation's span
            }
            ExecutableDefinition::Fragment(fragment) => {
                if fragment.location.contains(position_span) {
                    let type_name = fragment.type_condition.type_.value;
                    completion_request.add_type(TypePathItem::FragmentDefinition { type_name });
                    build_request_from_selection_or_directives(
                        &fragment.selections,
                        &fragment.directives,
                        DirectiveLocation::FragmentDefinition,
                        position_span,
                        &mut completion_request,
                    );
                }
            }
        }
    }
    Some(completion_request)
}

/// Resolves the root type of this completion path.
fn resolve_root_type(root_path_item: TypePathItem, schema: &Schema) -> Option<Type> {
    match root_path_item {
        TypePathItem::Operation(kind) => match kind {
            OperationKind::Query => schema.query_type(),
            OperationKind::Mutation => schema.mutation_type(),
            OperationKind::Subscription => schema.subscription_type(),
        },
        TypePathItem::FragmentDefinition { type_name } => schema.get_type(type_name),
        _ => {
            // TODO(brandondail) log here
            None
        }
    }
}

fn resolve_relative_type(
    parent_type: Type,
    path_item: TypePathItem,
    schema: &Schema,
) -> Option<Type> {
    match path_item {
        TypePathItem::Operation(_) => {
            // TODO(brandondail) log here
            None
        }
        TypePathItem::FragmentDefinition { .. } => {
            // TODO(brandondail) log here
            None
        }
        TypePathItem::LinkedField { name } => {
            let field_id = schema.named_field(parent_type, name)?;
            let field = schema.field(field_id);
            info!("resolved type for {:?} : {:?}", field.name, field.type_);
            Some(field.type_.inner())
        }
        TypePathItem::ScalarField { .. } => Some(parent_type),
        TypePathItem::InlineFragment { type_name } => schema.get_type(type_name),
    }
}

fn resolve_completion_items_from_fields<T: TypeWithFields>(
    type_: &T,
    schema: &Schema,
) -> Vec<CompletionItem> {
    type_
        .fields()
        .iter()
        .map(|field_id| {
            let field = schema.field(*field_id);
            let name = field.name.to_string();
            CompletionItem::new_simple(name, String::from(""))
        })
        .collect()
}

/// Finds all the valid fragment names for a given type. Used to complete fragment spreads
fn get_valid_fragments_for_type(type_: Type, programs: &Programs) -> Vec<StringKey> {
    let mut valid_fragment_names = vec![];
    for fragment in programs.source.fragments() {
        if fragment.type_condition == type_ {
            valid_fragment_names.push(fragment.name.item);
        }
    }
    info!("get_valid_fragments_for_type {:#?}", valid_fragment_names);
    valid_fragment_names
}

fn resolve_completion_items_for_fragment_spread(
    type_: Type,
    programs: &Programs,
) -> Vec<CompletionItem> {
    get_valid_fragments_for_type(type_, programs)
        .iter()
        .map(|fragment_name| {
            CompletionItem::new_simple(fragment_name.to_string(), String::from(""))
        })
        .collect()
}

pub fn completion_items_for_request(
    request: CompletionRequest,
    schema: &Schema,
    programs: Option<&Programs>,
) -> Option<Vec<CompletionItem>> {
    let kind = request.kind;
    let leaf_type = request.resolve_leaf_type(schema)?;
    info!("completion_items_for_request: {:?} - {:?}", leaf_type, kind);
    match kind {
        CompletionKind::FragmentSpread => {
            if let Some(programs) = programs {
                let items = resolve_completion_items_for_fragment_spread(leaf_type, programs);
                Some(items)
            } else {
                None
            }
        }
        CompletionKind::FieldName => match leaf_type {
            Type::Interface(interface_id) => {
                let interface = schema.interface(interface_id);
                let items = resolve_completion_items_from_fields(interface, schema);
                Some(items)
            }
            Type::Object(object_id) => {
                let object = schema.object(object_id);
                let items = resolve_completion_items_from_fields(object, schema);
                Some(items)
            }
            Type::Enum(_) | Type::InputObject(_) | Type::Scalar(_) | Type::Union(_) => None,
        },
        CompletionKind::DirectiveName { location } => {
            let directives = schema.directives_for_location(location);
            let items = directives
                .iter()
                .map(|directive| completion_item_from_directive(directive, schema))
                .collect();
            Some(items)
        }
    }
}

fn build_request_from_selections(
    selections: &List<Selection>,
    position_span: Span,
    completion_request: &mut CompletionRequest,
) {
    for item in &selections.items {
        if item.span().contains(position_span) {
            match item {
                Selection::LinkedField(node) => {
                    completion_request.kind = CompletionKind::FieldName;
                    let LinkedField {
                        name,
                        selections,
                        directives,
                        ..
                    } = node;
                    completion_request.add_type(TypePathItem::LinkedField { name: name.value });
                    build_request_from_selection_or_directives(
                        selections,
                        directives,
                        DirectiveLocation::Field,
                        position_span,
                        completion_request,
                    );
                }
                Selection::FragmentSpread(spread) => {
                    let FragmentSpread {
                        name, directives, ..
                    } = spread;
                    if name.span.contains(position_span) {
                        completion_request.kind = CompletionKind::FragmentSpread;
                    } else {
                        build_request_from_directives(
                            directives,
                            DirectiveLocation::FragmentSpread,
                            position_span,
                            completion_request,
                        );
                    }
                }
                Selection::InlineFragment(node) => {
                    let InlineFragment {
                        selections,
                        directives,
                        type_condition,
                        ..
                    } = node;
                    if let Some(type_condition) = type_condition {
                        let type_name = type_condition.type_.value;
                        completion_request.add_type(TypePathItem::InlineFragment { type_name });
                        build_request_from_selection_or_directives(
                            selections,
                            directives,
                            DirectiveLocation::InlineFragment,
                            position_span,
                            completion_request,
                        )
                    }
                }
                Selection::ScalarField(node) => {
                    let ScalarField {
                        directives, name, ..
                    } = node;
                    completion_request.add_type(TypePathItem::ScalarField { name: name.value });
                    build_request_from_directives(
                        directives,
                        DirectiveLocation::Scalar,
                        position_span,
                        completion_request,
                    );
                }
            }
        }
    }
}

fn build_request_from_directives(
    directives: &[Directive],
    location: DirectiveLocation,
    position_span: Span,
    completion_request: &mut CompletionRequest,
) {
    for Directive { span, .. } in directives {
        if span.contains(position_span) {
            completion_request.kind = CompletionKind::DirectiveName { location };
            break;
        }
    }
}

fn build_request_from_selection_or_directives(
    selections: &List<Selection>,
    directives: &[Directive],
    directive_location: DirectiveLocation,
    position_span: Span,
    completion_request: &mut CompletionRequest,
) {
    if selections.span.contains(position_span) {
        // TODO(brandondail) handle when the completion occurs at/within the start token
        build_request_from_selections(selections, position_span, completion_request);
    } else {
        build_request_from_directives(
            directives,
            directive_location,
            position_span,
            completion_request,
        )
    }
}

fn completion_item_from_directive(directive: &SchemaDirective, schema: &Schema) -> CompletionItem {
    let SchemaDirective {
        name, arguments, ..
    } = directive;

    use crate::lsp::InsertTextFormat;

    // Always use the name of the directive as the label
    let label = name.to_string();

    // We can return a snippet with the expected arguments of the directive
    let (insert_text, insert_text_format) = if arguments.is_empty() {
        (label.clone(), InsertTextFormat::PlainText)
    } else {
        let mut cursor_location = 1;
        let mut args = vec![];

        for arg in arguments.iter() {
            if let TypeReference::NonNull(type_) = &arg.type_ {
                let value_snippet = match type_ {
                    t if t.is_list() => format!("[${}]", cursor_location),
                    t if schema.is_string(t.inner()) => format!("\"${}\"", cursor_location),
                    _ => format!("${}", cursor_location),
                };
                let str = format!("{} : {}", arg.name, value_snippet);
                args.push(str);
                cursor_location += 1;
            }
        }

        if args.is_empty() {
            (label.clone(), InsertTextFormat::PlainText)
        } else {
            let insert_text = format!("{}({})", label, args.join(", "));
            (insert_text, InsertTextFormat::Snippet)
        }
    };

    CompletionItem {
        label,
        kind: None,
        detail: None,
        documentation: None,
        deprecated: None,
        preselect: None,
        sort_text: None,
        filter_text: None,
        insert_text: Some(insert_text),
        insert_text_format: Some(insert_text_format),
        text_edit: None,
        additional_text_edits: None,
        command: None,
        data: None,
        tags: None,
    }
}

/// Maps the LSP `Position` type back to a relative span, so we can find out which syntax node(s)
/// this completion request came from
pub fn position_to_span(position: Position, source: &GraphQLSource) -> Option<Span> {
    let mut index_of_last_line = 0;
    let mut line_index = source.line_index as u64;

    let mut chars = source.text.chars().enumerate().peekable();

    while let Some((index, chr)) = chars.next() {
        let is_newline = match chr {
            // Line terminators: https://www.ecma-international.org/ecma-262/#sec-line-terminators
            '\u{000A}' | '\u{000D}' | '\u{2028}' | '\u{2029}' => match (chr, chars.peek()) {
                // <CLRF>
                ('\u{000D}', Some((_, '\u{000D}'))) => false,
                _ => true,
            },
            _ => false,
        };

        if is_newline {
            line_index += 1;
            index_of_last_line = index as u64;
        }

        if line_index == position.line {
            let start_offset = (index_of_last_line + position.character) as u32;
            return Some(Span::new(start_offset, start_offset));
        }
    }
    None
}

pub fn send_completion_response(
    items: Vec<CompletionItem>,
    request_id: ServerRequestId,
    connection: &Connection,
) {
    // If there are no items, don't send any response
    if items.is_empty() {
        return;
    }
    let completion_response = CompletionResponse::Array(items);
    let result = serde_json::to_value(&completion_response).ok();
    let response = ServerResponse {
        id: request_id,
        error: None,
        result,
    };
    connection.sender.send(Message::Response(response)).ok();
}

/// Return a `CompletionPath` for this request, only if the completion request occurs
// within a GraphQL document. Otherwise return `None`
pub fn get_completion_request(
    params: CompletionParams,
    graphql_source_cache: &GraphQLSourceCache,
) -> Option<CompletionRequest> {
    let CompletionParams {
        text_document_position,
        ..
    } = params;
    let TextDocumentPositionParams {
        text_document,
        position,
    } = text_document_position;
    let url = text_document.uri;
    let graphql_sources = match graphql_source_cache.get(&url) {
        Some(sources) => sources,
        // If we have no sources for this file, do nothing
        None => return None,
    };

    info!(
        "Got completion request for file with sources: {:#?}",
        *graphql_sources
    );

    info!("position: {:?}", position);

    // We have GraphQL documents, now check if the completion request
    // falls within the range of one of these documents.
    let mut target_graphql_source: Option<&GraphQLSource> = None;
    for graphql_source in &*graphql_sources {
        let range = graphql_source.to_range();
        if position >= range.start && position <= range.end {
            target_graphql_source = Some(graphql_source);
            break;
        }
    }

    let graphql_source = match target_graphql_source {
        Some(source) => source,
        // Exit early if this completion request didn't fall within
        // the range of one of our GraphQL documents
        None => return None,
    };

    match parse_executable(
        &graphql_source.text,
        SourceLocationKey::standalone(&url.to_string()),
    ) {
        Ok(document) => {
            // Now we need to take the `Position` and map that to an offset relative
            // to this GraphQL document, as the `Span`s in the document are relative.
            info!("Successfully parsed the definitions for a target GraphQL source");
            // Map the position to a zero-length span, relative to this GraphQL source.
            let position_span = match position_to_span(position, &graphql_source) {
                Some(span) => span,
                // Exit early if we can't map the position for some reason
                None => return None,
            };
            // Now we need to walk the Document, tracking our path along the way, until
            // we find the position within the document. Note that the GraphQLSource will
            // already be updated *with the characters that triggered the completion request*
            // since the change event fires before completion.
            info!("position_span: {:?}", position_span);
            let completion_request = create_completion_request(document, position_span);
            info!("Completion path: {:#?}", completion_request);
            completion_request
        }
        Err(err) => {
            info!("Failed to parse this target!");
            info!("{:?}", err);
            None
        }
    }
}
