/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use interner::StringKey;
use std::fmt::{Result, Write};

#[derive(Debug, Clone)]
pub enum AST {
    Union(Vec<AST>),
    Intersection(Vec<AST>),
    ReadOnlyArray(Box<AST>),
    Nullable(Box<AST>),
    Identifier(StringKey),
    String,
    StringLiteral(StringKey),
    ExactObject(Vec<Prop>),
    InexactObject(Vec<Prop>),
    Number,
    Boolean,
    Any,
    TODO(String),
}

#[derive(Debug, Clone)]
pub struct Prop {
    pub key: StringKey,
    pub value: AST,
    pub read_only: bool,
    pub optional: bool,
    pub other_comment: bool,
}

pub fn print_type(ast: &AST) -> String {
    let mut printer = Printer {
        writer: String::new(),
        indentation: 0,
    };
    printer.write(ast).unwrap();
    printer.writer
}

struct Printer<W: Write> {
    writer: W,
    indentation: u32,
}
impl<W: Write> Printer<W> {
    fn write(&mut self, ast: &AST) -> Result {
        match ast {
            AST::Any => write!(self.writer, "any")?,
            AST::String => write!(self.writer, "string")?,
            AST::StringLiteral(literal) => self.write_string_literal(*literal)?,
            AST::Number => write!(self.writer, "number")?,
            AST::Boolean => write!(self.writer, "boolean")?,
            AST::Identifier(identifier) => write!(self.writer, "{}", identifier)?,
            AST::Union(members) => self.write_union(members)?,
            AST::Intersection(members) => self.write_intersection(members)?,
            AST::ReadOnlyArray(of_type) => self.write_read_only_array(of_type)?,
            AST::Nullable(of_type) => self.write_nullable(of_type)?,
            AST::ExactObject(props) => self.write_object(props, true)?,
            AST::InexactObject(props) => self.write_object(props, false)?,
            AST::TODO(msg) => write!(self.writer, "%TODO({})%", msg)?,
        }
        Ok(())
    }

    fn write_indentation(&mut self) -> Result {
        for _ in 0..self.indentation {
            write!(self.writer, "  ")?;
        }
        Ok(())
    }

    fn write_string_literal(&mut self, literal: StringKey) -> Result {
        write!(self.writer, "\"{}\"", literal)
    }

    fn write_union(&mut self, members: &[AST]) -> Result {
        let mut first = true;
        for member in members {
            if first {
                first = false;
            } else {
                write!(self.writer, " | ")?;
            }
            self.write(member)?;
        }
        Ok(())
    }

    fn write_intersection(&mut self, members: &[AST]) -> Result {
        let mut first = true;
        for member in members {
            if first {
                first = false;
            } else {
                write!(self.writer, " & ")?;
            }
            self.write(member)?;
        }
        Ok(())
    }

    fn write_read_only_array(&mut self, of_type: &AST) -> Result {
        write!(self.writer, "$ReadOnlyArray<")?;
        self.write(of_type)?;
        write!(self.writer, ">")
    }

    fn write_nullable(&mut self, of_type: &AST) -> Result {
        write!(self.writer, "?")?;
        match of_type {
            AST::Union(members) if members.len() > 1 => {
                write!(self.writer, "(")?;
                self.write(of_type)?;
                write!(self.writer, ")")?;
            }
            _ => {
                self.write(of_type)?;
            }
        }
        Ok(())
    }

