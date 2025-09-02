/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::ArgumentName;
use common::Diagnostic;
use common::DiagnosticsResult;
use common::DirectiveName;
use common::FeatureFlags;
use common::NamedItem;
use graphql_ir::Field;
use graphql_ir::FragmentDefinition;
use graphql_ir::LinkedField;
use graphql_ir::Program;
use graphql_ir::ScalarField;
use graphql_ir::Selection;
use graphql_ir::Transformed;
use graphql_ir::Transformer;
use intern::string_key::Intern;
use intern::string_key::StringKey;
use lazy_static::lazy_static;
use schema::SDLSchema;
use schema::Schema;
use schema::Type;
use schema::TypeWithFields;
use schema::suggestion_list::GraphQLSuggestions;
use schema::suggestion_list::did_you_mean;
use thiserror::Error;

use crate::connections::ConnectionInterface;
use crate::handle_fields::HandleFieldDirectiveValues;
use crate::handle_fields::build_handle_field_directive;

pub fn transform_declarative_connection(
    program: &Program,
    connection_interface: &ConnectionInterface,
    feature_flags: &FeatureFlags,
) -> DiagnosticsResult<Program> {
    let mut transform =
        DeclarativeConnectionMutationTransform::new(program, connection_interface, feature_flags);
    let next_program = transform
        .transform_program(program)
        .replace_or_else(|| program.clone());

    if transform.errors.is_empty() {
        Ok(next_program)
    } else {
        Err(transform.errors)
    }
}

lazy_static! {
    static ref APPEND_EDGE: DirectiveName = DirectiveName("appendEdge".intern());
    static ref APPEND_NODE: DirectiveName = DirectiveName("appendNode".intern());
    static ref CONNECTIONS_ARG_NAME: ArgumentName = ArgumentName("connections".intern());
    static ref DELETE_RECORD: DirectiveName = DirectiveName("deleteRecord".intern());
    static ref DELETE_EDGE: DirectiveName = DirectiveName("deleteEdge".intern());
    static ref PREPEND_EDGE: DirectiveName = DirectiveName("prependEdge".intern());
    static ref PREPEND_NODE: DirectiveName = DirectiveName("prependNode".intern());
    static ref EDGE_TYPENAME_ARG: ArgumentName = ArgumentName("edgeTypeName".intern());
    static ref EMPTY_STRING: StringKey = "".intern();
}

struct DeclarativeConnectionMutationTransform<'a> {
    schema: &'a SDLSchema,
    errors: Vec<Diagnostic>,
    connection_interface: &'a ConnectionInterface,
    feature_flags: &'a FeatureFlags,
}

impl<'a> DeclarativeConnectionMutationTransform<'a> {
    fn new(
        program: &'a Program,
        connection_interface: &'a ConnectionInterface,
        feature_flags: &'a FeatureFlags,
    ) -> Self {
        Self {
            schema: &program.schema,
            connection_interface,
            feature_flags,
            errors: vec![],
        }
    }

    fn has_cursor_and_node_field(&self, type_: &impl TypeWithFields) -> bool {
        let mut has_cursor_field = false;
        let mut has_node_field = false;
        for field_id in type_.fields() {
            let current_field_name = self.schema.field(*field_id).name.item;
            if current_field_name == self.connection_interface.cursor {
                has_cursor_field = true;
            } else if current_field_name == self.connection_interface.node {
                has_node_field = true;
            }
        }
        has_cursor_field && has_node_field
    }
}

