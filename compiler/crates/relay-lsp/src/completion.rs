/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Utilities for providing the completion language feature

use common::ArgumentName;
use common::DirectiveName;
use common::Named;
use common::NamedItem;
use common::Span;
use fnv::FnvHashSet;
use graphql_ir::DIRECTIVE_ARGUMENTS;
use graphql_ir::FragmentDefinitionName;
use graphql_ir::OperationDefinitionName;
use graphql_ir::Program;
use graphql_ir::VariableDefinition;
use graphql_ir::VariableName;
use graphql_syntax::Argument;
use graphql_syntax::ConstantValue;
use graphql_syntax::Directive;
use graphql_syntax::DirectiveLocation;
use graphql_syntax::ExecutableDefinition;
use graphql_syntax::ExecutableDocument;
use graphql_syntax::FragmentSpread;
use graphql_syntax::InlineFragment;
use graphql_syntax::LinkedField;
use graphql_syntax::List;
use graphql_syntax::OperationDefinition;
use graphql_syntax::ScalarField;
use graphql_syntax::Selection;
use graphql_syntax::TokenKind;
use graphql_syntax::Value;
use intern::Lookup;
use intern::string_key::StringKey;
use log::debug;
use lsp_types::CompletionItem;
use lsp_types::CompletionItemKind;
use lsp_types::CompletionResponse;
use lsp_types::Documentation;
use lsp_types::InsertTextFormat;
use lsp_types::MarkupContent;
use lsp_types::MarkupKind;
use lsp_types::request::Completion;
use lsp_types::request::Request;
use lsp_types::request::ResolveCompletionItem;
use schema::Argument as SchemaArgument;
use schema::Directive as SchemaDirective;
use schema::InputObject;
use schema::InterfaceID;
use schema::ObjectID;
use schema::SDLSchema;
use schema::Schema;
use schema::Type;
use schema::TypeReference;
use schema::TypeWithFields;

use crate::LSPRuntimeError;
use crate::SchemaDocumentation;
use crate::lsp_runtime_error::LSPRuntimeResult;
use crate::node_resolution_info::TypePath;
use crate::node_resolution_info::TypePathItem;
use crate::server::GlobalState;

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
    InputObjectFieldName {
        name: StringKey,
        existing_names: FnvHashSet<StringKey>,
        input_field_path: Vec<StringKey>,
    },
}

#[derive(Debug, Clone)]
pub enum ArgumentKind {
    Field,
    Directive(DirectiveName),
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
    Fragment(FragmentDefinitionName),
}

trait ArgumentLike {
    fn name(&self) -> StringKey;
    fn type_(&self) -> &TypeReference<Type>;
}

impl ArgumentLike for &SchemaArgument {
    fn name(&self) -> StringKey {
        self.name.item.0
    }
    fn type_(&self) -> &TypeReference<Type> {
        &self.type_
    }
}

