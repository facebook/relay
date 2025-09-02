/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::ArgumentName;
use common::Diagnostic;
use common::DiagnosticsResult;
use common::DirectiveName;
use common::NamedItem;
use common::WithLocation;
use graphql_ir::Argument;
use graphql_ir::Directive;
use graphql_ir::FragmentDefinition;
use graphql_ir::FragmentDefinitionName;
use graphql_ir::FragmentSpread;
use graphql_ir::OperationDefinitionName;
use graphql_ir::ProvidedVariableMetadata;
use graphql_ir::Selection;
use graphql_ir::Value;
use graphql_ir::Variable;
use graphql_ir::VariableDefinition;
use graphql_ir::associated_data_impl;
use intern::string_key::Intern;
use intern::string_key::StringKey;
use lazy_static::lazy_static;

use super::validation_message::ValidationMessage;
use crate::extract_connection_metadata_from_directive;
use crate::root_variables::VariableMap;

#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub struct RefetchableIdentifierInfo {
    pub identifier_field: StringKey,
    pub identifier_query_variable_name: StringKey,
}

#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub struct RefetchableMetadata {
    pub operation_name: OperationDefinitionName,
    pub path: Vec<StringKey>,
    pub identifier_info: Option<RefetchableIdentifierInfo>,
    pub is_prefetchable_pagination: bool,
}
associated_data_impl!(RefetchableMetadata);

pub struct Constants {
    pub fetchable: DirectiveName,
    pub field_name: ArgumentName,
    pub node_field_name: StringKey,
    pub node_type_name: StringKey,
    pub viewer_field_name: StringKey,
    pub viewer_type_name: StringKey,
}

lazy_static! {
    pub static ref CONSTANTS: Constants = Constants {
        fetchable: DirectiveName("fetchable".intern()),
        field_name: ArgumentName("field_name".intern()),
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
            .filter(|def| ProvidedVariableMetadata::find(&def.directives).is_none())
            .map(|var| Argument {
                name: var.name.map(|x| ArgumentName(x.0)),
                value: WithLocation::new(
                    var.name.location,
                    Value::Variable(Variable {
                        name: var.name,
                        type_: var.type_.clone(),
                    }),
                ),
            })
            .collect(),
        signature: Some(fragment.into()),
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
    result.sort_unstable_by(|l, r| l.name.item.cmp(&r.name.item));
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

pub fn uses_prefetchable_pagination_in_connection(fragment: &FragmentDefinition) -> bool {
    if let Some(metadatas) = extract_connection_metadata_from_directive(&fragment.directives)
        && metadatas.len() == 1
    {
        let metadata = &metadatas[0];
        return metadata.is_prefetchable_pagination;
    }
    false
}

/// Metadata attached to generated refetch queries storing the name of the
/// fragment the operation was derived from.
#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub struct RefetchableDerivedFromMetadata(pub FragmentDefinitionName);
associated_data_impl!(RefetchableDerivedFromMetadata);
