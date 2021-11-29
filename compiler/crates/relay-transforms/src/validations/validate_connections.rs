/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::{
    connections::{extract_connection_directive, ConnectionConstants, ConnectionInterface},
    handle_fields::{
        extract_handle_field_directive_args_for_connection, CONNECTION_HANDLER_ARG_NAME,
        DYNAMIC_KEY_ARG_NAME, FILTERS_ARG_NAME, KEY_ARG_NAME,
    },
};
use common::{Diagnostic, DiagnosticsResult, NamedItem};
use errors::{validate, validate_map};
use graphql_ir::{
    Argument, ConstantValue, Directive, LinkedField, Program, Selection, ValidationMessage,
    Validator, Value,
};
use intern::string_key::StringKey;
use schema::{Field, Schema, Type, TypeReference};

pub fn validate_connections(
    program: &Program,
    connection_interface: &ConnectionInterface,
) -> DiagnosticsResult<()> {
    let mut validator = ConnectionValidation::new(program, connection_interface);
    validator.validate_program(program)
}
struct ConnectionValidation<'s> {
    connection_constants: ConnectionConstants,
    connection_interface: &'s ConnectionInterface,
    program: &'s Program,
}

impl<'s> ConnectionValidation<'s> {
    fn new(program: &'s Program, connection_interface: &'s ConnectionInterface) -> Self {
        Self {
            connection_constants: ConnectionConstants::default(),
            connection_interface,
            program,
        }
    }

