/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Utilities for providing the completion language feature
use crate::{
    lsp::{CompletionItem, CompletionResponse},
    lsp_runtime_error::{LSPRuntimeError, LSPRuntimeResult},
    node_resolution_info::{TypePath, TypePathItem},
    server::LSPState,
};
use common::{PerfLogger, Span};

use graphql_ir::Program;
use graphql_syntax::{
    Argument, Directive, DirectiveLocation, ExecutableDefinition, ExecutableDocument,
    FragmentSpread, InlineFragment, LinkedField, List, OperationDefinition, OperationKind,
    ScalarField, Selection,
};
use interner::StringKey;
use log::info;
use lsp_types::request::{Completion, Request};
use schema::{
    ArgumentDefinitions, Directive as SchemaDirective, Schema, Type, TypeReference, TypeWithFields,
};
use std::{
    collections::HashMap,
    sync::{Arc, RwLock},
};

#[derive(Debug, Copy, Clone)]
pub enum CompletionKind {
    FieldName,
    FragmentSpread,
    DirectiveName { location: DirectiveLocation },
    FieldArgumentName,
}
#[derive(Debug)]
pub struct CompletionRequest {
    /// The type of the completion request we're responding to
    kind: CompletionKind,
    /// A list of type metadata that we can use to resolve the leaf
    /// type the request is being made against
    type_path: TypePath,
    /// The project the request belongs to
    pub project_name: StringKey,
}

impl CompletionRequest {
    fn new(project_name: StringKey) -> Self {
        Self {
            kind: CompletionKind::FieldName,
            type_path: Default::default(),
            project_name,
        }
    }
}

