/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::connections::{extract_connection_directive, ConnectionConstants, ConnectionInterface};
use crate::handle_fields::{extract_handle_field_directive_args, HandleFieldConstants};
use crate::util::find_argument;
use errors::{try2, try3, try4, try_map};
use graphql_ir::{
    Argument, ConstantValue, Directive, LinkedField, Program, Selection, ValidationError,
    ValidationMessage, ValidationResult, Validator, Value,
};
use interner::StringKey;
use schema::{Field, Type, TypeReference};

pub fn validate_connections<'s, TConnectionInterface: ConnectionInterface>(
    program: &Program<'s>,
    connection_interface: TConnectionInterface,
) -> ValidationResult<()> {
    let mut validator = ConnectionValidation::new(program, connection_interface);
    validator.validate_program(program)
}
struct ConnectionValidation<'s, TConnectionInterface: ConnectionInterface> {
    connection_constants: ConnectionConstants,
    connection_interface: TConnectionInterface,
    handle_field_constants: HandleFieldConstants,
    program: &'s Program<'s>,
}

impl<'s, TConnectionInterface: ConnectionInterface> ConnectionValidation<'s, TConnectionInterface> {
    fn new(program: &'s Program<'s>, connection_interface: TConnectionInterface) -> Self {
        Self {
            connection_constants: ConnectionConstants::default(),
            connection_interface,
            handle_field_constants: HandleFieldConstants::default(),
            program,
        }
    }

