/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::Diagnostic;
use common::DiagnosticsResult;
use common::Location;
use common::NamedItem;
use common::WithLocation;
use graphql_ir::Argument;
use graphql_ir::Field;
use graphql_ir::FragmentDefinition;
use graphql_ir::InlineFragment;
use graphql_ir::LinkedField;
use graphql_ir::OperationDefinitionName;
use graphql_ir::ScalarField;
use graphql_ir::Selection;
use graphql_ir::Value;
use graphql_ir::Variable;
use graphql_ir::VariableDefinition;
use graphql_ir::VariableName;
use intern::string_key::StringKey;
use relay_config::SchemaConfig;
use schema::Argument as ArgumentDef;
use schema::FieldID;
use schema::InterfaceID;
use schema::SDLSchema;
use schema::Schema;
use schema::Type;

use super::build_fragment_metadata_as_directive;
use super::build_fragment_spread;
use super::build_operation_variable_definitions;
use super::build_used_global_variables;
use super::validation_message::ValidationMessage;
use super::QueryGenerator;
use super::RefetchRoot;
use super::RefetchableIdentifierInfo;
use super::RefetchableMetadata;
use super::CONSTANTS;
use crate::root_variables::VariableMap;

fn build_refetch_operation(
    schema: &SDLSchema,
    schema_config: &SchemaConfig,
    fragment: &Arc<FragmentDefinition>,
    query_name: OperationDefinitionName,
    variables_map: &VariableMap,
) -> DiagnosticsResult<Option<RefetchRoot>> {
    let id_name = schema_config.node_interface_id_field;
    let node_interface_id = schema.get_type(CONSTANTS.node_type_name).and_then(|type_| {
        if let Type::Interface(id) = type_ {
            Some(id)
        } else {
            None
        }
    });

    match node_interface_id {
        None => Ok(None),
        Some(node_interface_id) => {
            let eligible = match fragment.type_condition {
                Type::Interface(id) => {
                    id == node_interface_id || {
                        let implementing_objects = &schema.interface(id).implementing_objects;
                        !implementing_objects.is_empty()
                            && implementing_objects.iter().all(|&object_id| {
                                schema
                                    .object(object_id)
                                    .interfaces
                                    .iter()
                                    .any(|interface_id| *interface_id == node_interface_id)
                            })
                    }
                }
                Type::Object(id) => schema
                    .object(id)
                    .interfaces
                    .iter()
                    .any(|interface_id| *interface_id == node_interface_id),
                Type::Union(id) => schema.union(id).members.iter().all(|&object_id| {
                    schema
                        .object(object_id)
                        .interfaces
                        .iter()
                        .any(|interface_id| *interface_id == node_interface_id)
                }),
                _ => false,
            };
            if !eligible {
                return Ok(None);
            }

            // Check if the fragment type have an `id` field
            let should_generate_inline_fragment_on_node = schema
                .named_field(fragment.type_condition, id_name)
                .is_none();

            let query_type = schema.query_type().unwrap();
            let (node_field_id, id_arg) =
                get_node_field_id_and_id_arg(schema, query_type, fragment)?;
            let node_interface = schema.interface(node_interface_id);
            let id_field_id = *node_interface
                .fields
                .iter()
                .find(|&&id| schema.field(id).name.item == id_name)
                .unwrap_or_else(|| {
                    panic!("Expected `Node` to contain a field named `{:}`.", id_name)
                });

            let fragment = Arc::new(FragmentDefinition {
                directives: build_fragment_metadata_as_directive(
                    fragment,
                    RefetchableMetadata {
                        operation_name: query_name,
                        path: vec![CONSTANTS.node_field_name],
                        identifier_info: Some(RefetchableIdentifierInfo {
                            identifier_field: id_name,
                            identifier_query_variable_name: schema_config
                                .node_interface_id_variable_name,
                        }),
                    },
                ),
                used_global_variables: build_used_global_variables(
                    variables_map,
                    &fragment.variable_definitions,
                )?,
                variable_definitions: fragment.variable_definitions.clone(),
                selections: enforce_selections_with_id_field(
                    fragment,
                    schema,
                    id_field_id,
                    schema_config.node_interface_id_field,
                    if should_generate_inline_fragment_on_node {
                        Some(node_interface_id)
                    } else {
                        None
                    },
                ),
                ..fragment.as_ref().clone()
            });
            let mut variable_definitions = build_operation_variable_definitions(&fragment);
            if let Some(id_argument) = variable_definitions.named(VariableName(id_name)) {
                return Err(vec![Diagnostic::error(
                    ValidationMessage::RefetchableFragmentOnNodeWithExistingID {
                        fragment_name: fragment.name.item,
                    },
                    id_argument.name.location,
                )]);
            }

            variable_definitions.push(VariableDefinition {
                name: WithLocation::new(fragment.name.location, VariableName(id_name)),
                type_: id_arg.type_.non_null(),
                default_value: None,
                directives: vec![],
            });
            Ok(Some(RefetchRoot {
                variable_definitions,
                selections: vec![Selection::LinkedField(Arc::new(LinkedField {
                    alias: None,
                    definition: WithLocation::new(fragment.name.location, node_field_id),
                    arguments: vec![Argument {
                        name: WithLocation::new(fragment.name.location, id_arg.name.item),
                        value: WithLocation::new(
                            fragment.name.location,
                            Value::Variable(Variable {
                                name: WithLocation::new(
                                    fragment.name.location,
                                    VariableName(id_name),
                                ),
                                type_: id_arg.type_.non_null(),
                            }),
                        ),
                    }],
                    directives: vec![],
                    selections: vec![build_fragment_spread(&fragment)],
                }))],
                fragment,
            }))
        }
    }
}

