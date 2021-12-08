/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::{
    connections::{
        assert_connection_selections, build_connection_metadata, build_edge_selections,
        build_page_info_selections, extract_connection_directive, get_default_filters,
        ConnectionConstants, ConnectionInterface, ConnectionMetadata, ConnectionMetadataDirective,
    },
    defer_stream::DEFER_STREAM_CONSTANTS,
    handle_fields::{build_handle_field_directive_from_connection_directive, KEY_ARG_NAME},
};
use common::{NamedItem, WithLocation};
use graphql_ir::{
    Argument, ConstantValue, Directive, FragmentDefinition, InlineFragment, LinkedField,
    OperationDefinition, Program, Selection, Transformed, Transformer, Value,
};
use intern::string_key::{Intern, StringKey};
use schema::Schema;
use std::sync::Arc;

pub fn transform_connections(
    program: &Program,
    connection_interface: &ConnectionInterface,
) -> Program {
    let mut transform = ConnectionTransform::new(program, connection_interface);
    transform
        .transform_program(program)
        .replace_or_else(|| program.clone())
}

struct ConnectionTransform<'s> {
    connection_interface: &'s ConnectionInterface,
    connection_constants: ConnectionConstants,
    current_path: Option<Vec<StringKey>>,
    current_connection_metadata: Vec<ConnectionMetadata>,
    current_document_name: StringKey,
    program: &'s Program,
}

impl<'s> ConnectionTransform<'s> {
    fn new(program: &'s Program, connection_interface: &'s ConnectionInterface) -> Self {
        Self {
            connection_constants: ConnectionConstants::default(),
            connection_interface,
            current_path: None,
            current_document_name: connection_interface.cursor, // Set an arbitrary value to avoid Option
            current_connection_metadata: Vec::new(),
            program,
        }
    }

