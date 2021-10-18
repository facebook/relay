/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::util::PointerAddress;
use graphql_ir::{
    Field, FragmentDefinition, OperationDefinition, Program, Selection, Transformed,
    TransformedValue, Transformer,
};
use std::{cmp::Ordering, collections::HashMap};

type Seen = HashMap<PointerAddress, Transformed<Selection>>;

/// Sorts selections in the fragments and queries (and their selections)
pub fn sort_selections(program: &Program) -> Program {
    let mut transform = SortSelectionsTransform::new(program);
    transform
        .transform_program(program)
        .replace_or_else(|| program.clone())
}

struct SortSelectionsTransform<'s> {
    seen: Seen,
    program: &'s Program,
}

impl<'s> SortSelectionsTransform<'s> {
    pub fn new(program: &'s Program) -> Self {
        Self {
            seen: Default::default(),
            program,
        }
    }
}

impl Transformer for SortSelectionsTransform<'_> {
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
        next_selections.sort_unstable_by(|a, b| self.compare_selections(a, b));
        TransformedValue::Replace(next_selections)
    }

    fn transform_fragment(
        &mut self,
        fragment: &FragmentDefinition,
    ) -> Transformed<FragmentDefinition> {
        let mut variable_definitions = fragment.variable_definitions.clone();
        let mut used_global_variables = fragment.used_global_variables.clone();
        variable_definitions.sort_unstable_by_key(|var| var.name.item);
        used_global_variables.sort_unstable_by_key(|var| var.name.item);

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

impl SortSelectionsTransform<'_> {
    fn compare_selections(&self, a: &Selection, b: &Selection) -> Ordering {
        match (a, b) {
            (Selection::ScalarField(a), Selection::ScalarField(b)) => a
                .alias_or_name(&self.program.schema)
                .cmp(&b.alias_or_name(&self.program.schema)),
            (Selection::LinkedField(a), Selection::LinkedField(b)) => a
                .alias_or_name(&self.program.schema)
                .cmp(&b.alias_or_name(&self.program.schema)),
            (Selection::FragmentSpread(a), Selection::FragmentSpread(b)) => {
                a.fragment.item.cmp(&b.fragment.item)
            }
            (Selection::InlineFragment(a), Selection::InlineFragment(b)) => {
                a.type_condition.cmp(&b.type_condition)
            }
            (Selection::Condition(a), Selection::Condition(b)) => a
                .passing_value
                .cmp(&b.passing_value)
                .then_with(|| {
                    use graphql_ir::ConditionValue::{Constant, Variable};
                    match (&a.value, &b.value) {
                        (Constant(a), Constant(b)) => a.cmp(b),
                        (Variable(a), Variable(b)) => a.name.item.cmp(&b.name.item),
                        (Constant(_), Variable(_)) => Ordering::Less,
                        (Variable(_), Constant(_)) => Ordering::Greater,
                    }
                })
                .then_with(|| {
                    let length = a.selections.len().min(b.selections.len());
                    let a_selections = &a.selections[..length];
                    let b_selections = &b.selections[..length];
                    for i in 0..length {
                        match self.compare_selections(&a_selections[i], &b_selections[i]) {
                            Ordering::Equal => {}
                            other => return other,
                        }
                    }
                    a_selections.len().cmp(&b_selections.len())
                }),
            _ => {
                let a_ordering = selection_kind_ordering(a);
                let b_ordering = selection_kind_ordering(b);
                assert!(
                    a_ordering != b_ordering,
                    "expected different ordering, got {} == {}",
                    a_ordering,
                    b_ordering
                );
                a_ordering.cmp(&b_ordering)
            }
        }
    }
}

/// Assigns an order to different variants of Selection.
fn selection_kind_ordering(selection: &Selection) -> u8 {
    match selection {
        Selection::FragmentSpread(_) => 1,
        Selection::InlineFragment(_) => 2,
        Selection::LinkedField(_) => 3,
        Selection::ScalarField(_) => 4,
        Selection::Condition(_) => 5,
    }
}