    /// Validates that the connnection field is a non-plural, object or interface type.
    fn validate_connection_field_type(
        &self,
        connection_field: &LinkedField,
        connection_schema_field: &Field,
        connection_directive: &Directive,
    ) -> ValidationResult<Type> {
        let schema = self.program.schema();
        let field_type = connection_schema_field.type_.nullable_type();
        if field_type.is_list()
            || (!schema.is_object(field_type.inner()) && !schema.is_interface(field_type.inner()))
        {
            return Err(vec![ValidationError::new(
                ValidationMessage::InvalidConnectionFieldType {
                    connection_directive_name: connection_directive.name.item,
                    connection_field_name: connection_schema_field.name,
                    connection_type_string: schema.get_type_string(field_type),
                },
                vec![connection_field.definition.location],
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
        connection_field: &'s LinkedField,
        connection_schema_field: &'s Field,
    ) -> ValidationResult<&'s LinkedField> {
        let schema = self.program.schema();

        let first_arg = find_argument(
            &connection_field.arguments,
            self.connection_constants.first_arg_name,
        );
        let last_arg = find_argument(
            &connection_field.arguments,
            self.connection_constants.last_arg_name,
        );
        if first_arg.is_none() && last_arg.is_none() {
            return Err(vec![ValidationError::new(
                ValidationMessage::ExpectedConnectionToHaveCountArgs {
                    connection_field_name: connection_schema_field.name,
                    first_arg: self.connection_constants.first_arg_name,
                    last_arg: self.connection_constants.last_arg_name,
                },
                vec![connection_field.definition.location],
            )]);
        }

        let edges_selection_name = self.connection_interface.edges_selection_name();
        let edges_selection: Option<&Selection> =
            connection_field.selections.iter().find(|sel| match sel {
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
                    connection_field_name: connection_schema_field.name,
                    edges_selection_name,
                },
                vec![connection_field.definition.location],
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
        connection_field: &LinkedField,
        connection_schema_field: &Field,
        connection_directive: &Directive,
    ) -> ValidationResult<()> {
        let connection_directive_args =
            extract_handle_field_directive_args(connection_directive, self.handle_field_constants);

        try4(
            self.validate_handler_arg(
                connection_field,
                connection_schema_field,
                connection_directive,
                connection_directive_args.handler_arg,
            ),
            self.validate_key_arg(
                connection_field,
                connection_schema_field,
                connection_directive,
                connection_directive_args.key_arg,
            ),
            self.validate_filters_arg(
                connection_field,
                connection_schema_field,
                connection_directive,
                connection_directive_args.filters_arg,
            ),
            self.validate_dynamic_key_arg(
                connection_field,
                connection_schema_field,
                connection_directive,
                connection_directive_args.dynamic_key_arg,
            ),
        )?;

        Ok(())
    }

    fn validate_handler_arg(
        &self,
        connection_field: &LinkedField,
        connection_schema_field: &Field,
        connection_directive: &Directive,
        constant_handler_arg: Option<(&Argument, &ConstantValue)>,
    ) -> ValidationResult<()> {
        if let Some((arg, handler_val)) = constant_handler_arg {
            match handler_val {
                ConstantValue::String(_) => {}
                _ => {
                    return Err(vec![ValidationError::new(
                        ValidationMessage::InvalidConnectionHandlerArg {
                            connection_directive_name: connection_directive.name.item,
                            connection_field_name: connection_schema_field.name,
                            handler_arg_name: self.handle_field_constants.handler_arg_name,
                        },
                        vec![arg.value.location, connection_field.definition.location],
                    )]);
                }
            }
        }
        Ok(())
    }

    fn validate_key_arg(
        &self,
        connection_field: &LinkedField,
        connection_schema_field: &Field,
        connection_directive: &Directive,
        constant_key_arg: Option<(&Argument, &ConstantValue)>,
    ) -> ValidationResult<()> {
        match constant_key_arg {
            Some((arg, key_val)) => match key_val {
                ConstantValue::String(string_val) => {
                    let field_alias_or_name = match connection_field.alias {
                        Some(alias) => alias.item.lookup(),
                        None => connection_schema_field.name.lookup(),
                    };
                    let postfix = format!("_{}", field_alias_or_name);
                    if !string_val.lookup().ends_with(postfix.as_str()) {
                        return Err(vec![ValidationError::new(
                            ValidationMessage::InvalidConnectionKeyArgPostfix {
                                connection_directive_name: connection_directive.name.item,
                                connection_field_name: connection_schema_field.name,
                                key_arg_name: self.handle_field_constants.key_arg_name,
                                key_arg_value: *string_val,
                                postfix,
                            },
                            vec![arg.value.location, connection_field.definition.location],
                        )]);
                    }
                }
                _ => {
                    return Err(vec![ValidationError::new(
                        ValidationMessage::InvalidConnectionKeyArg {
                            connection_directive_name: connection_directive.name.item,
                            connection_field_name: connection_schema_field.name,
                            key_arg_name: self.handle_field_constants.key_arg_name,
                        },
                        vec![arg.value.location, connection_field.definition.location],
                    )]);
                }
            },
            None => {
                return Err(vec![ValidationError::new(
                    ValidationMessage::InvalidConnectionKeyArg {
                        connection_directive_name: connection_directive.name.item,
                        connection_field_name: connection_schema_field.name,
                        key_arg_name: self.handle_field_constants.key_arg_name,
                    },
                    vec![connection_field.definition.location],
                )])
            }
        }
        Ok(())
    }

    fn validate_filters_arg(
        &self,
        connection_field: &LinkedField,
        connection_schema_field: &Field,
        connection_directive: &Directive,
        constant_filters_arg: Option<(&Argument, &ConstantValue)>,
    ) -> ValidationResult<()> {
        if let Some((arg, filters_val)) = constant_filters_arg {
            match filters_val {
                ConstantValue::List(list_val) => {
                    let non_string_value = list_val.iter().find(|val| match val {
                        ConstantValue::String(_) => false,
                        _ => true,
                    });

                    if non_string_value.is_some() {
                        return Err(vec![ValidationError::new(
                            ValidationMessage::InvalidConnectionFiltersArg {
                                connection_directive_name: connection_directive.name.item,
                                connection_field_name: connection_schema_field.name,
                                filters_arg_name: self.handle_field_constants.filters_arg_name,
                            },
                            vec![arg.value.location, connection_field.definition.location],
                        )]);
                    }
                }
                _ => {
                    return Err(vec![ValidationError::new(
                        ValidationMessage::InvalidConnectionFiltersArg {
                            connection_directive_name: connection_directive.name.item,
                            connection_field_name: connection_schema_field.name,
                            filters_arg_name: self.handle_field_constants.filters_arg_name,
                        },
                        vec![arg.value.location, connection_field.definition.location],
                    )]);
                }
            }
        }
        Ok(())
    }

    fn validate_dynamic_key_arg(
        &self,
        connection_field: &LinkedField,
        connection_schema_field: &Field,
        connection_directive: &Directive,
        dynamic_key_arg: Option<(&Argument, &Value)>,
    ) -> ValidationResult<()> {
        if let Some((dynamic_key_arg, value)) = dynamic_key_arg {
            match value {
                Value::Variable(_) => {}
                _ => {
                    return Err(vec![ValidationError::new(
                        ValidationMessage::InvalidConnectionDynamicKeyArg {
                            connection_directive_name: connection_directive.name.item,
                            connection_field_name: connection_schema_field.name,
                            dynamic_key_arg_name: self.handle_field_constants.dynamic_key_arg_name,
                        },
                        vec![
                            dynamic_key_arg.value.location,
                            connection_field.definition.location,
                        ],
                    )]);
                }
            }
        }
        Ok(())
    }
}

impl<'s, TConnectionInterface: ConnectionInterface> Validator
    for ConnectionValidation<'s, TConnectionInterface>
{
    const NAME: &'static str = "ConnectionValidation";
    const VALIDATE_ARGUMENTS: bool = false;
    const VALIDATE_DIRECTIVES: bool = false;

    fn validate_linked_field(&mut self, field: &LinkedField) -> ValidationResult<()> {
        if let Some(connection_directive) =
            extract_connection_directive(&field.directives, self.connection_constants)
        {
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
                self.validate_connection_arguments(
                    field,
                    connection_schema_field,
                    connection_directive,
                ),
                self.default_validate_linked_field(field),
            )?;
            Ok(())
        } else {
            self.default_validate_linked_field(field)
        }
    }
}
