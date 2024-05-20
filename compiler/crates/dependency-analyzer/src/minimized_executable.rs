/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::Location;
use graphql_ir::*;
use relay_transforms::Programs;
use schema::SDLSchema;
use schema::Schema;
use serde::Serialize;

#[derive(Serialize)]
pub struct MinProgram {
    pub definitions: Vec<MinExecutableDefinition>,
}

impl MinProgram {
    pub fn from_programs(programs: &Programs) -> Self {
        MinProgram {
            definitions: programs
                .source
                .operations
                .iter()
                .map(|o| {
                    MinExecutableDefinition::Operation(
                        MinOperationDefinition::from_operation_definition(
                            o,
                            &programs.source.schema,
                        ),
                    )
                })
                .chain(programs.source.fragments.values().map(|f| {
                    MinExecutableDefinition::Fragment(
                        MinFragmentDefinition::from_fragment_definition(f, &programs.source.schema),
                    )
                }))
                .collect(),
        }
    }
}
#[derive(Serialize)]
pub enum MinExecutableDefinition {
    Operation(MinOperationDefinition),
    Fragment(MinFragmentDefinition),
}

#[derive(Serialize)]
pub struct MinOperationDefinition {
    pub operation: String,
    pub name: String,
    pub location: Location,
    pub type_: String,
    pub selections: Vec<MinSelection>,
}

impl MinOperationDefinition {
    fn from_operation_definition(op: &Arc<OperationDefinition>, schema: &Arc<SDLSchema>) -> Self {
        MinOperationDefinition {
            operation: op.kind.to_string(),
            name: op.name.item.to_string(),
            location: op.name.location,
            type_: schema.get_type_name(op.type_).to_string(),
            selections: op
                .selections
                .iter()
                .map(|s| MinSelection::from_selection(s, schema))
                .collect::<Vec<_>>(),
        }
    }
}

#[derive(Serialize)]
pub struct MinFragmentDefinition {
    pub name: String,
    pub location: Location,
    pub type_: String,
    pub selections: Vec<MinSelection>,
}

impl MinFragmentDefinition {
    fn from_fragment_definition(
        fragment: &Arc<FragmentDefinition>,
        schema: &Arc<SDLSchema>,
    ) -> Self {
        MinFragmentDefinition {
            name: fragment.name.item.0.to_string(),
            location: fragment.name.location,
            type_: schema.get_type_name(fragment.type_condition).to_string(),
            selections: fragment
                .selections
                .iter()
                .map(|s| MinSelection::from_selection(s, schema))
                .collect::<Vec<_>>(),
        }
    }
}

#[derive(Serialize)]
pub struct MinInlineFragment {
    pub type_: Option<String>,
    pub selections: Vec<MinSelection>,
}

impl MinInlineFragment {
    fn from_inline_fragment(fragment: &InlineFragment, schema: &Arc<SDLSchema>) -> Self {
        MinInlineFragment {
            type_: fragment
                .type_condition
                .map(|t| schema.get_type_name(t).to_string()),
            selections: fragment
                .selections
                .iter()
                .map(|s| MinSelection::from_selection(s, schema))
                .collect::<Vec<_>>(),
        }
    }
}

#[derive(Serialize)]
pub struct MinLinkedField {
    pub name: String,
    pub type_: String,
    pub selections: Vec<MinSelection>,
}

impl MinLinkedField {
    fn from_linked_field(field: &LinkedField, schema: &Arc<SDLSchema>) -> Self {
        MinLinkedField {
            name: schema.field(field.definition.item).name.item.to_string(),
            type_: schema
                .get_type_name(schema.field(field.definition.item).type_.inner())
                .to_string(),
            selections: field
                .selections
                .iter()
                .map(|s| MinSelection::from_selection(s, schema))
                .collect::<Vec<_>>(),
        }
    }
}

#[derive(Serialize)]
pub enum MinSelection {
    FragmentSpread(MinFragmentSpread),
    InlineFragment(MinInlineFragment),
    LinkedField(MinLinkedField),
    ScalarField(MinScalarField),
    Condition(MinCondition),
}

impl MinSelection {
    fn from_selection(selection: &Selection, schema: &Arc<SDLSchema>) -> Self {
        match selection {
            Selection::FragmentSpread(fragment_spread) => MinSelection::FragmentSpread(
                MinFragmentSpread::from_fragment_spread(fragment_spread),
            ),
            Selection::InlineFragment(inline_fragment) => MinSelection::InlineFragment(
                MinInlineFragment::from_inline_fragment(inline_fragment, schema),
            ),
            Selection::LinkedField(linked_field) => {
                MinSelection::LinkedField(MinLinkedField::from_linked_field(linked_field, schema))
            }
            Selection::ScalarField(scalar_field) => {
                MinSelection::ScalarField(MinScalarField::from_scalar_field(scalar_field, schema))
            }
            Selection::Condition(condition) => {
                MinSelection::Condition(MinCondition::from_condition(condition, schema))
            }
        }
    }
}

#[derive(Serialize)]
pub struct MinScalarField {
    pub name: String,
}

impl MinScalarField {
    fn from_scalar_field(field: &ScalarField, schema: &SDLSchema) -> Self {
        MinScalarField {
            name: schema.field(field.definition.item).name.item.to_string(),
        }
    }
}

#[derive(Serialize)]
pub struct MinFragmentSpread {
    pub name: String,
}

impl MinFragmentSpread {
    fn from_fragment_spread(fragment_spread: &FragmentSpread) -> Self {
        MinFragmentSpread {
            name: fragment_spread.fragment.item.0.to_string(),
        }
    }
}

#[derive(Serialize)]
pub struct MinCondition {
    pub name: Option<String>,
    pub type_: Option<String>,
    pub selections: Vec<MinSelection>,
}

impl MinCondition {
    fn from_condition(condition: &Condition, schema: &Arc<SDLSchema>) -> Self {
        MinCondition {
            name: match &condition.value {
                ConditionValue::Constant(_) => None,
                ConditionValue::Variable(v) => Some(v.name.item.0.to_string()),
            },
            type_: match &condition.value {
                ConditionValue::Constant(_) => None,
                ConditionValue::Variable(v) => {
                    Some(schema.get_type_name(v.type_.inner()).to_string())
                }
            },
            selections: condition
                .selections
                .iter()
                .map(|s| MinSelection::from_selection(s, schema))
                .collect::<Vec<_>>(),
        }
    }
}