impl ArgumentLike for &VariableDefinition {
    fn name(&self) -> StringKey {
        self.name.item.0
    }
    fn type_(&self) -> &TypeReference<Type> {
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
                        self.current_executable_name = operation
                            .name
                            .as_ref()
                            .map(|name| ExecutableName::Operation(name.value));
                        let (_, kind) = operation.operation?;
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

                        let directive_location = kind.into();

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
                        self.current_executable_name = Some(ExecutableName::Fragment(
                            FragmentDefinitionName(fragment.name.value),
                        ));
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
                        if let Some(arguments) = arguments
                            && arguments.span.contains(position_span)
                        {
                            return self.build_request_from_arguments(
                                arguments,
                                position_span,
                                type_path,
                                ArgumentKind::Field,
                            );
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
                        if let Some(arguments) = arguments
                            && arguments.span.contains(position_span)
                        {
                            return self.build_request_from_arguments(
                                arguments,
                                position_span,
                                type_path,
                                ArgumentKind::Field,
                            );
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

    fn build_request_from_constant_input_value(
        &self,
        position_span: Span,
        type_path: Vec<TypePathItem>,
        mut input_field_path: Vec<StringKey>,
        constant_value: &ConstantValue,
        name: StringKey,
    ) -> Option<CompletionRequest> {
        match constant_value {
            ConstantValue::List(list) => list
                .items
                .iter()
                .find(|arg| arg.span().contains(position_span))
                .and_then(|constant_value| {
                    self.build_request_from_constant_input_value(
                        position_span,
                        type_path,
                        input_field_path,
                        constant_value,
                        name,
                    )
                }),
            ConstantValue::Object(arguments) => {
                if let Some(constant_argument) = arguments
                    .items
                    .iter()
                    .find(|arg| arg.span.contains(position_span))
                {
                    input_field_path.push(constant_argument.name());
                    self.build_request_from_constant_input_value(
                        position_span,
                        type_path,
                        input_field_path,
                        &constant_argument.value,
                        name,
                    )
                } else {
                    Some(self.new_request(
                        CompletionKind::InputObjectFieldName {
                            name,
                            existing_names:
                                arguments.items.iter().map(|item| item.name()).collect(),
                            input_field_path,
                        },
                        type_path,
                    ))
                }
            }
            _ => None,
        }
    }

    fn build_request_from_input_value(
        &self,
        position_span: Span,
        type_path: Vec<TypePathItem>,
        mut input_field_path: Vec<StringKey>,
        value: &Value,
        name: StringKey,
    ) -> Option<CompletionRequest> {
        match value {
            Value::List(list) => list
                .items
                .iter()
                .find(|arg| arg.span().contains(position_span))
                .and_then(|value| {
                    self.build_request_from_input_value(
                        position_span,
                        type_path,
                        input_field_path,
                        value,
                        name,
                    )
                }),
            Value::Object(arguments) => {
                if let Some(position_argument) = arguments
                    .items
                    .iter()
                    .find(|arg| arg.span.contains(position_span))
                {
                    input_field_path.push(position_argument.name());
                    self.build_request_from_input_value(
                        position_span,
                        type_path,
                        input_field_path,
                        &position_argument.value,
                        name,
                    )
                } else {
                    Some(self.new_request(
                        CompletionKind::InputObjectFieldName {
                            name,
                            existing_names:
                                arguments.items.iter().map(|item| item.name()).collect(),
                            input_field_path,
                        },
                        type_path,
                    ))
                }
            }
            Value::Constant(constant_value) => self.build_request_from_constant_input_value(
                position_span,
                type_path,
                input_field_path,
                constant_value,
                name,
            ),
            _ => None,
        }
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
                        Value::Constant(constant_value) => self
                            .build_request_from_constant_input_value(
                                position_span,
                                type_path,
                                Default::default(),
                                constant_value,
                                name.value,
                            ),
                        Value::Variable(_) => Some(self.new_request(
                            CompletionKind::ArgumentValue {
                                argument_name: name.value,
                                executable_name,
                                kind,
                            },
                            type_path,
                        )),
                        value => self.build_request_from_input_value(
                            position_span,
                            type_path,
                            Default::default(),
                            value,
                            name.value,
                        ),
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
                    // Handles the following special case
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
                                ArgumentKind::Directive(DirectiveName(directive.name.value))
                            }
                        } else {
                            ArgumentKind::Directive(DirectiveName(directive.name.value))
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
    schema_documentation: impl SchemaDocumentation,
    program: &Program,
) -> Option<Vec<CompletionItem>> {
    let kind = request.kind;
    match kind {
        CompletionKind::FragmentSpread => {
            let leaf_type = request.type_path.resolve_leaf_type(schema)?;
            Some(resolve_completion_items_for_fragment_spread(
                leaf_type, program, schema, true,
            ))
        }
        CompletionKind::FieldName {
            existing_linked_field,
        } => match request.type_path.resolve_leaf_type(schema)? {
            Type::Interface(interface_id) => {
                let interface = schema.interface(interface_id);
                Some(merge_completion_items_ordered([
                    resolve_completion_items_for_fields(
                        interface,
                        schema,
                        schema_documentation,
                        existing_linked_field,
                    ),
                    resolve_completion_items_typename(Type::Interface(interface_id), schema),
                    resolve_completion_items_for_inline_fragment(
                        Type::Interface(interface_id),
                        schema,
                        false,
                    ),
                    resolve_completion_items_for_fragment_spread(
                        Type::Interface(interface_id),
                        program,
                        schema,
                        false,
                    ),
                ]))
            }
            Type::Object(object_id) => Some(merge_completion_items_ordered([
                resolve_completion_items_for_fields(
                    schema.object(object_id),
                    schema,
                    schema_documentation,
                    existing_linked_field,
                ),
                resolve_completion_items_typename(Type::Object(object_id), schema),
                resolve_completion_items_for_fragment_spread(
                    Type::Object(object_id),
                    program,
                    schema,
                    false,
                ),
            ])),
            Type::Union(union_id) => Some(merge_completion_items_ordered([
                resolve_completion_items_typename(Type::Union(union_id), schema),
                resolve_completion_items_for_inline_fragment(Type::Union(union_id), schema, false),
                resolve_completion_items_for_fragment_spread(
                    Type::Union(union_id),
                    program,
                    schema,
                    false,
                ),
            ])),
            Type::Enum(_) | Type::InputObject(_) | Type::Scalar(_) => None,
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
                let fragment = program.fragment(FragmentDefinitionName(fragment_spread_name))?;
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
            let argument_type = match kind {
                ArgumentKind::Field => {
                    let (_, field) = request.type_path.resolve_current_field(schema)?;
                    &field.arguments.named(ArgumentName(argument_name))?.type_
                }
                ArgumentKind::ArgumentsDirective(fragment_spread_name) => {
                    let fragment =
                        program.fragment(FragmentDefinitionName(fragment_spread_name))?;
                    &fragment
                        .variable_definitions
                        .named(VariableName(argument_name))?
                        .type_
                }
                ArgumentKind::Directive(directive_name) => {
                    &schema
                        .get_directive(directive_name)?
                        .arguments
                        .named(ArgumentName(argument_name))?
                        .type_
                }
            };
            Some(resolve_completion_items_for_argument_value(
                schema,
                argument_type,
                program,
                executable_name,
            ))
        }
        CompletionKind::InlineFragmentType {
            existing_inline_fragment,
        } => {
            let type_ = request.type_path.resolve_leaf_type(schema)?;
            Some(resolve_completion_items_for_inline_fragment(
                type_,
                schema,
                existing_inline_fragment,
            ))
        }
        CompletionKind::InputObjectFieldName {
            name,
            existing_names,
            input_field_path,
        } => {
            let (_, field) = request.type_path.resolve_current_field(schema)?;

            fn resolve_root_input_field<'a>(
                schema: &'a SDLSchema,
                input_object: &'a TypeReference<Type>,
            ) -> Option<&'a InputObject> {
                match input_object {
                    TypeReference::Named(Type::InputObject(input_object_id)) => {
                        Some(schema.input_object(*input_object_id))
                    }
                    TypeReference::Named(_) => None,
                    TypeReference::NonNull(inner) => resolve_root_input_field(schema, inner),
                    TypeReference::List(inner) => resolve_root_input_field(schema, inner),
                }
            }

            fn resolve_input_field<'a>(
                schema: &'a SDLSchema,
                input_object: &'a InputObject,
                field_name: &StringKey,
            ) -> Option<&'a InputObject> {
                input_object
                    .fields
                    .iter()
                    .find(|field| field.name.item.0 == *field_name)
                    .and_then(|field| resolve_root_input_field(schema, &field.type_))
            }

            let field_argument = field
                .arguments
                .iter()
                .find(|argument| argument.name() == name)?;

            let mut input_object = resolve_root_input_field(schema, &field_argument.type_)?;

            for input_field_name in input_field_path.iter() {
                input_object = resolve_input_field(schema, input_object, input_field_name)?;
            }

            Some(resolve_completion_items_for_input_object(
                input_object,
                schema,
                existing_names,
            ))
        }
    }
}

