/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::ast::{Ast, AstBuilder, AstKey, Primitive};
use crate::build_ast::{build_fragment, build_operation};

use graphql_ir::{FragmentDefinition, OperationDefinition};
use schema::Schema;

use fnv::{FnvBuildHasher, FnvHashSet};
use indexmap::IndexMap;
use std::fmt::{Result as FmtResult, Write};

pub struct Printer {
    builder: AstBuilder,
}

type VariableDefinitions = IndexMap<AstKey, String, FnvBuildHasher>;
struct DedupedJSONPrinter<'b> {
    variable_definitions: VariableDefinitions,
    duplicates: FnvHashSet<AstKey>,
    builder: &'b AstBuilder,
    root_key: AstKey,
}

impl<'b> DedupedJSONPrinter<'b> {
    fn new(full_duplicates: FnvHashSet<AstKey>, builder: &'b AstBuilder, root_key: AstKey) -> Self {
        let mut duplicates = Default::default();
        Self::collect_value_duplicates(&mut duplicates, &full_duplicates, builder, root_key);
        Self {
            variable_definitions: Default::default(),
            duplicates,
            builder,
            root_key,
        }
    }

    /// We don't dedupe in an already deduped AST unless the duplicate
    /// also appears on a subtree that's not a duplicate
    /// Input:
    /// [
    ///     [{a: 1}, {b:2}],
    ///     [{a: 1}, {b:2}],
    ///     {b: 2}
    /// ]
    /// Output:
    /// v0 = {b: 2};
    /// v1 = [{a: 1}, v0];
    fn collect_value_duplicates(
        result: &mut FnvHashSet<AstKey>,
        full_duplicates: &FnvHashSet<AstKey>,
        builder: &AstBuilder,
        key: AstKey,
    ) {
        if full_duplicates.contains(&key) {
            result.insert(key);
            return;
        }
        match builder.lookup(key) {
            Ast::Array(array) => {
                if array.is_empty() {
                    return;
                }
                for val in array {
                    if let Primitive::Key(key) = val {
                        Self::collect_value_duplicates(result, full_duplicates, builder, *key);
                    }
                }
            }
            Ast::Object(object) => {
                if object.is_empty() {
                    return;
                }
                for (_, val) in object {
                    if let Primitive::Key(key) = val {
                        Self::collect_value_duplicates(result, full_duplicates, builder, *key);
                    }
                }
            }
        }
    }

    fn print(mut self) -> String {
        let mut result = String::new();
        self.print_ast(&mut result, self.root_key, 0, false)
            .unwrap();
        if self.variable_definitions.is_empty() {
            result
        } else {
            let mut with_variables = String::new();
            with_variables.push_str("(function(){\nvar ");
            let last = self.variable_definitions.len() - 1;
            for (i, (_, value)) in self.variable_definitions.drain(..).enumerate() {
                writeln!(
                    &mut with_variables,
                    "v{} = {}{}",
                    i,
                    value,
                    if i == last { ";" } else { "," }
                )
                .unwrap();
            }
            writeln!(&mut with_variables, "return {};\n}})()", result).unwrap();
            with_variables
        }
    }

    fn print_ast<W: Write>(
        &mut self,
        f: &mut W,
        key: AstKey,
        indent: usize,
        is_dedupe_var: bool,
    ) -> FmtResult {
        // Only use variable references at depth beyond the top level.
        if indent > 0 && self.duplicates.contains(&key) {
            let v = if self.variable_definitions.contains_key(&key) {
                self.variable_definitions.get_full(&key).unwrap().0
            } else {
                let mut variable = String::new();
                self.print_ast(&mut variable, key, 0, true)?;
                let v = self.variable_definitions.len();
                self.variable_definitions.insert(key, variable);
                v
            };
            return write!(f, "(v{}/*: any*/)", v);
        }

        let ast = self.builder.lookup(key);
        match ast {
            Ast::Object(object) => {
                if object.is_empty() {
                    write!(f, "{{}}")
                } else {
                    let next_indent = indent + 1;
                    writeln!(f, "{{")?;
                    for (i, (key, value)) in object.iter().enumerate() {
                        print_indentation(f, next_indent)?;
                        write!(f, "\"{}\": ", key.lookup(),)?;
                        self.print_primitive(f, value, next_indent, is_dedupe_var)?;
                        if i < object.len() - 1 {
                            writeln!(f, ",")?;
                        } else {
                            writeln!(f)?;
                        }
                    }
                    print_indentation(f, indent)?;
                    write!(f, "}}")
                }
            }
            Ast::Array(array) => {
                if array.is_empty() {
                    if is_dedupe_var {
                        // Empty arrays can only have one inferred flow type and then conflict if
                        // used in different places, this is unsound if we would write to them but
                        // this whole module is based on the idea of a read only JSON tree.
                        write!(f, "([]/*: any*/)")
                    } else {
                        write!(f, "[]")
                    }
                } else {
                    writeln!(f, "[")?;
                    let next_indent = indent + 1;
                    for (i, value) in array.iter().enumerate() {
                        print_indentation(f, indent + 1)?;
                        self.print_primitive(f, value, next_indent, is_dedupe_var)?;
                        if i < array.len() - 1 {
                            writeln!(f, ",")?;
                        } else {
                            writeln!(f)?;
                        }
                    }
                    print_indentation(f, indent)?;
                    write!(f, "]")
                }
            }
        }
    }

