/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::root_variables::VariableMap;
use common::WithLocation;
use graphql_ir::{
    Argument, ConstantValue, Directive, FragmentDefinition, FragmentSpread, Selection, Value,
    Variable, VariableDefinition,
};
use interner::{Intern, StringKey};
use lazy_static::lazy_static;
use std::sync::Arc;

pub struct RefetchableMetadata {
    pub operation_name: StringKey,
    pub path: Vec<StringKey>,
    pub identifier_field: Option<StringKey>,
}

pub struct Constants {
    pub id_name: StringKey,
    pub identifier_field_arg: StringKey,
    pub node_field_name: StringKey,
    pub node_type_name: StringKey,
    pub query_name_arg: StringKey,
    pub refetchable_metadata_name: StringKey,
    pub refetchable_operation_metadata_name: StringKey,
    pub refetchable_name: StringKey,
    pub viewer_field_name: StringKey,
    pub viewer_type_name: StringKey,
}

lazy_static! {
    pub static ref CONSTANTS: Constants = Constants {
        id_name: "id".intern(),
        identifier_field_arg: "fragmentPathInResult".intern(),
        node_field_name: "node".intern(),
        node_type_name: "Node".intern(),
        query_name_arg: "queryName".intern(),
        refetchable_metadata_name: "__refetchableMetadata".intern(),
        refetchable_operation_metadata_name: "__refetchableQueryMetadata".intern(),
        refetchable_name: "refetchable".intern(),
        viewer_field_name: "viewer".intern(),
        viewer_type_name: "Viewer".intern(),
    };
}

pub fn build_fragment_spread(fragment: &FragmentDefinition) -> Selection {
    Selection::FragmentSpread(Arc::new(FragmentSpread {
        fragment: fragment.name,
        directives: vec![],
        arguments: fragment
            .variable_definitions
            .iter()
            .map(|var| Argument {
                name: var.name,
                value: WithLocation::new(
                    var.name.location,
                    Value::Variable(Variable {
                        name: var.name,
                        type_: var.type_.clone(),
                    }),
                ),
            })
            .collect(),
    }))
}

pub fn build_operation_variable_definitions(
    variable_map: &VariableMap,
    local_variables: &[VariableDefinition],
) -> Vec<VariableDefinition> {
    let mut result: Vec<_> = variable_map
        .values()
        .map(|var| VariableDefinition {
            name: var.name,
            type_: var.type_.clone(),
            default_value: None,
            directives: vec![],
        })
        .collect();
    for var in local_variables {
        if !variable_map.contains_key(&var.name.item) {
            result.push(var.clone());
        }
    }
    result.sort_unstable_by(|l, r| l.name.item.lookup().cmp(&r.name.item.lookup()));
    result
}

/// Attach metadata to the operation and fragment.
pub fn build_fragment_metadata_as_directive(
    fragment: &FragmentDefinition,
    metadata: RefetchableMetadata,
) -> Vec<Directive> {
    let mut next_directives = fragment.directives.clone();
    // Fragment: [operation, fragmentPathInResult, identifierField]
    next_directives.push(Directive {
        name: WithLocation::new(fragment.name.location, CONSTANTS.refetchable_metadata_name),
        arguments: vec![Argument {
            name: WithLocation::new(fragment.name.location, CONSTANTS.refetchable_metadata_name),
            value: WithLocation::new(
                fragment.name.location,
                Value::Constant(ConstantValue::List(vec![
                    ConstantValue::String(metadata.operation_name),
                    ConstantValue::List(
                        metadata
                            .path
                            .into_iter()
                            .map(ConstantValue::String)
                            .collect(),
                    ),
                    if let Some(identifier) = metadata.identifier_field {
                        ConstantValue::String(identifier)
                    } else {
                        ConstantValue::Null()
                    },
                ])),
            ),
        }],
    });
    next_directives
}

pub fn build_operation_metadata_as_directive(
    fragment_name: WithLocation<StringKey>,
) -> Vec<Directive> {
    // Operation: derivedFrom
    vec![Directive {
        name: WithLocation::new(
            fragment_name.location,
            CONSTANTS.refetchable_operation_metadata_name,
        ),
        arguments: vec![Argument {
            name: WithLocation::new(
                fragment_name.location,
                CONSTANTS.refetchable_operation_metadata_name,
            ),
            value: WithLocation::new(
                fragment_name.location,
                Value::Constant(ConstantValue::String(fragment_name.item)),
            ),
        }],
    }]
}
