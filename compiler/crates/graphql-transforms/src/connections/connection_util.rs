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
    pub direction: ConnectionDirection,
    pub cursor: Option<StringKey>,
    pub count: Option<StringKey>,
    pub is_stream_connection: bool,
}

pub enum ConnectionDirection {
    Forward,
    Backward,
    Bidirectional,
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
            Some(_last_arg) => (ConnectionDirection::Bidirectional, None, None),
            None => (
                ConnectionDirection::Forward,
                extract_variable_name(Some(first_arg)),
                extract_variable_name(find_argument(
                    &connection_field.arguments,
                    connection_constants.after_arg_name,
                )),
            ),
        },
        None => match last_arg {
            Some(last_arg) => (
                ConnectionDirection::Backward,
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
        .map(|metadata| build_connection_metadata_value(metadata, connection_constants))
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

fn build_connection_metadata_value(
    connection_metadata: &ConnectionMetadata,
    connection_constants: ConnectionConstants,
) -> ConstantValue {
    ConstantValue::List(vec![
        match &connection_metadata.path {
            Some(path) => ConstantValue::List(
                path.iter()
                    .map(|part| ConstantValue::String(*part))
                    .collect::<Vec<_>>(),
            ),
            None => ConstantValue::Null(),
        },
        ConstantValue::String(match connection_metadata.direction {
            ConnectionDirection::Forward => connection_constants.direction_forward,
            ConnectionDirection::Backward => connection_constants.direction_backward,
            ConnectionDirection::Bidirectional => connection_constants.direction_bidirectional,
        }),
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
    direction: &ConnectionDirection,
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

    match direction {
        ConnectionDirection::Forward => Selection::InlineFragment(From::from(InlineFragment {
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
        })),
        ConnectionDirection::Backward => Selection::InlineFragment(From::from(InlineFragment {
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
        })),
        ConnectionDirection::Bidirectional => {
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
        }
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