impl Transformer<'_> for DeclarativeConnectionMutationTransform<'_> {
    const NAME: &'static str = "DeclarativeConnectionMutationTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_fragment(&mut self, _: &FragmentDefinition) -> Transformed<FragmentDefinition> {
        Transformed::Keep
    }

    fn transform_scalar_field(&mut self, field: &ScalarField) -> Transformed<Selection> {
        let linked_field_directive = field.directives.iter().find(|directive| {
            directive.name.item == *APPEND_EDGE
                || directive.name.item == *PREPEND_EDGE
                || directive.name.item == *APPEND_NODE
                || directive.name.item == *PREPEND_NODE
        });
        if let Some(linked_field_directive) = linked_field_directive {
            self.errors.push(Diagnostic::error(
                ValidationMessage::ConnectionMutationDirectiveOnScalarField {
                    directive_name: linked_field_directive.name.item,
                    field_name: field.alias_or_name(self.schema),
                },
                field.definition.location,
            ));
        }
        let delete_directive = field.directives.iter().find(|directive| {
            directive.name.item == *DELETE_RECORD || directive.name.item == *DELETE_EDGE
        });
        let field_definition = self.schema.field(field.definition.item);
        match delete_directive {
            None => Transformed::Keep,
            Some(delete_directive) => {
                let is_id = self.schema.is_id(field_definition.type_.inner());
                if !is_id {
                    self.errors.push(Diagnostic::error(
                        ValidationMessage::DeleteRecordDirectiveOnUnsupportedType {
                            directive_name: delete_directive.name.item,
                            field_name: field.alias_or_name(self.schema),
                            current_type: self.schema.get_type_string(&field_definition.type_),
                        },
                        delete_directive.location,
                    ));
                    Transformed::Keep
                } else {
                    let connections_arg = delete_directive.arguments.named(*CONNECTIONS_ARG_NAME);
                    let handle_directive =
                        build_handle_field_directive(HandleFieldDirectiveValues {
                            handle: delete_directive.name.item.0,
                            key: *EMPTY_STRING,
                            dynamic_key: None,
                            filters: None,
                            handle_args: connections_arg
                                .map(|connections_arg| vec![connections_arg.clone()]),
                        });
                    let mut next_directives: Vec<_> = field
                        .directives
                        .iter()
                        .filter(|directive| directive.name.item != *DELETE_RECORD)
                        .cloned()
                        .collect();
                    next_directives.push(handle_directive);
                    Transformed::Replace(Selection::ScalarField(Arc::new(ScalarField {
                        directives: next_directives,
                        ..field.clone()
                    })))
                }
            }
        }
    }

    fn transform_linked_field(&mut self, field: &LinkedField) -> Transformed<Selection> {
        let transformed_field = self.default_transform_linked_field(field);
        let delete_directive = field.directives.named(*DELETE_RECORD);
        if let Some(delete_directive) = delete_directive {
            self.errors.push(Diagnostic::error(
                ValidationMessage::DeleteRecordDirectiveOnLinkedField {
                    directive_name: delete_directive.name.item,
                    field_name: field.alias_or_name(self.schema),
                },
                field.definition.location,
            ));
        }
        let edge_directive = field.directives.iter().find(|directive| {
            directive.name.item == *APPEND_EDGE || directive.name.item == *PREPEND_EDGE
        });
        let node_directive = field.directives.iter().find(|directive| {
            directive.name.item == *APPEND_NODE || directive.name.item == *PREPEND_NODE
        });
        match (edge_directive, node_directive) {
            (Some(edge_directive), Some(node_directive)) => {
                self.errors.push(Diagnostic::error(
                    ValidationMessage::ConflictingEdgeAndNodeDirectives {
                        edge_directive_name: edge_directive.name.item,
                        node_directive_name: node_directive.name.item,
                        field_name: field.alias_or_name(self.schema),
                    },
                    edge_directive.location,
                ));
                transformed_field
            }
            (None, None) => transformed_field,
            (Some(edge_directive), None) => {
                let connections_arg = edge_directive.arguments.named(*CONNECTIONS_ARG_NAME);
                match connections_arg {
                    None => {
                        self.errors.push(Diagnostic::error(
                            ValidationMessage::ConnectionsArgumentRequired {
                                directive_name: edge_directive.name.item,
                            },
                            edge_directive.location,
                        ));
                        transformed_field
                    }
                    Some(connections_arg) => {
                        let field_definition = self.schema.field(field.definition.item);
                        let has_cursor_and_node_field = match field_definition.type_.inner() {
                            Type::Object(id) => {
                                let object = self.schema.object(id);
                                self.has_cursor_and_node_field(object)
                            }
                            Type::Interface(id) => {
                                let interface = self.schema.interface(id);
                                self.has_cursor_and_node_field(interface)
                            }
                            _ => false,
                        };
                        if has_cursor_and_node_field {
                            let handle_directive =
                                build_handle_field_directive(HandleFieldDirectiveValues {
                                    handle: edge_directive.name.item.0,
                                    key: *EMPTY_STRING,
                                    dynamic_key: None,
                                    filters: None,
                                    handle_args: Some(vec![connections_arg.clone()]),
                                });
                            let mut next_field = match transformed_field {
                                Transformed::Replace(Selection::LinkedField(linked_field)) => {
                                    (*linked_field).clone()
                                }
                                Transformed::Keep => field.clone(),
                                _ => panic!(
                                    "DeclarativeConnection got unexpected transform result: `{transformed_field:?}`."
                                ),
                            };
                            let index = next_field
                                .directives
                                .iter()
                                .position(|directive| {
                                    directive.name.item == edge_directive.name.item
                                })
                                .expect("Expected the edge directive to exist.");
                            next_field.directives[index] = handle_directive;
                            Transformed::Replace(Selection::LinkedField(Arc::new(next_field)))
                        } else {
                            self.errors.push(Diagnostic::error(
                                ValidationMessage::EdgeDirectiveOnUnsupportedType {
                                    directive_name: edge_directive.name.item,
                                    field_name: field.alias_or_name(self.schema),
                                },
                                edge_directive.location,
                            ));
                            Transformed::Keep
                        }
                    }
                }
            }
            (None, Some(node_directive)) => {
                let connections_arg = node_directive.arguments.named(*CONNECTIONS_ARG_NAME);
                match connections_arg {
                    None => {
                        self.errors.push(Diagnostic::error(
                            ValidationMessage::ConnectionsArgumentRequired {
                                directive_name: node_directive.name.item,
                            },
                            node_directive.location,
                        ));
                        transformed_field
                    }
                    Some(connections_arg) => {
                        let edge_typename_arg = node_directive.arguments.named(*EDGE_TYPENAME_ARG);
                        if let Some(edge_typename_arg) = edge_typename_arg {
                            if let Some(edge_typename_value) = edge_typename_arg
                                .value
                                .item
                                .get_constant()
                                .and_then(|c| c.get_string_literal())
                                && !self.feature_flags.disable_edge_type_name_validation_on_declerative_connection_directives.is_enabled_for(edge_typename_value) {
                                    let is_not_object_type = self
                                        .schema
                                        .get_type(edge_typename_value)
                                        .is_none_or(|edge_type| !edge_type.is_object());

                                    if is_not_object_type {
                                        let suggestions = GraphQLSuggestions::new(self.schema);

                                        self.errors.push(Diagnostic::error(
                                            ValidationMessage::InvalidEdgeTypeName {
                                                directive_name: node_directive.name.item,
                                                edge_typename: edge_typename_value,
                                                suggestions: suggestions
                                                    .object_type_suggestions(edge_typename_value),
                                            },
                                            edge_typename_arg.value.location,
                                        ));

                                        return Transformed::Keep;
                                    }
                                }

                            let field_definition = self.schema.field(field.definition.item);
                            match field_definition.type_.inner() {
                                Type::Object(_) | Type::Interface(_) | Type::Union(_) => {
                                    let handle_directive =
                                        build_handle_field_directive(HandleFieldDirectiveValues {
                                            handle: node_directive.name.item.0,
                                            key: *EMPTY_STRING,
                                            dynamic_key: None,
                                            filters: None,
                                            handle_args: Some(vec![
                                                connections_arg.clone(),
                                                edge_typename_arg.clone(),
                                            ]),
                                        });
                                    let mut next_field = match transformed_field {
                                        Transformed::Replace(Selection::LinkedField(
                                            linked_field,
                                        )) => (*linked_field).clone(),
                                        Transformed::Keep => field.clone(),
                                        _ => panic!(
                                            "DeclarativeConnection got unexpected transform result: `{transformed_field:?}`."
                                        ),
                                    };
                                    let index = next_field
                                        .directives
                                        .iter()
                                        .position(|directive| {
                                            directive.name.item == node_directive.name.item
                                        })
                                        .expect("Expected the edge directive to exist.");
                                    next_field.directives[index] = handle_directive;
                                    Transformed::Replace(Selection::LinkedField(Arc::new(
                                        next_field,
                                    )))
                                }
                                _ => {
                                    self.errors.push(Diagnostic::error(
                                        ValidationMessage::NodeDirectiveOnUnsupportedType {
                                            directive_name: node_directive.name.item,
                                            field_name: field.alias_or_name(self.schema),
                                            current_type: self
                                                .schema
                                                .get_type_string(&field_definition.type_),
                                        },
                                        node_directive.location,
                                    ));
                                    Transformed::Keep
                                }
                            }
                        } else {
                            self.errors.push(Diagnostic::error(
                                ValidationMessage::NodeDirectiveMissesRequiredEdgeTypeName {
                                    directive_name: node_directive.name.item,
                                    field_name: field.alias_or_name(self.schema),
                                },
                                node_directive.location,
                            ));
                            Transformed::Keep
                        }
                    }
                }
            }
        }
    }
}