fn create_completion_request(
    document: ExecutableDocument,
    position_span: Span,
    project_name: StringKey,
) -> Option<CompletionRequest> {
    let mut completion_request = CompletionRequest::new(project_name);

    for definition in document.definitions {
        match &definition {
            ExecutableDefinition::Operation(operation) => {
                if operation.location.contains(position_span) {
                    let (_, kind) = operation.operation.clone()?;
                    completion_request
                        .type_path
                        .add_type(TypePathItem::Operation(kind));

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
                    completion_request
                        .type_path
                        .add_type(TypePathItem::FragmentDefinition { type_name });
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
            let args = create_arguments_snippets(&field.arguments, schema);
            let insert_text = match (field.type_.inner().is_scalar(), args.is_empty()) {
                (true, true) => None,
                (true, false) => Some(format!("{}({})", name, args.join(", "))),
                (false, true) => Some(format!("{} {{\n\t$1\n}}", name)),
                (false, false) => Some(format!(
                    "{}({}) {{\n\t${}\n}}",
                    name,
                    args.join(", "),
                    args.len() + 1
                )),
            };
            let (insert_text_format, command) = if insert_text.is_some() {
                (
                    Some(lsp_types::InsertTextFormat::Snippet),
                    Some(lsp_types::Command::new(
                        "Suggest".into(),
                        "editor.action.triggerSuggest".into(),
                        None,
                    )),
                )
            } else {
                (None, None)
            };
            CompletionItem {
                label: name,
                kind: None,
                detail: None,
                documentation: None,
                deprecated: None,
                preselect: None,
                sort_text: None,
                filter_text: None,
                insert_text,
                insert_text_format,
                text_edit: None,
                additional_text_edits: None,
                command,
                data: None,
                tags: None,
            }
        })
        .collect()
}

fn resolve_completion_items_for_fragment_spread(
    type_: Type,
    source_program: &Program,
    schema: &Schema,
) -> Vec<CompletionItem> {
    let mut valid_fragments = vec![];
    for fragment in source_program.fragments() {
        if fragment.type_condition == type_ && !fragment.variable_definitions.is_empty() {
            // Create a snippet if the fragment has required arugmentDefinition with no default values
            let mut cursor_location = 1;
            let mut args = vec![];
            for arg in fragment.variable_definitions.iter() {
                if arg.default_value.is_none() {
                    if let TypeReference::NonNull(type_) = &arg.type_ {
                        let value_snippet = match type_ {
                            t if t.is_list() => format!("[${}]", cursor_location),
                            t if schema.is_string(t.inner()) => format!("\"${}\"", cursor_location),
                            _ => format!("${}", cursor_location),
                        };
                        let str = format!("{}: {}", arg.name.item, value_snippet);
                        args.push(str);
                        cursor_location += 1;
                    }
                }
            }

            valid_fragments.push(if args.is_empty() {
                CompletionItem::new_simple(fragment.name.item.to_string(), "".into())
            } else {
                let label = fragment.name.item.to_string();
                let insert_text = format!("{} @arguments({})", label, args.join(", "));
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
                    insert_text_format: Some(lsp_types::InsertTextFormat::Snippet),
                    text_edit: None,
                    additional_text_edits: None,
                    command: None,
                    data: None,
                    tags: None,
                }
            });
        }
    }
    info!("get_valid_fragments_for_type {:#?}", valid_fragments);
    valid_fragments
}

fn completion_items_for_request(
    request: CompletionRequest,
    schema: &Schema,
    source_programs: &Arc<RwLock<HashMap<StringKey, Program>>>,
) -> Option<Vec<CompletionItem>> {
    let kind = request.kind;
    let project_name = request.project_name;
    info!("completion_items_for_request: {:?}", kind);
    match kind {
        CompletionKind::FragmentSpread => {
            let leaf_type = request.type_path.resolve_leaf_type(schema)?;
            if let Some(source_program) = source_programs.read().unwrap().get(&project_name) {
                info!("has source program");
                let items =
                    resolve_completion_items_for_fragment_spread(leaf_type, source_program, schema);
                Some(items)
            } else {
                None
            }
        }
        CompletionKind::FieldName => match request.type_path.resolve_leaf_type(schema)? {
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
        CompletionKind::FieldArgumentName => {
            let field = request.type_path.resolve_current_field(schema)?;
            Some(
                field
                    .arguments
                    .iter()
                    .map(|arg| {
                        CompletionItem::new_simple(
                            arg.name.lookup().into(),
                            schema.get_type_string(&arg.type_),
                        )
                    })
                    .collect(),
            )
        }
    }
}

fn build_request_from_selections(
    selections: &List<Selection>,
    position_span: Span,
    completion_request: &mut CompletionRequest,
) {
    if selections.items.is_empty() {
        completion_request.kind = CompletionKind::FieldName;
        return;
    }
    for item in &selections.items {
        if item.span().contains(position_span) {
            match item {
                Selection::LinkedField(node) => {
                    completion_request.kind = CompletionKind::FieldName;
                    let LinkedField {
                        name,
                        selections,
                        directives,
                        arguments,
                        ..
                    } = node;
                    completion_request
                        .type_path
                        .add_type(TypePathItem::LinkedField { name: name.value });
                    if let Some(arguments) = arguments {
                        if build_request_from_arguments(
                            arguments,
                            position_span,
                            completion_request,
                        ) {
                            return;
                        }
                    }
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
                        completion_request
                            .type_path
                            .add_type(TypePathItem::InlineFragment { type_name });
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
                        directives,
                        name,
                        arguments,
                        ..
                    } = node;
                    completion_request
                        .type_path
                        .add_type(TypePathItem::ScalarField { name: name.value });
                    if let Some(arguments) = arguments {
                        if build_request_from_arguments(
                            arguments,
                            position_span,
                            completion_request,
                        ) {
                            return;
                        }
                    }
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

fn build_request_from_arguments(
    arguments: &List<Argument>,
    position_span: Span,
    completion_request: &mut CompletionRequest,
) -> bool {
    if arguments.span.contains(position_span) {
        if arguments.items.is_empty() {
            completion_request.kind = CompletionKind::FieldArgumentName;
            return true;
        } else {
            for Argument { name, .. } in &arguments.items {
                if name.span.contains(position_span) {
                    completion_request.kind = CompletionKind::FieldArgumentName;
                    return true;
                }
            }
        }
    }
    false
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
        let args = create_arguments_snippets(&arguments, schema);
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

fn create_arguments_snippets(arguments: &ArgumentDefinitions, schema: &Schema) -> Vec<String> {
    let mut cursor_location = 1;
    let mut args = vec![];

    for arg in arguments.iter() {
        if let TypeReference::NonNull(type_) = &arg.type_ {
            let value_snippet = match type_ {
                t if t.is_list() => format!("[${}]", cursor_location),
                t if schema.is_string(t.inner()) => format!("\"${}\"", cursor_location),
                _ => format!("${}", cursor_location),
            };
            let str = format!("{}: {}", arg.name, value_snippet);
            args.push(str);
            cursor_location += 1;
        }
    }
    args
}

pub(crate) fn on_completion<TPerfLogger: PerfLogger + 'static>(
    state: &mut LSPState<TPerfLogger>,
    params: <Completion as Request>::Params,
) -> LSPRuntimeResult<<Completion as Request>::Result> {
    let (document, position_span, project_name) =
        state.extract_executable_document_from_text(params.text_document_position)?;

    let completion_request = create_completion_request(document, position_span, project_name)
        .ok_or(LSPRuntimeError::ExpectedError)?;

    if let Some(schema) = state.get_schemas().read().unwrap().get(&project_name) {
        let items = completion_items_for_request(
            completion_request,
            schema,
            state.get_source_programs_ref(),
        )
        .unwrap_or_else(Vec::new);
        Ok(Some(CompletionResponse::Array(items)))
    } else {
        Err(LSPRuntimeError::ExpectedError)
    }
}