    fn transform_connection_selections(
        &mut self,
        connection_field: &LinkedField,
        connection_metadata: &ConnectionMetadata,
        connection_directive: &Directive,
    ) -> Vec<Selection> {
        let is_stream_connection = connection_directive.name.item
            == self.connection_constants.stream_connection_directive_name;
        let schema = &self.program.schema;
        let transformed_selections = self
            .transform_selections(&connection_field.selections)
            .replace_or_else(|| connection_field.selections.clone());

        let ((edges_ix, edges_field), page_info_selection) = assert_connection_selections(
            schema,
            &transformed_selections,
            self.connection_interface,
        );
        let connection_field_type = schema.field(connection_field.definition.item).type_.inner();

        // Construct edges selection
        let edges_schema_field_id = schema
            .named_field(connection_field_type, self.connection_interface.edges)
            .expect("Expected presence of edges field to have been previously validated.");
        let edges_schema_field = schema.field(edges_schema_field_id);
        let edges_field_name = edges_schema_field.name.item;
        let edge_type = edges_schema_field.type_.inner();
        let mut is_aliased_edges = false;
        let mut transformed_edges_field = if let Some(alias) = edges_field.alias {
            is_aliased_edges = true;
            // The edges selection has to be generated as non-aliased field (since product
            // code may be accessing the non-aliased response keys).
            if alias.item != edges_field_name {
                // If an alias is present, and it is different from the field name,
                // we need to build a new edges_selection
                LinkedField {
                    alias: None,
                    definition: WithLocation::generated(edges_schema_field_id),
                    arguments: Vec::new(),
                    directives: Vec::new(),
                    selections: Vec::new(),
                }
            } else {
                // Otherwise reuse the existing edges field
                edges_field.clone()
            }
        } else {
            // If there is no alias present, we can reuse the existing edges field
            edges_field.clone()
        };
        transformed_edges_field
            .selections
            .push(build_edge_selections(
                schema,
                edge_type,
                self.connection_interface,
            ));
        if is_stream_connection {
            let mut arguments = vec![];
            for arg in &connection_directive.arguments {
                if arg.name.item == DEFER_STREAM_CONSTANTS.if_arg
                    || arg.name.item == DEFER_STREAM_CONSTANTS.initial_count_arg
                    || arg.name.item == DEFER_STREAM_CONSTANTS.use_customized_batch_arg
                {
                    arguments.push(arg.clone());
                } else if arg.name.item == *KEY_ARG_NAME {
                    arguments.push(Argument {
                        name: WithLocation::new(
                            arg.name.location,
                            DEFER_STREAM_CONSTANTS.label_arg,
                        ),
                        value: arg.value.clone(),
                    });
                }
            }
            transformed_edges_field.directives.push(Directive {
                name: WithLocation::new(
                    connection_directive.name.location,
                    DEFER_STREAM_CONSTANTS.stream_name,
                ),
                arguments,
                data: None,
            });
        }

        // Construct page_info selection
        let page_info_schema_field_id = schema
            .named_field(connection_field_type, self.connection_interface.page_info)
            .expect("Expected presence of page_info field to have been previously validated.");
        let page_info_schema_field = schema.field(page_info_schema_field_id);
        let page_info_field_name = page_info_schema_field.name.item;
        let page_info_type = page_info_schema_field.type_.inner();
        let mut page_info_ix = None;
        let mut is_aliased_page_info = false;
        let mut transformed_page_info_field = match page_info_selection {
            Some((ix, page_info_field)) => {
                page_info_ix = Some(ix);
                if let Some(alias) = page_info_field.alias {
                    // The page_info selection has to be generated as non-aliased field (since product
                    // code may be accessing the non-aliased response keys).
                    if alias.item != page_info_field_name {
                        is_aliased_page_info = true;
                        // If an alias is present, and it is different from the field name,
                        // we need to build a new page_info field
                        LinkedField {
                            alias: None,
                            definition: WithLocation::generated(page_info_schema_field_id),
                            arguments: Vec::new(),
                            directives: Vec::new(),
                            selections: Vec::new(),
                        }
                    } else {
                        // Otherwise reuse the existing edges field
                        page_info_field.clone()
                    }
                } else {
                    // If there is no alias present, we can reuse the existing edges field
                    page_info_field.clone()
                }
            }
            None => LinkedField {
                alias: None,
                definition: WithLocation::generated(page_info_schema_field_id),
                arguments: Vec::new(),
                directives: Vec::new(),
                selections: Vec::new(),
            },
        };
        transformed_page_info_field
            .selections
            .push(build_page_info_selections(
                schema,
                page_info_type,
                connection_metadata,
                self.connection_constants,
                self.connection_interface,
            ));

        let transformed_page_info_field_selection = if is_stream_connection {
            let mut arguments = vec![];
            let connection_args = &connection_directive.arguments;
            if let Some(key_arg) = connection_args.named(*KEY_ARG_NAME) {
                let key = key_arg.value.item.expect_string_literal();
                arguments.push(Argument {
                    name: WithLocation::new(
                        key_arg.name.location,
                        DEFER_STREAM_CONSTANTS.label_arg,
                    ),
                    value: WithLocation::new(
                        key_arg.value.location,
                        Value::Constant(ConstantValue::String(
                            format!(
                                "{}$defer${}${}",
                                self.current_document_name,
                                key.lookup(),
                                self.connection_interface.page_info
                            )
                            .intern(),
                        )),
                    ),
                });
            }
            if let Some(if_arg) = connection_args.named(DEFER_STREAM_CONSTANTS.if_arg) {
                arguments.push(if_arg.clone());
            }
            Selection::InlineFragment(Arc::new(InlineFragment {
                type_condition: None,
                selections: vec![Selection::LinkedField(From::from(
                    transformed_page_info_field,
                ))],
                directives: vec![Directive {
                    name: WithLocation::new(
                        connection_directive.name.location,
                        DEFER_STREAM_CONSTANTS.defer_name,
                    ),
                    arguments,
                    data: None,
                }],
            }))
        } else {
            Selection::LinkedField(From::from(transformed_page_info_field))
        };

        // Copy the original selections, replacing edges/pageInfo (if present)
        // with the generated locations. This is to maintain the original field
        // ordering.
        let mut next_selections = transformed_selections
            .iter()
            .enumerate()
            .map(|(ix, selection)| {
                if ix == edges_ix {
                    if !is_aliased_edges {
                        return Selection::LinkedField(From::from(transformed_edges_field.clone()));
                    }
                } else if let Some(page_info_ix) = page_info_ix {
                    if ix == page_info_ix && !is_aliased_page_info {
                        return transformed_page_info_field_selection.clone();
                    }
                }
                selection.clone()
            })
            .collect::<Vec<_>>();

        // If a page_info selection didn't exist, or the selections are aliased,
        // append the generated version instead.
        if is_aliased_edges {
            next_selections.push(Selection::LinkedField(From::from(transformed_edges_field)));
        }
        if page_info_selection.is_none() || is_aliased_page_info {
            next_selections.push(transformed_page_info_field_selection);
        }
        next_selections
    }

