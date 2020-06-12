/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::{
    build_fragment_metadata_as_directive, build_fragment_spread,
    build_operation_variable_definitions, build_used_global_variables,
    filter_fragment_variable_definitions, QueryGenerator, RefetchRoot,
    RefetchableDerivedFromMetadata, RefetchableMetadata, CONSTANTS,
};
use crate::root_variables::VariableMap;
use common::{NamedItem, WithLocation};
use graphql_ir::{
    Argument, FragmentDefinition, LinkedField, OperationDefinition, ScalarField, Selection,
    ValidationError, ValidationMessage, ValidationResult, Value, Variable, VariableDefinition,
};
use graphql_syntax::OperationKind;
use interner::StringKey;
use schema::{Argument as ArgumentDef, FieldID, Schema, Type};
use std::sync::Arc;

fn build_refetch_operation(
    schema: &Schema,
    fragment: &Arc<FragmentDefinition>,
    query_name: StringKey,
    variables_map: &VariableMap,
) -> ValidationResult<Option<RefetchRoot>> {
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
                    id == node_interface_id
                        || schema.interface(id).implementors.iter().all(|&object_id| {
                            schema
                                .object(object_id)
                                .interfaces
                                .iter()
                                .any(|interface_id| *interface_id == node_interface_id)
                        })
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

            let query_type = schema.query_type().unwrap();
            let (node_field_id, id_arg) =
                get_node_field_id_and_id_arg(schema, query_type, fragment)?;
            let node_interface = schema.interface(node_interface_id);
            let id_field_id = *node_interface
                .fields
                .iter()
                .find(|&&id| schema.field(id).name == CONSTANTS.id_name)
                .expect("Expected `Node` to contain a field named `id`.");

            let fragment = Arc::new(FragmentDefinition {
                directives: build_fragment_metadata_as_directive(
                    fragment,
                    RefetchableMetadata {
                        operation_name: query_name,
                        path: vec![CONSTANTS.node_field_name],
                        identifier_field: Some(CONSTANTS.id_name),
                    },
                ),
                used_global_variables: build_used_global_variables(variables_map),
                variable_definitions: filter_fragment_variable_definitions(
                    variables_map,
                    &fragment.variable_definitions,
                ),
                selections: enforce_selections_with_id_field(fragment, schema, id_field_id),
                ..fragment.as_ref().clone()
            });
            let mut variable_definitions = build_operation_variable_definitions(&fragment);
            if let Some(id_argument) = variable_definitions.named(CONSTANTS.id_name) {
                return Err(vec![ValidationError::new(
                    ValidationMessage::RefetchableFragmentOnNodeWithExistingID {
                        fragment_name: fragment.name.item,
                    },
                    vec![id_argument.name.location],
                )]);
            }

            variable_definitions.push(VariableDefinition {
                name: WithLocation::new(fragment.name.location, CONSTANTS.id_name),
                type_: id_arg.type_.non_null(),
                default_value: None,
                directives: vec![],
            });
            Ok(Some(RefetchRoot {
                operation: Arc::new(OperationDefinition {
                    kind: OperationKind::Query,
                    name: WithLocation::new(fragment.name.location, query_name),
                    type_: query_type,
                    variable_definitions,
                    directives: vec![RefetchableDerivedFromMetadata::create_directive(
                        fragment.name,
                    )],
                    selections: vec![Selection::LinkedField(Arc::new(LinkedField {
                        alias: None,
                        definition: WithLocation::new(fragment.name.location, node_field_id),
                        arguments: vec![Argument {
                            name: WithLocation::new(fragment.name.location, id_arg.name),
                            value: WithLocation::new(
                                fragment.name.location,
                                Value::Variable(Variable {
                                    name: WithLocation::new(
                                        fragment.name.location,
                                        CONSTANTS.id_name,
                                    ),
                                    type_: id_arg.type_.non_null(),
                                }),
                            ),
                        }],
                        directives: vec![],
                        selections: vec![build_fragment_spread(&fragment)],
                    }))],
                }),
                fragment,
            }))
        }
    }
}

fn get_node_field_id_and_id_arg<'s>(
    schema: &'s Schema,
    query_type: Type,
    fragment: &FragmentDefinition,
) -> ValidationResult<(FieldID, &'s ArgumentDef)> {
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
    Err(vec![ValidationError::new(
        ValidationMessage::InvalidNodeSchemaForRefetchableFragmentOnNode {
            fragment_name: fragment.name.item,
        },
        vec![fragment.name.location],
    )])
}

fn enforce_selections_with_id_field(
    fragment: &FragmentDefinition,
    schema: &Schema,
    id_field_id: FieldID,
) -> Vec<Selection> {
    let mut next_selections = fragment.selections.clone();
    let has_id_field = next_selections.iter().any(|sel| {
        if let Selection::ScalarField(field) = sel {
            field.alias_or_name(schema) == CONSTANTS.id_name
                && schema.field(field.definition.item).type_ == schema.field(id_field_id).type_
        } else {
            false
        }
    });
    if has_id_field {
        next_selections
    } else {
        next_selections.push(Selection::ScalarField(Arc::new(ScalarField {
            alias: None,
            definition: WithLocation::new(fragment.name.location, id_field_id),
            arguments: vec![],
            directives: vec![],
        })));
        next_selections
    }
}

pub const NODE_QUERY_GENERATOR: QueryGenerator = QueryGenerator {
    description: "the Node interface or types implementing the Node interface",
    build_refetch_operation,
};
