/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::compiler_context::CompilerContext;
use graphql_ir::{
    FragmentSpread, InlineFragment, ScalarField, Selection, Transformed, Transformer,
};
use interner::StringKey;
use std::collections::HashMap;
use std::sync::Arc;

pub fn inline_fragments<'s>(ctx: &'s CompilerContext<'s>) -> CompilerContext<'s> {
    let mut next_context = CompilerContext::new(ctx.schema());
    let mut transformer = InlineFragmentsTransform::new(ctx);
    for operation in ctx.operations() {
        match transformer.transform_operation(operation) {
            Transformed::Delete => {}
            Transformed::Keep => next_context.insert_operation(Arc::clone(operation)),
            Transformed::Replace(replacement) => {
                next_context.insert_operation(Arc::new(replacement))
            }
        }
    }
    next_context
}

type Seen = HashMap<StringKey, Arc<InlineFragment>>;

struct InlineFragmentsTransform<'s> {
    ctx: &'s CompilerContext<'s>,
    seen: Seen,
}

impl<'s> InlineFragmentsTransform<'s> {
    fn new(ctx: &'s CompilerContext<'s>) -> Self {
        Self {
            ctx,
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
        let fragment = self.ctx.fragment(spread.fragment.item).unwrap();
        let selections = self.transform_selections(&fragment.selections);
        let result = Arc::new(InlineFragment {
            type_condition: Some(fragment.type_condition),
            directives: fragment.directives.clone(),
            selections: selections.unwrap_or_else(|| fragment.selections.clone()),
        });
        self.seen.insert(spread.fragment.item, Arc::clone(&result));
        result
    }
}

impl<'s> Transformer for InlineFragmentsTransform<'s> {
    const NAME: &'static str = "InlineFragmentsTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

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
