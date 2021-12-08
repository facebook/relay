/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::{print_fragment, print_operation};
use fnv::FnvHashMap;
use graphql_ir::{
    FragmentDefinition, FragmentSpread, OperationDefinition, Program, ScalarField, Visitor,
};
use intern::string_key::StringKey;
use std::sync::Arc;

pub fn print_full_operation(program: &Program, operation: &OperationDefinition) -> String {
    let mut printer = OperationPrinter::new(program);
    printer.print(operation)
}

pub struct OperationPrinter<'s> {
    fragment_result: FnvHashMap<StringKey, String>,
    reachable_fragments: FnvHashMap<StringKey, Arc<FragmentDefinition>>,
    program: &'s Program,
}

impl<'s> OperationPrinter<'s> {
    pub fn new(program: &'s Program) -> Self {
        Self {
            fragment_result: Default::default(),
            reachable_fragments: Default::default(),
            program,
        }
    }

    pub fn print(&mut self, operation: &OperationDefinition) -> String {
        let mut result = print_operation(&self.program.schema, operation, Default::default());
        self.visit_operation(operation);
        let mut fragments: Vec<(StringKey, Arc<FragmentDefinition>)> =
            self.reachable_fragments.drain().collect();
        fragments.sort_unstable_by_key(|(name, _)| *name);
        for (_, fragment) in fragments {
            result.push_str("\n\n");
            result.push_str(self.print_fragment(&fragment));
        }
        result.push('\n');
        result
    }

    fn print_fragment(&mut self, fragment: &FragmentDefinition) -> &str {
        let schema = &self.program.schema;
        self.fragment_result
            .entry(fragment.name.item)
            .or_insert_with(|| print_fragment(schema, fragment, Default::default()))
    }
}

impl<'s, 'ir> Visitor for OperationPrinter<'s> {
    const NAME: &'static str = "OperationPrinter";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn visit_fragment_spread(&mut self, spread: &FragmentSpread) {
        if self.reachable_fragments.contains_key(&spread.fragment.item) {
            return;
        }

        let fragment = self.program.fragment(spread.fragment.item).unwrap();
        self.reachable_fragments
            .insert(spread.fragment.item, Arc::clone(fragment));
        self.visit_fragment(fragment);
    }

    fn visit_scalar_field(&mut self, _field: &ScalarField) {
        // Stop
    }
}
