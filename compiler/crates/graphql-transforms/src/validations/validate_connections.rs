/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::connections::ConnectionInterface;
use errors::{try2, try3, try_map};
use graphql_ir::{
    Argument, Directive, LinkedField, Program, Selection, ValidationError, ValidationMessage,
    ValidationResult, Validator,
};
use interner::{Intern, StringKey};
use schema::{Field, Type, TypeReference};

pub fn validate_connections<'s, TConnectionInterface: ConnectionInterface>(
    program: &Program<'s>,
    connection_interface: TConnectionInterface,
) -> ValidationResult<()> {
    let mut validator = ConnectionValidation::new(program, connection_interface);
    validator.validate_program(program)
}
struct ConnectionValidation<'s, TConnectionInterface: ConnectionInterface> {
    connection_interface: TConnectionInterface,
    program: &'s Program<'s>,
    connection_key: StringKey,
    stream_connection_key: StringKey,
    _after_key: StringKey,
    _before_key: StringKey,
    first_key: StringKey,
    _key_key: StringKey,
    last_key: StringKey,
}

impl<'s, TConnectionInterface: ConnectionInterface> ConnectionValidation<'s, TConnectionInterface> {
    fn new(program: &'s Program<'s>, connection_interface: TConnectionInterface) -> Self {
        Self {
            connection_interface,
            program,
            connection_key: "connection".intern(),
            stream_connection_key: "stream_connection".intern(),
            _after_key: "after".intern(),
            _before_key: "before".intern(),
            first_key: "first".intern(),
            _key_key: "key".intern(),
            last_key: "last".intern(),
        }
    }

    /// Validates that the connnection field is a non-plural, object or interface type.
    fn validate_connection_field_type(
        &self,
        field: &LinkedField,
        schema_field: &Field,
        directive: &Directive,
    ) -> ValidationResult<Type> {
        let schema = self.program.schema();
        let field_type = schema_field.type_.nullable_type();
        if field_type.is_list()
            || (!schema.is_object(field_type.inner()) && !schema.is_interface(field_type.inner()))
        {
            return Err(vec![ValidationError::new(
                ValidationMessage::InvalidConnectionFieldType {
                    connection_directive_name: directive.name.item,
                    connection_field_name: schema_field.name,
                    connection_type_string: schema.get_type_string(field_type),
                },
                vec![field.definition.location],
            )]);
        }
        Ok(field_type.inner())
    }

    /// Validates that the selection is a valid connection:
    /// - Specifies a first or last argument to prevent accidental, unconstrained
    ///   data access.
    /// - Has an `edges` selection, otherwise there is nothing to paginate.
    ///
    /// TODO: This implementation requires the edges field to be a direct selection
    /// and not contained within an inline fragment or fragment spread. It's
    /// technically possible to remove this restriction if this pattern becomes
    /// common/necessary.
    fn validate_connection_selection(
        &self,
        field: &'s LinkedField,
        schema_field: &'s Field,
    ) -> ValidationResult<&'s LinkedField> {
        let schema = self.program.schema();

        let first_arg = find_argument(&field.arguments, self.first_key);
        let last_arg = find_argument(&field.arguments, self.last_key);
        if first_arg.is_none() && last_arg.is_none() {
            return Err(vec![ValidationError::new(
                ValidationMessage::ExpectedConnectionToHaveCountArgs {
                    connection_field_name: schema_field.name,
                    first_arg: self.first_key,
                    last_arg: self.last_key,
                },
                vec![field.definition.location],
            )]);
        }

        let edges_selection_name = self.connection_interface.edges_selection_name();
        let edges_selection: Option<&Selection> = field.selections.iter().find(|sel| match sel {
            Selection::LinkedField(field) => {
                schema.field(field.definition.item).name == edges_selection_name
            }
            _ => false,
        });

