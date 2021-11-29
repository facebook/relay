/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::root_variables::VariableMap;
use common::{Diagnostic, DiagnosticsResult, NamedItem, WithLocation};
use graphql_ir::{
    associated_data_impl, Argument, Directive, FragmentDefinition, FragmentSpread, Selection,
    ValidationMessage, Value, Variable, VariableDefinition,
};
use intern::string_key::{Intern, StringKey};
use lazy_static::lazy_static;
use std::sync::Arc;

#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub struct RefetchableMetadata {
    pub operation_name: StringKey,
    pub path: Vec<StringKey>,
    pub identifier_field: Option<StringKey>,
}
associated_data_impl!(RefetchableMetadata);

pub struct Constants {
    pub fetchable: StringKey,
    pub field_name: StringKey,
    pub id_name: StringKey,
    pub node_field_name: StringKey,
    pub node_type_name: StringKey,
    pub viewer_field_name: StringKey,
    pub viewer_type_name: StringKey,
}

lazy_static! {
    pub static ref CONSTANTS: Constants = Constants {
        fetchable: "fetchable".intern(),
        field_name: "field_name".intern(),
        id_name: "id".intern(),
        node_field_name: "node".intern(),
        node_type_name: "Node".intern(),
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
    fragment: &FragmentDefinition,
) -> Vec<VariableDefinition> {
    let mut result: Vec<_> = fragment
        .used_global_variables
        .iter()
        .chain(fragment.variable_definitions.iter())
        .cloned()
        .collect();
    result.sort_unstable_by(|l, r| l.name.item.lookup().cmp(r.name.item.lookup()));
    result
}

pub fn build_used_global_variables(
    variable_map: &VariableMap,
    local_variable_definitions: &[VariableDefinition],
) -> DiagnosticsResult<Vec<VariableDefinition>> {
    let mut errors = Vec::new();

    let global_variables = variable_map
        .values()
        .map(|var| {
            if let Some(local_conflicting_var) = local_variable_definitions.named(var.name.item) {
                errors.push(Diagnostic::error(
                    ValidationMessage::LocalGlobalVariableConflict {
                        name: local_conflicting_var.name.item,
                    },
                    local_conflicting_var.name.location,
                ));
            };
            VariableDefinition {
                name: var.name,
                type_: var.type_.clone(),
                default_value: None,
                directives: vec![],
            }
        })
        .collect();

    if errors.is_empty() {
        Ok(global_variables)
    } else {
        Err(errors)
    }
}

/// Attach metadata to the operation and fragment.
pub fn build_fragment_metadata_as_directive(
    fragment: &FragmentDefinition,
    metadata: RefetchableMetadata,
) -> Vec<Directive> {
    let mut next_directives = fragment.directives.clone();
    next_directives.push(metadata.into());
    next_directives
}

/// Metadata attached to generated refetch queries storing the name of the
/// fragment the operation was derived from.
#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub struct RefetchableDerivedFromMetadata(pub StringKey);
associated_data_impl!(RefetchableDerivedFromMetadata);
