/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::ast::{Ast, AstBuilder, Primitive};
use crate::build_ast::build_operation;

use graphql_ir::OperationDefinition;
use schema::Schema;

use std::fmt::{Result as FmtResult, Write};

pub struct Printer {
    builder: AstBuilder,
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
        let key = build_operation(schema, &mut self.builder, operation);
        let root = self.builder.lookup(key);
        let mut result = String::new();
        self.print(&mut result, root, 0).unwrap();
        result
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