    fn print_primitive<W: Write>(
        &mut self,
        f: &mut W,
        primitive: &Primitive,
        indent: usize,
        is_dedupe_var: bool,
    ) -> FmtResult {
        match primitive {
            Primitive::Null => write!(f, "null"),
            Primitive::Bool(b) => write!(f, "{}", if *b { "true" } else { "false" }),
            Primitive::String(key) => write!(f, "\"{}\"", key),
            Primitive::Float(value) => write!(f, "{}", value.as_float()),
            Primitive::Int(value) => write!(f, "{}", value),
            Primitive::Key(key) => self.print_ast(f, *key, indent, is_dedupe_var),
        }
    }
}

impl Default for Printer {
    fn default() -> Self {
        Self {
            builder: AstBuilder::default(),
        }
    }
}

impl Printer {
    pub fn print_operation(&mut self, schema: &Schema, operation: &OperationDefinition) -> String {
        let key = build_operation(schema, &mut self.builder, operation).0;
        let root = self.builder.lookup(key);
        let mut result = String::new();
        self.print(&mut result, root, 0).unwrap();
        result
    }

    pub fn print_fragment(&mut self, schema: &Schema, fragment: &FragmentDefinition) -> String {
        let key = build_fragment(schema, &mut self.builder, fragment).0;
        let root = self.builder.lookup(key);
        let mut result = String::new();
        self.print(&mut result, root, 0).unwrap();
        result
    }

    pub fn print_operation_deduped(
        &mut self,
        schema: &Schema,
        operation: &OperationDefinition,
    ) -> String {
        let (key, duplicates) = build_operation(schema, &mut self.builder, operation);
        if duplicates.is_empty() {
            let root = self.builder.lookup(key);
            let mut result = String::new();
            self.print(&mut result, root, 0).unwrap();
            result
        } else {
            let deduped_printer = DedupedJSONPrinter::new(duplicates, &self.builder, key);
            deduped_printer.print()
        }
    }

    pub fn print_fragment_deduped(
        &mut self,
        schema: &Schema,
        fragment: &FragmentDefinition,
    ) -> String {
        let (key, duplicates) = build_fragment(schema, &mut self.builder, fragment);
        if duplicates.is_empty() {
            let root = self.builder.lookup(key);
            let mut result = String::new();
            self.print(&mut result, root, 0).unwrap();
            result
        } else {
            let deduped_printer = DedupedJSONPrinter::new(duplicates, &self.builder, key);
            deduped_printer.print()
        }
    }

    fn print<W: Write>(&self, f: &mut W, ast: &Ast, indent: usize) -> FmtResult {
        match ast {
            Ast::Object(object) => {
                if object.is_empty() {
                    write!(f, "{{}}")
                } else {
                    let next_indent = indent + 1;
                    writeln!(f, "{{")?;
                    for (i, (key, value)) in object.iter().enumerate() {
                        print_indentation(f, next_indent)?;
                        write!(f, "\"{}\": ", key.lookup(),)?;
                        self.print_primitive(f, value, next_indent)?;
                        if i < object.len() - 1 {
                            writeln!(f, ",")?;
                        } else {
                            writeln!(f)?;
                        }
                    }
                    print_indentation(f, indent)?;
                    write!(f, "}}")
                }
            }
            Ast::Array(array) => {
                if array.is_empty() {
                    write!(f, "[]")
                } else {
                    writeln!(f, "[")?;
                    let next_indent = indent + 1;
                    for (i, value) in array.iter().enumerate() {
                        print_indentation(f, indent + 1)?;
                        self.print_primitive(f, value, next_indent)?;
                        if i < array.len() - 1 {
                            writeln!(f, ",")?;
                        } else {
                            writeln!(f)?;
                        }
                    }
                    print_indentation(f, indent)?;
                    write!(f, "]")
                }
            }
        }
    }

    fn print_primitive<W: Write>(
        &self,
        f: &mut W,
        primitive: &Primitive,
        indent: usize,
    ) -> FmtResult {
        match primitive {
            Primitive::Null => write!(f, "null"),
            Primitive::Bool(b) => write!(f, "{}", if *b { "true" } else { "false" }),
            Primitive::String(key) => write!(f, "\"{}\"", key),
            Primitive::Float(value) => write!(f, "{}", value.as_float()),
            Primitive::Int(value) => write!(f, "{}", value),
            Primitive::Key(key) => self.print(f, self.builder.lookup(*key), indent),
        }
    }
}

fn print_indentation<W: Write>(dest_buffer: &mut W, indent: usize) -> FmtResult {
    for _ in 0..indent {
        write!(dest_buffer, "  ")?;
    }
    Ok(())
}
