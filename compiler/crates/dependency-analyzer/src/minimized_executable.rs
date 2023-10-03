/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use graphql_syntax::*;
use serde::Serialize;

#[derive(Serialize)]
pub enum MinExecutableDefinition {
    Operation(MinOperationDefinition),
    Fragment(MinFragmentDefinition),
}

impl MinExecutableDefinition {
    pub fn from_executable_definition(def: ExecutableDefinition) -> Self {
        match def {
            ExecutableDefinition::Operation(operation) => MinExecutableDefinition::Operation(
                MinOperationDefinition::from_operation_definition(operation),
            ),
            ExecutableDefinition::Fragment(fragment) => MinExecutableDefinition::Fragment(
                MinFragmentDefinition::from_fragment_definition(fragment),
            ),
        }
    }
}

#[derive(Serialize)]
pub struct MinOperationDefinition {
    pub operation: String,
    pub name: Option<String>,
    pub selections: Vec<MinSelection>,
}

impl MinOperationDefinition {
    fn from_operation_definition(op: OperationDefinition) -> Self {
        MinOperationDefinition {
            operation: op.operation_kind().to_string(),
            name: op.name.as_ref().map(|n| n.value.to_string()),
            selections: op
                .selections
                .items
                .iter()
                .map(MinSelection::from_selection)
                .collect::<Vec<_>>(),
        }
    }
}

#[derive(Serialize)]
pub struct MinFragmentDefinition {
    pub name: String,
    pub type_: String,
    pub selections: Vec<MinSelection>,
}

impl MinFragmentDefinition {
    fn from_fragment_definition(fragment: FragmentDefinition) -> Self {
        MinFragmentDefinition {
            name: fragment.name.value.to_string(),
            type_: fragment.type_condition.type_.value.to_string(),
            selections: fragment
                .selections
                .items
                .iter()
                .map(MinSelection::from_selection)
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
    fn from_inline_fragment(fragment: &InlineFragment) -> Self {
        MinInlineFragment {
            type_: fragment
                .clone()
                .type_condition
                .map(|t| t.type_.value.to_string()),
            selections: fragment
                .selections
                .items
                .iter()
                .map(MinSelection::from_selection)
                .collect::<Vec<_>>(),
        }
    }
}

#[derive(Serialize)]
pub struct MinLinkedField {
    pub name: String,
    pub selections: Vec<MinSelection>,
}

impl MinLinkedField {
    fn from_linked_field(field: &LinkedField) -> Self {
        MinLinkedField {
            name: field.name.value.to_string(),
            selections: field
                .selections
                .items
                .iter()
                .map(MinSelection::from_selection)
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
}

impl MinSelection {
    fn from_selection(selection: &Selection) -> Self {
        match selection {
            Selection::FragmentSpread(fragment_spread) => MinSelection::FragmentSpread(
                MinFragmentSpread::from_fragment_spread(fragment_spread),
            ),
            Selection::InlineFragment(inline_fragment) => MinSelection::InlineFragment(
                MinInlineFragment::from_inline_fragment(inline_fragment),
            ),
            Selection::LinkedField(linked_field) => {
                MinSelection::LinkedField(MinLinkedField::from_linked_field(linked_field))
            }
            Selection::ScalarField(scalar_field) => {
                MinSelection::ScalarField(MinScalarField::from_scalar_field(scalar_field))
            }
        }
    }
}

#[derive(Serialize)]
pub struct MinScalarField {
    pub name: String,
}

impl MinScalarField {
    fn from_scalar_field(field: &ScalarField) -> Self {
        MinScalarField {
            name: field.name.value.to_string(),
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
            name: fragment_spread.name.value.to_string(),
        }
    }
}
