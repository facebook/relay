/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::no_inline::NO_INLINE_DIRECTIVE_NAME;
use common::{Diagnostic, DiagnosticsResult, NamedItem};
use fnv::FnvHashMap;
use graphql_ir::{
    Condition, ConditionValue, FragmentDefinition, FragmentSpread, Program, Selection, Transformed,
    TransformedMulti, TransformedValue, Transformer,
};
use interner::StringKey;
use std::sync::Arc;
use thiserror::Error;

pub fn skip_unreachable_node(program: &Program) -> DiagnosticsResult<Program> {
    let fragments = program
        .fragments()
        .filter_map(|fragment| {
            if fragment.selections.is_empty() {
                None
            } else {
                Some((fragment.name.item, (Arc::clone(fragment), None)))
            }
        })
        .collect();

    let mut skip_unreachable_node_transform = SkipUnreachableNodeTransform::new(fragments);
    let transformed = skip_unreachable_node_transform.transform_program(program);
    if skip_unreachable_node_transform.errors.is_empty() {
        Ok(transformed.replace_or_else(|| program.clone()))
    } else {
        Err(skip_unreachable_node_transform.errors)
    }
}

type VisitedFragments = FnvHashMap<
    StringKey,
    (
        Arc<FragmentDefinition>,
        Option<Transformed<FragmentDefinition>>,
    ),
>;

pub struct SkipUnreachableNodeTransform {
    errors: Vec<Diagnostic>,
    visited_fragments: VisitedFragments,
}

impl Transformer for SkipUnreachableNodeTransform {
    const NAME: &'static str = "SkipUnreachableNodeTransform";
    const VISIT_ARGUMENTS: bool = true;
    const VISIT_DIRECTIVES: bool = true;

    fn transform_program(&mut self, program: &Program) -> TransformedValue<Program> {
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

        let mut next_program = Program::new(Arc::clone(&program.schema));
        let mut has_changes = false;

        for operation in program.operations() {
            match self.transform_operation(operation) {
                Transformed::Delete => {
                    self.errors.push(Diagnostic::error(
                        ValidationMessage::EmptyOperationResult {
                            name: operation.name.item,
                        },
                        operation.name.location,
                    ));
                    has_changes = true;
                }
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

    fn transform_fragment(
        &mut self,
        fragment: &FragmentDefinition,
    ) -> Transformed<FragmentDefinition> {
        // Remove the fragment with empty selections
        let selections = self.transform_selections(&fragment.selections);
        if let TransformedValue::Replace(selections) = &selections {
            if selections.is_empty() {
                return Transformed::Delete;
            }
        }
        let directives = self.transform_directives(&fragment.directives);
        if selections.should_keep() && directives.should_keep() {
            return Transformed::Keep;
        }
        Transformed::Replace(FragmentDefinition {
            directives: directives.replace_or_else(|| fragment.directives.clone()),
            selections: selections.replace_or_else(|| fragment.selections.clone()),
            ..fragment.clone()
        })
    }

    fn transform_selections(
        &mut self,
        selections: &[Selection],
    ) -> TransformedValue<Vec<Selection>> {
        self.transform_list_multi(selections, Self::map_selection_multi)
    }

    fn transform_fragment_spread(&mut self, spread: &FragmentSpread) -> Transformed<Selection> {
        if spread.directives.named(*NO_INLINE_DIRECTIVE_NAME).is_some() {
            return Transformed::Keep;
        }
        if self.should_delete_fragment_definition(spread.fragment.item) {
            Transformed::Delete
        } else {
            Transformed::Keep
        }
    }
}

impl SkipUnreachableNodeTransform {
    pub fn new(visited_fragments: VisitedFragments) -> Self {
        Self {
            errors: Vec::new(),
            visited_fragments,
        }
    }

    fn should_delete_fragment_definition(&mut self, key: StringKey) -> bool {
        let fragment = {
            let (fragment, visited_opt) = if let Some(entry) = self.visited_fragments.get(&key) {
                entry
            } else {
                return true;
            };

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

#[derive(Clone, Debug, Error, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub enum ValidationMessage {
    #[error(
        "After transforms, the operation `{name}` that would be sent to the server is empty. \
        Relay is not setup to handle such queries. This is likely due to only querying for \
        client extension fields or `@skip`/`@include` directives with constant values that \
        remove all selections."
    )]
    EmptyOperationResult { name: StringKey },
}
