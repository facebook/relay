/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::Diagnostic;
use common::DiagnosticsResult;
use common::NamedItem;
use common::WithLocation;
use graphql_ir::Argument;
use graphql_ir::FragmentDefinition;
use graphql_ir::LinkedField;
use graphql_ir::OperationDefinitionName;
use graphql_ir::ScalarField;
use graphql_ir::Selection;
use graphql_ir::Value;
use graphql_ir::Variable;
use graphql_ir::VariableDefinition;
use graphql_ir::VariableName;
use intern::string_key::Intern;
use intern::string_key::StringKey;
use relay_config::SchemaConfig;
use schema::Argument as ArgumentDef;
use schema::FieldID;
use schema::SDLSchema;
use schema::Schema;
use schema::Type;

use super::CONSTANTS;
use super::QueryGenerator;
use super::RefetchRoot;
use super::RefetchableIdentifierInfo;
use super::RefetchableMetadata;
use super::build_fragment_metadata_as_directive;
use super::build_fragment_spread;
use super::build_operation_variable_definitions;
use super::build_used_global_variables;
use super::uses_prefetchable_pagination_in_connection;
use super::validation_message::ValidationMessage;
use crate::root_variables::VariableMap;

fn build_refetch_operation(
    schema: &SDLSchema,
    schema_config: &SchemaConfig,
    fragment: &Arc<FragmentDefinition>,
    query_name: OperationDefinitionName,
    variables_map: &VariableMap,
) -> DiagnosticsResult<Option<RefetchRoot>> {
    let id_name = schema_config.node_interface_id_field;

    if let Some(identifier_field_name) = get_fetchable_field_name(fragment, schema)? {
        let identifier_field_id = get_identifier_field_id(fragment, schema, identifier_field_name)?;

        let query_type = schema.query_type().unwrap();
        let fetch_field_name =
            format!("fetch__{}", schema.get_type_name(fragment.type_condition)).intern();
        let (fetch_field_id, id_arg) =
            get_fetch_field_id_and_id_arg(fragment, schema, query_type, fetch_field_name)?;

        let fetch_token_field = match schema_config.enable_token_field {
            true => Some(schema.fetch_token_field()),
            false => None,
        };

        let fragment = Arc::new(FragmentDefinition {
            name: fragment.name,
            variable_definitions: fragment.variable_definitions.clone(),
            used_global_variables: build_used_global_variables(
                variables_map,
                &fragment.variable_definitions,
            )?,
            type_condition: fragment.type_condition,
            directives: build_fragment_metadata_as_directive(
                fragment,
                RefetchableMetadata {
                    operation_name: query_name,
                    path: vec![fetch_field_name],
                    identifier_info: Some(RefetchableIdentifierInfo {
                        identifier_field: identifier_field_name,
                        identifier_query_variable_name: schema_config
                            .node_interface_id_variable_name,
                    }),
                    is_prefetchable_pagination: uses_prefetchable_pagination_in_connection(
                        fragment,
                    ),
                },
            ),
            selections: enforce_selections_with_id_field(
                fragment,
                identifier_field_id,
                fetch_token_field,
            ),
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
                definition: WithLocation::new(fragment.name.location, fetch_field_id),
                arguments: vec![Argument {
                    name: WithLocation::new(fragment.name.location, id_arg.name.item),
                    value: WithLocation::new(
                        fragment.name.location,
                        Value::Variable(Variable {
                            name: WithLocation::new(fragment.name.location, VariableName(id_name)),
                            type_: id_arg.type_.non_null(),
                        }),
                    ),
                }],
                directives: vec![],
                selections: vec![build_fragment_spread(&fragment)],
            }))],
            fragment,
        }))
    } else {
        Ok(None)
    }
}