        if let Some(edges_selection) = edges_selection {
            if let Selection::LinkedField(edges_field) = edges_selection {
                Ok(edges_field.as_ref())
            } else {
                unreachable!("Expected selection for edges to be a linked field.")
            }
        } else {
            Err(vec![ValidationError::new(
                ValidationMessage::ExpectedConnectionToHaveEdgesSelection {
                    connection_field_name: schema_field.name,
                    edges_selection_name,
                },
                vec![field.definition.location],
            )])
        }
    }

    /// Validates that the type satisfies the Connection specification:
    /// - The type has a valid edges field, which returns a list objects that should each expose:
    ///   - a scalar `cursor` field
    ///   - a object `node` field
    /// - The type has a page info field which is an object with the correct
    ///   subfields.
    fn validate_connection_spec(
        &self,
        connection_field: &LinkedField,
        connection_schema_field: &Field,
        connection_field_type: Type,
        connection_directive: &Directive,
        edges_field: &LinkedField,
    ) -> ValidationResult<()> {
        try2(
            self.validate_edges_spec(
                connection_field,
                connection_schema_field,
                connection_field_type,
                connection_directive,
                edges_field,
            ),
            self.validate_page_info_spec(
                connection_field,
                connection_schema_field,
                connection_field_type,
                connection_directive,
            ),
        )?;
        Ok(())
    }

    /// Validates that the Connection type has a valid `edges` field, which returns a list objects
    /// that should each expose:
    /// - a scalar `cursor` field
    /// - a object `node` field
    fn validate_edges_spec(
        &self,
        connection_field: &LinkedField,
        connection_schema_field: &Field,
        connection_field_type: Type,
        connection_directive: &Directive,
        edges_field: &LinkedField,
    ) -> ValidationResult<()> {
        let schema = self.program.schema();
        let connection_directive_name = connection_directive.name.item;
        let connection_type_name = schema.get_type_name(connection_field_type);
        let connection_field_name = connection_schema_field.name;
        let edges_selection_name = self.connection_interface.edges_selection_name();

        // Validate edges selection
        let (_, edges_type) = self.validate_selection(
            connection_field_type,
            edges_selection_name,
            |_, edges_type| {
                edges_type.is_list()
                    && (schema.is_object(edges_type.inner())
                        || schema.is_interface(edges_type.inner()))
            },
            || {
                vec![ValidationError::new(
                    ValidationMessage::ExpectedConnectionToExposeValidEdgesField {
                        connection_directive_name,
                        connection_field_name,
                        connection_type_name,
                        edges_selection_name,
                    },
                    vec![
                        connection_field.definition.location,
                        edges_field.definition.location,
                    ],
                )]
            },
        )?;

        let edge_type = edges_type.inner();
        let node_selection_name = self.connection_interface.node_selection_name();
        let cursor_selection_name = self.connection_interface.cursor_selection_name();
        try2(
            // Validate edges.node selection
            self.validate_selection(
                edge_type,
                node_selection_name,
                |_, node_type| {
                    !node_type.is_list()
                        && (node_type.inner().is_abstract_type() || node_type.inner().is_object())
                },
                || {
                    vec![ValidationError::new(
                        ValidationMessage::ExpectedConnectionToExposeValidNodeField {
                            connection_directive_name,
                            connection_field_name,
                            connection_type_name,
                            edges_selection_name,
                            node_selection_name,
                        },
                        vec![
                            connection_field.definition.location,
                            edges_field.definition.location,
                        ],
                    )]
                },
            ),
            // Validate edges.cursor selection
            self.validate_selection(
                edge_type,
                cursor_selection_name,
                |_, cursor_type| !cursor_type.is_list() && cursor_type.inner().is_scalar(),
                || {
                    vec![ValidationError::new(
                        ValidationMessage::ExpectedConnectionToExposeValidCursorField {
                            connection_directive_name,
                            connection_field_name,
                            connection_type_name,
                            cursor_selection_name,
                            edges_selection_name,
                        },
                        vec![
                            connection_field.definition.location,
                            edges_field.definition.location,
                        ],
                    )]
                },
            ),
        )?;
        Ok(())
    }

    /// Validates that the Connection type has a valid `page_info` field,
    /// which should be an object that exposes the correct sub fields as scalars.
    fn validate_page_info_spec(
        &self,
        connection_field: &LinkedField,
        connection_schema_field: &Field,
        connection_field_type: Type,
        connection_directive: &Directive,
    ) -> ValidationResult<()> {
        let schema = self.program.schema();
        let connection_directive_name = connection_directive.name.item;
        let connection_type_name = schema.get_type_name(connection_field_type);
        let connection_field_name = connection_schema_field.name;
        let page_info_selection_name = self.connection_interface.page_info_selection_name();

        // Validate page_info selection
        let (_, page_info_type) = self.validate_selection(
            connection_field_type,
            page_info_selection_name,
            |_, page_info_type| {
                !page_info_type.is_list() && schema.is_object(page_info_type.inner())
            },
            || {
                vec![ValidationError::new(
                    ValidationMessage::ExpectedConnectionToExposeValidPageInfoField {
                        connection_directive_name,
                        connection_field_name,
                        connection_type_name,
                        page_info_selection_name,
                    },
                    vec![connection_field.definition.location],
                )]
            },
        )?;

        let page_info_type = page_info_type.inner();
        let page_info_sub_fields = vec![
            self.connection_interface.end_cursor_selection_name(),
            self.connection_interface.has_next_page_selection_name(),
            self.connection_interface.has_prev_page_selection_name(),
            self.connection_interface.start_cursor_selection_name(),
        ];

        try_map(page_info_sub_fields.iter(), |page_info_sub_field_name| {
            self.validate_selection(
                page_info_type,
                *page_info_sub_field_name,
                |_, sub_field_type| !sub_field_type.is_list() && sub_field_type.inner().is_scalar(),
                || {
                    vec![ValidationError::new(
                        ValidationMessage::ExpectedConnectionToExposeValidPageInfoSubField {
                            connection_directive_name,
                            connection_field_name,
                            connection_type_name,
                            page_info_selection_name,
                            page_info_sub_field_name: *page_info_sub_field_name,
                        },
                        vec![connection_field.definition.location],
                    )]
                },
            )
        })?;
        Ok(())
    }

    fn validate_selection(
        &self,
        parent_type: Type,
        selection_name: StringKey,
        is_valid: impl Fn(&Field, &TypeReference) -> bool,
        error: impl Fn() -> Vec<ValidationError>,
    ) -> ValidationResult<(&Field, &TypeReference)> {
        let schema = self.program.schema();
        if let Some(field_id) = schema.named_field(parent_type, selection_name) {
            let field = schema.field(field_id);
            let field_type = field.type_.nullable_type();
            if is_valid(field, field_type) {
                Ok((field, field_type))
            } else {
                Err(error())
            }
        } else {
            Err(error())
        }
    }

    fn validate_connection_arguments(
        &self,
        _connection_field: &LinkedField,
    ) -> ValidationResult<()> {
        // TODO
        Ok(())
    }

    fn get_connection_directive(&self, directives: &'s [Directive]) -> Option<&Directive> {
        directives.iter().find(|directive| {
            directive.name.item == self.connection_key
                || directive.name.item == self.stream_connection_key
        })
    }
}

