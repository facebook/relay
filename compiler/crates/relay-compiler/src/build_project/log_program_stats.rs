/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use fnv::FnvHashMap;
use graphql_ir::{
    Condition, FragmentDefinition, InlineFragment, LinkedField, OperationDefinition, Program,
    ScalarField, Selection,
};
use lazy_static::lazy_static;
use relay_transforms::PointerAddress;

lazy_static! {
    static ref LOG_AST_STATS: bool = std::env::var("RELAY_LOG_AST_STATS").is_ok();
}

pub fn print_stats(extra_info: &'static str, program: &Program) {
    if *LOG_AST_STATS {
        let mut visitor = IRStatsVisitor::default();
        let stats = visitor.visit_program(program);
        println!("{}", extra_info);
        stats.print_stats();
        println!();
    }
}

#[derive(Default)]
struct IRStatsVisitor {
    visited: FnvHashMap<PointerAddress, StatsCollection>,
}
/// Represents the stats of one category of the current node and it's descendant
/// total: Total number of nodes
/// duplicate: The number of nodes that are duplicate (doesn't include the original node)
/// total - duplicate = the number of nodes that actually consumes memory
#[derive(Default, Clone)]
struct Stats {
    total: usize,
    duplicate: usize,
}
#[derive(Default, Clone)]
struct StatsCollection {
    linked_field: Stats,
    scalar_field: Stats,
    inline_fragment: Stats,
    condition: Stats,
}

impl StatsCollection {
    fn print_stats(&self) {
        print!("Linked field: ");
        self.linked_field.print_stats();
        print!("Inline fragment: ");
        self.inline_fragment.print_stats();
        print!("Scalar field: ");
        self.scalar_field.print_stats();
        print!("Condition: ");
        self.condition.print_stats();
    }

    fn add(&mut self, other: StatsCollection) {
        self.linked_field.add(other.linked_field);
        self.scalar_field.add(other.scalar_field);
        self.inline_fragment.add(other.inline_fragment);
        self.condition.add(other.condition);
    }

    // If the Stats is read from a cache, that means it'a duplicated node:
    // all of it's descendants are also duplicates, thus the duplicate count
    // should be equalt to the total count.
    fn to_duplicate(&self) -> StatsCollection {
        StatsCollection {
            linked_field: self.linked_field.to_duplicate(),
            scalar_field: self.scalar_field.to_duplicate(),
            inline_fragment: self.inline_fragment.to_duplicate(),
            condition: self.condition.to_duplicate(),
        }
    }
}

impl Stats {
    fn print_stats(&self) {
        println!(
            "{} unique, {} total, {} duplicate.",
            self.total - self.duplicate,
            self.total,
            self.duplicate
        )
    }

    fn add(&mut self, other: Stats) {
        self.total += other.total;
        self.duplicate += other.duplicate;
    }

    fn to_duplicate(&self) -> Stats {
        Stats {
            total: self.total,
            duplicate: self.total,
        }
    }
}

impl IRStatsVisitor {
    fn visit_program(&mut self, program: &Program) -> StatsCollection {
        let mut result = StatsCollection::default();
        for operation in program.operations() {
            result.add(self.visit_operation(operation));
        }
        for fragment in program.fragments() {
            result.add(self.visit_fragment(fragment));
        }
        result
    }

    fn visit_operation(&mut self, operation: &OperationDefinition) -> StatsCollection {
        self.visit_selections(&operation.selections)
    }

    fn visit_fragment(&mut self, fragment: &FragmentDefinition) -> StatsCollection {
        self.visit_selections(&fragment.selections)
    }

    fn visit_selections(&mut self, selections: &[Selection]) -> StatsCollection {
        let mut result = StatsCollection::default();
        for selection in selections {
            result.add(self.visit_selection(selection))
        }
        result
    }

    fn visit_selection(&mut self, selection: &Selection) -> StatsCollection {
        match selection {
            Selection::FragmentSpread(_) => Default::default(),
            Selection::InlineFragment(selection) => {
                self.cached_visit_fn(selection.as_ref(), Self::visit_inline_fragment)
            }
            Selection::LinkedField(selection) => {
                self.cached_visit_fn(selection.as_ref(), Self::visit_linked_field)
            }
            Selection::ScalarField(selection) => {
                self.cached_visit_fn(selection.as_ref(), Self::visit_scalar_field)
            }
            Selection::Condition(selection) => {
                self.cached_visit_fn(selection.as_ref(), Self::visit_condition)
            }
        }
    }

    fn visit_scalar_field(&mut self, _: &ScalarField) -> StatsCollection {
        let mut result = StatsCollection::default();
        result.scalar_field.total += 1;
        result
    }

    fn visit_linked_field(&mut self, field: &LinkedField) -> StatsCollection {
        let mut result = self.visit_selections(&field.selections);
        result.linked_field.total += 1;
        result
    }

    fn visit_condition(&mut self, condition: &Condition) -> StatsCollection {
        let mut result = self.visit_selections(&condition.selections);
        result.condition.total += 1;
        result
    }

    fn visit_inline_fragment(&mut self, fragment: &InlineFragment) -> StatsCollection {
        let mut result = self.visit_selections(&fragment.selections);
        result.inline_fragment.total += 1;
        result
    }

    fn cached_visit_fn<F, T>(&mut self, node: &T, count_fn: F) -> StatsCollection
    where
        F: Fn(&mut Self, &T) -> StatsCollection,
    {
        let address = PointerAddress::new(node);
        let result = self.visited.get(&address);
        if let Some(result) = result {
            return result.to_duplicate();
        }
        let result = count_fn(self, node);
        self.visited.insert(address, result.clone());
        result
    }
}