#[derive(Debug, Error, serde::Serialize)]
#[serde(tag = "type")]
enum ValidationMessage {
    #[error(
        "Unsupported use of @{directive_name} on field '${field_name}', 'edgeTypeName' argument must be provided."
    )]
    NodeDirectiveMissesRequiredEdgeTypeName {
        directive_name: DirectiveName,
        field_name: StringKey,
    },

    #[error("Invalid use of @{directive_name} on scalar field '{field_name}'.")]
    ConnectionMutationDirectiveOnScalarField {
        directive_name: DirectiveName,
        field_name: StringKey,
    },

    #[error(
        "Invalid use of @{directive_name} on field '{field_name}'. Expected field type 'ID', got '{current_type}'."
    )]
    DeleteRecordDirectiveOnUnsupportedType {
        directive_name: DirectiveName,
        field_name: StringKey,
        current_type: String,
    },

    #[error("Invalid use of @{directive_name} on linked field '{field_name}'.")]
    DeleteRecordDirectiveOnLinkedField {
        directive_name: DirectiveName,
        field_name: StringKey,
    },

    #[error(
        "Invalid use of @{edge_directive_name} and @{node_directive_name} on field '{field_name}' - these directives cannot be used together."
    )]
    ConflictingEdgeAndNodeDirectives {
        edge_directive_name: DirectiveName,
        node_directive_name: DirectiveName,
        field_name: StringKey,
    },

    #[error("Expected the 'connections' argument to be defined on @{directive_name}.")]
    ConnectionsArgumentRequired { directive_name: DirectiveName },

    #[error(
        "Unsupported use of @{directive_name} on field '{field_name}', expected an edge field (a field with 'cursor' and 'node' selection)."
    )]
    EdgeDirectiveOnUnsupportedType {
        directive_name: DirectiveName,
        field_name: StringKey,
    },

    #[error(
        "Unsupported use of @{directive_name} on field '{field_name}'. Expected an object, union or interface, but got '{current_type}'."
    )]
    NodeDirectiveOnUnsupportedType {
        directive_name: DirectiveName,
        field_name: StringKey,
        current_type: String,
    },
    #[error(
        "Expected the 'edgeTypeName' argument value on @{directive_name} to be the name of an object type. '{edge_typename}' does not refer to a known object type.{suggestions}", suggestions = did_you_mean(suggestions)
    )]
    InvalidEdgeTypeName {
        directive_name: DirectiveName,
        edge_typename: StringKey,
        suggestions: Vec<StringKey>,
    },
}
