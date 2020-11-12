/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::root_variables::VariableMap;
use common::{Diagnostic, DiagnosticsResult, NamedItem, WithLocation};
use graphql_ir::{
    Argument, ConstantValue, Directive, FragmentDefinition, FragmentSpread, Selection,
    ValidationMessage, Value, Variable, VariableDefinition,
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
    pub fetchable: StringKey,
    pub field_name: StringKey,
    pub id_name: StringKey,
    pub identifier_field_arg: StringKey,
    pub node_field_name: StringKey,
    pub node_type_name: StringKey,
    pub query_name_arg: StringKey,
    pub refetchable_metadata_name: StringKey,
    pub refetchable_name: StringKey,
    pub refetchable_operation_metadata_name: StringKey,
    pub viewer_field_name: StringKey,
    pub viewer_type_name: StringKey,
}

lazy_static! {
    pub static ref CONSTANTS: Constants = Constants {
        fetchable: "fetchable".intern(),
        field_name: "field_name".intern(),
        id_name: "id".intern(),
        identifier_field_arg: "fragmentPathInResult".intern(),
        node_field_name: "node".intern(),
        node_type_name: "Node".intern(),
        query_name_arg: "queryName".intern(),
        refetchable_metadata_name: "__refetchableMetadata".intern(),
        refetchable_name: "refetchable".intern(),
        refetchable_operation_metadata_name: "__refetchableQueryMetadata".intern(),
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
    result.sort_unstable_by(|l, r| l.name.item.lookup().cmp(&r.name.item.lookup()));
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

/// Metadata attached to generated refetch queries storing the name of the
/// fragment the operation was derived from.
pub struct RefetchableDerivedFromMetadata;
impl RefetchableDerivedFromMetadata {
    pub fn create_directive(fragment_name: WithLocation<StringKey>) -> Directive {
        Directive {
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
        }
    }

    pub fn from_directives(directives: &[Directive]) -> Option<StringKey> {
        directives
            .named(CONSTANTS.refetchable_operation_metadata_name)
            .map(|directive| {
                directive
                    .arguments
                    .named(CONSTANTS.refetchable_operation_metadata_name)
                    .unwrap()
                    .value
                    .item
                    .expect_string_literal()
            })
    }
}

pub fn extract_refetch_metadata_from_directive(
    directives: &[Directive],
) -> Option<RefetchableMetadata> {
    let refetchable_metadata_directive = directives.named(CONSTANTS.refetchable_metadata_name);
    if let Some(refetchable_metadata_directive) = refetchable_metadata_directive {
        let metadata_arg = refetchable_metadata_directive
            .arguments
            .named(CONSTANTS.refetchable_metadata_name)
            .expect("Expected an argument in the refetchable metadata directive.");
        let metadata_values = if let Value::Constant(ConstantValue::List(metadata_values)) =
            &metadata_arg.value.item
        {
            metadata_values
        } else {
            unreachable!("Expected refetchable metadata to be a list of metadata values.")
        };
        debug_assert!(
            metadata_values.len() == 3,
            "Expected metadata value to be a list with 3 elements"
        );
        let operation_name = match metadata_values[0] {
            ConstantValue::String(string_val) => string_val,
            _ => unreachable!("Expected refetchable metadata operation_name to be a string."),
        };
        let path = match &metadata_values[1] {
            ConstantValue::List(list) => list
                .iter()
                .map(|item| match item {
                    ConstantValue::String(string_val) => *string_val,
                    _ => {
                        unreachable!("Expected refetchable metadata path to be a list of strings.")
                    }
                })
                .collect::<Vec<StringKey>>(),
            _ => unreachable!("Expected refetchable metadata path to be a list of strings."),
        };
        let identifier_field = match metadata_values[2] {
            ConstantValue::String(string_val) => Some(string_val),
            ConstantValue::Null() => None,
            _ => unreachable!(
                "Expected reftchable metadata identifier_field to be a nullable string."
            ),
        };
        Some(RefetchableMetadata {
            operation_name,
            path,
            identifier_field,
        })
    } else {
        None
    }
}
