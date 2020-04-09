/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::connections::{ConnectionConstants, ConnectionInterface};
use crate::util::find_argument;
use common::{Location, WithLocation};
use graphql_ir::{
    Argument, ConstantValue, Directive, InlineFragment, LinkedField, ScalarField, Selection, Value,
};
use interner::StringKey;
use schema::{Schema, Type};

/// Helper to assert and extract the expected selections for a connection
/// field. This function will panic if the expected selections aren't present,
/// with the assumption that the connection field has already been validated.
pub fn assert_connection_selections<'s, TConnectionInterface: ConnectionInterface>(
    schema: &'s Schema,
    selections: &'s [Selection],
    connection_interface: &'s TConnectionInterface,
) -> ((usize, &'s LinkedField), Option<(usize, &'s LinkedField)>) {
    let mut edges_selection = None;
    let mut page_info_selection = None;
    for (ix, selection) in selections.iter().enumerate() {
        if let Selection::LinkedField(field) = selection {
            let field_name = schema.field(field.definition.item).name;
            if field_name == connection_interface.edges_selection_name() {
                if edges_selection.is_some() {
                    unreachable!("Unexpected duplicate selection for edges")
                }
                edges_selection = Some((ix, field.as_ref()));
            }
            if field_name == connection_interface.page_info_selection_name() {
                if page_info_selection.is_some() {
                    unreachable!("Unexpected duplicate selection for page_info")
                }
                page_info_selection = Some((ix, field.as_ref()));
            }
        }
    }

    if let Some(edges_selection) = edges_selection {
        (edges_selection, page_info_selection)
    } else {
        unreachable!("Expected selection for edges to have been previously validated.")
    }
}

pub struct ConnectionMetadata {
    pub path: Option<Vec<StringKey>>,
    pub direction: StringKey,
    pub cursor: Option<StringKey>,
    pub count: Option<StringKey>,
    pub is_stream_connection: bool,
}

/// Builds the connection metadata that will be attached
/// to the document root (fragment or operation)
pub fn build_connection_metadata(
    connection_field: &LinkedField,
    connection_constants: ConnectionConstants,
    path: &Option<Vec<StringKey>>,
    is_stream_connection: bool,
) -> ConnectionMetadata {
    let first_arg = find_argument(
        &connection_field.arguments,
        connection_constants.first_arg_name,
    );
    let last_arg = find_argument(
        &connection_field.arguments,
        connection_constants.last_arg_name,
    );

    let (direction, count_variable, cursor_variable) = match first_arg {
        Some(first_arg) => match last_arg {
            Some(_last_arg) => (connection_constants.direction_bidirectional, None, None),
            None => (
                connection_constants.direction_forward,
                extract_variable_name(Some(first_arg)),
                extract_variable_name(find_argument(
                    &connection_field.arguments,
                    connection_constants.after_arg_name,
                )),
            ),
        },
        None => match last_arg {
            Some(last_arg) => (
                connection_constants.direction_backward,
                extract_variable_name(Some(last_arg)),
                extract_variable_name(find_argument(
                    &connection_field.arguments,
                    connection_constants.before_arg_name,
                )),
            ),
            None => unreachable!("Expected presence of first or last args on connection to have been previously validated."),
        },
    };

    ConnectionMetadata {
        count: count_variable,
        cursor: cursor_variable,
        direction,
        path: path.clone(),
        is_stream_connection,
    }
}

fn extract_variable_name(argument: Option<&Argument>) -> Option<StringKey> {
    match argument {
        Some(arg) => match &arg.value.item {
            Value::Variable(var_value) => Some(var_value.name.item),
            _ => None,
        },
        None => None,
    }
}

/// Helper that builds a Directive that holds the list of ConnectionMetadata
/// for every @connection present in a Document (fragment or operation)
pub fn build_connection_metadata_as_directive(
    connection_metadata: &[ConnectionMetadata],
    connection_constants: ConnectionConstants,
    // TODO(T63626569): Add support for derived locations
    empty_location: &Location,
) -> Directive {
    let connection_metadata_values = connection_metadata
        .iter()
        .map(|metadata| build_connection_metadata_value(metadata))
        .collect::<Vec<ConstantValue>>();
    let metadata_argument = Argument {
        name: WithLocation::new(
            *empty_location,
            connection_constants.connection_metadata_argument_name,
        ),
        value: WithLocation::new(
            *empty_location,
            Value::Constant(ConstantValue::List(connection_metadata_values)),
        ),
    };

    Directive {
        name: WithLocation::new(
            *empty_location,
            connection_constants.connection_metadata_directive_name,
        ),
        arguments: vec![metadata_argument],
    }
}

fn build_connection_metadata_value(connection_metadata: &ConnectionMetadata) -> ConstantValue {
    ConstantValue::List(vec![
        match &connection_metadata.path {
            Some(path) => ConstantValue::List(
                path.iter()
                    .map(|part| ConstantValue::String(*part))
                    .collect::<Vec<_>>(),
            ),
            None => ConstantValue::Null(),
        },
        ConstantValue::String(connection_metadata.direction),
        match connection_metadata.cursor {
            Some(cursor) => ConstantValue::String(cursor),
            None => ConstantValue::Null(),
        },
        match connection_metadata.count {
            Some(count) => ConstantValue::String(count),
            None => ConstantValue::Null(),
        },
        ConstantValue::Boolean(connection_metadata.is_stream_connection),
    ])
}

