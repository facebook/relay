/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::writer::{Prop, Writer, AST, SPREAD_KEY};
use interner::{Intern, StringKey};
use lazy_static::lazy_static;
use std::fmt::{Result, Write};

pub struct FlowPrinter {
    result: String,
    indentation: usize,
}

lazy_static! {
    static ref FRAGMENT_REFERENCE: StringKey = "FragmentReference".intern();
}

impl Writer for FlowPrinter {
    fn into_string(self: Box<Self>) -> String {
        self.result
    }

    fn write(&mut self, ast: &AST) -> Result {
        match ast {
            AST::Any => write!(&mut self.result, "any"),
            AST::String => write!(&mut self.result, "string"),
            AST::StringLiteral(literal) => self.write_string_literal(*literal),
            AST::OtherTypename => self.write_other_string(),
            AST::Number => write!(&mut self.result, "number"),
            AST::Boolean => write!(&mut self.result, "boolean"),
            AST::Identifier(identifier) => write!(&mut self.result, "{}", identifier),
            AST::RawType(raw) => write!(&mut self.result, "{}", raw),
            AST::Union(members) => self.write_union(members),
            AST::ReadOnlyArray(of_type) => self.write_read_only_array(of_type),
            AST::Nullable(of_type) => self.write_nullable(of_type),
            AST::ExactObject(props) => self.write_object(props, true),
            AST::InexactObject(props) => self.write_object(props, false),
            AST::Local3DPayload(document_name, selections) => {
                self.write_local_3d_payload(*document_name, selections)
            }
            AST::FragmentReference(fragments) => self.write_intersection(
                fragments
                    .iter()
                    .map(|fragment| AST::FragmentReferenceType(*fragment))
                    .collect::<Vec<_>>()
                    .as_slice(),
            ),
            AST::FragmentReferenceType(fragment) => {
                write!(&mut self.result, "{}$ref", fragment)
            }
            AST::FunctionReturnType(function_name) => {
                self.write_function_return_type(*function_name)
            }
            AST::ActorChangePoint(selections) => self.write_actor_change_point(selections),
        }
    }

    fn get_runtime_fragment_import(&self) -> StringKey {
        *FRAGMENT_REFERENCE
    }

    fn write_export_type(&mut self, name: StringKey, value: &AST) -> Result {
        write!(&mut self.result, "export type {} = ", name)?;
        self.write(value)?;
        writeln!(&mut self.result, ";")
    }

    fn write_import_module_default(&mut self, name: StringKey, from: StringKey) -> Result {
        writeln!(&mut self.result, "import {} from \"{}\";", name, from)
    }

    fn write_import_type(&mut self, types: &[StringKey], from: StringKey) -> Result {
        writeln!(
            &mut self.result,
            "import type {{ {} }} from \"{}\";",
            types
                .iter()
                .map(|t| format!("{}", t))
                .collect::<Vec<_>>()
                .join(", "),
            from
        )
    }

    fn write_import_fragment_type(&mut self, types: &[StringKey], from: StringKey) -> Result {
        self.write_import_type(types, from)
    }

    fn write_export_fragment_type(&mut self, old_name: StringKey, new_name: StringKey) -> Result {
        writeln!(
            &mut self.result,
            "declare export opaque type {old_name}: FragmentReference;
declare export opaque type {new_name}: {old_name};",
            old_name = old_name,
            new_name = new_name
        )
    }

    fn write_export_fragment_types(
        &mut self,
        old_fragment_type_name: StringKey,
        new_fragment_type_name: StringKey,
    ) -> Result {
        writeln!(
            &mut self.result,
            "export type {{ {}, {} }};",
            old_fragment_type_name, new_fragment_type_name
        )
    }

    fn write_any_type_definition(&mut self, name: StringKey) -> Result {
        writeln!(&mut self.result, "type {} = any;", name)
    }
}

impl FlowPrinter {
    pub fn new() -> Self {
        Self {
            result: String::new(),
            indentation: 0,
        }
    }

    fn write_indentation(&mut self) -> Result {
        self.result.write_str(&"  ".repeat(self.indentation))
    }

    fn write_string_literal(&mut self, literal: StringKey) -> Result {
        write!(&mut self.result, "\"{}\"", literal)
    }

