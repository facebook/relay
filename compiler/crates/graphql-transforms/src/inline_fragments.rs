/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use graphql_ir::{
    FragmentDefinition, FragmentSpread, InlineFragment, Program, ScalarField, Selection,
    Transformed, Transformer,
};
use interner::StringKey;
use std::collections::HashMap;
use std::sync::Arc;

pub fn inline_fragments<'s>(program: &'s Program<'s>) -> Program<'s> {
    let mut transform = InlineFragmentsTransform::new(program);
    transform
        .transform_program(program)
        .replace_or_else(|| program.clone())
}

type Seen = HashMap<StringKey, Arc<InlineFragment>>;

struct InlineFragmentsTransform<'s> {
    program: &'s Program<'s>,
    seen: Seen,
}

impl<'s> InlineFragmentsTransform<'s> {
    fn new(program: &'s Program<'s>) -> Self {
        Self {
            program,
            seen: Default::default(),
        }
    }

    fn transform_fragment_spread(&mut self, spread: &FragmentSpread) -> Arc<InlineFragment> {
        // If we've already created an InlineFragment for this fragment name before,
        // share it
        if let Some(prev) = self.seen.get(&spread.fragment.item) {
            return Arc::clone(prev);
        };
        // Otherwise create the InlineFragment equivalent of the fragment (recursively
        // inlining its contents). To guard against cycles, store a dummy value
        // that we overwrite once we finish.
        self.seen.insert(
            spread.fragment.item,
            Arc::new(InlineFragment {
                type_condition: None,
                directives: Default::default(),
                selections: Default::default(),
            }),
        );
        let fragment = self.program.fragment(spread.fragment.item).unwrap();
        let selections = self.transform_selections(&fragment.selections);
        let result = Arc::new(InlineFragment {
            type_condition: Some(fragment.type_condition),
            directives: fragment.directives.clone(),
            selections: selections.replace_or_else(|| fragment.selections.clone()),
        });
        self.seen.insert(spread.fragment.item, Arc::clone(&result));
        result
    }
}

impl<'s> Transformer for InlineFragmentsTransform<'s> {
    const NAME: &'static str = "InlineFragmentsTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_fragment(
        &mut self,
        _fragment: &FragmentDefinition,
    ) -> Transformed<FragmentDefinition> {
        Transformed::Delete
    }

    fn transform_selection(&mut self, selection: &Selection) -> Transformed<Selection> {
        match selection {
            Selection::FragmentSpread(selection) => Transformed::Replace(
                Selection::InlineFragment(self.transform_fragment_spread(selection)),
            ),
            _ => self.default_transform_selection(selection),
        }
    }

    fn transform_scalar_field(&mut self, _field: &ScalarField) -> Transformed<Arc<ScalarField>> {
        Transformed::Keep
    }
}