pub fn extract_connection_metadata_from_directive(
    directives: &[Directive],
    connection_constants: ConnectionConstants,
) -> Option<Vec<ConnectionMetadata>> {
    let connection_metadata_directive = directives.iter().find(|directive| {
        directive.name.item == connection_constants.connection_metadata_directive_name
    });

    if let Some(connection_metadata_directive) = connection_metadata_directive {
        debug_assert!(
            connection_metadata_directive.arguments.len() == 1,
            "Expected the connection metadata directive to have a single argument."
        );
        let metadata_arg = connection_metadata_directive
            .arguments
            .iter()
            .find(|arg| arg.name.item == connection_constants.connection_metadata_argument_name);

        if let Some(metadata_arg) = metadata_arg {
            let metadata_values = match &metadata_arg.value.item {
                Value::Constant(value) => match value {
                    ConstantValue::List(list) => list,
                    _ => unreachable!(
                        "Expected connection metadata to be a list of metadata objects."
                    ),
                },
                _ => unreachable!("Expected connection metadata to be a list of metadata objects."),
            };

            let built_metadata_values = metadata_values
                .iter()
                .map(|metadata_value| {
                    let metadata_value = match &metadata_value {
                        ConstantValue::List(list) => list,
                        _ => unreachable!("Expected connection metadata value to be a list."),
                    };

                    debug_assert!(
                        metadata_value.len() == 5,
                        "Expected metadata value to be a list with 5 elements"
                    );

                    let path = match &metadata_value[0] {
                        ConstantValue::List(list) => Some(
                            list.iter()
                                .map(|item| match item {
                                    ConstantValue::String(string_val) => *string_val,
                                    _ => unreachable!("Expected connection metadata path to be a list of strings."),
                                })
                                .collect::<Vec<StringKey>>(),
                        ),
                        ConstantValue::Null() => None,
                        _ => unreachable!("Expected connection metadata path to be a nullable list of strings."),
                    };
                    let direction = match &metadata_value[1] {
                        ConstantValue::String(string_val) => *string_val,
                        _ => unreachable!("Expected connection metadata direction to be a string."),
                    };
                    let cursor = match &metadata_value[2] {
                        ConstantValue::String(string_val) => Some(*string_val),
                        ConstantValue::Null() => None,
                        _ => unreachable!("Expected connection metadata cursor to be a nullable string."),
                    };
                    let count = match &metadata_value[3] {
                        ConstantValue::String(string_val) => Some(*string_val),
                        ConstantValue::Null() => None,
                        _ => unreachable!("Expected connection metadata count to be a nullable string."),
                    };
                    let is_stream_connection = match &metadata_value[4] {
                        ConstantValue::Boolean(bool_val) => *bool_val,
                        _ => unreachable!("Expected connection metadata is_stream_connection to be a boolean."),
                    };

                    ConnectionMetadata {
                        path,
                        direction,
                        cursor,
                        count,
                        is_stream_connection,
                    }
                })
                .collect::<Vec<_>>();

            Some(built_metadata_values)
        } else {
            unreachable!("Expected the connection metadata directive to have a single argument containing the connection metadata.")
        }
    } else {
        None
    }
}

/// Builds the selections that will be added to the edges selection
/// by the connections transform
pub fn build_edge_selections<TConnectionInterface: ConnectionInterface>(
    schema: &Schema,
    edge_type: Type,
    connection_interface: &TConnectionInterface,
    // TODO(T63626569): Add support for derived locations
    empty_location: &Location,
) -> Selection {
    let cursor_field_id = schema
        .named_field(edge_type, connection_interface.cursor_selection_name())
        .expect("Expected presence of cursor field to have been previously validated.");
    let node_field_id = schema
        .named_field(edge_type, connection_interface.node_selection_name())
        .expect("Expected presence of node field to have been previously validated.");
    let typename_field_id = schema.typename_field();

    Selection::InlineFragment(From::from(InlineFragment {
        type_condition: Some(edge_type),
        directives: Vec::new(),
        selections: vec![
            Selection::ScalarField(From::from(ScalarField {
                alias: None,
                definition: WithLocation::new(*empty_location, cursor_field_id),
                arguments: Vec::new(),
                directives: Vec::new(),
            })),
            Selection::LinkedField(From::from(LinkedField {
                alias: None,
                definition: WithLocation::new(*empty_location, node_field_id),
                arguments: Vec::new(),
                directives: Vec::new(),
                selections: vec![
                    // We rely on generate_id_transform to add "id"
                    Selection::ScalarField(From::from(ScalarField {
                        alias: None,
                        definition: WithLocation::new(*empty_location, typename_field_id),
                        arguments: Vec::new(),
                        directives: Vec::new(),
                    })),
                ],
            })),
        ],
    }))
}

