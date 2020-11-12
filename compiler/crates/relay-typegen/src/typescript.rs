/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::writer::{Prop, Writer, AST, SPREAD_KEY};
use interner::{Intern, StringKey};
use std::fmt::{Result, Write};

pub struct TypeScriptPrinter {
    indentation: u32,
}

impl Writer for TypeScriptPrinter {
    fn write_ast(&mut self, ast: &AST) -> String {
        let mut writer = String::new();
        self.write(&mut writer, ast)
            .expect("Expected Ok result from writing TypeScript code");

        writer
    }
}

impl TypeScriptPrinter {
    pub fn new() -> Self {
        Self { indentation: 0 }
    }

    fn write(&mut self, writer: &mut dyn Write, ast: &AST) -> Result {
        match ast {
            AST::Any => write!(writer, "any")?,
            AST::String => write!(writer, "string")?,
            AST::StringLiteral(literal) => self.write_string_literal(writer, *literal)?,
            AST::OtherEnumValue => self.write_other_string(writer)?,
            AST::Number => write!(writer, "number")?,
            AST::Boolean => write!(writer, "boolean")?,
            AST::Identifier(identifier) => write!(writer, "{}", identifier)?,
            AST::RawType(raw) => write!(writer, "{}", raw)?,
            AST::Union(members) => self.write_union(writer, members)?,
            AST::Intersection(members) => self.write_intersection(writer, members)?,
            AST::ReadOnlyArray(of_type) => self.write_read_only_array(writer, of_type)?,
            AST::Nullable(of_type) => self.write_nullable(writer, of_type)?,
            AST::ExactObject(props) => self.write_object(writer, props, true)?,
            AST::InexactObject(props) => self.write_object(writer, props, false)?,
            AST::Local3DPayload(document_name, selections) => {
                self.write_local_3d_payload(writer, *document_name, selections)?
            }
            AST::ImportType(types, from) => self.write_import_type(writer, types, from)?,
            AST::DeclareExportOpaqueType(alias, value) => {
                self.write_declare_export_opaque_type(writer, alias, value)?
            }
            AST::ExportTypeEquals(name, value) => {
                self.write_export_type_equals(writer, name, value)?
            }
            AST::ExportList(names) => self.write_export_list(writer, names)?,
        }

        Ok(())
    }

    fn write_indentation(&mut self, writer: &mut dyn Write) -> Result {
        for _ in 0..self.indentation {
            write!(writer, "  ")?;
        }
        Ok(())
    }

    fn write_string_literal(&mut self, writer: &mut dyn Write, literal: StringKey) -> Result {
        write!(writer, "\"{}\"", literal)
    }

