/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::root_variables::VariableMap;
use common::WithLocation;
use graphql_ir::{
    Argument, FragmentDefinition, FragmentSpread, Selection, Value, Variable, VariableDefinition,
};
use interner::{Intern, StringKey};
use lazy_static::lazy_static;
use std::sync::Arc;

pub struct Constants {
    pub id_name: StringKey,
    pub node_field_name: StringKey,
    pub node_type_name: StringKey,
    pub viewer_type_name: StringKey,
    pub viewer_field_name: StringKey,
    pub query_name_arg: StringKey,
    pub refetchable_name: StringKey,
}

lazy_static! {
    pub static ref CONSTANTS: Constants = Constants {
        id_name: "id".intern(),
        node_field_name: "node".intern(),
        node_type_name: "Node".intern(),
        query_name_arg: "queryName".intern(),
        refetchable_name: "refetchable".intern(),
        viewer_type_name: "Viewer".intern(),
        viewer_field_name: "viewer".intern(),
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
