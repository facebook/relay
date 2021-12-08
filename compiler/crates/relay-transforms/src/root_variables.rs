/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::no_inline::NO_INLINE_DIRECTIVE_NAME;
use common::{Diagnostic, NamedItem, WithLocation};
use fnv::{FnvHashMap, FnvHashSet};
use graphql_ir::{
    FragmentDefinition, FragmentSpread, OperationDefinition, Program, ValidationMessage, Value,
    Variable, Visitor,
};
use intern::string_key::StringKey;
use schema::{Schema, TypeReference};

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
    /// fragment and any fragments it transitively spreads. The type of each variable will be
    /// the most specific type with which that variable is used (ie, the type that the variable
    /// must have for the query to be valid).
    pub fn infer_operation_variables(
        &mut self,
        operation: &OperationDefinition,
    ) -> (VariableMap, Vec<Diagnostic>) {
        let transitive_local_variables = Default::default();
        let mut visitor = VariablesVisitor::new(
            self.program,
            &mut self.visited_fragments,
            Default::default(),
            &transitive_local_variables,
        );
        visitor.visit_operation(operation);
        (visitor.variable_map, visitor.errors)
    }

    /// Similar to infer_operation_variables(), but finds root variables referenced transitively
    /// from the given fragment.
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
    errors: Vec<Diagnostic>,
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
            errors: Default::default(),
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

            // Avoid collecting local variables usages as root variables
            let local_variables = fragment
                .variable_definitions
                .iter()
                .map(|var| var.name.item)
                .collect::<FnvHashSet<_>>();
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
                    .unwrap_or(self.transitive_local_variables),
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

    // Record that the given (root) variable was used with the given type, updating the mapping of
    // used root variables:
    // - If the first time the variable has been seen, add it to the variable map
    // - If the variable has been seen before, update the type if the new type is more specific
    //   then the type with which the variable was previously used.
    // The net effect is that for each variable name the most specific type will be recorded along
    // with a location that requires that type.
    fn record_root_variable_usage(
        &mut self,
        name: &WithLocation<StringKey>,
        type_: &TypeReference,
    ) {
        let schema = &self.program.schema;
        let errors = &mut self.errors;
        self.variable_map
            .entry(name.item)
            .and_modify(|prev_variable| {
                // Note the use of *strict* subtype check: there's no reason to update the mapping
                // if the types are equivalent, only if the current type is more specific than
                // the previous type
                let is_stricter_type =
                    schema.is_type_strict_subtype_of(type_, &prev_variable.type_);
                if is_stricter_type {
                    *prev_variable = Variable {
                        name: *name,
                        type_: type_.clone(),
                    };
                } else if !schema.is_type_subtype_of(&prev_variable.type_, type_) {
                    errors.push(
                        Diagnostic::error(
                            ValidationMessage::IncompatibleVariableUsage {
                                prev_type: schema.get_type_string(&prev_variable.type_),
                                next_type: schema.get_type_string(type_),
                            },
                            name.location,
                        )
                        .annotate("is incompatible with", prev_variable.name.location),
                    )
                }
            })
            .or_insert_with(|| Variable {
                name: *name,
                type_: type_.clone(),
            });
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
                            self.record_root_variable_usage(&var.name, &def.type_);
                        }
                    }
                }
            }
        }

        // Merge any root variables referenced by the spread fragment
        // into this (parent) fragment's arguments.
        let referenced_fragment_variables = self.infer_fragment_variables(fragment);
        for (_, variable) in referenced_fragment_variables.into_iter() {
            self.record_root_variable_usage(&variable.name, &variable.type_);
        }
    }

    fn visit_variable(&mut self, variable: &Variable) {
        if self.is_root_variable(variable.name.item) {
            self.record_root_variable_usage(&variable.name, &variable.type_)
        }
    }
}
