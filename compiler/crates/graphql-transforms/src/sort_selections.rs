/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::util::PointerAddress;
use graphql_ir::{
    FragmentDefinition, OperationDefinition, Program, Selection, Transformed, TransformedValue,
    Transformer,
};
use std::collections::HashMap;
type Seen = HashMap<PointerAddress, Transformed<Selection>>;

///
/// Sorts selections in the fragments and queries (and their selections)
///
pub fn sort_selections<'s>(program: &Program<'s>) -> Program<'s> {
    let mut transform = SortSelectionsTransform::new(program);
    transform
        .transform_program(program)
        .replace_or_else(|| program.clone())
}

struct SortSelectionsTransform<'s> {
    seen: Seen,
    program: &'s Program<'s>,
}

impl<'s> SortSelectionsTransform<'s> {
    pub fn new(program: &'s Program<'s>) -> Self {
        Self {
            seen: Default::default(),
            program,
        }
    }
}

impl<'s> Transformer for SortSelectionsTransform<'s> {
    const NAME: &'static str = "SortSelectionsTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_selections(
        &mut self,
        selections: &[Selection],
    ) -> TransformedValue<Vec<Selection>> {
        let mut next_selections = self
            .transform_list(selections, Self::transform_selection)
            .replace_or_else(|| selections.to_vec());
        next_selections.sort_unstable_by(|a, b| match (a, b) {
            (Selection::ScalarField(a), Selection::ScalarField(b)) => a
                .alias_or_name(self.program.schema())
                .cmp(&b.alias_or_name(self.program.schema()))
                .then_with(|| a.arguments.cmp(&b.arguments))
                .then_with(|| a.directives.cmp(&b.directives)),
            (Selection::LinkedField(a), Selection::LinkedField(b)) => a
                .alias_or_name(self.program.schema())
                .cmp(&b.alias_or_name(self.program.schema()))
                .then_with(|| a.arguments.cmp(&b.arguments))
                .then_with(|| a.directives.cmp(&b.directives)),
            _ => a.cmp(b),
        });
        TransformedValue::Replace(next_selections)
    }

    fn transform_fragment(
        &mut self,
        fragment: &FragmentDefinition,
    ) -> Transformed<FragmentDefinition> {
        let mut variable_definitions = fragment.variable_definitions.clone();
        let mut used_global_variables = fragment.used_global_variables.clone();
        variable_definitions.sort_unstable();
        used_global_variables.sort_unstable();

        let selections = self.transform_selections(&fragment.selections);
        Transformed::Replace(FragmentDefinition {
            selections: selections.replace_or_else(|| fragment.selections.clone()),
            variable_definitions,
            used_global_variables,
            ..fragment.clone()
        })
    }

    fn default_transform_operation(
        &mut self,
        operation: &OperationDefinition,
    ) -> Transformed<OperationDefinition> {
        self.transform_selections(&operation.selections)
            .map(|selections| OperationDefinition {
                selections,
                ..operation.clone()
            })
            .into()
    }

    fn transform_selection(&mut self, selection: &Selection) -> Transformed<Selection> {
        match selection {
            Selection::InlineFragment(selection) => {
                let key = PointerAddress::new(selection);
                if let Some(prev) = self.seen.get(&key) {
                    return prev.clone();
                }
                let transformed = self.transform_inline_fragment(selection);
                self.seen.insert(key, transformed.clone());
                transformed
            }
            Selection::LinkedField(selection) => {
                let key = PointerAddress::new(selection);
                if let Some(prev) = self.seen.get(&key) {
                    return prev.clone();
                }
                let transformed = self.transform_linked_field(selection);
                self.seen.insert(key, transformed.clone());
                transformed
            }
            Selection::Condition(selection) => {
                let key = PointerAddress::new(selection);
                if let Some(prev) = self.seen.get(&key) {
                    return prev.clone();
                }
                let transformed = self.transform_condition(selection);
                self.seen.insert(key, transformed.clone());
                transformed
            }
            Selection::ScalarField(_) => Transformed::Keep,
            Selection::FragmentSpread(_) => Transformed::Keep,
        }
    }
}
