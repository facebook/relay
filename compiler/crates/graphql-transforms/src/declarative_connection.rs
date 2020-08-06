/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::{Diagnostic, NamedItem};
use graphql_ir::{
    FragmentDefinition, LinkedField, Program, ScalarField, Selection, Transformed, Transformer,
    ValidationError, ValidationMessage, ValidationResult,
};

use crate::connections::ConnectionInterface;
use crate::handle_fields::{build_handle_field_directive, HandleFieldDirectiveValues};
use interner::{Intern, StringKey};
use lazy_static::lazy_static;
use schema::Type;
use std::sync::Arc;

pub fn transform_declarative_connection(
    program: &Program,
    connection_interface: &ConnectionInterface,
) -> ValidationResult<Program> {
    let mut transform = DeclarativeConnectionMutationTransform::new(program, connection_interface);
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
    pub static ref DELETE_RECORD: StringKey = "deleteRecord".intern();
    pub static ref APPEND_EDGE: StringKey = "appendEdge".intern();
    pub static ref PREPEND_EDGE: StringKey = "prependEdge".intern();
    pub static ref CONNECTIONS_ARG_NAME: StringKey = "connections".intern();
}

struct DeclarativeConnectionMutationTransform<'s, 'c> {
    program: &'s Program,
    errors: Vec<ValidationError>,
    connection_interface: &'c ConnectionInterface,
}

impl<'s, 'c> DeclarativeConnectionMutationTransform<'s, 'c> {
    fn new(program: &'s Program, connection_interface: &'c ConnectionInterface) -> Self {
        Self {
            program,
            connection_interface,
            errors: vec![],
        }
    }
}

impl<'s, 'c> Transformer for DeclarativeConnectionMutationTransform<'s, 'c> {
    const NAME: &'static str = "DeclarativeConnectionMutationTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_fragment(&mut self, _: &FragmentDefinition) -> Transformed<FragmentDefinition> {
        Transformed::Keep
    }

    fn transform_scalar_field(&mut self, field: &ScalarField) -> Transformed<Selection> {
        let linked_field_directive = field.directives.iter().find(|directive| {
            directive.name.item == *APPEND_EDGE || directive.name.item == *PREPEND_EDGE
        });
        if let Some(linked_field_directive) = linked_field_directive {
            self.errors.push(Diagnostic::error(
                ValidationMessage::ConnectionMutationDirectiveOnScalarField {
                    directive_name: linked_field_directive.name.item,
                    field_name: field.alias_or_name(&self.program.schema),
                },
                field.definition.location,
            ));
        }
        let delete_directive = field.directives.named(*DELETE_RECORD);
        let field_definition = self.program.schema.field(field.definition.item);
        match delete_directive {
            None => Transformed::Keep,
            Some(delete_directive) => {
                let is_id = self.program.schema.is_id(field_definition.type_.inner());
                if !is_id {
                    self.errors.push(Diagnostic::error(
                        ValidationMessage::DeleteRecordDirectiveOnUnsupportedType {
                            directive_name: delete_directive.name.item,
                            field_name: field.alias_or_name(&self.program.schema),
                            current_type: self
                                .program
                                .schema
                                .get_type_string(&field_definition.type_),
                        },
                        delete_directive.name.location,
                    ));
                    Transformed::Keep
                } else {
                    let handle_directive =
                        build_handle_field_directive(HandleFieldDirectiveValues {
                            handle: *DELETE_RECORD,
                            key: "".intern(),
                            dynamic_key: None,
                            filters: None,
                            handle_args: None,
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
                    field_name: field.alias_or_name(&self.program.schema),
                },
                field.definition.location,
            ));
        }
        let edge_directive = field.directives.iter().find(|directive| {
            directive.name.item == *APPEND_EDGE || directive.name.item == *PREPEND_EDGE
        });
        match edge_directive {
            None => transformed_field,
            Some(edge_directive) => {
                let connetions_arg = edge_directive.arguments.named(*CONNECTIONS_ARG_NAME);
                match connetions_arg {
                    None => {
                        self.errors.push(Diagnostic::error(
                            ValidationMessage::ConnectionsArgumentRequired {
                                directive_name: edge_directive.name.item,
                            },
                            edge_directive.name.location,
                        ));
                        transformed_field
                    }
                    Some(connections_arg) => {
                        let field_definition = self.program.schema.field(field.definition.item);
                        let mut has_cursor_field = false;
                        let mut has_node_field = false;
                        if let Type::Object(id) = field_definition.type_.inner() {
                            let object = self.program.schema.object(id);
                            for field_id in &object.fields {
                                let current_field = self.program.schema.field(*field_id);
                                if current_field.name == self.connection_interface.cursor {
                                    has_cursor_field = true;
                                } else if current_field.name == self.connection_interface.node {
                                    has_node_field = true;
                                }
                            }
                        }
                        if has_cursor_field && has_node_field {
                            let handle_directive =
                                build_handle_field_directive(HandleFieldDirectiveValues {
                                    handle: edge_directive.name.item,
                                    key: "".intern(),
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
                                    "DeclarativeConnection got unexpected transform result: `{:?}`.",
                                    transformed_field
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
                                    field_name: field.alias_or_name(&self.program.schema),
                                },
                                edge_directive.name.location,
                            ));
                            Transformed::Keep
                        }
                    }
                }
            }
        }
    }
}
