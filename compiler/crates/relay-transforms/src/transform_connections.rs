/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::Location;
use common::NamedItem;
use common::WithLocation;
use graphql_ir::Argument;
use graphql_ir::ConstantValue;
use graphql_ir::Directive;
use graphql_ir::FragmentDefinition;
use graphql_ir::InlineFragment;
use graphql_ir::LinkedField;
use graphql_ir::OperationDefinition;
use graphql_ir::Program;
use graphql_ir::Selection;
use graphql_ir::Transformed;
use graphql_ir::Transformer;
use graphql_ir::Value;
use intern::string_key::Intern;
use intern::string_key::StringKey;
use intern::Lookup;
use relay_config::DeferStreamInterface;
use schema::Schema;

use crate::connections::assert_connection_selections;
use crate::connections::build_connection_metadata;
use crate::connections::build_edge_selections;
use crate::connections::build_page_info_selections;
use crate::connections::extract_connection_directive;
use crate::connections::get_default_filters;
use crate::connections::ConnectionConstants;
use crate::connections::ConnectionInterface;
use crate::connections::ConnectionMetadata;
use crate::connections::ConnectionMetadataDirective;
use crate::handle_fields::build_handle_field_directive_from_connection_directive;
use crate::handle_fields::KEY_ARG_NAME;

pub fn transform_connections(
    program: &Program,
    connection_interface: &ConnectionInterface,
    defer_stream_interface: &DeferStreamInterface,
) -> Program {
    let mut transform =
        ConnectionTransform::new(program, connection_interface, defer_stream_interface);
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
    defer_stream_interface: &'s DeferStreamInterface,
}

impl<'s> ConnectionTransform<'s> {
    fn new(
        program: &'s Program,
        connection_interface: &'s ConnectionInterface,
        defer_stream_interface: &'s DeferStreamInterface,
    ) -> Self {
        Self {
            connection_constants: ConnectionConstants::default(),
            connection_interface,
            current_path: None,
            current_document_name: connection_interface.cursor, // Set an arbitrary value to avoid Option
            current_connection_metadata: Vec::new(),
            program,
            defer_stream_interface,
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
                if arg.name.item == self.connection_constants.stream_connection_if_arg {
                    arguments.push(Argument {
                        name: WithLocation::new(
                            arg.name.location,
                            self.defer_stream_interface.if_arg,
                        ),
                        value: arg.value.clone(),
                    });
                } else if arg.name.item
                    == self
                        .connection_constants
                        .stream_connection_initial_count_arg
                {
                    arguments.push(Argument {
                        name: WithLocation::new(
                            arg.name.location,
                            self.defer_stream_interface.initial_count_arg,
                        ),
                        value: arg.value.clone(),
                    });
                } else if arg.name.item
                    == self
                        .connection_constants
                        .stream_connection_use_customized_batch_arg
                {
                    arguments.push(Argument {
                        name: WithLocation::new(
                            arg.name.location,
                            self.defer_stream_interface.use_customized_batch_arg,
                        ),
                        value: arg.value.clone(),
                    });
                } else if arg.name.item == *KEY_ARG_NAME {
                    arguments.push(Argument {
                        name: WithLocation::new(
                            arg.name.location,
                            self.defer_stream_interface.label_arg,
                        ),
                        value: arg.value.clone(),
                    });
                }
            }
            transformed_edges_field.directives.push(Directive {
                name: WithLocation::new(
                    connection_directive.name.location,
                    self.defer_stream_interface.stream_name,
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
                        self.defer_stream_interface.label_arg,
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
            if let Some(if_arg) =
                connection_args.named(self.connection_constants.stream_connection_if_arg)
            {
                arguments.push(Argument {
                    name: WithLocation::new(
                        if_arg.name.location,
                        self.defer_stream_interface.if_arg,
                    ),
                    value: if_arg.value.clone(),
                })
            }
            Selection::InlineFragment(Arc::new(InlineFragment {
                type_condition: None,
                selections: vec![Selection::LinkedField(From::from(
                    transformed_page_info_field,
                ))],
                directives: vec![Directive {
                    name: WithLocation::new(
                        connection_directive.name.location,
                        self.defer_stream_interface.defer_name,
                    ),
                    arguments,
                    data: None,
                }],
                spread_location: Location::generated(),
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
            Some(self.connection_constants.connection_directive_name.0),
            get_default_filters(connection_field, self.connection_constants),
        );
        let mut next_directives = connection_field
            .directives
            .iter()
            .filter(|&directive| directive != connection_directive)
            .cloned()
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
        self.current_document_name = operation.name.item.0;
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
        self.current_document_name = fragment.name.item.0;
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