    /// Validates that the connection field is a non-plural, object or interface type.
    fn validate_connection_field_type(
        &self,
        connection_field: &LinkedField,
        connection_schema_field: &Field,
        connection_directive: &Directive,
    ) -> DiagnosticsResult<Type> {
        let schema = &self.program.schema;
        let field_type = connection_schema_field.type_.nullable_type();
        if field_type.is_list() || !field_type.inner().is_object_or_interface() {
            return Err(vec![Diagnostic::error(
                ValidationMessage::InvalidConnectionFieldType {
                    connection_directive_name: connection_directive.name.item,
                    connection_field_name: connection_schema_field.name.item,
                    connection_type_string: schema.get_type_string(field_type),
                },
                connection_field.definition.location,
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
    ) -> DiagnosticsResult<&'s LinkedField> {
        let schema = &self.program.schema;

        let first_arg = connection_field
            .arguments
            .named(self.connection_constants.first_arg_name);
        let last_arg = connection_field
            .arguments
            .named(self.connection_constants.last_arg_name);
        if first_arg.is_none() && last_arg.is_none() {
            return Err(vec![Diagnostic::error(
                ValidationMessage::ExpectedConnectionToHaveCountArgs {
                    connection_field_name: connection_schema_field.name.item,
                    first_arg: self.connection_constants.first_arg_name,
                    last_arg: self.connection_constants.last_arg_name,
                },
                connection_field.definition.location,
            )]);
        }

        let edges_selection_name = self.connection_interface.edges;
        let edges_selection: Option<&Selection> =
            connection_field.selections.iter().find(|sel| match sel {
                Selection::LinkedField(field) => {
                    schema.field(field.definition.item).name.item == edges_selection_name
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
            Err(vec![Diagnostic::error(
                ValidationMessage::ExpectedConnectionToHaveEdgesSelection {
                    connection_field_name: connection_schema_field.name.item,
                    edges_selection_name,
                },
                connection_field.definition.location,
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
    ) -> DiagnosticsResult<()> {
        validate!(
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
            )
        )
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
    ) -> DiagnosticsResult<()> {
        let schema = &self.program.schema;
        let connection_directive_name = connection_directive.name.item;
        let connection_type_name = schema.get_type_name(connection_field_type);
        let connection_field_name = connection_schema_field.name.item;
        let edges_selection_name = self.connection_interface.edges;

        // Validate edges selection
        let (_, edges_type) = self.validate_selection(
            connection_field_type,
            edges_selection_name,
            |_, edges_type| edges_type.is_list() && edges_type.inner().is_object_or_interface(),
            || {
                vec![
                    Diagnostic::error(
                        ValidationMessage::ExpectedConnectionToExposeValidEdgesField {
                            connection_directive_name,
                            connection_field_name,
                            connection_type_name,
                            edges_selection_name,
                        },
                        connection_field.definition.location,
                    )
                    .annotate("invalid field type", edges_field.definition.location),
                ]
            },
        )?;

        let edge_type = edges_type.inner();
        let node_selection_name = self.connection_interface.node;
        let cursor_selection_name = self.connection_interface.cursor;
        validate!(
            // Validate edges.node selection
            self.validate_selection(
                edge_type,
                node_selection_name,
                |_, node_type| {
                    !node_type.is_list()
                        && (node_type.inner().is_abstract_type() || node_type.inner().is_object())
                },
                || {
                    vec![
                        Diagnostic::error(
                            ValidationMessage::ExpectedConnectionToExposeValidNodeField {
                                connection_directive_name,
                                connection_field_name,
                                connection_type_name,
                                edges_selection_name,
                                node_selection_name,
                            },
                            connection_field.definition.location,
                        )
                        .annotate("field with invalid type", edges_field.definition.location),
                    ]
                },
            ),
            // Validate edges.cursor selection
            self.validate_selection(
                edge_type,
                cursor_selection_name,
                |_, cursor_type| !cursor_type.is_list() && cursor_type.inner().is_scalar(),
                || {
                    vec![
                        Diagnostic::error(
                            ValidationMessage::ExpectedConnectionToExposeValidCursorField {
                                connection_directive_name,
                                connection_field_name,
                                connection_type_name,
                                cursor_selection_name,
                                edges_selection_name,
                            },
                            connection_field.definition.location,
                        )
                        .annotate("field with invalid type", edges_field.definition.location),
                    ]
                },
            )
        )
    }

    /// Validates that the Connection type has a valid `page_info` field,
    /// which should be an object that exposes the correct sub fields as scalars.
    fn validate_page_info_spec(
        &self,
        connection_field: &LinkedField,
        connection_schema_field: &Field,
        connection_field_type: Type,
        connection_directive: &Directive,
    ) -> DiagnosticsResult<()> {
        let schema = &self.program.schema;
        let connection_directive_name = connection_directive.name.item;
        let connection_type_name = schema.get_type_name(connection_field_type);
        let connection_field_name = connection_schema_field.name.item;
        let page_info_selection_name = self.connection_interface.page_info;

        // Validate page_info selection
        let (_, page_info_type) = self.validate_selection(
            connection_field_type,
            page_info_selection_name,
            |_, page_info_type| !page_info_type.is_list() && page_info_type.inner().is_object(),
            || {
                vec![Diagnostic::error(
                    ValidationMessage::ExpectedConnectionToExposeValidPageInfoField {
                        connection_directive_name,
                        connection_field_name,
                        connection_type_name,
                        page_info_selection_name,
                    },
                    connection_field.definition.location,
                )]
            },
        )?;

        let page_info_type = page_info_type.inner();
        let page_info_sub_fields = vec![
            self.connection_interface.end_cursor,
            self.connection_interface.has_next_page,
            self.connection_interface.has_previous_page,
            self.connection_interface.start_cursor,
        ];

        validate_map(page_info_sub_fields.iter(), |page_info_sub_field_name| {
            self.validate_selection(
                page_info_type,
                *page_info_sub_field_name,
                |_, sub_field_type| !sub_field_type.is_list() && sub_field_type.inner().is_scalar(),
                || {
                    vec![Diagnostic::error(
                        ValidationMessage::ExpectedConnectionToExposeValidPageInfoSubField {
                            connection_directive_name,
                            connection_field_name,
                            connection_type_name,
                            page_info_selection_name,
                            page_info_sub_field_name: *page_info_sub_field_name,
                        },
                        connection_field.definition.location,
                    )]
                },
            )
        })
    }

    fn validate_selection(
        &self,
        parent_type: Type,
        selection_name: StringKey,
        is_valid: impl Fn(&Field, &TypeReference) -> bool,
        error: impl Fn() -> Vec<Diagnostic>,
    ) -> DiagnosticsResult<(&Field, &TypeReference)> {
        let schema = &self.program.schema;
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
    ) -> DiagnosticsResult<()> {
        let connection_directive_args =
            extract_handle_field_directive_args_for_connection(connection_directive);

        validate!(
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
            )
        )
    }

    fn validate_handler_arg(
        &self,
        connection_field: &LinkedField,
        connection_schema_field: &Field,
        connection_directive: &Directive,
        constant_handler_arg: Option<(&Argument, &ConstantValue)>,
    ) -> DiagnosticsResult<()> {
        if let Some((arg, handler_val)) = constant_handler_arg {
            match handler_val {
                ConstantValue::String(_) => {}
                _ => {
                    return Err(vec![
                        Diagnostic::error(
                            ValidationMessage::InvalidConnectionHandlerArg {
                                connection_directive_name: connection_directive.name.item,
                                connection_field_name: connection_schema_field.name.item,
                                handler_arg_name: *CONNECTION_HANDLER_ARG_NAME,
                            },
                            arg.value.location,
                        )
                        .annotate("on connection field", connection_field.definition.location),
                    ]);
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
    ) -> DiagnosticsResult<()> {
        match constant_key_arg {
            Some((arg, key_val)) => match key_val {
                ConstantValue::String(string_val) => {
                    let field_alias_or_name = match connection_field.alias {
                        Some(alias) => alias.item,
                        None => connection_schema_field.name.item,
                    };
                    let postfix = format!("_{}", field_alias_or_name);
                    if !string_val.lookup().ends_with(postfix.as_str()) {
                        return Err(vec![
                            Diagnostic::error(
                                ValidationMessage::InvalidConnectionKeyArgPostfix {
                                    connection_directive_name: connection_directive.name.item,
                                    connection_field_name: connection_schema_field.name.item,
                                    key_arg_name: *KEY_ARG_NAME,
                                    key_arg_value: *string_val,
                                    postfix,
                                },
                                arg.value.location,
                            )
                            .annotate("related location", connection_field.definition.location),
                        ]);
                    }
                }
                _ => {
                    return Err(vec![
                        Diagnostic::error(
                            ValidationMessage::InvalidConnectionKeyArg {
                                connection_directive_name: connection_directive.name.item,
                                connection_field_name: connection_schema_field.name.item,
                                key_arg_name: *KEY_ARG_NAME,
                            },
                            arg.value.location,
                        )
                        .annotate("related location", connection_field.definition.location),
                    ]);
                }
            },
            None => {
                return Err(vec![Diagnostic::error(
                    ValidationMessage::InvalidConnectionKeyArg {
                        connection_directive_name: connection_directive.name.item,
                        connection_field_name: connection_schema_field.name.item,
                        key_arg_name: *KEY_ARG_NAME,
                    },
                    connection_directive.name.location,
                )]);
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
    ) -> DiagnosticsResult<()> {
        if let Some((arg, filters_val)) = constant_filters_arg {
            match filters_val {
                ConstantValue::List(list_val) => {
                    let non_string_value = list_val
                        .iter()
                        .find(|val| !matches!(val, ConstantValue::String(_)));

                    if non_string_value.is_some() {
                        return Err(vec![
                            Diagnostic::error(
                                ValidationMessage::InvalidConnectionFiltersArg {
                                    connection_directive_name: connection_directive.name.item,
                                    connection_field_name: connection_schema_field.name.item,
                                    filters_arg_name: *FILTERS_ARG_NAME,
                                },
                                arg.value.location,
                            )
                            .annotate("related location", connection_field.definition.location),
                        ]);
                    }
                }
                _ => {
                    return Err(vec![
                        Diagnostic::error(
                            ValidationMessage::InvalidConnectionFiltersArg {
                                connection_directive_name: connection_directive.name.item,
                                connection_field_name: connection_schema_field.name.item,
                                filters_arg_name: *FILTERS_ARG_NAME,
                            },
                            arg.value.location,
                        )
                        .annotate("related location", connection_field.definition.location),
                    ]);
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
    ) -> DiagnosticsResult<()> {
        if let Some((dynamic_key_arg, value)) = dynamic_key_arg {
            match value {
                Value::Variable(_) => {}
                _ => {
                    return Err(vec![
                        Diagnostic::error(
                            ValidationMessage::InvalidConnectionDynamicKeyArg {
                                connection_directive_name: connection_directive.name.item,
                                connection_field_name: connection_schema_field.name.item,
                                dynamic_key_arg_name: *DYNAMIC_KEY_ARG_NAME,
                            },
                            dynamic_key_arg.value.location,
                        )
                        .annotate("related location", connection_field.definition.location),
                    ]);
                }
            }
        }
        Ok(())
    }

    fn validate_stream_connection(
        &self,
        edges_field: &LinkedField,
        connection_field: &LinkedField,
    ) -> DiagnosticsResult<()> {
        if edges_field.alias.is_some() {
            return Err(vec![Diagnostic::error(
                ValidationMessage::UnsupportedAliasingInStreamConnection {
                    field_name: self.connection_interface.edges,
                },
                edges_field.definition.location,
            )]);
        }

        let page_info_selection = connection_field
            .selections
            .iter()
            .find_map(|sel| match sel {
                Selection::LinkedField(field) => {
                    if self.program.schema.field(field.definition.item).name.item
                        == self.connection_interface.page_info
                    {
                        Some(field)
                    } else {
                        None
                    }
                }
                _ => None,
            });
        if let Some(page_info_selection) = page_info_selection {
            if page_info_selection.alias.is_some() {
                return Err(vec![Diagnostic::error(
                    ValidationMessage::UnsupportedAliasingInStreamConnection {
                        field_name: self.connection_interface.page_info,
                    },
                    page_info_selection.definition.location,
                )]);
            }
        }

        Ok(())
    }
}

impl<'s> Validator for ConnectionValidation<'s> {
    const NAME: &'static str = "ConnectionValidation";
    const VALIDATE_ARGUMENTS: bool = false;
    const VALIDATE_DIRECTIVES: bool = false;

    fn validate_linked_field(&mut self, field: &LinkedField) -> DiagnosticsResult<()> {
        if let Some(connection_directive) =
            extract_connection_directive(&field.directives, self.connection_constants)
        {
            let connection_schema_field = self.program.schema.field(field.definition.item);

            let connection_field_type = self.validate_connection_field_type(
                field,
                connection_schema_field,
                connection_directive,
            )?;
            let edges_field = self.validate_connection_selection(field, connection_schema_field)?;

            if connection_directive.name.item
                == self.connection_constants.stream_connection_directive_name
            {
                self.validate_stream_connection(edges_field, field)?;
            }

            validate!(
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
                self.default_validate_linked_field(field)
            )
        } else {
            self.default_validate_linked_field(field)
        }
    }
}