    fn write_object(&mut self, props: &[Prop], exact: bool) -> Result {
        if props.is_empty() && exact {
            write!(self.writer, "{{||}}")?;
            return Ok(());
        }
        if exact {
            writeln!(self.writer, "{{|")?;
        } else {
            writeln!(self.writer, "{{")?;
        }
        self.indentation += 1;
        let mut first = true;
        for prop in props {
            self.write_indentation()?;
            if prop.other_comment {
                writeln!(
                    self.writer,
                    "// This will never be '%other', but we need some"
                )?;
                self.write_indentation()?;
                writeln!(
                    self.writer,
                    "// value in case none of the concrete values match."
                )?;
                self.write_indentation()?;
            }
            if prop.read_only {
                write!(self.writer, "+")?;
            }
            write!(self.writer, "{}", prop.key)?;
            if prop.optional {
                write!(self.writer, "?")?;
            }
            write!(self.writer, ": ")?;
            self.write(&prop.value)?;
            if first && props.len() == 1 && exact {
                writeln!(self.writer)?;
            } else {
                writeln!(self.writer, ",")?;
            }
            first = false;
        }
        if !exact {
            self.write_indentation()?;
            writeln!(self.writer, "...")?;
        }
        self.indentation -= 1;
        self.write_indentation()?;
        if exact {
            write!(self.writer, "|}}")?;
        } else {
            write!(self.writer, "}}")?;
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use interner::Intern;

    #[test]
    fn scalar_types() {
        assert_eq!(print_type(&AST::Any), "any".to_string());
        assert_eq!(print_type(&AST::String), "string".to_string());
        assert_eq!(print_type(&AST::Number), "number".to_string());
    }

    #[test]
    fn union_type() {
        assert_eq!(
            print_type(&AST::Union(vec![AST::String, AST::Number])),
            "string | number".to_string()
        );
    }

    #[test]
    fn read_only_array_type() {
        assert_eq!(
            print_type(&AST::ReadOnlyArray(Box::new(AST::String))),
            "$ReadOnlyArray<string>".to_string()
        );
    }

    #[test]
    fn nullable_type() {
        assert_eq!(
            print_type(&AST::Nullable(Box::new(AST::String))),
            "?string".to_string()
        );

        assert_eq!(
            print_type(&AST::Nullable(Box::new(AST::Union(vec![
                AST::String,
                AST::Number,
            ])))),
            "?(string | number)"
        )
    }

    #[test]
    fn exact_object() {
        assert_eq!(
            print_type(&AST::ExactObject(Vec::new())),
            r"{||}".to_string()
        );

        assert_eq!(
            print_type(&AST::ExactObject(vec![Prop {
                key: "single".intern(),
                optional: false,
                read_only: false,
                other_comment: false,
                value: AST::String,
            },])),
            r"{|
  single: string
|}"
            .to_string()
        );
        assert_eq!(
            print_type(&AST::ExactObject(vec![
                Prop {
                    key: "foo".intern(),
                    optional: true,
                    other_comment: false,
                    read_only: false,
                    value: AST::String,
                },
                Prop {
                    key: "bar".intern(),
                    optional: false,
                    read_only: true,
                    other_comment: false,
                    value: AST::Number,
                },
            ])),
            r"{|
  foo?: string,
  +bar: number,
|}"
            .to_string()
        );
    }

    #[test]
    fn nested_object() {
        assert_eq!(
            print_type(&AST::ExactObject(vec![
                Prop {
                    key: "foo".intern(),
                    optional: true,
                    other_comment: false,
                    read_only: false,
                    value: AST::ExactObject(vec![
                        Prop {
                            key: "nested_foo".intern(),
                            optional: true,
                            other_comment: false,
                            read_only: false,
                            value: AST::String,
                        },
                        Prop {
                            key: "nested_foo2".intern(),
                            optional: false,
                            other_comment: false,
                            read_only: true,
                            value: AST::Number,
                        },
                    ]),
                },
                Prop {
                    key: "bar".intern(),
                    optional: false,
                    other_comment: false,
                    read_only: true,
                    value: AST::Number,
                },
            ])),
            r"{|
  foo?: {|
    nested_foo?: string,
    +nested_foo2: number,
  |},
  +bar: number,
|}"
            .to_string()
        );
    }

    #[test]
    fn inexact_object() {
        assert_eq!(
            print_type(&AST::InexactObject(Vec::new())),
            r"{
  ...
}"
            .to_string()
        );

        assert_eq!(
            print_type(&AST::InexactObject(vec![Prop {
                key: "single".intern(),
                optional: false,
                other_comment: false,
                read_only: false,
                value: AST::String,
            },])),
            r"{
  single: string,
  ...
}"
            .to_string()
        );

        assert_eq!(
            print_type(&AST::InexactObject(vec![
                Prop {
                    key: "foo".intern(),
                    optional: false,
                    other_comment: false,
                    read_only: false,
                    value: AST::String,
                },
                Prop {
                    key: "bar".intern(),
                    optional: true,
                    other_comment: false,
                    read_only: true,
                    value: AST::Number,
                }
            ])),
            r"{
  foo: string,
  +bar?: number,
  ...
}"
            .to_string()
        );
    }

    #[test]
    fn other_comment() {
        assert_eq!(
            print_type(&AST::ExactObject(vec![Prop {
                key: "with_comment".intern(),
                optional: false,
                read_only: false,
                other_comment: true,
                value: AST::String,
            },])),
            r"{|
  // This will never be '%other', but we need some
  // value in case none of the concrete values match.
  with_comment: string
|}"
            .to_string()
        );
    }
}
