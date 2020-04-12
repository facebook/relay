/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::node_identifier::NodeIdentifier;
use crate::util::PointerAddress;
use fnv::{FnvBuildHasher, FnvHashMap};
use graphql_ir::{
    Condition, FragmentDefinition, InlineFragment, LinkedField, OperationDefinition, Program,
    Selection, Transformed, TransformedValue, Transformer,
};
use im::hashmap::HashMap;
use std::iter::Iterator;
use std::sync::Arc;

/**
 * A transform that removes redundant fields and fragment spreads. Redundancy is
 * defined in this context as any selection that is guaranteed to already be
 * fetched by an ancestor selection. This can occur in two cases:
 *
 * 1. Simple duplicates at the same level of the document can always be skipped:
 *
 *
 * fragment Foo on FooType {
 *   id
 *   id
 *   ...Bar
 *   ...Bar
 * }
 *
 *
 * Becomes
 *
 *
 * fragment Foo on FooType {
 *   id
 *   ...Bar
 * }
 *
 *
 * 2. Inline fragments and conditions introduce the possibility for duplication
 * at different levels of the tree. Whenever a selection is fetched in a parent,
 * it is redundant to also fetch it in a child:
 *
 *
 * fragment Foo on FooType {
 *   id
 *   ... on OtherType {
 *     id # 1
 *   }
 *   ... on FooType @include(if: $cond) {
 *     id # 2
 *   }
 * }
 *
 *
 * Becomes:
 *
 *
 * fragment Foo on FooType {
 *   id
 * }
 *
 *
 * In this example:
 * - 1 can be skipped because `id` is already fetched by the parent. Even
 *   though the type is different (FooType/OtherType), the inline fragment
 *   cannot match without the outer fragment matching so the outer `id` is
 *   guaranteed to already be fetched.
 * - 2 can be skipped for similar reasons: it doesn't matter if the condition
 *   holds, `id` is already fetched by the parent regardless.
 *
 * This transform also handles more complicated cases in which selections are
 * nested:
 *
 *
 * fragment Foo on FooType {
 *   a {
 *     bb
 *   }
 *   ... on OtherType {
 *     a {
 *       bb # 1
 *       cc
 *     }
 *   }
 *  }
 *
 *
 * Becomes
 *
 *
 * fragment Foo on FooType {
 *   a {
 *     bb
 *   }
 *   ... on OtherType {
 *     a {
 *       cc
 *     }
 *   }
 *  }
 *
 *
 * 1 can be skipped because it is already fetched at the outer level.
 */
pub fn skip_redundant_nodes<'s>(program: &Program<'s>) -> Program<'s> {
    let mut transform = SkipRedundantNodesTransform::new(program);
    transform
        .transform_program(program)
        .replace_or_else(|| program.clone())
}

#[derive(Default, Clone)]
struct SelectionMap(HashMap<NodeIdentifier, Option<SelectionMap>, FnvBuildHasher>);

type Cache = FnvHashMap<PointerAddress, Transformed<Selection>>;

struct SkipRedundantNodesTransform<'s> {
    program: &'s Program<'s>,
    cache: Cache,
}

impl<'s> SkipRedundantNodesTransform<'s> {
    fn new(program: &'s Program<'s>) -> Self {
        Self {
            program,
            cache: Default::default(),
        }
    }

    fn transform_selection(
        &mut self,
        selection: &Selection,
        selection_map: &mut SelectionMap,
    ) -> Transformed<Selection> {
        // This will optimize a traversal of the same subselections.
        // If it's the same node, and selection_map is empty
        // result of transform_selection has to be the same.
        let is_empty = selection_map.0.is_empty();
        if is_empty {
            let key = PointerAddress::new(selection);
            if let Some(result) = self.cache.get(&key) {
                return result.clone();
            }
        }
        let identifier = NodeIdentifier::from_selection(self.program.schema(), selection);
        let result = match selection {
            Selection::ScalarField(_) => {
                if selection_map.0.contains_key(&identifier) {
                    Transformed::Delete
                } else {
                    selection_map.0.insert(identifier, None);
                    Transformed::Keep
                }
            }
            Selection::FragmentSpread(_) => {
                if selection_map.0.contains_key(&identifier) {
                    Transformed::Delete
                } else {
                    selection_map.0.insert(identifier, None);
                    Transformed::Keep
                }
            }
            Selection::LinkedField(selection) => {
                if let Some(Some(linked_selection_map)) = selection_map.0.get_mut(&identifier) {
                    self.transform_linked_field(selection, linked_selection_map)
                        .map(Selection::LinkedField)
                } else {
                    let mut linked_selection_map = Default::default();
                    let result = self
                        .transform_linked_field(selection, &mut linked_selection_map)
                        .map(Selection::LinkedField);
                    if !linked_selection_map.0.is_empty() {
                        selection_map
                            .0
                            .insert(identifier, Some(linked_selection_map));
                    }
                    result
                }
            }
            Selection::Condition(selection) => {
                if let Some(Some(existing_selection_map)) = selection_map.0.get_mut(&identifier) {
                    self.transform_condition(selection, existing_selection_map)
                        .map(Selection::Condition)
                } else {
                    // Fork the selection map to prevent conditional selections from
                    // affecting the outer "guaranteed" selections.
                    let mut next_selection_map = selection_map.clone();
                    let result = self
                        .transform_condition(selection, &mut next_selection_map)
                        .map(Selection::Condition);
                    selection_map.0.insert(identifier, Some(next_selection_map));
                    result
                }
            }
            Selection::InlineFragment(selection) => {
                if let Some(Some(existing_selection_map)) = selection_map.0.get_mut(&identifier) {
                    self.transform_inline_fragment(selection, existing_selection_map)
                        .map(Selection::InlineFragment)
                } else {
                    // Fork for inline fragments for the same reason
                    let mut next_selection_map = selection_map.clone();
                    let result = self
                        .transform_inline_fragment(selection, &mut next_selection_map)
                        .map(Selection::InlineFragment);
                    selection_map.0.insert(identifier, Some(next_selection_map));
                    result
                }
            }
        };
        if is_empty {
            let key = PointerAddress::new(selection);
            self.cache.insert(key, result.clone());
        }
        result
    }

