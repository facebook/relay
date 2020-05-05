/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use fnv::{FnvHashMap, FnvHashSet};
use graphql_ir::{
    FragmentDefinition, FragmentSpread, NamedItem, OperationDefinition, Program, Value, Variable,
    Visitor,
};
use interner::StringKey;
use std::iter::FromIterator;

type VariableMap = FnvHashMap<StringKey, Variable>;
type Visited = FnvHashMap<StringKey, VariableMap>;

pub struct InferVariablesVisitor<'s> {
    /// Cache fragments as they are transformed to avoid duplicate processing.
    /// Because @argument values don't matter (only variable names/types),
    /// each reachable fragment only has to be checked once.
    visited_fragments: Visited,
    program: &'s Program<'s>,
}

impl<'s> InferVariablesVisitor<'s> {
    pub fn new(program: &'s Program<'s>) -> Self {
        Self {
            visited_fragments: Default::default(),
            program,
        }
    }

    /// Determine the set of root variables set of root variables that are transitively
    /// referenced by each fragment, ie the union of all root variables used in the
    /// fragment and any fragments it transitively spreads.
    pub fn infer_operation_variables(&mut self, operation: &OperationDefinition) -> VariableMap {
        let mut visitor = VaraiblesVisitor::new(
            self.program,
            &mut self.visited_fragments,
            Default::default(),
        );
        visitor.visit_operation(operation);
        visitor.variable_map
    }
}

struct VaraiblesVisitor<'s> {
    variable_map: VariableMap,
    visited_fragments: &'s mut Visited,
    program: &'s Program<'s>,
    local_variables: FnvHashSet<StringKey>,
}

impl<'s> VaraiblesVisitor<'s> {
    fn new(
        program: &'s Program<'s>,
        visited_fragments: &'s mut Visited,
        local_variables: FnvHashSet<StringKey>,
    ) -> Self {
        Self {
            variable_map: Default::default(),
            visited_fragments,
            program,
            local_variables,
        }
    }
}

impl<'s> VaraiblesVisitor<'s> {
    /// Determine the set of root variables referenced locally in each
    /// fragment. Note that RootArgumentDefinitions in the fragment's
    /// argumentDefinitions can contain spurious entries for legacy
    /// reasons. Instead of using those the fragment is traversed
    /// to reanalyze variable usage.
    fn infer_fragment_variables(&mut self, fragment: &FragmentDefinition) -> VariableMap {
        if let Some(map) = self.visited_fragments.get(&fragment.name.item) {
            map.clone()
        } else {
            // Break cycles by initially caching a version that is empty.
            // If the current fragment is reached again, it won't have any
            // root variables to add to its parents. The traversal below will
            // find any root variables and update the cached version of the
            // fragment.
            self.visited_fragments
                .insert(fragment.name.item, Default::default());

            // Avoid collecting local variables usages as root varaibles
            let local_variables = FnvHashSet::from_iter(
                fragment
                    .variable_definitions
                    .iter()
                    .map(|var| var.name.item),
            );
            let mut visitor =
                VaraiblesVisitor::new(self.program, self.visited_fragments, local_variables);
            visitor.visit_fragment(fragment);
            let result = visitor.variable_map;
            self.visited_fragments
                .insert(fragment.name.item, result.clone());
            result
        }
    }
}

impl<'s> Visitor for VaraiblesVisitor<'s> {
    const NAME: &'static str = "VaraiblesVisitor";
    const VISIT_ARGUMENTS: bool = true;
    const VISIT_DIRECTIVES: bool = true;

    fn visit_fragment_spread(&mut self, spread: &FragmentSpread) {
        self.visit_directives(&spread.directives);
        let fragment = self
            .program
            .fragment(spread.fragment.item)
            .expect("Expect fragment to exist.");

        // Detect root variables being passed as the value of @arguments;
        // recover the expected type from the corresponding argument definitions.
        if !fragment.variable_definitions.is_empty() {
            for arg in spread.arguments.iter() {
                if let Value::Variable(var) = &arg.value.item {
                    if let Some(def) = fragment.variable_definitions.named(var.name.item) {
                        self.variable_map
                            .entry(var.name.item)
                            .or_insert_with(|| Variable {
                                name: var.name,
                                type_: def.type_.clone(),
                            });
                    }
                }
            }
        }

        // Merge any root variables referenced by the spread fragment
        // into this (parent) fragment's arguments.
        let referenced_fragment_variables = self.infer_fragment_variables(fragment);
        for (_, variable) in referenced_fragment_variables.into_iter() {
            self.variable_map.insert(variable.name.item, variable);
        }
    }

    fn visit_variable(&mut self, value: &Variable) {
        if !self.local_variables.contains(&value.name.item) {
            self.variable_map
                .entry(value.name.item)
                .or_insert_with(|| value.clone());
        }
    }
}
