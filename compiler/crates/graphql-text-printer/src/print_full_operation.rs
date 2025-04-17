/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use fnv::FnvHashMap;
use graphql_ir::FragmentDefinition;
use graphql_ir::FragmentDefinitionName;
use graphql_ir::FragmentSpread;
use graphql_ir::OperationDefinition;
use graphql_ir::Program;
use graphql_ir::ScalarField;
use graphql_ir::Visitor;

use crate::PrinterOptions;
use crate::print_fragment;
use crate::print_operation;

pub fn print_full_operation(
    program: &Program,
    operation: &OperationDefinition,
    options: PrinterOptions,
) -> String {
    let mut printer = OperationPrinter::new(program, options);
    printer.print(operation)
}

pub struct OperationPrinter<'s> {
    fragment_result: FnvHashMap<FragmentDefinitionName, String>,
    reachable_fragments: FnvHashMap<FragmentDefinitionName, Arc<FragmentDefinition>>,
    program: &'s Program,
    options: PrinterOptions,
}

impl<'s> OperationPrinter<'s> {
    pub fn new(program: &'s Program, options: PrinterOptions) -> Self {
        Self {
            fragment_result: Default::default(),
            reachable_fragments: Default::default(),
            program,
            options,
        }
    }

    pub fn print(&mut self, operation: &OperationDefinition) -> String {
        let mut result = print_operation(&self.program.schema, operation, self.options);
        self.visit_operation(operation);
        let mut fragments: Vec<(FragmentDefinitionName, Arc<FragmentDefinition>)> =
            self.reachable_fragments.drain().collect();
        fragments.sort_unstable_by_key(|(name, _)| *name);
        for (_, fragment) in fragments {
            if !self.options.compact {
                result.push_str("\n\n");
            }
            result.push_str(self.print_fragment(&fragment));
        }
        if !self.options.compact {
            result.push('\n');
        }
        result
    }

    fn print_fragment(&mut self, fragment: &FragmentDefinition) -> &str {
        let schema = &self.program.schema;
        self.fragment_result
            .entry(fragment.name.item)
            .or_insert_with(|| print_fragment(schema, fragment, self.options))
    }
}

impl Visitor for OperationPrinter<'_> {
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
