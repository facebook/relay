/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Utilities for providing the completion language feature
use crate::{
    lsp::{CompletionItem, CompletionResponse, Documentation, MarkupContent},
    lsp_runtime_error::{LSPRuntimeError, LSPRuntimeResult},
    node_resolution_info::{TypePath, TypePathItem},
    server::LSPState,
    server::SourcePrograms,
};
use common::{NamedItem, PerfLogger, Span};

use fnv::FnvHashSet;
use graphql_ir::{Program, VariableDefinition, DIRECTIVE_ARGUMENTS};
use graphql_syntax::{
    Argument, ConstantValue, Directive, DirectiveLocation, ExecutableDefinition,
    ExecutableDocument, FragmentSpread, InlineFragment, LinkedField, List, OperationDefinition,
    OperationKind, ScalarField, Selection, TokenKind, Value,
};
use interner::{Intern, StringKey};
use lazy_static::lazy_static;
use log::debug;
use lsp_types::{
    request::{Completion, Request},
    MarkupKind,
};
use schema::{
    Argument as SchemaArgument, Directive as SchemaDirective, SDLSchema, Schema, Type,
    TypeReference, TypeWithFields,
};
use std::iter::once;

lazy_static! {
    static ref DEPRECATED_DIRECTIVE: StringKey = "deprecated".intern();
}
#[derive(Debug, Clone)]
pub enum CompletionKind {
    FieldName {
        existing_linked_field: bool,
    },
    FragmentSpread,
    DirectiveName {
        location: DirectiveLocation,
    },
    ArgumentName {
        has_colon: bool,
        existing_names: FnvHashSet<StringKey>,
        kind: ArgumentKind,
    },
    ArgumentValue {
        executable_name: ExecutableName,
        argument_name: StringKey,
        kind: ArgumentKind,
    },
    InlineFragmentType {
        existing_inline_fragment: bool,
    },
}

#[derive(Debug, Clone)]
pub enum ArgumentKind {
    Field,
    Directive(StringKey),
    ArgumentsDirective(StringKey),
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
    fn new(project_name: StringKey, kind: CompletionKind, type_path: TypePath) -> Self {
        Self {
            kind,
            type_path,
            project_name,
        }
    }
}

#[derive(Debug, Copy, Clone)]
pub enum ExecutableName {
    Operation(StringKey),
    Fragment(StringKey),
}

trait ArgumentLike {
    fn name(&self) -> StringKey;
    fn type_(&self) -> &TypeReference;
}

impl ArgumentLike for &SchemaArgument {
    fn name(&self) -> StringKey {
        self.name
    }
    fn type_(&self) -> &TypeReference {
        &self.type_
    }
}

impl ArgumentLike for &VariableDefinition {
    fn name(&self) -> StringKey {
        self.name.item
    }
    fn type_(&self) -> &TypeReference {
        &self.type_
    }
}

struct CompletionRequestBuilder {
    project_name: StringKey,
    current_executable_name: Option<ExecutableName>,
}

impl CompletionRequestBuilder {
    fn new(project_name: StringKey) -> Self {
        Self {
            project_name,
            current_executable_name: None,
        }
    }

    fn new_request(&self, kind: CompletionKind, type_path: Vec<TypePathItem>) -> CompletionRequest {
        CompletionRequest::new(self.project_name, kind, type_path.into())
    }

