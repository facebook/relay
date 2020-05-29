/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::relay_directive::RelayDirective;
use fnv::FnvBuildHasher;
use graphql_ir::{
    FragmentDefinition, FragmentSpread, InlineFragment, Program, ScalarField, Selection,
    Transformed, Transformer, VariableDefinition,
};
use indexmap::{map::Entry, IndexMap};
use interner::StringKey;
use std::sync::Arc;

/// Transform to inline fragment spreads with @relay(mask:false)
pub fn mask(program: &Program) -> Program {
    let mut transform = Mask::new(program);
    transform
        .transform_program(program)
        .replace_or_else(|| program.clone())
}

type JoinedArguments<'s> = IndexMap<StringKey, &'s VariableDefinition, FnvBuildHasher>;

struct Mask<'program> {
    program: &'program Program,
}

impl<'program> Mask<'program> {
    fn new(program: &'program Program) -> Self {
        Self { program }
    }
}

impl<'s> Transformer for Mask<'s> {
    const NAME: &'static str = "MaskTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_fragment(
        &mut self,
        fragment: &FragmentDefinition,
    ) -> Transformed<FragmentDefinition> {
        let mut mask_fragment = MaskFragment::new(self.program);
        mask_fragment.transform_fragment(fragment)
    }
}

struct MaskFragment<'program> {
    program: &'program Program,
    current_reachable_arguments: Vec<&'program VariableDefinition>,
}

impl<'program> MaskFragment<'program> {
    fn new(program: &'program Program) -> Self {
        Self {
            program,
            current_reachable_arguments: vec![],
        }
    }

    fn join_current_arguments_to_fragment(&mut self, fragment: &mut FragmentDefinition) {
        let mut joined_arguments = JoinedArguments::default();
        for variable in &fragment.used_global_variables {
            joined_arguments.insert(variable.name.item, variable);
        }
        for arg in self.current_reachable_arguments.drain(..) {
            match joined_arguments.entry(arg.name.item) {
                Entry::Vacant(entry) => {
                    entry.insert(arg);
                }
                Entry::Occupied(mut entry) => {
                    let prev_arg = entry.get();
                    if self
                        .program
                        .schema
                        .is_type_subtype_of(&arg.type_, &prev_arg.type_)
                    {
                        entry.insert(arg);
                    }
                }
            }
        }
        fragment.used_global_variables = joined_arguments
            .into_iter()
            .map(|(_, v)| v)
            .cloned()
            .collect();
    }
}

impl<'s> Transformer for MaskFragment<'s> {
    const NAME: &'static str = "MaskFragmentTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_fragment(
        &mut self,
        fragment: &FragmentDefinition,
    ) -> Transformed<FragmentDefinition> {
        let result = self.default_transform_fragment(fragment);
        if self.current_reachable_arguments.is_empty() {
            result
        } else {
            Transformed::Replace(match result {
                Transformed::Keep => {
                    let mut new_fragment = fragment.clone();
                    self.join_current_arguments_to_fragment(&mut new_fragment);
                    new_fragment
                }
                Transformed::Replace(mut new_fragment) => {
                    self.join_current_arguments_to_fragment(&mut new_fragment);
                    new_fragment
                }
                Transformed::Delete => {
                    panic!("Unexpected fragment deletion in mask transform.");
                }
            })
        }
    }

    fn transform_fragment_spread(&mut self, spread: &FragmentSpread) -> Transformed<Selection> {
        if RelayDirective::is_unmasked_fragment_spread(spread) {
            let fragment = self.program.fragment(spread.fragment.item).unwrap();
            self.current_reachable_arguments
                .extend(&fragment.used_global_variables);
            Transformed::Replace(Selection::InlineFragment(Arc::new(InlineFragment {
                type_condition: Some(fragment.type_condition),
                directives: vec![],
                selections: self
                    .transform_selections(&fragment.selections)
                    .replace_or_else(|| fragment.selections.to_vec()),
            })))
        } else {
            Transformed::Keep
        }
    }

    fn transform_scalar_field(&mut self, _field: &ScalarField) -> Transformed<Selection> {
        Transformed::Keep
    }
}