    fn write_other_string(&mut self, writer: &mut dyn Write) -> Result {
        write!(writer, r#""%other""#)
    }

    fn write_and_wrap_union(&mut self, writer: &mut dyn Write, ast: &AST) -> Result {
        match ast {
            AST::Union(members) if members.len() > 1 => {
                write!(writer, "(")?;
                self.write_union(writer, members)?;
                write!(writer, ")")?;
            }
            _ => {
                self.write(writer, ast)?;
            }
        }

        Ok(())
    }

    fn write_union(&mut self, writer: &mut dyn Write, members: &[AST]) -> Result {
        let mut first = true;
        for member in members {
            if first {
                first = false;
            } else {
                write!(writer, " | ")?;
            }
            self.write(writer, member)?;
        }
        Ok(())
    }

    fn write_intersection(&mut self, writer: &mut dyn Write, members: &[AST]) -> Result {
        let mut first = true;
        for member in members {
            if first {
                first = false;
            } else {
                write!(writer, " & ")?;
            }

            self.write_and_wrap_union(writer, member)?;
        }
        Ok(())
    }

    fn write_read_only_array(&mut self, writer: &mut dyn Write, of_type: &AST) -> Result {
        write!(writer, "ReadonlyArray<")?;
        self.write(writer, of_type)?;
        write!(writer, ">")
    }

    fn write_nullable(&mut self, writer: &mut dyn Write, of_type: &AST) -> Result {
        let null_type = AST::RawType("null".intern());
        if let AST::Union(members) = of_type {
            let mut new_members = Vec::with_capacity(members.len() + 1);
            new_members.extend_from_slice(members);
            new_members.push(null_type);
            self.write_union(writer, &*new_members)?;
        } else {
            self.write_union(writer, &*vec![of_type.clone(), null_type])?;
        }
        Ok(())
    }

    fn write_object(&mut self, writer: &mut dyn Write, props: &[Prop], exact: bool) -> Result {
        if props.is_empty() {
            write!(writer, "{{}}")?;
            return Ok(());
        }

        // Replication of babel printer oddity: objects only containing a spread
        // are missing a newline.
        if props.len() == 1 && props[0].key == *SPREAD_KEY {
            write!(writer, "{{}}")?;
            return Ok(());
        }

        writeln!(writer, "{{")?;
        self.indentation += 1;

        let mut first = true;
        for prop in props {
            if prop.key == *SPREAD_KEY {
                continue;
            }

            self.write_indentation(writer)?;
            if let AST::OtherEnumValue = prop.value {
                writeln!(writer, "// This will never be '%other', but we need some")?;
                self.write_indentation(writer)?;
                writeln!(
                    writer,
                    "// value in case none of the concrete values match."
                )?;
                self.write_indentation(writer)?;
            }
            if prop.read_only {
                write!(writer, "readonly ")?;
            }
            write!(writer, "{}", prop.key)?;
            if match &prop.value {
                AST::Nullable(_) => true,
                _ => prop.optional,
            } {
                write!(writer, "?")?;
            }
            write!(writer, ": ")?;
            self.write(
                writer,
                if let AST::Nullable(value) = &prop.value {
                    value
                } else {
                    &prop.value
                },
            )?;
            if first && props.len() == 1 && exact {
                writeln!(writer)?;
            } else {
                writeln!(writer, ",")?;
            }
            first = false;
        }
        self.indentation -= 1;
        self.write_indentation(writer)?;
        write!(writer, "}}")?;
        Ok(())
    }

    fn write_local_3d_payload(
        &mut self,
        writer: &mut dyn Write,
        document_name: StringKey,
        selections: &AST,
    ) -> Result {
        write!(writer, "Local3DPayload<\"{}\", ", document_name)?;
        self.write(writer, selections)?;
        write!(writer, ">")?;
        Ok(())
    }

    fn write_import_type(
        &mut self,
        writer: &mut dyn Write,
        types: &Vec<StringKey>,
        from: &StringKey,
    ) -> Result {
        write!(
            writer,
            "import {{ {} }} from \"{}\";",
            types
                .iter()
                .map(|t| format!("{}", t))
                .collect::<Vec<_>>()
                .join(", "),
            from
        )
    }

    fn write_declare_export_opaque_type(
        &mut self,
        writer: &mut dyn Write,
        alias: &StringKey,
        value: &StringKey,
    ) -> Result {
        write!(
            writer,
            "export type {} = {} & {{ _: \"{}\" }};",
            alias, value, alias
        )
    }

    fn write_export_type_equals(
        &mut self,
        writer: &mut dyn Write,
        name: &StringKey,
        value: &AST,
    ) -> Result {
        write!(writer, "export type {} = {};", name, self.write_ast(value))
    }

    fn write_export_list(&mut self, writer: &mut dyn Write, names: &Vec<StringKey>) -> Result {
        write!(
            writer,
            "export {{ {} }};",
            names
                .iter()
                .map(|t| format!("{}", t))
                .collect::<Vec<_>>()
                .join(", "),
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use interner::Intern;

    fn print_type(ast: &AST) -> String {
        TypeScriptPrinter::new().write_ast(ast)
    }

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
            "ReadonlyArray<string>".to_string()
        );
    }

    #[test]
    fn nullable_type() {
        assert_eq!(
            print_type(&AST::Nullable(Box::new(AST::String))),
            "string | null".to_string()
        );

        assert_eq!(
            print_type(&AST::Nullable(Box::new(AST::Union(vec![
                AST::String,
                AST::Number,
            ])))),
            "string | number | null"
        )
    }

    #[test]
    fn intersections() {
        assert_eq!(
            print_type(&AST::Intersection(vec![
                AST::ExactObject(vec![Prop {
                    key: "first".intern(),
                    optional: false,
                    read_only: false,
                    value: AST::String
                }]),
                AST::ExactObject(vec![Prop {
                    key: "second".intern(),
                    optional: false,
                    read_only: false,
                    value: AST::Number
                }]),
            ])),
            r"{
  first: string
} & {
  second: number
}"
        );

        assert_eq!(
            print_type(&AST::Intersection(vec![
                AST::Union(vec![
                    AST::ExactObject(vec![Prop {
                        key: "first".intern(),
                        optional: false,
                        read_only: false,
                        value: AST::String
                    }]),
                    AST::ExactObject(vec![Prop {
                        key: "second".intern(),
                        optional: false,
                        read_only: false,
                        value: AST::Number
                    }]),
                ]),
                AST::ExactObject(vec![Prop {
                    key: "third".intern(),
                    optional: false,
                    read_only: false,
                    value: AST::Number
                }]),
            ],)),
            r"({
  first: string
} | {
  second: number
}) & {
  third: number
}"
        );
    }

    #[test]
    fn exact_object() {
        assert_eq!(print_type(&AST::ExactObject(Vec::new())), r"{}".to_string());

        assert_eq!(
            print_type(&AST::ExactObject(vec![Prop {
                key: "single".intern(),
                optional: false,
                read_only: false,
                value: AST::String,
            },])),
            r"{
  single: string
}"
            .to_string()
        );
        assert_eq!(
            print_type(&AST::ExactObject(vec![
                Prop {
                    key: "foo".intern(),
                    optional: true,
                    read_only: false,
                    value: AST::String,
                },
                Prop {
                    key: "bar".intern(),
                    optional: false,
                    read_only: true,
                    value: AST::Number,
                },
            ])),
            r"{
  foo?: string,
  readonly bar: number,
}"
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
                    read_only: false,
                    value: AST::ExactObject(vec![
                        Prop {
                            key: "nested_foo".intern(),
                            optional: true,
                            read_only: false,
                            value: AST::String,
                        },
                        Prop {
                            key: "nested_foo2".intern(),
                            optional: false,
                            read_only: true,
                            value: AST::Number,
                        },
                    ]),
                },
                Prop {
                    key: "bar".intern(),
                    optional: false,
                    read_only: true,
                    value: AST::Number,
                },
            ])),
            r"{
  foo?: {
    nested_foo?: string,
    readonly nested_foo2: number,
  },
  readonly bar: number,
}"
            .to_string()
        );
    }

    #[test]
    fn inexact_object() {
        assert_eq!(
            print_type(&AST::InexactObject(Vec::new())),
            "{}".to_string()
        );

        assert_eq!(
            print_type(&AST::InexactObject(vec![Prop {
                key: "single".intern(),
                optional: false,
                read_only: false,
                value: AST::String,
            },])),
            r"{
  single: string,
}"
            .to_string()
        );

        assert_eq!(
            print_type(&AST::InexactObject(vec![
                Prop {
                    key: "foo".intern(),
                    optional: false,
                    read_only: false,
                    value: AST::String,
                },
                Prop {
                    key: "bar".intern(),
                    optional: true,
                    read_only: true,
                    value: AST::Number,
                }
            ])),
            r"{
  foo: string,
  readonly bar?: number,
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
                value: AST::OtherEnumValue,
            },])),
            r#"{
  // This will never be '%other', but we need some
  // value in case none of the concrete values match.
  with_comment: "%other"
}"#
            .to_string()
        );
    }
}
