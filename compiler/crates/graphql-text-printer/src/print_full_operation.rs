/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use fnv::FnvHashMap;
use fnv::FnvHashSet;
use graphql_ir::FragmentDefinitionName;
use graphql_ir::FragmentSpread;
use graphql_ir::OperationDefinition;
use graphql_ir::OperationDefinitionName;
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
    program: &'s Program,
    options: PrinterOptions,
}

impl<'s> OperationPrinter<'s> {
    pub fn new(program: &'s Program, options: PrinterOptions) -> Self {
        Self {
            fragment_result: Default::default(),
            program,
            options,
        }
    }

    pub fn print(&mut self, operation: &OperationDefinition) -> String {
        let mut result = print_operation(&self.program.schema, operation, self.options);
        let reachable = collect_reachable_fragments(operation, self.program);
        self.ensure_fragment_texts(&reachable);
        append_fragment_texts(&mut result, &reachable, &self.fragment_result, self.options);
        result
    }

    fn ensure_fragment_texts(&mut self, reachable: &[FragmentDefinitionName]) {
        let schema = &self.program.schema;
        let options = self.options;
        for name in reachable {
            let fragment = self.program.fragment(*name).unwrap();
            self.fragment_result
                .entry(*name)
                .or_insert_with(|| print_fragment(schema, fragment, options));
        }
    }
}

/// Pre-compute all fragment texts from a program into a read-only map.
/// This allows thread-safe access to fragment texts during parallel
/// operation text generation.
pub fn precompute_fragment_texts(
    program: &Program,
    options: PrinterOptions,
) -> FnvHashMap<FragmentDefinitionName, String> {
    program
        .fragments()
        .map(|f| (f.name.item, print_fragment(&program.schema, f, options)))
        .collect()
}

/// Compute the full operation text (operation + reachable fragments) without
/// any mutable state, enabling thread-safe parallel execution.
pub fn compute_operation_text(
    operation: &OperationDefinition,
    program: &Program,
    fragment_texts: &FnvHashMap<FragmentDefinitionName, String>,
    options: PrinterOptions,
) -> String {
    let mut result = print_operation(&program.schema, operation, options);
    let reachable = collect_reachable_fragments(operation, program);
    append_fragment_texts(&mut result, &reachable, fragment_texts, options);
    result
}

/// Pre-compute all operation texts in a program into a map, keyed by
/// operation name. Uses pre-computed fragment texts for thread safety.
pub fn precompute_operation_texts(
    program: &Program,
    fragment_texts: &FnvHashMap<FragmentDefinitionName, String>,
    options: PrinterOptions,
) -> FnvHashMap<OperationDefinitionName, String> {
    program
        .operations()
        .map(|op| {
            (
                op.name.item,
                compute_operation_text(op, program, fragment_texts, options),
            )
        })
        .collect()
}

/// Collect all transitively reachable fragment names from an operation,
/// returned in sorted order for deterministic output.
fn collect_reachable_fragments(
    operation: &OperationDefinition,
    program: &Program,
) -> Vec<FragmentDefinitionName> {
    let mut collector = FragmentCollector {
        reachable: FnvHashSet::default(),
        program,
    };
    collector.visit_operation(operation);
    let mut sorted: Vec<_> = collector.reachable.into_iter().collect();
    sorted.sort_unstable();
    sorted
}

/// Append pre-computed fragment texts to a result string.
fn append_fragment_texts(
    result: &mut String,
    reachable: &[FragmentDefinitionName],
    fragment_texts: &FnvHashMap<FragmentDefinitionName, String>,
    options: PrinterOptions,
) {
    for name in reachable {
        if !options.compact {
            result.push_str("\n\n");
        }
        result.push_str(&fragment_texts[name]);
    }
    if !options.compact {
        result.push('\n');
    }
}

/// Helper visitor that collects all transitively reachable fragments
/// from an operation using only local (non-shared) mutable state.
struct FragmentCollector<'s> {
    reachable: FnvHashSet<FragmentDefinitionName>,
    program: &'s Program,
}

impl Visitor for FragmentCollector<'_> {
    const NAME: &'static str = "FragmentCollector";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn visit_fragment_spread(&mut self, spread: &FragmentSpread) {
        if self.reachable.contains(&spread.fragment.item) {
            return;
        }

        self.reachable.insert(spread.fragment.item);
        let fragment = self.program.fragment(spread.fragment.item).unwrap();
        self.visit_fragment(fragment);
    }

    fn visit_scalar_field(&mut self, _field: &ScalarField) {
        // Stop
    }
}

#[cfg(test)]
mod tests {
    use std::sync::Arc;

    use common::SourceLocationKey;
    use graphql_ir::ExecutableDefinition;
    use graphql_ir::build;
    use graphql_syntax::parse_executable;
    use relay_test_schema::TEST_SCHEMA;

    use super::*;

    fn build_program(source: &str) -> Program {
        let source_location = SourceLocationKey::standalone("test");
        let ast = parse_executable(source, source_location).unwrap();
        let ir = build(&TEST_SCHEMA, &ast.definitions).unwrap();
        Program::from_definitions(Arc::clone(&TEST_SCHEMA), ir)
    }

    fn get_operations(source: &str) -> Vec<OperationDefinition> {
        let source_location = SourceLocationKey::standalone("test");
        let ast = parse_executable(source, source_location).unwrap();
        let ir = build(&TEST_SCHEMA, &ast.definitions).unwrap();
        ir.into_iter()
            .filter_map(|def| match def {
                ExecutableDefinition::Operation(op) => Some(op),
                _ => None,
            })
            .collect()
    }

