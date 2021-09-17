/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::{
    no_inline::NO_INLINE_DIRECTIVE_NAME,
    node_identifier::{LocationAgnosticHash, LocationAgnosticPartialEq},
    relay_client_component::RELAY_CLIENT_COMPONENT_SERVER_DIRECTIVE_NAME,
};
use fnv::FnvHashMap;
use graphql_ir::{
    FragmentDefinition, FragmentSpread, InlineFragment, Program, ScalarField, Selection,
    Transformed, Transformer,
};
use std::{hash::Hash, sync::Arc};

pub fn inline_fragments(program: &Program) -> Program {
    let mut transform = InlineFragmentsTransform::new(program);
    transform
        .transform_program(program)
        .replace_or_else(|| program.clone())
}

#[derive(Eq, Clone, Debug)]
struct FragmentSpreadKey(Arc<FragmentSpread>);
type Seen = FnvHashMap<FragmentSpreadKey, Arc<InlineFragment>>;

impl PartialEq for FragmentSpreadKey {
    fn eq(&self, other: &Self) -> bool {
        self.0.fragment.item == other.0.fragment.item
            && self.0.directives.location_agnostic_eq(&other.0.directives)
    }
}

impl Hash for FragmentSpreadKey {
    fn hash<H: std::hash::Hasher>(&self, state: &mut H) {
        self.0.fragment.item.hash(state);
        self.0.directives.location_agnostic_hash(state);
    }
}

struct InlineFragmentsTransform<'s> {
    program: &'s Program,
    seen: Seen,
}

impl<'s> InlineFragmentsTransform<'s> {
    fn new(program: &'s Program) -> Self {
        Self {
            program,
            seen: Default::default(),
        }
    }

    fn transform_fragment_spread(&mut self, spread: &Arc<FragmentSpread>) -> Arc<InlineFragment> {
        let key = FragmentSpreadKey(Arc::clone(spread));
        // If we've already created an InlineFragment for this fragment name before,
        // share it
        if let Some(prev) = self.seen.get(&key) {
            return Arc::clone(prev);
        };
        // Otherwise create the InlineFragment equivalent of the fragment (recursively
        // inlining its contents). To guard against cycles, store a dummy value
        // that we overwrite once we finish.
        self.seen.insert(
            key.clone(),
            Arc::new(InlineFragment {
                type_condition: None,
                directives: Default::default(),
                selections: Default::default(),
            }),
        );
        let fragment = self
            .program
            .fragment(spread.fragment.item)
            .unwrap_or_else(|| {
                panic!(
                    "Fragment spread unable to resolve fragment `{}`.",
                    spread.fragment.item
                )
            });
        let selections = self.transform_selections(&fragment.selections);
        let result = Arc::new(InlineFragment {
            type_condition: Some(fragment.type_condition),
            directives: spread.directives.clone(),
            selections: selections.replace_or_else(|| fragment.selections.clone()),
        });
        self.seen.insert(key, Arc::clone(&result));
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
            Selection::FragmentSpread(selection) => {
                let should_skip_inline = selection.directives.iter().any(|directive| {
                    directive.name.item == *NO_INLINE_DIRECTIVE_NAME
                        || directive.name.item == *RELAY_CLIENT_COMPONENT_SERVER_DIRECTIVE_NAME
                });
                if should_skip_inline {
                    Transformed::Keep
                } else {
                    Transformed::Replace(Selection::InlineFragment(
                        self.transform_fragment_spread(selection),
                    ))
                }
            }
            _ => self.default_transform_selection(selection),
        }
    }

    fn transform_scalar_field(&mut self, _field: &ScalarField) -> Transformed<Selection> {
        Transformed::Keep
    }
}
