/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::RELAY_DIRECTIVE_CONSTANTS;
use fnv::FnvBuildHasher;
use graphql_ir::{
    ConstantValue, FragmentDefinition, FragmentSpread, InlineFragment, Program, ScalarField,
    Selection, Transformed, Transformer, Value, VariableDefinition,
};
use indexmap::{map::Entry, IndexMap};
use interner::StringKey;
use std::ops::RangeFull;
use std::sync::Arc;

/// Transform to inline fragment spreads with @relay(mask:false)
pub fn mask<'s>(program: &Program<'s>) -> Program<'s> {
    let mut transform = Mask::new(program);
    transform
        .transform_program(program)
        .replace_or_else(|| program.clone())
}

type JoinedArguments<'s> = IndexMap<StringKey, &'s VariableDefinition, FnvBuildHasher>;

struct Mask<'s> {
    program: &'s Program<'s>,
    current_reachable_arguments: Vec<&'s VariableDefinition>,
}

impl<'s> Mask<'s> {
    fn new(program: &'s Program<'s>) -> Self {
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
                        .schema()
                        .is_type_subtype_of(&arg.type_, &prev_arg.type_)
                    {
                        entry.insert(arg);
                    }
                }
            }
        }
        let range = RangeFull;
        fragment.used_global_variables = joined_arguments
            .drain(range)
            .map(|(_, v)| v)
            .cloned()
            .collect();
    }
}

impl<'s> Transformer for Mask<'s> {
    const NAME: &'static str = "SkipClientExtensionsTransform";
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
        let is_relay_mask_false = spread.directives.iter().any(|directive| {
            directive.name.item == RELAY_DIRECTIVE_CONSTANTS.relay_directive_name
                && directive.arguments.iter().any(|arg| {
                    arg.name.item == RELAY_DIRECTIVE_CONSTANTS.mask_arg_name
                        && match arg.value.item {
                            Value::Constant(ConstantValue::Boolean(val)) => !val,
                            _ => false,
                        }
                })
        });
        if is_relay_mask_false {
            let fragment = self.program.fragment(spread.fragment.item).unwrap();
            self.current_reachable_arguments
                .extend(&fragment.used_global_variables);
            Transformed::Replace(Selection::InlineFragment(Arc::new(InlineFragment {
                type_condition: Some(fragment.type_condition),
                directives: fragment.directives.clone(),
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