    fn transform_connection_directives(
        &mut self,
        connection_field: &LinkedField,
        connection_directive: &Directive,
    ) -> Vec<Directive> {
        let connection_handle_directive = build_handle_field_directive_from_connection_directive(
            connection_directive,
            Some(self.connection_constants.connection_directive_name),
            get_default_filters(connection_field, self.connection_constants),
        );
        let mut next_directives = connection_field
            .directives
            .iter()
            .cloned()
            // Remove the original @connection directive
            .filter(|directive| directive != connection_directive)
            .collect::<Vec<_>>();

        // Add an internal (untyped) directive to pass down the connection handle
        // metadata attached to this field.
        // TODO(T63388023): Use typed directives/metadata instead
        next_directives.push(connection_handle_directive);
        next_directives
    }

    fn transform_connection_field(
        &mut self,
        connection_field: &LinkedField,
        connection_directive: &Directive,
    ) -> Transformed<Selection> {
        let connection_metadata = build_connection_metadata(
            connection_field,
            self.connection_constants,
            &self.current_path,
            connection_directive.name.item
                == self.connection_constants.stream_connection_directive_name,
        );
        let next_connection_selections = self.transform_connection_selections(
            connection_field,
            &connection_metadata,
            connection_directive,
        );
        let next_connection_directives =
            self.transform_connection_directives(connection_field, connection_directive);

        // Include the connection metadata from this linked field to
        // attach to the current root document (fragment or operation)
        self.current_connection_metadata.push(connection_metadata);

        Transformed::Replace(Selection::LinkedField(Arc::new(LinkedField {
            selections: next_connection_selections,
            directives: next_connection_directives,
            ..connection_field.clone()
        })))
    }

    fn get_metadata_directive(&mut self) -> Directive {
        ConnectionMetadataDirective(std::mem::take(&mut self.current_connection_metadata)).into()
    }
}

impl<'s> Transformer for ConnectionTransform<'s> {
    const NAME: &'static str = "ConnectionTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_operation(
        &mut self,
        operation: &OperationDefinition,
    ) -> Transformed<OperationDefinition> {
        // TODO(T63626938): This assumes that each document is processed serially (not in parallel or concurrently)
        self.current_document_name = operation.name.item;
        self.current_path = Some(Vec::new());
        self.current_connection_metadata = Vec::new();

        let transformed = self.default_transform_operation(operation);
        if self.current_connection_metadata.is_empty() {
            return transformed;
        }

        let mut transformed_operation = match transformed {
            Transformed::Delete => return Transformed::Delete,
            Transformed::Keep => operation.clone(),
            Transformed::Replace(replaced) => replaced,
        };

        transformed_operation
            .directives
            .push(self.get_metadata_directive());

        Transformed::Replace(transformed_operation)
    }

    fn transform_fragment(
        &mut self,
        fragment: &FragmentDefinition,
    ) -> Transformed<FragmentDefinition> {
        // TODO(T63626938): This assumes that each document is processed serially (not in parallel or concurrently)
        self.current_document_name = fragment.name.item;
        self.current_path = Some(Vec::new());
        self.current_connection_metadata = Vec::new();

        let transformed = self.default_transform_fragment(fragment);
        if self.current_connection_metadata.is_empty() {
            return transformed;
        }

        let mut transformed_fragment = match transformed {
            Transformed::Delete => return Transformed::Delete,
            Transformed::Keep => fragment.clone(),
            Transformed::Replace(replaced) => replaced,
        };

        transformed_fragment
            .directives
            .push(self.get_metadata_directive());

        Transformed::Replace(transformed_fragment)
    }

    fn transform_linked_field(&mut self, field: &LinkedField) -> Transformed<Selection> {
        let schema = &self.program.schema;
        let connection_schema_field = schema.field(field.definition.item);

        // TODO(T63626938): Shouldn't need to do this when transformer infra
        // supports passing state
        let current_path_at_field = self.current_path.clone();

        // Keep track of the current path as long as we don't encounter plural field.
        if connection_schema_field.type_.is_list() {
            self.current_path = None
        } else if let Some(path) = self.current_path.as_mut() {
            path.push(if let Some(alias) = field.alias {
                alias.item
            } else {
                connection_schema_field.name.item
            })
        }

        let res = if let Some(connection_directive) =
            extract_connection_directive(&field.directives, self.connection_constants)
        {
            self.transform_connection_field(field, connection_directive)
        } else {
            self.default_transform_linked_field(field)
        };
        self.current_path = current_path_at_field;
        res
    }
}
