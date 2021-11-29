/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::{
    build_fragment_metadata_as_directive, build_fragment_spread,
    build_operation_variable_definitions, build_used_global_variables, QueryGenerator, RefetchRoot,
    RefetchableMetadata, CONSTANTS,
};
use crate::root_variables::VariableMap;
use common::{Diagnostic, DiagnosticsResult, NamedItem, WithLocation};
use graphql_ir::{
    Argument, FragmentDefinition, LinkedField, ScalarField, Selection, ValidationMessage, Value,
    Variable, VariableDefinition,
};
use intern::string_key::{Intern, StringKey};
use schema::{Argument as ArgumentDef, FieldID, SDLSchema, Schema, Type};
use std::sync::Arc;

fn build_refetch_operation(
    schema: &SDLSchema,
    fragment: &Arc<FragmentDefinition>,
    query_name: StringKey,
    variables_map: &VariableMap,
) -> DiagnosticsResult<Option<RefetchRoot>> {
    if let Some(identifier_field_name) = get_fetchable_field_name(fragment, schema)? {
        let identifier_field_id = get_identifier_field_id(fragment, schema, identifier_field_name)?;

        let query_type = schema.query_type().unwrap();
        let fetch_field_name =
            format!("fetch__{}", schema.get_type_name(fragment.type_condition)).intern();
        let (fetch_field_id, id_arg) =
            get_fetch_field_id_and_id_arg(fragment, schema, query_type, fetch_field_name)?;

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
                    identifier_field: Some(identifier_field_name),
                },
            ),
            selections: enforce_selections_with_id_field(
                fragment,
                identifier_field_id,
                schema.fetch_token_field(),
            ),
        });
        let mut variable_definitions = build_operation_variable_definitions(&fragment);
        if let Some(id_argument) = variable_definitions.named(CONSTANTS.id_name) {
            return Err(vec![Diagnostic::error(
                ValidationMessage::RefetchableFragmentOnNodeWithExistingID {
                    fragment_name: fragment.name.item,
                },
                id_argument.name.location,
            )]);
        }
        variable_definitions.push(VariableDefinition {
            name: WithLocation::new(fragment.name.location, CONSTANTS.id_name),
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
                    name: WithLocation::new(fragment.name.location, id_arg.name),
                    value: WithLocation::new(
                        fragment.name.location,
                        Value::Variable(Variable {
                            name: WithLocation::new(fragment.name.location, CONSTANTS.id_name),
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
    if let Type::Object(id) = fragment.type_condition {
        let object = schema.object(id);
        if let Some(fetchable) = object.directives.named(CONSTANTS.fetchable) {
            let field_name_arg = fetchable.arguments.named(CONSTANTS.field_name);
            if let Some(field_name_arg) = field_name_arg {
                if let Some(value) = field_name_arg.value.get_string_literal() {
                    return Ok(Some(value));
                }
            }
            return Err(vec![Diagnostic::error(
                ValidationMessage::InvalidRefetchDirectiveDefinition {
                    fragment_name: fragment.name.item,
                },
                fragment.name.location,
            )]);
        }
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
        if let Some(inner_type) = fetch_field.type_.non_list_type() {
            if inner_type == fragment.type_condition {
                let mut arg_iter = fetch_field.arguments.iter();
                if let Some(id_arg) = arg_iter.next() {
                    if !id_arg.type_.is_list() && schema.is_id(id_arg.type_.inner()) {
                        return Ok((fetch_field_id, id_arg));
                    }
                }
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
    fetch_token_field_id: FieldID,
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
    if !has_field(&next_selections, fetch_token_field_id) {
        next_selections.push(Selection::ScalarField(Arc::new(ScalarField {
            alias: None,
            definition: WithLocation::generated(fetch_token_field_id),
            arguments: vec![],
            directives: vec![],
        })));
    }
    next_selections
}

pub const FETCHABLE_QUERY_GENERATOR: QueryGenerator = QueryGenerator {
    description: "@fetchable type",
    build_refetch_operation,
};