impl<'s, TConnectionInterface: ConnectionInterface> Validator
    for ConnectionValidation<'s, TConnectionInterface>
{
    const NAME: &'static str = "ConnectionValidation";
    const VALIDATE_ARGUMENTS: bool = false;
    const VALIDATE_DIRECTIVES: bool = false;

    fn validate_linked_field(&mut self, field: &LinkedField) -> ValidationResult<()> {
        if let Some(connection_directive) = self.get_connection_directive(&field.directives) {
            let schema = self.program.schema();
            let connection_schema_field = schema.field(field.definition.item);

            let connection_field_type = self.validate_connection_field_type(
                field,
                connection_schema_field,
                connection_directive,
            )?;
            let edges_field = self.validate_connection_selection(field, connection_schema_field)?;

            try3(
                self.validate_connection_spec(
                    field,
                    connection_schema_field,
                    connection_field_type,
                    connection_directive,
                    edges_field,
                ),
                self.validate_connection_arguments(field),
                self.default_validate_linked_field(field),
            )?;
            Ok(())
        } else {
            self.default_validate_linked_field(field)
        }
    }
}

fn find_argument(arguments: &[Argument], arg_name: StringKey) -> Option<&Argument> {
    arguments.iter().find(|arg| arg.name.item == arg_name)
}
