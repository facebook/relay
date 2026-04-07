/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#![deny(warnings)]
#![deny(rust_2018_idioms)]
#![deny(clippy::all)]

mod prettier_common;
mod prettier_doc_builders;
mod prettier_document_printer;
mod prettier_executable_printer;
mod prettier_schema_printer;
mod print_ast_to_text;
mod print_full_operation;
mod print_to_text;

pub use prettier_document_printer::prettier_print_document;
pub use prettier_executable_printer::prettier_print_executable_definition;
pub use prettier_executable_printer::prettier_print_executable_document;
pub use prettier_executable_printer::prettier_print_fragment;
pub use prettier_executable_printer::prettier_print_operation;
pub use prettier_schema_printer::prettier_print_schema_document;
pub use prettier_schema_printer::prettier_print_type_system_definition;
pub use print_ast_to_text::print_executable_definition_ast;
pub use print_ast_to_text::print_fragment_ast;
pub use print_ast_to_text::print_operation_ast;
pub use print_full_operation::OperationPrinter;
pub use print_full_operation::print_full_operation;
pub use print_to_text::PrinterOptions;
pub use print_to_text::print_arguments;
pub use print_to_text::print_definition;
pub use print_to_text::print_directives;
pub use print_to_text::print_fragment;
pub use print_to_text::print_ir;
pub use print_to_text::print_operation;
pub use print_to_text::print_selection;
pub use print_to_text::print_selections;
pub use print_to_text::print_value;
pub use print_to_text::write_arguments;
pub use print_to_text::write_directives;
pub use print_to_text::write_value;

/// Test utilities for prettier output assertions.
#[cfg(test)]
pub(crate) mod test_utils {
    /// Asserts that the prettier output matches the expected lines, with detailed
    /// line-by-line comparison on failure.
    macro_rules! assert_prettier_output {
        ($actual:expr, [$($expected_line:expr),* $(,)?]) => {{
            let actual = $actual;
            let expected_lines: &[&str] = &[$($expected_line),*];
            let actual_lines: Vec<&str> = actual.lines().collect();

            if actual_lines.as_slice() != expected_lines {
                let max_lines = std::cmp::max(actual_lines.len(), expected_lines.len());

                let mut diff_report = String::new();
                diff_report.push_str("\n=== Prettier Output Mismatch ===\n");

                for i in 0..max_lines {
                    let actual_line = actual_lines.get(i).copied();
                    let expected_line = expected_lines.get(i).copied();

                    match (actual_line, expected_line) {
                        (Some(a), Some(e)) if a != e => {
                            diff_report.push_str(&format!(
                                "✗ line {}: expected {:?}\n           got      {:?}\n",
                                i + 1,
                                e,
                                a
                            ));
                        }
                        (Some(a), None) => {
                            diff_report.push_str(&format!(
                                "✗ line {}: unexpected {:?}\n",
                                i + 1,
                                a
                            ));
                        }
                        (None, Some(e)) => {
                            diff_report.push_str(&format!(
                                "✗ line {}: missing {:?}\n",
                                i + 1,
                                e
                            ));
                        }
                        _ => {}
                    }
                }

                panic!("{}", diff_report);
            }
        }};
    }

    pub(crate) use assert_prettier_output;
}