/// Builds the selections that will be added to the page_info selection
/// by the connections transform
pub fn build_page_info_selections<TConnectionInterface: ConnectionInterface>(
    schema: &Schema,
    page_info_type: Type,
    connection_metadata: &ConnectionMetadata,
    connection_constants: ConnectionConstants,
    connection_interface: &TConnectionInterface,
    // TODO(T63626569): Add support for derived locations
    empty_location: &Location,
) -> Selection {
    let end_cursor_field_id = schema
        .named_field(
            page_info_type,
            connection_interface.end_cursor_selection_name(),
        )
        .expect("Expected presence of end_cursor field to have been previously validated.");
    let has_next_page_field_id = schema
        .named_field(
            page_info_type,
            connection_interface.has_next_page_selection_name(),
        )
        .expect("Expected presence of has_next_page field to have been previously validated.");
    let has_prev_page_field_id = schema
        .named_field(
            page_info_type,
            connection_interface.has_prev_page_selection_name(),
        )
        .expect("Expected presence of has_previous_page field to have been previously validated.");
    let start_cursor_field_id = schema
        .named_field(
            page_info_type,
            connection_interface.start_cursor_selection_name(),
        )
        .expect("Expected presence of start_cursor field to have been previously validated.");

    if connection_metadata.direction == connection_constants.direction_forward {
        Selection::InlineFragment(From::from(InlineFragment {
            type_condition: Some(page_info_type),
            directives: Vec::new(),
            selections: vec![
                Selection::ScalarField(From::from(ScalarField {
                    alias: None,
                    definition: WithLocation::new(*empty_location, end_cursor_field_id),
                    arguments: Vec::new(),
                    directives: Vec::new(),
                })),
                Selection::ScalarField(From::from(ScalarField {
                    alias: None,
                    definition: WithLocation::new(*empty_location, has_next_page_field_id),
                    arguments: Vec::new(),
                    directives: Vec::new(),
                })),
            ],
        }))
    } else if connection_metadata.direction == connection_constants.direction_backward {
        Selection::InlineFragment(From::from(InlineFragment {
            type_condition: Some(page_info_type),
            directives: Vec::new(),
            selections: vec![
                Selection::ScalarField(From::from(ScalarField {
                    alias: None,
                    definition: WithLocation::new(*empty_location, has_prev_page_field_id),
                    arguments: Vec::new(),
                    directives: Vec::new(),
                })),
                Selection::ScalarField(From::from(ScalarField {
                    alias: None,
                    definition: WithLocation::new(*empty_location, start_cursor_field_id),
                    arguments: Vec::new(),
                    directives: Vec::new(),
                })),
            ],
        }))
    } else if connection_metadata.direction == connection_constants.direction_bidirectional {
        Selection::InlineFragment(From::from(InlineFragment {
            type_condition: Some(page_info_type),
            directives: Vec::new(),
            selections: vec![
                Selection::ScalarField(From::from(ScalarField {
                    alias: None,
                    definition: WithLocation::new(*empty_location, end_cursor_field_id),
                    arguments: Vec::new(),
                    directives: Vec::new(),
                })),
                Selection::ScalarField(From::from(ScalarField {
                    alias: None,
                    definition: WithLocation::new(*empty_location, has_next_page_field_id),
                    arguments: Vec::new(),
                    directives: Vec::new(),
                })),
                Selection::ScalarField(From::from(ScalarField {
                    alias: None,
                    definition: WithLocation::new(*empty_location, has_prev_page_field_id),
                    arguments: Vec::new(),
                    directives: Vec::new(),
                })),
                Selection::ScalarField(From::from(ScalarField {
                    alias: None,
                    definition: WithLocation::new(*empty_location, start_cursor_field_id),
                    arguments: Vec::new(),
                    directives: Vec::new(),
                })),
            ],
        }))
    } else {
        unreachable!()
    }
}

/// Helper to extract the connection directive if present in the given list of
/// of directives
pub fn extract_connection_directive(
    directives: &[Directive],
    connection_constants: ConnectionConstants,
) -> Option<&Directive> {
    directives.iter().find(|directive| {
        directive.name.item == connection_constants.connection_directive_name
            || directive.name.item == connection_constants.stream_connection_directive_name
    })
}

/// Helper to get the default set of filters to be used for an @connection handle
/// field when no filters are explicitly specified in the input graphql.
/// By default, we will use all arguments that don't belong to the
/// connection spec as part of the filters.
pub fn get_default_filters(
    connection_field: &LinkedField,
    connection_constants: ConnectionConstants,
) -> Option<Vec<StringKey>> {
    let filtered_args = connection_field
        .arguments
        .iter()
        .filter_map(|arg| {
            if connection_constants.is_connection_argument(arg.name.item) {
                None
            } else {
                Some(arg.name.item)
            }
        })
        .collect::<Vec<_>>();
    if filtered_args.is_empty() {
        return None;
    }
    Some(filtered_args)
}