fn get_fetchable_field_name(
    fragment: &FragmentDefinition,
    schema: &SDLSchema,
) -> DiagnosticsResult<Option<StringKey>> {
    let fetchable_directive = match fragment.type_condition {
        Type::Interface(interface_id) => {
            let interface = schema.interface(interface_id);
            interface.directives.named(CONSTANTS.fetchable)
        }
        Type::Object(object_id) => {
            let object = schema.object(object_id);
            object.directives.named(CONSTANTS.fetchable)
        }
        _ => None,
    };

    if let Some(fetchable) = fetchable_directive {
        let field_name_arg = fetchable.arguments.named(CONSTANTS.field_name);
        if let Some(field_name_arg) = field_name_arg
            && let Some(value) = field_name_arg.value.get_string_literal()
        {
            return Ok(Some(value));
        }
        return Err(vec![Diagnostic::error(
            ValidationMessage::InvalidRefetchDirectiveDefinition {
                fragment_name: fragment.name.item,
            },
            fragment.name.location,
        )]);
    }

    Ok(None)
}

fn get_identifier_field_id(
    fragment: &FragmentDefinition,
    schema: &SDLSchema,
    identifier_field_name: StringKey,
) -> DiagnosticsResult<FieldID> {
    let identifier_field_id = schema.named_field(fragment.type_condition, identifier_field_name);
    if let Some(identifier_field_id) = identifier_field_id {
        let identifier_field = schema.field(identifier_field_id);
        if schema.is_id(identifier_field.type_.inner()) {
            return Ok(identifier_field_id);
        }
    }
    Err(vec![Diagnostic::error(
        ValidationMessage::InvalidRefetchIdentifyingField {
            fragment_name: fragment.name.item,
            identifier_field_name,
            type_name: schema.get_type_name(fragment.type_condition),
        },
        fragment.name.location,
    )])
}

fn get_fetch_field_id_and_id_arg<'s>(
    fragment: &FragmentDefinition,
    schema: &'s SDLSchema,
    query_type: Type,
    fetch_field_name: StringKey,
) -> DiagnosticsResult<(FieldID, &'s ArgumentDef)> {
    let fetch_field_id = schema.named_field(query_type, fetch_field_name);
    if let Some(fetch_field_id) = fetch_field_id {
        let fetch_field = schema.field(fetch_field_id);
        if let Some(inner_type) = fetch_field.type_.non_list_type()
            && inner_type == fragment.type_condition
        {
            let mut arg_iter = fetch_field.arguments.iter();
            if let Some(id_arg) = arg_iter.next()
                && !id_arg.type_.is_list()
                && schema.is_id(id_arg.type_.inner())
            {
                return Ok((fetch_field_id, id_arg));
            }
        }
    }
    Err(vec![Diagnostic::error(
        ValidationMessage::InvalidRefetchFetchField {
            fetch_field_name,
            fragment_name: fragment.name.item,
            type_name: schema.get_type_name(fragment.type_condition),
        },
        fragment.name.location,
    )])
}

fn has_field(selections: &[Selection], field_id: FieldID) -> bool {
    selections.iter().any(|sel| match sel {
        Selection::ScalarField(field) => field.definition.item == field_id,
        _ => false,
    })
}

fn enforce_selections_with_id_field(
    fragment: &FragmentDefinition,
    identifier_field_id: FieldID,
    fetch_token_field_id: Option<FieldID>,
) -> Vec<Selection> {
    let mut next_selections = fragment.selections.clone();
    if !has_field(&next_selections, identifier_field_id) {
        next_selections.push(Selection::ScalarField(Arc::new(ScalarField {
            alias: None,
            definition: WithLocation::new(fragment.name.location, identifier_field_id),
            arguments: vec![],
            directives: vec![],
        })));
    }
    if let Some(fetch_token_field_id) = fetch_token_field_id
        && !has_field(&next_selections, fetch_token_field_id)
    {
        next_selections.push(Selection::ScalarField(Arc::new(ScalarField {
            alias: None,
            definition: WithLocation::new(fragment.name.location, fetch_token_field_id),
            arguments: vec![],
            directives: vec![],
        })));
    };
    next_selections
}

pub const FETCHABLE_QUERY_GENERATOR: QueryGenerator = QueryGenerator {
    // T138625502 we should support interfaces and maybe unions
    description: "server objects and interfaces with the @fetchable directive",
    build_refetch_operation,
};