    fn write_other_string(&mut self) -> Result {
        write!(&mut self.result, r#""%other""#)
    }

    fn write_union(&mut self, members: &[AST]) -> Result {
        let mut first = true;
        for member in members {
            if first {
                first = false;
            } else {
                write!(&mut self.result, " | ")?;
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
                write!(&mut self.result, " & ")?;
            }
            self.write(member)?;
        }
        Ok(())
    }

    fn write_read_only_array(&mut self, of_type: &AST) -> Result {
        write!(&mut self.result, "$ReadOnlyArray<")?;
        self.write(of_type)?;
        write!(&mut self.result, ">")
    }

    fn write_nullable(&mut self, of_type: &AST) -> Result {
        write!(&mut self.result, "?")?;
        match of_type {
            AST::Union(members) if members.len() > 1 => {
                write!(&mut self.result, "(")?;
                self.write(of_type)?;
                write!(&mut self.result, ")")?;
            }
            _ => {
                self.write(of_type)?;
            }
        }
        Ok(())
    }

    fn write_object(&mut self, props: &[Prop], exact: bool) -> Result {
        if props.is_empty() && exact {
            write!(&mut self.result, "{{||}}")?;
            return Ok(());
        }

        if exact {
            writeln!(&mut self.result, "{{|")?;
        } else {
            writeln!(&mut self.result, "{{")?;
        }
        self.indentation += 1;

        for prop in props {
            self.write_indentation()?;
            if prop.key == *SPREAD_KEY {
                write!(&mut self.result, "...")?;
                self.write(&prop.value)?;
                writeln!(&mut self.result, ",")?;
                continue;
            }
            if let AST::OtherTypename = prop.value {
                writeln!(
                    &mut self.result,
                    "// This will never be '%other', but we need some"
                )?;
                self.write_indentation()?;
                writeln!(
                    &mut self.result,
                    "// value in case none of the concrete values match."
                )?;
                self.write_indentation()?;
            }
            if prop.read_only {
                write!(&mut self.result, "+")?;
            }
            write!(&mut self.result, "{}", prop.key)?;
            if prop.optional {
                write!(&mut self.result, "?")?;
            }
            write!(&mut self.result, ": ")?;
            self.write(&prop.value)?;
            writeln!(&mut self.result, ",")?;
        }
        if !exact {
            self.write_indentation()?;
            writeln!(&mut self.result, "...")?;
        }
        self.indentation -= 1;
        self.write_indentation()?;
        if exact {
            write!(&mut self.result, "|}}")?;
        } else {
            write!(&mut self.result, "}}")?;
        }
        Ok(())
    }

    fn write_local_3d_payload(&mut self, document_name: StringKey, selections: &AST) -> Result {
        write!(&mut self.result, "Local3DPayload<\"{}\", ", document_name)?;
        self.write(selections)?;
        write!(&mut self.result, ">")?;
        Ok(())
    }

    fn write_function_return_type(&mut self, function_name: StringKey) -> Result {
        write!(
            &mut self.result,
            "$Call<<R>((...empty[]) => R) => R, typeof {}>",
            function_name
        )
    }

    fn write_actor_change_point(&mut self, selections: &AST) -> Result {
        write!(&mut self.result, "ActorChangePoint<")?;
        self.write(selections)?;
        write!(&mut self.result, ">")?;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use interner::Intern;

    fn print_type(ast: &AST) -> String {
        let mut printer = Box::new(FlowPrinter::new());
        printer.write(ast).unwrap();
        printer.into_string()
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
                value: AST::String,
            },])),
            r"{|
  single: string,
|}"
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
                value: AST::OtherTypename,
            },])),
            r#"{|
  // This will never be '%other', but we need some
  // value in case none of the concrete values match.
  with_comment: "%other",
|}"#
            .to_string()
        );
    }

    #[test]
    fn import_type() {
        let mut printer = Box::new(FlowPrinter::new());
        printer
            .write_import_type(&["A".intern(), "B".intern()], "module".intern())
            .unwrap();
        assert_eq!(
            printer.into_string(),
            "import type { A, B } from \"module\";\n"
        );
    }

    #[test]
    fn import_module() {
        let mut printer = Box::new(FlowPrinter::new());
        printer
            .write_import_module_default("A".intern(), "module".intern())
            .unwrap();
        assert_eq!(printer.into_string(), "import A from \"module\";\n");
    }

    #[test]
    fn function_return_type() {
        assert_eq!(
            print_type(&AST::FunctionReturnType("someFunc".intern(),)),
            "$Call<<R>((...empty[]) => R) => R, typeof someFunc>".to_string()
        );
    }
}