    fn transform_linked_field(
        &mut self,
        field: &LinkedField,
        selection_map: &mut SelectionMap,
    ) -> Transformed<Arc<LinkedField>> {
        let selections = self.transform_selections(&field.selections, selection_map);
        match selections {
            TransformedValue::Keep => Transformed::Keep,
            TransformedValue::Replace(selections) => {
                if selections.is_empty() {
                    Transformed::Delete
                } else {
                    Transformed::Replace(Arc::new(LinkedField {
                        selections,
                        ..field.clone()
                    }))
                }
            }
        }
    }

    fn transform_condition(
        &mut self,
        condition: &Condition,
        selection_map: &mut SelectionMap,
    ) -> Transformed<Arc<Condition>> {
        let selections = self.transform_selections(&condition.selections, selection_map);
        match selections {
            TransformedValue::Keep => Transformed::Keep,
            TransformedValue::Replace(selections) => {
                if selections.is_empty() {
                    Transformed::Delete
                } else {
                    Transformed::Replace(Arc::new(Condition {
                        selections,
                        ..condition.clone()
                    }))
                }
            }
        }
    }

    fn transform_inline_fragment(
        &mut self,
        fragment: &InlineFragment,
        selection_map: &mut SelectionMap,
    ) -> Transformed<Arc<InlineFragment>> {
        let selections = self.transform_selections(&fragment.selections, selection_map);
        match selections {
            TransformedValue::Keep => Transformed::Keep,
            TransformedValue::Replace(selections) => {
                if selections.is_empty() {
                    Transformed::Delete
                } else {
                    Transformed::Replace(Arc::new(InlineFragment {
                        selections,
                        ..fragment.clone()
                    }))
                }
            }
        }
    }

    // Mostly a copy from Transformer::transform_list, but does partition and pass down `selection_map`.
    fn transform_selections(
        &mut self,
        selections: &[Selection],
        selection_map: &mut SelectionMap,
    ) -> TransformedValue<Vec<Selection>> {
        if selections.is_empty() {
            return TransformedValue::Keep;
        }
        let mut result: Vec<Selection> = Vec::new();
        let mut has_changes = false;
        let selections = get_partitioned_selections(selections);

        for (index, prev_item) in selections.iter().enumerate() {
            let next_item = self.transform_selection(prev_item, selection_map);
            match next_item {
                Transformed::Keep => {
                    if has_changes {
                        result.push((*prev_item).clone());
                    }
                }
                Transformed::Delete => {
                    if !has_changes {
                        debug_assert!(result.capacity() == 0);
                        // assume most items won't be skipped and allocate space for all items
                        result.reserve(selections.len());
                        result.extend(selections.iter().take(index).map(|&x| x.clone()));
                        has_changes = true;
                    }
                }
                Transformed::Replace(next_item) => {
                    if !has_changes {
                        debug_assert!(result.capacity() == 0);
                        // assume most items won't be skipped and allocate space for all items
                        result.reserve(selections.len());
                        result.extend(selections.iter().take(index).map(|&x| x.clone()));
                        has_changes = true;
                    }
                    result.push(next_item);
                }
            }
        }
        if has_changes {
            TransformedValue::Replace(result)
        } else {
            TransformedValue::Keep
        }
    }
}

impl<'s> Transformer for SkipRedundantNodesTransform<'s> {
    const NAME: &'static str = "SkipRedundantNodesTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_operation(
        &mut self,
        operation: &OperationDefinition,
    ) -> Transformed<OperationDefinition> {
        let mut selection_map = Default::default();
        let selections = self.transform_selections(&operation.selections, &mut selection_map);
        match selections {
            TransformedValue::Keep => Transformed::Keep,
            TransformedValue::Replace(selections) => Transformed::Replace(OperationDefinition {
                selections,
                ..operation.clone()
            }),
        }
    }

    fn transform_fragment(
        &mut self,
        fragment: &FragmentDefinition,
    ) -> Transformed<FragmentDefinition> {
        let mut selection_map = Default::default();
        let selections = self.transform_selections(&fragment.selections, &mut selection_map);
        match selections {
            TransformedValue::Keep => Transformed::Keep,
            TransformedValue::Replace(selections) => Transformed::Replace(FragmentDefinition {
                selections,
                ..fragment.clone()
            }),
        }
    }
}

/* Selections are sorted with fields first, "conditionals"
 * (inline fragments & conditions) last. This means that all fields that are
 * guaranteed to be fetched are encountered prior to any duplicates that may be
 * fetched within a conditional.
 */
fn get_partitioned_selections(selections: &[Selection]) -> Vec<&Selection> {
    let mut result: Vec<&Selection> = selections.iter().collect();
    let mut left = 0;
    let mut right = selections.len() - 1;
    while left < right {
        match result[left] {
            Selection::LinkedField(_) | Selection::ScalarField(_) => {
                left += 1;
            }
            _ => {
                result.swap(left, right);
                right -= 1;
            }
        }
    }
    result
}