fn get_node_field_id_and_id_arg<'s>(
    schema: &'s SDLSchema,
    query_type: Type,
    fragment: &FragmentDefinition,
) -> DiagnosticsResult<(FieldID, &'s ArgumentDef)> {
    let node_field_id = schema.named_field(query_type, CONSTANTS.node_field_name);
    if let Some(node_field_id) = node_field_id {
        let node_field = schema.field(node_field_id);
        let mut arg_iter = node_field.arguments.iter();
        if let Some(id_arg) = arg_iter.next() {
            if arg_iter.len() == 0 {
                return Ok((node_field_id, id_arg));
            }
        }
    }
    Err(vec![Diagnostic::error(
        ValidationMessage::InvalidNodeSchemaForRefetchableFragmentOnNode {
            fragment_name: fragment.name.item,
        },
        fragment.name.location,
    )])
}

fn enforce_selections_with_id_field(
    fragment: &FragmentDefinition,
    schema: &SDLSchema,
    id_field_id: FieldID,
    id_name: StringKey,
    node_interface_id: Option<InterfaceID>,
) -> Vec<Selection> {
    let mut next_selections = fragment.selections.clone();
    let has_id_field = next_selections.iter().any(|sel| {
        if let Selection::ScalarField(field) = sel {
            field.alias_or_name(schema) == id_name
                && schema.field(field.definition.item).type_ == schema.field(id_field_id).type_
        } else {
            false
        }
    });
    if has_id_field {
        next_selections
    } else {
        let id_selection: Selection = if let Some(node_interface_id) = node_interface_id {
            Selection::InlineFragment(Arc::new(InlineFragment {
                type_condition: Some(Type::Interface(node_interface_id)),
                directives: vec![],
                selections: vec![Selection::ScalarField(Arc::new(ScalarField {
                    alias: None,
                    definition: WithLocation::new(fragment.name.location, id_field_id),
                    arguments: vec![],
                    directives: vec![],
                }))],
                spread_location: Location::generated(),
            }))
        } else {
            Selection::ScalarField(Arc::new(ScalarField {
                alias: None,
                definition: WithLocation::new(fragment.name.location, id_field_id),
                arguments: vec![],
                directives: vec![],
            }))
        };

        next_selections.push(id_selection);
        next_selections
    }
}

pub const NODE_QUERY_GENERATOR: QueryGenerator = QueryGenerator {
    description: "the Node interface, object types that implement the Node interface, interfaces whose implementing objects all implement Node, and unions whose members all implement Node",
    build_refetch_operation,
};
