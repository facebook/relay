/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use fnv::FnvHashMap;
use graphql_ir::{
    Condition, ConditionValue, FragmentDefinition, FragmentSpread, Program, Selection, Transformed,
    TransformedMulti, TransformedValue, Transformer,
};
use interner::StringKey;
use std::sync::Arc;

pub fn skip_unreachable_node<'a>(program: &Program<'a>) -> Program<'a> {
    let fragments = program
        .fragment_map()
        .iter()
        .map(|(k, v)| (*k, (Arc::clone(v), None)))
        .collect();

    let mut skip_unreachable_node_transform = SkipUnreachableNodeTransform::new(fragments);
    skip_unreachable_node_transform
        .transform_program(program)
        .replace_or_else(|| program.clone())
}

type VisitedFragments = FnvHashMap<
    StringKey,
    (
        Arc<FragmentDefinition>,
        Option<Transformed<FragmentDefinition>>,
    ),
>;

pub struct SkipUnreachableNodeTransform {
    visited_fragments: VisitedFragments,
}

impl Transformer for SkipUnreachableNodeTransform {
    const NAME: &'static str = "SkipUnreachableNodeTransform";
    const VISIT_ARGUMENTS: bool = true;
    const VISIT_DIRECTIVES: bool = true;

    fn transform_program<'s>(&mut self, program: &Program<'s>) -> TransformedValue<Program<'s>> {
        // Iterate over the operation ASTs. Whenever we encounter a FragmentSpread (by way of
        // fn transform_fragment_spread) look up that the associated FragmentDefinition.
        // Crawl that FragmentDefinition for other FragmentSpreads and repeat.
        // Delete that FragmentSpread if the associated FragmentDefinition was deleted.
        //
        // Throughout, when we encounter a condition node with a constant predicate, either remove
        // it or replace it with its contents.
        //
        // @include(if: false)  => remove
        // @skip(if: true)      => remove
        // @include(if: true)   => replace with contents
        // @include(if: false)  => replace with contents
        //
        // Removal of a condition or spread can result in a FragmentDefinition being deleted.

        let mut next_program = Program::new(program.schema());
        let mut has_changes = false;

        for operation in program.operations() {
            match self.transform_operation(operation) {
                Transformed::Delete => has_changes = true,
                Transformed::Keep => next_program.insert_operation(Arc::clone(operation)),
                Transformed::Replace(replacement) => {
                    has_changes = true;
                    next_program.insert_operation(Arc::new(replacement))
                }
            }
        }

        for fragment in self.visited_fragments.values() {
            match fragment {
                (_, None) | (_, Some(Transformed::Delete)) => {
                    has_changes = true;
                }
                (fragment, Some(Transformed::Keep)) => {
                    next_program.insert_fragment(Arc::clone(fragment));
                }
                (_, Some(Transformed::Replace(replacement))) => {
                    next_program.insert_fragment(Arc::new(replacement.clone()));
                    has_changes = true;
                }
            }
        }

        if has_changes {
            TransformedValue::Replace(next_program)
        } else {
            TransformedValue::Keep
        }
    }

    fn transform_selections(
        &mut self,
        selections: &[Selection],
    ) -> TransformedValue<Vec<Selection>> {
        self.transform_list_multi(selections, Self::map_selection_multi)
    }

    fn transform_fragment_spread(&mut self, spread: &FragmentSpread) -> Transformed<Selection> {
        if self.should_delete_fragment_definition(spread.fragment.item) {
            Transformed::Delete
        } else {
            Transformed::Keep
        }
    }
}

impl SkipUnreachableNodeTransform {
    pub fn new(visited_fragments: VisitedFragments) -> Self {
        Self { visited_fragments }
    }

    fn should_delete_fragment_definition(&mut self, key: StringKey) -> bool {
        let fragment = {
            let (fragment, visited_opt) = self.visited_fragments.get(&key).unwrap_or_else(|| {
                panic!(
                    "Attempted to look up FragmentDefinition {}, but it did not exist.",
                    key
                )
            });
            if let Some(visited) = visited_opt {
                return matches!(visited, Transformed::Delete);
            }
            Arc::clone(fragment)
        };

        let transformed = self.transform_fragment(&fragment);
        let should_delete = matches!(transformed, Transformed::Delete);

        // N.B. we must call self.visited_fragments.get* twice, because we cannot have
        // a reference to visited_opt and call transform_segment, which requires an
        // exclusive reference to self.
        let (_fragment, visited_opt) = self.visited_fragments.get_mut(&key).unwrap();
        *visited_opt = Some(transformed);

        should_delete
    }

    fn map_selection_multi(&mut self, selection: &Selection) -> TransformedMulti<Selection> {
        match selection {
            Selection::FragmentSpread(selection) => {
                self.transform_fragment_spread(selection).into()
            }
            Selection::InlineFragment(selection) => {
                self.transform_inline_fragment(selection).into()
            }
            Selection::LinkedField(selection) => self.transform_linked_field(selection).into(),
            Selection::ScalarField(selection) => self.transform_scalar_field(selection).into(),
            Selection::Condition(condition) => self.transform_constant_conditions(condition),
        }
    }

    fn transform_constant_conditions(
        &mut self,
        condition: &Condition,
    ) -> TransformedMulti<Selection> {
        if let ConditionValue::Constant(b) = condition.value {
            // passing_value == "what the value needs to be in order to include the contents"
            // in other words, @skip has passing_value of false
            // and @include has passing_value of true
            //
            // so, b == condition.passing_value implies that the condition is redundant,
            // and b != condition.passing_value implies that the whole node can be removed
            let keep_contents = b == condition.passing_value;
            if keep_contents {
                // @include(if: true) or @skip(if: false)
                let contents = match self.transform_selections(&condition.selections) {
                    TransformedValue::Keep => &condition.selections,
                    TransformedValue::Replace(ref t) => t,
                }
                .clone();
                TransformedMulti::ReplaceMultiple(contents)
            } else {
                // @include(if: false) or @skip(if: true)
                TransformedMulti::Delete
            }
        } else {
            self.transform_condition(condition).into()
        }
    }
}