fn resolve_completion_items_typename(type_: Type, schema: &SDLSchema) -> Vec<CompletionItem> {
    if type_.is_root_type(schema) {
        vec![]
    } else {
        let mut item = CompletionItem::new_simple("__typename".to_owned(), "String!".to_owned());
        item.kind = Some(CompletionItemKind::FIELD);
        vec![item]
    }
}

fn resolve_completion_items_for_input_object(
    input_object: &InputObject,
    schema: &SDLSchema,
    existing_names: FnvHashSet<StringKey>,
) -> Vec<CompletionItem> {
    input_object
        .fields
        .iter()
        .filter(|arg| !existing_names.contains(&arg.name()))
        .map(|arg| {
            let label = arg.name().lookup().to_string();
            let detail = schema.get_type_string(arg.type_());
            let kind = match arg.type_().inner() {
                Type::InputObject(_) => Some(CompletionItemKind::STRUCT),
                Type::Scalar(_) => Some(CompletionItemKind::FIELD),
                _ => None,
            };

            CompletionItem {
                label: label.clone(),
                kind,
                detail: Some(detail),
                documentation: None,
                deprecated: None,
                preselect: None,
                sort_text: None,
                filter_text: None,
                insert_text: Some(format!("{label}: $1")),
                insert_text_format: Some(lsp_types::InsertTextFormat::SNIPPET),
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
        })
        .collect()
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
                    insert_text: Some(format!("{label}: $1")),
                    insert_text_format: Some(lsp_types::InsertTextFormat::SNIPPET),
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

fn resolve_completion_items_for_inline_fragment(
    type_: Type,
    schema: &SDLSchema,
    existing_inline_fragment: bool,
) -> Vec<CompletionItem> {
    match type_ {
        Type::Interface(id) => {
            let interface = schema.interface(id);

            get_abstract_type_suggestions(schema, &interface.implementing_objects, Some(&id))
        }
        Type::Union(id) => {
            let union = schema.union(id);

            get_abstract_type_suggestions(schema, &union.members, None)
        }
        Type::Enum(_) | Type::Object(_) | Type::InputObject(_) | Type::Scalar(_) => vec![],
    }
    .into_iter()
    .map(|type_| {
        let type_name = schema.get_type_name(type_).lookup();
        if existing_inline_fragment {
            CompletionItem::new_simple(type_name.to_owned(), "".into())
        } else {
            CompletionItem {
                label: format!("... on {type_name}"),
                kind: None,
                detail: None,
                documentation: None,
                deprecated: None,
                preselect: None,
                sort_text: None,
                filter_text: None,
                insert_text: Some(format!("... on {type_name} {{\n\t$1\n}}")),
                insert_text_format: Some(lsp_types::InsertTextFormat::SNIPPET),
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
    schema: &SDLSchema,
    type_: &TypeReference<Type>,
    program: &Program,
    executable_name: ExecutableName,
) -> Vec<CompletionItem> {
    let mut completion_items = match executable_name {
        ExecutableName::Fragment(name) => {
            if let Some(fragment) = program.fragment(name) {
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
            if let Some(operation) = program.operation(OperationDefinitionName(name)) {
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
    };

    if !type_.is_list()
        && let Type::Enum(id) = type_.inner()
    {
        let enum_ = schema.enum_(id);
        completion_items.extend(
            enum_
                .values
                .iter()
                .map(|value| CompletionItem::new_simple(value.value.to_string(), "".into())),
        )
    }

    completion_items
}

fn resolve_completion_items_for_fields<T: TypeWithFields + Named>(
    type_: &T,
    schema: &SDLSchema,
    schema_documentation: impl SchemaDocumentation,
    existing_linked_field: bool,
) -> Vec<CompletionItem> {
    type_
        .fields()
        .iter()
        .map(|field_id| {
            let field = schema.field(*field_id);
            let field_name = field.name.item.to_string();
            let deprecated = field.deprecated();
            let is_deprecated = deprecated.is_some();
            let deprecated_reason = deprecated
                .and_then(|deprecated| deprecated.reason)
                .map(|reason| format!("Deprecated: {reason}"));
            let args = create_arguments_snippets(field.arguments.iter(), schema);
            let insert_text = match (
                existing_linked_field
                    || matches!(field.type_.inner(), Type::Scalar(_) | Type::Enum(_)), // don't insert { }
                args.is_empty(), // don't insert arguments
            ) {
                (true, true) => None,
                (true, false) => Some(format!("{}({})", field_name, args.join(", "))),
                (false, true) => Some(format!("{field_name} {{\n\t$1\n}}")),
                (false, false) => Some(format!(
                    "{}({}) {{\n\t${}\n}}",
                    field_name,
                    args.join(", "),
                    args.len() + 1
                )),
            };
            let (insert_text_format, command) = if insert_text.is_some() {
                (
                    Some(lsp_types::InsertTextFormat::SNIPPET),
                    Some(lsp_types::Command::new(
                        "Suggest".into(),
                        "editor.action.triggerSuggest".into(),
                        None,
                    )),
                )
            } else {
                (None, None)
            };

            let type_description = schema_documentation
                .get_type_description(schema.get_type_name(field.type_.inner()).lookup());

            let field_description = schema_documentation
                .get_field_description(type_.name().lookup(), field.name.item.lookup());

            let type_name = schema.get_type_string(&field.type_);
            let documentation = make_markdown_table_documentation(
                field.name.item.lookup(),
                &type_name,
                field_description.unwrap_or(""),
                type_description.unwrap_or(""),
            );

            let kind = match field.type_.inner() {
                Type::Enum(_) => Some(CompletionItemKind::ENUM),
                // There is no Kind for union, so we'll use interface
                Type::Interface(_) | Type::Union(_) => Some(CompletionItemKind::INTERFACE),
                Type::Object(_) | Type::InputObject(_) => Some(CompletionItemKind::STRUCT),
                Type::Scalar(_) => Some(CompletionItemKind::FIELD),
            };

            CompletionItem {
                label: field_name,
                kind,
                detail: deprecated_reason.or(Some(type_name)),
                documentation: Some(documentation),
                deprecated: Some(is_deprecated),
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
    existing_fragment_spread: bool,
) -> Vec<CompletionItem> {
    source_program
        .fragments()
        .filter(|fragment| schema.are_overlapping_types(fragment.type_condition, type_))
        .map(|fragment| {
            let label = if existing_fragment_spread {
                fragment.name.item.to_string()
            } else {
                format!("...{}", fragment.name.item)
            };
            let detail = schema
                .get_type_name(fragment.type_condition)
                .lookup()
                .to_string();
            if fragment.variable_definitions.is_empty() {
                return CompletionItem::new_simple(label, detail);
            }
            // Create a snippet if the fragment has required argumentDefinition with no default values
            let args = create_arguments_snippets(fragment.variable_definitions.iter(), schema);
            if args.is_empty() {
                return CompletionItem::new_simple(label, detail);
            }
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
                insert_text_format: Some(lsp_types::InsertTextFormat::SNIPPET),
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
        })
        .collect()
}

fn merge_completion_items_ordered<I: IntoIterator<Item = Vec<CompletionItem>>>(
    completion_item_groups: I,
) -> Vec<CompletionItem> {
    completion_item_groups
        .into_iter()
        .enumerate()
        .flat_map(|(index, mut items)| {
            items.iter_mut().for_each(|item| {
                item.sort_text = Some(format!(
                    "{}{}",
                    index,
                    item.sort_text.clone().unwrap_or_else(|| item.label.clone())
                ));
            });
            items
        })
        .collect()
}

fn completion_item_from_directive(
    directive: &SchemaDirective,
    schema: &SDLSchema,
) -> CompletionItem {
    let SchemaDirective {
        name, arguments, ..
    } = directive;

    // Always use the name of the directive as the label
    let label = name.item.to_string();

    // We can return a snippet with the expected arguments of the directive
    let (insert_text, insert_text_format) = if arguments.is_empty() {
        (label.clone(), InsertTextFormat::PLAIN_TEXT)
    } else {
        let args = create_arguments_snippets(arguments.iter(), schema);
        if args.is_empty() {
            (label.clone(), InsertTextFormat::PLAIN_TEXT)
        } else {
            let insert_text = format!("{}({})", label, args.join(", "));
            (insert_text, InsertTextFormat::SNIPPET)
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
                t if t.is_list() => format!("[${cursor_location}]"),
                t if schema.is_string(t.inner()) => format!("\"${cursor_location}\""),
                _ => format!("${cursor_location}"),
            };
            let str = format!("{}: {}", arg.name(), value_snippet);
            args.push(str);
            cursor_location += 1;
        }
    }
    args
}

pub fn on_completion(
    state: &impl GlobalState,
    params: <Completion as Request>::Params,
) -> LSPRuntimeResult<<Completion as Request>::Result> {
    match state.extract_executable_document_from_text(&params.text_document_position, 0) {
        Ok((document, position_span)) => {
            let project_name = state
                .extract_project_name_from_url(&params.text_document_position.text_document.uri)?;
            let schema = &state.get_schema(&project_name)?;
            let items = resolve_completion_items(
                document,
                position_span,
                project_name,
                schema,
                state.get_schema_documentation(project_name.lookup()),
                &state.get_program(&project_name)?,
            )
            .unwrap_or_else(Vec::new);
            Ok(Some(CompletionResponse::Array(items)))
        }
        Err(graphql_err) => {
            if matches!(graphql_err, LSPRuntimeError::ExpectedError) {
                Err(LSPRuntimeError::ExpectedError)
            } else {
                Err(LSPRuntimeError::UnexpectedError(format!(
                    "Unable to get completion {:?}",
                    &graphql_err,
                )))
            }
        }
    }
}

pub(crate) fn on_resolve_completion_item(
    _state: &impl GlobalState,
    params: <ResolveCompletionItem as Request>::Params,
) -> LSPRuntimeResult<<ResolveCompletionItem as Request>::Result> {
    // We currently don't do anything with the selected item
    // and we just return an input

    Ok(params)
}

fn resolve_completion_items(
    document: ExecutableDocument,
    position_span: Span,
    project_name: StringKey,
    schema: &SDLSchema,
    schema_documentation: impl SchemaDocumentation,
    progam: &Program,
) -> Option<Vec<CompletionItem>> {
    let completion_request = CompletionRequestBuilder::new(project_name)
        .create_completion_request(document, position_span);
    completion_request.and_then(|completion_request| {
        completion_items_for_request(completion_request, schema, schema_documentation, progam)
    })
}

fn make_markdown_table_documentation(
    field_name: &str,
    type_name: &str,
    field_description: &str,
    type_description: &str,
) -> Documentation {
    Documentation::MarkupContent(MarkupContent {
        kind: MarkupKind::Markdown,
        value: [
            format!("| **Field: {field_name}** |"),
            "| :--- |".to_string(),
            format!("| {field_description} |"),
            format!("| **Type: {type_name}** |"),
            format!("| {type_description} |"),
        ]
        .join("\n"),
    })
}

fn get_abstract_type_suggestions(
    schema: &SDLSchema,
    objects: &[ObjectID],
    base_interface_id: Option<&InterfaceID>,
) -> Vec<Type> {
    let object_types: Vec<_> = objects.iter().map(|id| schema.object(*id)).collect();

    let mut interfaces = Vec::new();
    let mut types = Vec::new();

    for object_type in &object_types {
        if let Some(t) = schema.get_type(object_type.name.item.0) {
            types.push(t);
        }

        for interface_id in &object_type.interfaces {
            let interface_type = schema.interface(*interface_id);

            if let Some(base_id) = base_interface_id
                && (interface_id == base_id || !interface_type.interfaces.contains(base_id))
            {
                continue;
            }

            if let Some(t) = schema.get_type(interface_type.name.item.0) {
                if interfaces.contains(&t) {
                    continue;
                }

                interfaces.push(t);
            }
        }
    }

    types.extend(interfaces);

    types
}

#[cfg(test)]
mod test;