    fn create_completion_request(
        &mut self,
        document: ExecutableDocument,
        position_span: Span,
    ) -> Option<CompletionRequest> {
        for definition in document.definitions {
            match &definition {
                ExecutableDefinition::Operation(operation) => {
                    if operation.location.contains(position_span) {
                        self.current_executable_name = if let Some(name) = &operation.name {
                            Some(ExecutableName::Operation(name.value))
                        } else {
                            None
                        };
                        let (_, kind) = operation.operation.clone()?;
                        let type_path = vec![TypePathItem::Operation(kind)];

                        debug!(
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

                        if let Some(req) = self.build_request_from_selection_or_directives(
                            selections,
                            directives,
                            directive_location,
                            position_span,
                            type_path,
                        ) {
                            return Some(req);
                        }
                    }
                    // Check if the position span is within this operation's span
                }
                ExecutableDefinition::Fragment(fragment) => {
                    if fragment.location.contains(position_span) {
                        self.current_executable_name =
                            Some(ExecutableName::Fragment(fragment.name.value));
                        let type_name = fragment.type_condition.type_.value;
                        let type_path = vec![TypePathItem::FragmentDefinition { type_name }];
                        if let Some(req) = self.build_request_from_selection_or_directives(
                            &fragment.selections,
                            &fragment.directives,
                            DirectiveLocation::FragmentDefinition,
                            position_span,
                            type_path,
                        ) {
                            return Some(req);
                        }
                    }
                }
            }
        }
        None
    }

    fn build_request_from_selections(
        &self,
        selections: &List<Selection>,
        position_span: Span,
        mut type_path: Vec<TypePathItem>,
    ) -> Option<CompletionRequest> {
        for item in &selections.items {
            if item.span().contains(position_span) {
                return match item {
                    Selection::LinkedField(node) => {
                        if node.name.span.contains(position_span) {
                            return Some(self.new_request(
                                CompletionKind::FieldName {
                                    existing_linked_field: true,
                                },
                                type_path,
                            ));
                        }
                        let LinkedField {
                            name,
                            selections,
                            directives,
                            arguments,
                            ..
                        } = node;
                        type_path.push(TypePathItem::LinkedField { name: name.value });
                        if let Some(arguments) = arguments {
                            if arguments.span.contains(position_span) {
                                return self.build_request_from_arguments(
                                    arguments,
                                    position_span,
                                    type_path,
                                    ArgumentKind::Field,
                                );
                            }
                        }
                        self.build_request_from_selection_or_directives(
                            selections,
                            directives,
                            DirectiveLocation::Field,
                            position_span,
                            type_path,
                        )
                    }
                    Selection::FragmentSpread(spread) => {
                        let FragmentSpread {
                            name, directives, ..
                        } = spread;
                        if name.span.contains(position_span) {
                            Some(self.new_request(CompletionKind::FragmentSpread, type_path))
                        } else {
                            self.build_request_from_directives(
                                directives,
                                DirectiveLocation::FragmentSpread,
                                position_span,
                                type_path,
                                Some(name.value),
                            )
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
                            if type_condition.span.contains(position_span) {
                                return Some(self.new_request(
                                    CompletionKind::InlineFragmentType {
                                        existing_inline_fragment: selections.start.kind
                                            != TokenKind::Empty,
                                    },
                                    type_path,
                                ));
                            }
                            type_path.push(TypePathItem::InlineFragment { type_name });
                        }
                        self.build_request_from_selection_or_directives(
                            selections,
                            directives,
                            DirectiveLocation::InlineFragment,
                            position_span,
                            type_path,
                        )
                    }
                    Selection::ScalarField(node) => {
                        if node.name.span.contains(position_span) {
                            return Some(self.new_request(
                                CompletionKind::FieldName {
                                    existing_linked_field: false,
                                },
                                type_path,
                            ));
                        }
                        let ScalarField {
                            directives,
                            name,
                            arguments,
                            ..
                        } = node;
                        type_path.push(TypePathItem::ScalarField { name: name.value });
                        if let Some(arguments) = arguments {
                            if arguments.span.contains(position_span) {
                                return self.build_request_from_arguments(
                                    arguments,
                                    position_span,
                                    type_path,
                                    ArgumentKind::Field,
                                );
                            }
                        }
                        self.build_request_from_directives(
                            directives,
                            DirectiveLocation::Field,
                            position_span,
                            type_path,
                            None,
                        )
                    }
                };
            }
        }
        // The selection list is empty or the current cursor is out of any of the selection
        Some(self.new_request(
            CompletionKind::FieldName {
                existing_linked_field: false,
            },
            type_path,
        ))
    }

    fn build_request_from_arguments(
        &self,
        arguments: &List<Argument>,
        position_span: Span,
        type_path: Vec<TypePathItem>,
        kind: ArgumentKind,
    ) -> Option<CompletionRequest> {
        for (
            i,
            Argument {
                name,
                value,
                colon,
                span,
                ..
            },
        ) in arguments.items.iter().enumerate()
        {
            if span.contains(position_span) {
                return if name.span.contains(position_span) {
                    Some(self.new_request(
                        CompletionKind::ArgumentName {
                            has_colon: colon.kind != TokenKind::Empty,
                            existing_names:
                                arguments.items.iter().map(|arg| arg.name.value).collect(),
                            kind,
                        },
                        type_path,
                    ))
                } else if let Some(executable_name) = self.current_executable_name {
                    match value {
                        Value::Constant(ConstantValue::Null(token))
                            if token.kind == TokenKind::Empty =>
                        {
                            Some(self.new_request(
                                CompletionKind::ArgumentValue {
                                    argument_name: name.value,
                                    executable_name,
                                    kind,
                                },
                                type_path,
                            ))
                        }
                        Value::Variable(_) => Some(self.new_request(
                            CompletionKind::ArgumentValue {
                                argument_name: name.value,
                                executable_name,
                                kind,
                            },
                            type_path,
                        )),
                        _ => None,
                    }
                } else {
                    None
                };
            } else if span.end <= position_span.start {
                let is_cursor_in_next_white_space = {
                    if let Some(next_argument) = arguments.items.get(i + 1) {
                        position_span.start < next_argument.span.start
                    } else {
                        position_span.start < arguments.span.end
                    }
                };
                if is_cursor_in_next_white_space {
                    // Handles the following speicial case
                    // (args1:  | args2:$var)
                    //          ^ cursor here
                    // The cursor is on the white space between args1 and args2.
                    // We want to autocomplete the value if it's empty.
                    return if let Some(executable_name) = self.current_executable_name {
                        match value {
                            Value::Constant(ConstantValue::Null(token))
                                if token.kind == TokenKind::Empty =>
                            {
                                Some(self.new_request(
                                    CompletionKind::ArgumentValue {
                                        argument_name: name.value,
                                        executable_name,
                                        kind,
                                    },
                                    type_path,
                                ))
                            }
                            _ => Some(self.new_request(
                                CompletionKind::ArgumentName {
                                    has_colon: false,
                                    existing_names:
                                        arguments.items.iter().map(|arg| arg.name.value).collect(),
                                    kind,
                                },
                                type_path,
                            )),
                        }
                    } else {
                        None
                    };
                }
            }
        }
        // The argument list is empty or the cursor is not on any of the argument
        Some(self.new_request(
            CompletionKind::ArgumentName {
                has_colon: false,
                existing_names: arguments.items.iter().map(|arg| arg.name.value).collect(),
                kind,
            },
            type_path,
        ))
    }

    fn build_request_from_directives(
        &self,
        directives: &[Directive],
        location: DirectiveLocation,
        position_span: Span,
        type_path: Vec<TypePathItem>,
        fragment_spread_name: Option<StringKey>,
    ) -> Option<CompletionRequest> {
        for directive in directives {
            if !directive.span.contains(position_span) {
                continue;
            };
            return if directive.name.span.contains(position_span) {
                Some(self.new_request(CompletionKind::DirectiveName { location }, type_path))
            } else if let Some(arguments) = &directive.arguments {
                if arguments.span.contains(position_span) {
                    self.build_request_from_arguments(
                        arguments,
                        position_span,
                        type_path,
                        if let Some(fragment_spread_name) = fragment_spread_name {
                            if directive.name.value == *DIRECTIVE_ARGUMENTS {
                                ArgumentKind::ArgumentsDirective(fragment_spread_name)
                            } else {
                                ArgumentKind::Directive(directive.name.value)
                            }
                        } else {
                            ArgumentKind::Directive(directive.name.value)
                        },
                    )
                } else {
                    None
                }
            } else {
                // The directive doesn't have a name `@|`
                Some(self.new_request(CompletionKind::DirectiveName { location }, type_path))
            };
        }
        None
    }

    fn build_request_from_selection_or_directives(
        &self,
        selections: &List<Selection>,
        directives: &[Directive],
        directive_location: DirectiveLocation,
        position_span: Span,
        type_path: Vec<TypePathItem>,
    ) -> Option<CompletionRequest> {
        if selections.span.contains(position_span) {
            // TODO(brandondail) handle when the completion occurs at/within the start token
            self.build_request_from_selections(selections, position_span, type_path)
        } else {
            self.build_request_from_directives(
                directives,
                directive_location,
                position_span,
                type_path,
                None,
            )
        }
    }
}

fn completion_items_for_request(
    request: CompletionRequest,
    schema: &SDLSchema,
    source_programs: &SourcePrograms,
) -> Option<Vec<CompletionItem>> {
    let kind = request.kind;
    let project_name = request.project_name;
    debug!("completion_items_for_request: {:?}", kind);
    match kind {
        CompletionKind::FragmentSpread => {
            let leaf_type = request.type_path.resolve_leaf_type(schema)?;
            if let Some(source_program) = source_programs.get(&project_name) {
                debug!("has source program");
                let items = resolve_completion_items_for_fragment_spread(
                    leaf_type,
                    &source_program,
                    schema,
                );
                Some(items)
            } else {
                None
            }
        }
        CompletionKind::FieldName {
            existing_linked_field,
        } => match request.type_path.resolve_leaf_type(schema)? {
            Type::Interface(interface_id) => {
                let interface = schema.interface(interface_id);
                let items =
                    resolve_completion_items_from_fields(interface, schema, existing_linked_field);
                Some(items)
            }
            Type::Object(object_id) => {
                let object = schema.object(object_id);
                let items =
                    resolve_completion_items_from_fields(object, schema, existing_linked_field);
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
        CompletionKind::ArgumentName {
            has_colon,
            existing_names,
            kind,
        } => match kind {
            ArgumentKind::Field => {
                let (_, field) = request.type_path.resolve_current_field(schema)?;
                Some(resolve_completion_items_for_argument_name(
                    field.arguments.iter(),
                    schema,
                    existing_names,
                    has_colon,
                ))
            }
            ArgumentKind::ArgumentsDirective(fragment_spread_name) => {
                let source_program = source_programs.get(&request.project_name)?;
                let fragment = source_program.fragment(fragment_spread_name)?;
                Some(resolve_completion_items_for_argument_name(
                    fragment.variable_definitions.iter(),
                    schema,
                    existing_names,
                    has_colon,
                ))
            }
            ArgumentKind::Directive(directive_name) => {
                Some(resolve_completion_items_for_argument_name(
                    schema.get_directive(directive_name)?.arguments.iter(),
                    schema,
                    existing_names,
                    has_colon,
                ))
            }
        },
        CompletionKind::ArgumentValue {
            executable_name,
            argument_name,
            kind,
        } => {
            if let Some(source_program) = source_programs.get(&project_name) {
                let argument_type = match kind {
                    ArgumentKind::Field => {
                        let (_, field) = request.type_path.resolve_current_field(schema)?;
                        &field.arguments.named(argument_name)?.type_
                    }
                    ArgumentKind::ArgumentsDirective(fragment_spread_name) => {
                        let fragment = source_program.fragment(fragment_spread_name)?;
                        &fragment.variable_definitions.named(argument_name)?.type_
                    }
                    ArgumentKind::Directive(directive_name) => {
                        &schema
                            .get_directive(directive_name)?
                            .arguments
                            .named(argument_name)?
                            .type_
                    }
                };
                Some(resolve_completion_items_for_argument_value(
                    argument_type,
                    &source_program,
                    executable_name,
                ))
            } else {
                None
            }
        }
        CompletionKind::InlineFragmentType {
            existing_inline_fragment,
        } => {
            let type_ = request.type_path.resolve_leaf_type(schema)?;
            Some(resolve_completion_items_for_inline_fragment_type(
                type_,
                schema,
                existing_inline_fragment,
            ))
        }
    }
}

fn resolve_completion_items_for_argument_name<T: ArgumentLike>(
    arguments: impl Iterator<Item = T>,
    schema: &SDLSchema,
    existing_names: FnvHashSet<StringKey>,
    has_colon: bool,
) -> Vec<CompletionItem> {
    arguments
        .filter(|arg| !existing_names.contains(&arg.name()))
        .map(|arg| {
            let label = arg.name().lookup().into();
            let detail = schema.get_type_string(arg.type_());
            if has_colon {
                CompletionItem::new_simple(label, detail)
            } else {
                CompletionItem {
                    label: label.clone(),
                    kind: None,
                    detail: Some(detail),
                    documentation: None,
                    deprecated: None,
                    preselect: None,
                    sort_text: None,
                    filter_text: None,
                    insert_text: Some(format!("{}: $1", label)),
                    insert_text_format: Some(lsp_types::InsertTextFormat::Snippet),
                    text_edit: None,
                    additional_text_edits: None,
                    command: Some(lsp_types::Command::new(
                        "Suggest".into(),
                        "editor.action.triggerSuggest".into(),
                        None,
                    )),
                    data: None,
                    tags: None,
                    ..Default::default()
                }
            }
        })
        .collect()
}

fn resolve_completion_items_for_inline_fragment_type(
    type_: Type,
    schema: &SDLSchema,
    existing_inline_fragment: bool,
) -> Vec<CompletionItem> {
    match type_ {
        Type::Interface(id) => {
            let interface = schema.interface(id);
            once(type_)
                .chain(
                    interface
                        .implementing_objects
                        .iter()
                        .filter_map(|id| schema.get_type(schema.object(*id).name)),
                )
                .collect()
        }
        Type::Union(id) => {
            let union = schema.union(id);
            once(type_)
                .chain(
                    union
                        .members
                        .iter()
                        .filter_map(|id| schema.get_type(schema.object(*id).name)),
                )
                .collect()
        }
        Type::Enum(_) | Type::Object(_) | Type::InputObject(_) | Type::Scalar(_) => vec![type_],
    }
    .into_iter()
    .map(|type_| {
        let label = schema.get_type_name(type_).lookup().into();
        if existing_inline_fragment {
            CompletionItem::new_simple(label, "".into())
        } else {
            CompletionItem {
                label: label.clone(),
                kind: None,
                detail: None,
                documentation: None,
                deprecated: None,
                preselect: None,
                sort_text: None,
                filter_text: None,
                insert_text: Some(format!("{} {{\n\t$1\n}}", label)),
                insert_text_format: Some(lsp_types::InsertTextFormat::Snippet),
                text_edit: None,
                additional_text_edits: None,
                command: Some(lsp_types::Command::new(
                    "Suggest".into(),
                    "editor.action.triggerSuggest".into(),
                    None,
                )),
                data: None,
                tags: None,
                ..Default::default()
            }
        }
    })
    .collect()
}

fn resolve_completion_items_for_argument_value(
    type_: &TypeReference,
    source_program: &Program,
    executable_name: ExecutableName,
) -> Vec<CompletionItem> {
    match executable_name {
        ExecutableName::Fragment(name) => {
            if let Some(fragment) = source_program.fragment(name) {
                fragment
                    .used_global_variables
                    .iter()
                    .chain(fragment.variable_definitions.iter())
                    .filter(|variable| variable.type_.eq(type_))
                    .map(|variable| {
                        CompletionItem::new_simple(format!("${}", variable.name.item,), "".into())
                    })
                    .collect()
            } else {
                vec![]
            }
        }
        ExecutableName::Operation(name) => {
            if let Some(operation) = source_program.operation(name) {
                operation
                    .variable_definitions
                    .iter()
                    .filter(|variable| variable.type_.eq(type_))
                    .map(|variable| {
                        CompletionItem::new_simple(format!("${}", variable.name.item,), "".into())
                    })
                    .collect()
            } else {
                vec![]
            }
        }
    }
}

fn resolve_completion_items_from_fields<T: TypeWithFields>(
    type_: &T,
    schema: &SDLSchema,
    existing_linked_field: bool,
) -> Vec<CompletionItem> {
    type_
        .fields()
        .iter()
        .map(|field_id| {
            let field = schema.field(*field_id);
            let name = field.name.to_string();
            let deprecated_directive = field.directives.named(*DEPRECATED_DIRECTIVE);
            let deprecated_reason = if let Some(deprecated_directive) = deprecated_directive {
                if let Some(ConstantValue::String(reason)) =
                    deprecated_directive.arguments.get(0).map(|arg| &arg.value)
                {
                    Some(reason.value.lookup().to_string())
                } else {
                    None
                }
            } else {
                None
            };
            let args = create_arguments_snippets(field.arguments.iter(), schema);
            let insert_text = match (
                existing_linked_field
                    || matches!(field.type_.inner(), Type::Scalar(_) | Type::Enum(_)), // don't insert { }
                args.is_empty(), // don't insert arguments
            ) {
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

            let documentation = field.description.map(|desc| {
                Documentation::MarkupContent(MarkupContent {
                    kind: MarkupKind::Markdown,
                    value: desc.to_string(),
                })
            });
            CompletionItem {
                label: name,
                kind: None,
                detail: deprecated_reason,
                documentation,
                deprecated: Some(deprecated_directive.is_some()),
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
                ..Default::default()
            }
        })
        .collect()
}

fn resolve_completion_items_for_fragment_spread(
    type_: Type,
    source_program: &Program,
    schema: &SDLSchema,
) -> Vec<CompletionItem> {
    let mut valid_fragments = vec![];
    for fragment in source_program.fragments() {
        if schema.are_overlapping_types(fragment.type_condition, type_) {
            let label = fragment.name.item.to_string();
            let detail = schema
                .get_type_name(fragment.type_condition)
                .lookup()
                .to_string();
            if fragment.variable_definitions.is_empty() {
                valid_fragments.push(CompletionItem::new_simple(label, detail))
            } else {
                // Create a snippet if the fragment has required argumentDefinition with no default values
                let args = create_arguments_snippets(fragment.variable_definitions.iter(), schema);
                valid_fragments.push(if args.is_empty() {
                    CompletionItem::new_simple(label, detail)
                } else {
                    let insert_text = format!("{} @arguments({})", label, args.join(", "));
                    CompletionItem {
                        label,
                        kind: None,
                        detail: Some(detail),
                        documentation: None,
                        deprecated: None,
                        preselect: None,
                        sort_text: None,
                        filter_text: None,
                        insert_text: Some(insert_text),
                        insert_text_format: Some(lsp_types::InsertTextFormat::Snippet),
                        text_edit: None,
                        additional_text_edits: None,
                        command: Some(lsp_types::Command::new(
                            "Suggest".into(),
                            "editor.action.triggerSuggest".into(),
                            None,
                        )),
                        data: None,
                        tags: None,
                        ..Default::default()
                    }
                });
            }
        }
    }
    debug!("get_valid_fragments_for_type {:#?}", valid_fragments);
    valid_fragments
}

fn completion_item_from_directive(
    directive: &SchemaDirective,
    schema: &SDLSchema,
) -> CompletionItem {
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
        let args = create_arguments_snippets(arguments.iter(), schema);
        if args.is_empty() {
            (label.clone(), InsertTextFormat::PlainText)
        } else {
            let insert_text = format!("{}({})", label, args.join(", "));
            (insert_text, InsertTextFormat::Snippet)
        }
    };

    let documentation = directive.description.map(|desc| {
        Documentation::MarkupContent(MarkupContent {
            kind: MarkupKind::Markdown,
            value: desc.to_string(),
        })
    });

    CompletionItem {
        label,
        kind: None,
        detail: None,
        documentation,
        deprecated: None,
        preselect: None,
        sort_text: None,
        filter_text: None,
        insert_text: Some(insert_text),
        insert_text_format: Some(insert_text_format),
        text_edit: None,
        additional_text_edits: None,
        command: Some(lsp_types::Command::new(
            "Suggest".into(),
            "editor.action.triggerSuggest".into(),
            None,
        )),
        data: None,
        tags: None,
        ..Default::default()
    }
}

fn create_arguments_snippets<T: ArgumentLike>(
    arguments: impl Iterator<Item = T>,
    schema: &SDLSchema,
) -> Vec<String> {
    let mut cursor_location = 1;
    let mut args = vec![];

    for arg in arguments {
        if let TypeReference::NonNull(type_) = arg.type_() {
            let value_snippet = match type_ {
                t if t.is_list() => format!("[${}]", cursor_location),
                t if schema.is_string(t.inner()) => format!("\"${}\"", cursor_location),
                _ => format!("${}", cursor_location),
            };
            let str = format!("{}: {}", arg.name(), value_snippet);
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
    match state.extract_executable_document_from_text(&params.text_document_position, 0) {
        Ok((document, position_span, project_name)) => {
            if let Some(schema) = &state.get_schemas().get(&project_name) {
                let items = resolve_completion_items(
                    document,
                    position_span,
                    project_name,
                    schema,
                    state.get_source_programs_ref(),
                )
                .unwrap_or_else(Vec::new);
                Ok(Some(CompletionResponse::Array(items)))
            } else {
                Err(LSPRuntimeError::ExpectedError)
            }
        }
        Err(graphql_err) => {
            if let Ok(response) = state.js_resource.on_complete(&params, state) {
                Ok(response)
            } else {
                Err(graphql_err)
            }
        }
    }
}

fn resolve_completion_items(
    document: ExecutableDocument,
    position_span: Span,
    project_name: StringKey,
    schema: &SDLSchema,
    source_programs: &SourcePrograms,
) -> Option<Vec<CompletionItem>> {
    let completion_request = CompletionRequestBuilder::new(project_name)
        .create_completion_request(document, position_span);
    completion_request.and_then(|completion_request| {
        completion_items_for_request(completion_request, schema, source_programs)
    })
}

#[cfg(test)]
mod test;
