/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::{
    connections::{ConnectionConstants, ConnectionInterface},
    util::extract_variable_name,
};
use common::{NamedItem, WithLocation};
use graphql_ir::{
    associated_data_impl, Directive, InlineFragment, LinkedField, ScalarField, Selection,
};
use intern::string_key::StringKey;
use schema::{SDLSchema, Schema, Type};

/// Helper to assert and extract the expected selections for a connection
/// field. This function will panic if the expected selections aren't present,
/// with the assumption that the connection field has already been validated.
pub fn assert_connection_selections<'s>(
    schema: &'s SDLSchema,
    selections: &'s [Selection],
    connection_interface: &ConnectionInterface,
) -> ((usize, &'s LinkedField), Option<(usize, &'s LinkedField)>) {
    let mut edges_selection = None;
    let mut page_info_selection = None;
    for (ix, selection) in selections.iter().enumerate() {
        if let Selection::LinkedField(field) = selection {
            let field_name = schema.field(field.definition.item).name.item;
            if field_name == connection_interface.edges {
                if edges_selection.is_some() {
                    unreachable!("Unexpected duplicate selection for edges")
                }
                edges_selection = Some((ix, field.as_ref()));
            }
            if field_name == connection_interface.page_info {
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

#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub struct ConnectionMetadataDirective(pub Vec<ConnectionMetadata>);

associated_data_impl!(ConnectionMetadataDirective);

#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub struct ConnectionMetadata {
    pub path: Option<Vec<StringKey>>,
    pub direction: StringKey,
    pub first: Option<StringKey>,
    pub last: Option<StringKey>,
    pub before: Option<StringKey>,
    pub after: Option<StringKey>,
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
    let first_arg = connection_field
        .arguments
        .named(connection_constants.first_arg_name);
    let last_arg = connection_field
        .arguments
        .named(connection_constants.last_arg_name);

    let direction = match (first_arg, last_arg) {
        (Some(_), Some(_)) => connection_constants.direction_bidirectional,
        (Some(_), None) => connection_constants.direction_forward,
        (None, Some(_)) => connection_constants.direction_backward,
        (None, None) => unreachable!(
            "Expected presence of first or last args on connection to have been previously validated."
        ),
    };

    ConnectionMetadata {
        first: extract_variable_name(first_arg),
        last: extract_variable_name(last_arg),
        after: first_arg.and_then(|_| {
            extract_variable_name(
                connection_field
                    .arguments
                    .named(connection_constants.after_arg_name),
            )
        }),
        before: last_arg.and_then(|_| {
            extract_variable_name(
                connection_field
                    .arguments
                    .named(connection_constants.before_arg_name),
            )
        }),
        direction,
        path: path.clone(),
        is_stream_connection,
    }
}

pub fn extract_connection_metadata_from_directive(
    directives: &[Directive],
) -> Option<&[ConnectionMetadata]> {
    ConnectionMetadataDirective::find(directives)
        .map(|connection_metadatas| connection_metadatas.0.as_slice())
}

/// Builds the selections that will be added to the edges selection
/// by the connections transform
pub fn build_edge_selections(
    schema: &SDLSchema,
    edge_type: Type,
    connection_interface: &ConnectionInterface,
) -> Selection {
    let cursor_field_id = schema
        .named_field(edge_type, connection_interface.cursor)
        .expect("Expected presence of cursor field to have been previously validated.");
    let node_field_id = schema
        .named_field(edge_type, connection_interface.node)
        .expect("Expected presence of node field to have been previously validated.");
    let typename_field_id = schema.typename_field();

    Selection::InlineFragment(From::from(InlineFragment {
        type_condition: Some(edge_type),
        directives: Vec::new(),
        selections: vec![
            Selection::ScalarField(From::from(ScalarField {
                alias: None,
                definition: WithLocation::generated(cursor_field_id),
                arguments: Vec::new(),
                directives: Vec::new(),
            })),
            Selection::LinkedField(From::from(LinkedField {
                alias: None,
                definition: WithLocation::generated(node_field_id),
                arguments: Vec::new(),
                directives: Vec::new(),
                selections: vec![
                    // We rely on generate_id_transform to add "id"
                    Selection::ScalarField(From::from(ScalarField {
                        alias: None,
                        definition: WithLocation::generated(typename_field_id),
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
pub fn build_page_info_selections(
    schema: &SDLSchema,
    page_info_type: Type,
    connection_metadata: &ConnectionMetadata,
    connection_constants: ConnectionConstants,
    connection_interface: &ConnectionInterface,
) -> Selection {
    let end_cursor_field_id = schema
        .named_field(page_info_type, connection_interface.end_cursor)
        .expect("Expected presence of end_cursor field to have been previously validated.");
    let has_next_page_field_id = schema
        .named_field(page_info_type, connection_interface.has_next_page)
        .expect("Expected presence of has_next_page field to have been previously validated.");
    let has_prev_page_field_id = schema
        .named_field(page_info_type, connection_interface.has_previous_page)
        .expect("Expected presence of has_previous_page field to have been previously validated.");
    let start_cursor_field_id = schema
        .named_field(page_info_type, connection_interface.start_cursor)
        .expect("Expected presence of start_cursor field to have been previously validated.");

    if connection_metadata.direction == connection_constants.direction_forward {
        Selection::InlineFragment(From::from(InlineFragment {
            type_condition: Some(page_info_type),
            directives: Vec::new(),
            selections: vec![
                Selection::ScalarField(From::from(ScalarField {
                    alias: None,
                    definition: WithLocation::generated(end_cursor_field_id),
                    arguments: Vec::new(),
                    directives: Vec::new(),
                })),
                Selection::ScalarField(From::from(ScalarField {
                    alias: None,
                    definition: WithLocation::generated(has_next_page_field_id),
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
                    definition: WithLocation::generated(has_prev_page_field_id),
                    arguments: Vec::new(),
                    directives: Vec::new(),
                })),
                Selection::ScalarField(From::from(ScalarField {
                    alias: None,
                    definition: WithLocation::generated(start_cursor_field_id),
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
                    definition: WithLocation::generated(end_cursor_field_id),
                    arguments: Vec::new(),
                    directives: Vec::new(),
                })),
                Selection::ScalarField(From::from(ScalarField {
                    alias: None,
                    definition: WithLocation::generated(has_next_page_field_id),
                    arguments: Vec::new(),
                    directives: Vec::new(),
                })),
                Selection::ScalarField(From::from(ScalarField {
                    alias: None,
                    definition: WithLocation::generated(has_prev_page_field_id),
                    arguments: Vec::new(),
                    directives: Vec::new(),
                })),
                Selection::ScalarField(From::from(ScalarField {
                    alias: None,
                    definition: WithLocation::generated(start_cursor_field_id),
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
