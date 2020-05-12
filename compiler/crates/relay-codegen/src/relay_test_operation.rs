/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::NamedItem;
use graphql_ir::{OperationDefinition, Selection};
use indexmap::IndexMap;
use interner::{Intern, StringKey};
use lazy_static::lazy_static;
use schema::{Field, Schema, Type};

pub struct Constants {
    pub relay_test_operation_directive_name: StringKey,
}

lazy_static! {
    pub static ref CONSTANTS: Constants = Constants {
        relay_test_operation_directive_name: "relay_test_operation".intern(),
    };
}

#[derive(Debug, Clone)]
pub struct RelayTestOperationSelectionTypeInfo {
    pub type_: StringKey,
    pub enum_values: Option<Vec<StringKey>>,
    pub plural: bool,
    pub nullable: bool,
}

impl RelayTestOperationSelectionTypeInfo {
    fn new(schema: &Schema, field: &Field) -> Self {
        let type_ = field.type_.inner();
        RelayTestOperationSelectionTypeInfo {
            type_: schema.get_type_name(type_),
            enum_values: match type_ {
                Type::Enum(enum_id) => Some(schema.enum_(enum_id).values.clone()),
                _ => None,
            },
            plural: field.type_.is_list(),
            nullable: !field.type_.is_non_null(),
        }
    }
}
pub struct RelayTestOperationMetadata {
    pub selection_type_info: IndexMap<StringKey, RelayTestOperationSelectionTypeInfo>,
}

impl RelayTestOperationMetadata {
    pub fn new(schema: &Schema, selections: &[Selection]) -> Self {
        let mut selection_type_info: IndexMap<StringKey, RelayTestOperationSelectionTypeInfo> =
            Default::default();

        let mut processing_queue: Vec<(Option<StringKey>, &[Selection])> = vec![(None, selections)];
        while !processing_queue.is_empty() {
            if let Some(current_item) = processing_queue.pop() {
                let (path, selections) = current_item;
                for selection in selections {
                    match selection {
                        Selection::ScalarField(scalar_field) => {
                            let field = schema.field(scalar_field.definition.item);
                            if !field.is_extension {
                                let alias_or_name = scalar_field.alias_or_name(schema);
                                let next_path = next_path(path, alias_or_name);
                                selection_type_info.insert(
                                    next_path,
                                    RelayTestOperationSelectionTypeInfo::new(schema, field),
                                );
                            }
                        }
                        Selection::LinkedField(linked_field) => {
                            let field = schema.field(linked_field.definition.item);
                            if !field.is_extension {
                                let alias_or_name = linked_field.alias_or_name(schema);
                                let next_path = next_path(path, alias_or_name);
                                selection_type_info.insert(
                                    next_path,
                                    RelayTestOperationSelectionTypeInfo::new(schema, field),
                                );
                                processing_queue.push((Some(next_path), &linked_field.selections));
                            }
                        }
                        Selection::Condition(condition) => {
                            processing_queue.push((path, &condition.selections));
                        }
                        Selection::InlineFragment(inline_fragment) => {
                            processing_queue.push((path, &inline_fragment.selections));
                        }
                        Selection::FragmentSpread(_fragment_spread) => {
                            panic!(
                                "We do not expect to visit fragment spreads in the test operation"
                            );
                        }
                    }
                }
            }
        }

        RelayTestOperationMetadata {
            selection_type_info,
        }
    }
}

fn next_path(current_path: Option<StringKey>, field_alias_or_name: StringKey) -> StringKey {
    match current_path {
        None => field_alias_or_name,
        Some(path) => format!("{}.{}", path, field_alias_or_name).intern(),
    }
}

pub fn build_test_operation_metadata(
    schema: &Schema,
    operation: &OperationDefinition,
) -> Option<RelayTestOperationMetadata> {
    let directive = operation
        .directives
        .named(CONSTANTS.relay_test_operation_directive_name);
    if directive.is_none() {
        None
    } else {
        Some(RelayTestOperationMetadata::new(
            schema,
            &operation.selections,
        ))
    }
}
