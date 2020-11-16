/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Utilities for providing the hover feature
use crate::lsp::{
    Hover, HoverContents, LanguageString, MarkedString, Message, ServerRequestId, ServerResponse,
    TextDocumentPositionParams, Url,
};
use crate::type_path::{TypePath, TypePathItem};
use crate::utils::extract_executable_document_from_text;
use common::Span;
use crossbeam::Sender;
use graphql_ir::Program;
use graphql_syntax::{
    ExecutableDefinition, FragmentSpread, InlineFragment, LinkedField, List, OperationDefinition,
    ScalarField, Selection,
};
use graphql_syntax::{ExecutableDocument, GraphQLSource};
use graphql_text_printer::print_fragment;
use interner::StringKey;
use log::info;
use relay_compiler::FileCategorizer;
use schema::Schema;
use std::{
    collections::HashMap,
    path::PathBuf,
    sync::{Arc, RwLock},
};

#[derive(Debug, Clone, Copy)]
pub enum HoverKind {
    FieldName,
    FragmentSpread(StringKey),
}

#[derive(Debug)]
pub struct HoverRequest {
    /// The type of the hover request we're responding to
    kind: HoverKind,
    /// A list of type metadata that we can use to resolve the leaf
    /// type the request is being made against
    type_path: TypePath,
    /// The project the request belongs to
    pub project_name: StringKey,
}

impl HoverRequest {
    fn new(project_name: StringKey) -> Self {
        Self {
            kind: HoverKind::FieldName,
            type_path: Default::default(),
            project_name,
        }
    }
}

pub fn create_hover_request(
    document: ExecutableDocument,
    position_span: Span,
    project_name: StringKey,
) -> Option<HoverRequest> {
    info!("Building hover path for {:#?}", document);
    let mut hover_request = HoverRequest::new(project_name);

    for definition in document.definitions {
        match &definition {
            ExecutableDefinition::Operation(operation) => {
                if operation.location.contains(position_span) {
                    let (_, kind) = operation.operation.clone()?;
                    hover_request
                        .type_path
                        .add_type(TypePathItem::Operation(kind));

                    info!("Hover request is within operation: {:?}", operation.name);
                    let OperationDefinition { selections, .. } = operation;

                    build_request_from_selections(selections, position_span, &mut hover_request);
                }
            }
            ExecutableDefinition::Fragment(fragment) => {
                if fragment.location.contains(position_span) {
                    let type_name = fragment.type_condition.type_.value;
                    hover_request
                        .type_path
                        .add_type(TypePathItem::FragmentDefinition { type_name });
                    build_request_from_selections(
                        &fragment.selections,
                        position_span,
                        &mut hover_request,
                    );
                }
            }
        }
    }
    Some(hover_request)
}

pub fn hover_contents_for_request(
    request: HoverRequest,
    schema: &Schema,
    source_programs: &Arc<RwLock<HashMap<StringKey, Program>>>,
) -> Option<HoverContents> {
    let kind = request.kind;

    match kind {
        HoverKind::FieldName => {
            let type_ref = request.type_path.resolve_current_type_reference(schema)?;
            let type_name = schema.get_type_string(&type_ref);

            Some(HoverContents::Scalar(MarkedString::String(type_name)))
        }
        HoverKind::FragmentSpread(fragment_name) => {
            let project_name = request.project_name;
            if let Some(source_program) = source_programs.read().unwrap().get(&project_name) {
                let fragment_text =
                    print_fragment(&schema, source_program.fragment(fragment_name)?);
                Some(HoverContents::Scalar(MarkedString::LanguageString(
                    LanguageString {
                        language: "graphql".to_string(),
                        value: fragment_text,
                    },
                )))
            } else {
                None
            }
        }
    }
}

fn build_request_from_selections(
    selections: &List<Selection>,
    position_span: Span,
    hover_request: &mut HoverRequest,
) {
    if let Some(item) = selections
        .items
        .iter()
        .find(|item| item.span().contains(position_span))
    {
        match item {
            Selection::LinkedField(node) => {
                hover_request.kind = HoverKind::FieldName;
                let LinkedField {
                    name, selections, ..
                } = node;
                hover_request
                    .type_path
                    .add_type(TypePathItem::LinkedField { name: name.value });
                build_request_from_selections(selections, position_span, hover_request);
            }
            Selection::FragmentSpread(spread) => {
                let FragmentSpread { name, .. } = spread;
                if name.span.contains(position_span) {
                    hover_request.kind = HoverKind::FragmentSpread(name.value);
                }
            }
            Selection::InlineFragment(node) => {
                let InlineFragment {
                    selections,
                    type_condition,
                    ..
                } = node;
                if let Some(type_condition) = type_condition {
                    let type_name = type_condition.type_.value;
                    hover_request
                        .type_path
                        .add_type(TypePathItem::InlineFragment { type_name });
                    build_request_from_selections(selections, position_span, hover_request)
                }
            }
            Selection::ScalarField(node) => {
                let ScalarField { name, .. } = node;
                hover_request.kind = HoverKind::FieldName;
                hover_request
                    .type_path
                    .add_type(TypePathItem::ScalarField { name: name.value });
            }
        }
    }
}

/// Return a `HoverRequest` for this hover message, only if the request occurs
/// within a GraphQL document. Otherwise return `None`
pub fn get_hover_request(
    text_document_position: TextDocumentPositionParams,
    graphql_source_cache: &HashMap<Url, Vec<GraphQLSource>>,
    file_categorizer: &FileCategorizer,
    root_dir: &PathBuf,
) -> Option<HoverRequest> {
    let (document, position_span, project_name) = extract_executable_document_from_text(
        text_document_position,
        graphql_source_cache,
        file_categorizer,
        root_dir,
    )?;

    create_hover_request(document, position_span, project_name)
}

pub fn send_hover_response(
    hover_contents: Option<HoverContents>,
    request_id: ServerRequestId,
    sender: &Sender<Message>,
) {
    let result = if let Some(hover_contents) = hover_contents {
        serde_json::to_value(Hover {
            contents: hover_contents,
            range: None,
        })
        .ok()
    } else {
        None
    };
    sender
        .send(Message::Response(ServerResponse {
            id: request_id,
            result,
            error: None,
        }))
        .ok();
}