    /// Verify that compute_operation_text produces identical output to
    /// OperationPrinter::print for a simple query without fragments.
    #[test]
    fn test_compute_operation_text_no_fragments() {
        let source = r#"
            query MyQuery($id: ID) {
                node(id: $id) {
                    id
                }
            }
        "#;
        let program = build_program(source);
        let operations = get_operations(source);
        let options = PrinterOptions::default();

        // Old path
        let mut printer = OperationPrinter::new(&program, options);
        let expected = printer.print(&operations[0]);

        // New path
        let fragment_texts = precompute_fragment_texts(&program, options);
        let actual = compute_operation_text(&operations[0], &program, &fragment_texts, options);

        assert_eq!(expected, actual);
    }

    /// Verify equivalence with fragment spreads.
    #[test]
    fn test_compute_operation_text_with_fragments() {
        let source = r#"
            fragment UserFragment on User {
                name
            }

            fragment ActorFragment on Actor {
                id
            }

            query MyQuery($id: ID) {
                node(id: $id) {
                    ...ActorFragment
                    ...UserFragment
                }
            }
        "#;
        let program = build_program(source);
        let operations = get_operations(source);
        let options = PrinterOptions::default();

        let mut printer = OperationPrinter::new(&program, options);
        let expected = printer.print(&operations[0]);

        let fragment_texts = precompute_fragment_texts(&program, options);
        let actual = compute_operation_text(&operations[0], &program, &fragment_texts, options);

        assert_eq!(expected, actual);
    }

    /// Verify equivalence with nested (transitive) fragment spreads.
    #[test]
    fn test_compute_operation_text_nested_fragments() {
        let source = r#"
            fragment NestedUserFragment on User {
                username
            }

            fragment NestedActorFragment on Actor {
                name
            }

            fragment UserFragment on User {
                name
                ...NestedUserFragment
            }

            fragment ActorFragment on Actor {
                id
                ...NestedActorFragment
            }

            query MyQuery($id: ID) {
                node(id: $id) {
                    ...ActorFragment
                    ...UserFragment
                }
            }
        "#;
        let program = build_program(source);
        let operations = get_operations(source);
        let options = PrinterOptions::default();

        let mut printer = OperationPrinter::new(&program, options);
        let expected = printer.print(&operations[0]);

        let fragment_texts = precompute_fragment_texts(&program, options);
        let actual = compute_operation_text(&operations[0], &program, &fragment_texts, options);

        assert_eq!(expected, actual);
    }

    /// Verify equivalence with multiple operations sharing fragments.
    #[test]
    fn test_compute_operation_text_multiple_operations() {
        let source = r#"
            fragment SharedFragment on User {
                name
            }

            query QueryA($id: ID) {
                node(id: $id) {
                    ...SharedFragment
                }
            }

            query QueryB($id: ID) {
                node(id: $id) {
                    ...SharedFragment
                }
            }
        "#;
        let program = build_program(source);
        let operations = get_operations(source);
        let options = PrinterOptions::default();

        // Old path: OperationPrinter caches across operations
        let mut printer = OperationPrinter::new(&program, options);
        let expected_a = printer.print(&operations[0]);
        let expected_b = printer.print(&operations[1]);

        // New path: pre-computed texts
        let fragment_texts = precompute_fragment_texts(&program, options);
        let actual_a = compute_operation_text(&operations[0], &program, &fragment_texts, options);
        let actual_b = compute_operation_text(&operations[1], &program, &fragment_texts, options);

        assert_eq!(expected_a, actual_a);
        assert_eq!(expected_b, actual_b);
    }

    /// Verify equivalence with compact mode.
    #[test]
    fn test_compute_operation_text_compact() {
        let source = r#"
            fragment UserFragment on User {
                name
            }

            query MyQuery($id: ID) {
                node(id: $id) {
                    ...UserFragment
                }
            }
        "#;
        let program = build_program(source);
        let operations = get_operations(source);
        let options = PrinterOptions {
            compact: true,
            ..Default::default()
        };

        let mut printer = OperationPrinter::new(&program, options);
        let expected = printer.print(&operations[0]);

        let fragment_texts = precompute_fragment_texts(&program, options);
        let actual = compute_operation_text(&operations[0], &program, &fragment_texts, options);

        assert_eq!(expected, actual);
    }

    /// Verify precompute_operation_texts produces same results as individual calls.
    #[test]
    fn test_precompute_operation_texts() {
        let source = r#"
            fragment SharedFragment on User {
                name
            }

            query QueryA($id: ID) {
                node(id: $id) {
                    ...SharedFragment
                }
            }

            query QueryB($id: ID) {
                node(id: $id) {
                    id
                }
            }
        "#;
        let program = build_program(source);
        let operations = get_operations(source);
        let options = PrinterOptions::default();

        let mut printer = OperationPrinter::new(&program, options);
        let expected_a = printer.print(&operations[0]);
        let expected_b = printer.print(&operations[1]);

        let fragment_texts = precompute_fragment_texts(&program, options);
        let op_texts = precompute_operation_texts(&program, &fragment_texts, options);

        assert_eq!(expected_a, op_texts[&operations[0].name.item]);
        assert_eq!(expected_b, op_texts[&operations[1].name.item]);
    }
}
