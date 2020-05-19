/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Utilities for providing the completion language feature
use crate::lsp::Position;
use common::{FileKey, Span};
use graphql_syntax::{parse, Document, GraphQLSource};
use interner::StringKey;
use log::info;

use relay_compiler::Programs;

use crate::lsp::{
    CompletionItem, CompletionParams, CompletionResponse, Connection, Message, ServerRequestId,
    ServerResponse, TextDocumentPositionParams, Url,
};
use schema::{Schema, Type, TypeWithFields};

use graphql_syntax::{
    ExecutableDefinition, LinkedField, List, OperationDefinition, OperationKind, Selection,
};

pub type GraphQLSourceCache = std::collections::HashMap<Url, Vec<GraphQLSource>>;

#[derive(Debug, Clone, Copy, Hash, PartialEq, Eq)]
pub enum CompletionKind {
    FieldName,
    FragmentSpread,
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
    fn resolve_leaf_type(self, schema: &Schema) -> Type {
        let mut type_path = self.type_path;
        type_path.reverse();
        let mut type_ = resolve_root_type(type_path.pop().expect("path must be non-empty"), schema);
        while let Some(path_item) = type_path.pop() {
            type_ = resolve_relative_type(type_, path_item, schema);
        }
        type_
    }
}

#[derive(Debug, Clone, Hash, PartialEq, Eq)]
pub enum TypePathItem {
    Operation(OperationKind),
    FragmentDefinition { type_name: StringKey },
    LinkedField { name: StringKey },
}

pub fn create_completion_request(document: Document, position_span: Span) -> CompletionRequest {
    info!("Building completion path for {:#?}", document);
    let mut completion_request = CompletionRequest::default();

    for definition in document.definitions {
        match &definition {
            ExecutableDefinition::Operation(operation) => {
                if operation.location.contains(position_span) {
                    // TODO don't unwrap here
                    let (_, kind) = operation.operation.clone().unwrap();
                    completion_request.add_type(TypePathItem::Operation(kind));

                    info!(
                        "Completion request is within operation: {:?}",
                        operation.name
                    );
                    let OperationDefinition { selections, .. } = operation;

                    if selections.span.contains(position_span) {
                        // TODO(brandondail) handle when the completion occurs at/within the start token
                        info!("Completion request is within a selection");
                        populate_completion_request_from_selection(
                            selections,
                            position_span,
                            &mut completion_request,
                        );
                    }
                }
                // Check if the position span is within this operation's span
            }
            ExecutableDefinition::Fragment(fragment) => {
                if fragment.location.contains(position_span) {
                    let type_name = fragment.type_condition.type_.value;
                    completion_request.add_type(TypePathItem::FragmentDefinition { type_name });
                    if fragment.selections.span.contains(position_span) {
                        populate_completion_request_from_selection(
                            &fragment.selections,
                            position_span,
                            &mut completion_request,
                        );
                    }
                }
            }
        }
    }

    completion_request
}

/// Resolves the root type of this completion path.
fn resolve_root_type(root_path_item: TypePathItem, schema: &Schema) -> Type {
    match root_path_item {
        TypePathItem::Operation(kind) => match kind {
            OperationKind::Query => schema.query_type().unwrap(),
            OperationKind::Mutation => schema.mutation_type().unwrap(),
            OperationKind::Subscription => schema.subscription_type().unwrap(),
        },
        TypePathItem::FragmentDefinition { type_name } => schema.get_type(type_name).unwrap(),
        TypePathItem::LinkedField { .. } => {
            // TODO(brandondail) fail silently and log here instead
            panic!("Completion paths must start with an operation or fragment")
        }
    }
}

fn resolve_relative_type(parent_type: Type, path_item: TypePathItem, schema: &Schema) -> Type {
    match path_item {
        TypePathItem::Operation(_) => {
            // TODO(brandondail) fail silently and log here instead
            panic!("Operations must only exist at the root of the completion path");
        }
        TypePathItem::FragmentDefinition { .. } => {
            // TODO(brandondail) fail silently and log here instead
            panic!("Fragments must only exist at the root of the completion path");
        }
        TypePathItem::LinkedField { name } => {
            let field_id = schema.named_field(parent_type, name).unwrap();
            let field = schema.field(field_id);
            info!("resolved type for {:?} : {:?}", field.name, field.type_);
            field.type_.inner()
        }
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
fn get_valid_fragments_for_type(type_: Type, programs: &Programs<'_>) -> Vec<StringKey> {
    let mut valid_fragment_names = vec![];
    let fragment_map = programs.source.fragment_map();
    for (fragment_name, fragment) in fragment_map {
        if fragment.type_condition == type_ {
            valid_fragment_names.push(*fragment_name);
        }
    }
    info!("get_valid_fragments_for_type {:#?}", valid_fragment_names);
    valid_fragment_names
}

fn resolve_completion_items_for_fragment_spread(
    type_: Type,
    programs: &Programs<'_>,
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
    programs: Option<&Programs<'_>>,
) -> Option<Vec<CompletionItem>> {
    let kind = request.kind;
    let leaf_type = request.resolve_leaf_type(schema);
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
    }
}

fn populate_completion_request_from_selection(
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
                        name, selections, ..
                    } = node;
                    completion_request.add_type(TypePathItem::LinkedField { name: name.value });
                    populate_completion_request_from_selection(
                        selections,
                        position_span,
                        completion_request,
                    );
                }
                Selection::FragmentSpread(_) => {
                    completion_request.kind = CompletionKind::FragmentSpread;
                }
                Selection::ScalarField(_node) => {}
                Selection::InlineFragment(_node) => {}
            }
        }
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
            let start_offset = index_of_last_line + position.character;
            return Some(Span::new(start_offset as u32, 0));
        }
    }
    None
}

pub fn send_completion_response(
    items: Vec<CompletionItem>,
    request_id: ServerRequestId,
    connection: &Connection,
) {
    info!("send_completion_response: {:#?}", items);
    // If there are no items, don't send any response
    if items.is_empty() {
        return;
    }
    let completion_response = CompletionResponse::Array(items);
    let result = serde_json::to_value(&completion_response).unwrap();
    let response = ServerResponse {
        id: request_id,
        error: None,
        result: Some(result),
    };
    connection.sender.send(Message::Response(response)).unwrap();
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

    match parse(&graphql_source.text, FileKey::new(&url.to_string())) {
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
            Some(completion_request)
        }
        Err(err) => {
            info!("Failed to parse this target!");
            info!("{:?}", err);
            None
        }
    }
}
