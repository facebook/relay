/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::no_inline::NO_INLINE_DIRECTIVE_NAME;
use common::NamedItem;
use fnv::{FnvHashMap, FnvHashSet};
use graphql_ir::{
    FragmentDefinition, FragmentSpread, OperationDefinition, Program, Value, Variable, Visitor,
};
use interner::StringKey;
use std::iter::FromIterator;

pub type VariableMap = FnvHashMap<StringKey, Variable>;
type Visited = FnvHashMap<StringKey, VariableMap>;

pub struct InferVariablesVisitor<'program> {
    /// Cache fragments as they are transformed to avoid duplicate processing.
    /// Because @argument values don't matter (only variable names/types),
    /// each reachable fragment only has to be checked once.
    visited_fragments: Visited,
    program: &'program Program,
}

impl<'program> InferVariablesVisitor<'program> {
    pub fn new(program: &'program Program) -> Self {
        Self {
            visited_fragments: Default::default(),
            program,
        }
    }

    /// Determine the set of root variables that are transitively
    /// referenced by each fragment, ie the union of all root variables used in the
    /// fragment and any fragments it transitively spreads.
    pub fn infer_operation_variables(&mut self, operation: &OperationDefinition) -> VariableMap {
        let transitive_local_variables = Default::default();
        let mut visitor = VariablesVisitor::new(
            self.program,
            &mut self.visited_fragments,
            Default::default(),
            &transitive_local_variables,
        );
        visitor.visit_operation(operation);
        visitor.variable_map
    }

    pub fn infer_fragment_variables(&mut self, fragment: &FragmentDefinition) -> VariableMap {
        let transitive_local_variables = Default::default();
        let mut visitor = VariablesVisitor::new(
            self.program,
            &mut self.visited_fragments,
            Default::default(),
            &transitive_local_variables,
        );
        visitor.infer_fragment_variables(fragment)
    }
}

struct VariablesVisitor<'a, 'b> {
    variable_map: VariableMap,
    visited_fragments: &'a mut Visited,
    program: &'a Program,
    local_variables: FnvHashSet<StringKey>,
    transitive_local_variables: &'b FnvHashSet<StringKey>,
}

impl<'a, 'b> VariablesVisitor<'a, 'b> {
    fn new(
        program: &'a Program,
        visited_fragments: &'a mut Visited,
        local_variables: FnvHashSet<StringKey>,
        transitive_local_variables: &'b FnvHashSet<StringKey>,
    ) -> Self {
        Self {
            variable_map: Default::default(),
            visited_fragments,
            program,
            local_variables,
            transitive_local_variables,
        }
    }
}

impl VariablesVisitor<'_, '_> {
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
            let transitive_local_variables = if fragment
                .directives
                .named(*NO_INLINE_DIRECTIVE_NAME)
                .is_some()
            {
                Some(local_variables.clone())
            } else {
                None
            };
            let mut visitor = VariablesVisitor::new(
                self.program,
                self.visited_fragments,
                local_variables,
                transitive_local_variables
                    .as_ref()
                    .unwrap_or_else(|| &self.transitive_local_variables),
            );
            visitor.visit_fragment(fragment);
            let result = visitor.variable_map;
            self.visited_fragments
                .insert(fragment.name.item, result.clone());
            result
        }
    }

    fn is_root_variable(&self, name: StringKey) -> bool {
        !self.local_variables.contains(&name) && !self.transitive_local_variables.contains(&name)
    }
}

impl<'a, 'b> Visitor for VariablesVisitor<'a, 'b> {
    const NAME: &'static str = "VariablesVisitor";
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
                    if let Some(def) = fragment.variable_definitions.named(arg.name.item) {
                        if self.is_root_variable(var.name.item) {
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
        }

        // Merge any root variables referenced by the spread fragment
        // into this (parent) fragment's arguments.
        let referenced_fragment_variables = self.infer_fragment_variables(fragment);
        for (_, variable) in referenced_fragment_variables.into_iter() {
            self.variable_map.insert(variable.name.item, variable);
        }
    }

    fn visit_variable(&mut self, value: &Variable) {
        if self.is_root_variable(value.name.item) {
            self.variable_map
                .entry(value.name.item)
                .or_insert_with(|| value.clone());
        }
    }
}
