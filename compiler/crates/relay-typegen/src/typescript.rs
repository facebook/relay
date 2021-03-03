/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::writer::{Prop, Writer, AST, SPREAD_KEY};
use crate::TypegenConfig;
use crate::{KEY_DATA, KEY_FRAGMENT_REFS, KEY_REF_TYPE};
use interner::{Intern, StringKey};
use std::fmt::{Result, Write};

pub struct TypeScriptPrinter {
    use_import_type_syntax: bool,
    indentation: usize,
}

impl Writer for TypeScriptPrinter {
    fn get_runtime_fragment_import(&self) -> StringKey {
        "FragmentRefs".intern()
    }

    fn write(&mut self, writer: &mut dyn Write, ast: &AST) -> Result {
        match ast {
            AST::Any => write!(writer, "any"),
            AST::String => write!(writer, "string"),
            AST::StringLiteral(literal) => self.write_string_literal(writer, *literal),
            AST::OtherTypename => self.write_other_string(writer),
            AST::Number => write!(writer, "number"),
            AST::Boolean => write!(writer, "boolean"),
            AST::Identifier(identifier) => write!(writer, "{}", identifier),
            AST::RawType(raw) => write!(writer, "{}", raw),
            AST::Union(members) => self.write_union(writer, members),
            AST::ReadOnlyArray(of_type) => self.write_read_only_array(writer, of_type),
            AST::Nullable(of_type) => self.write_nullable(writer, of_type),
            AST::ExactObject(props) => self.write_object(writer, props, true),
            AST::InexactObject(props) => self.write_object(writer, props, false),
            AST::Local3DPayload(document_name, selections) => {
                self.write_local_3d_payload(writer, *document_name, selections)
            }
            AST::DefineType(name, value) => self.write_type_definition(writer, name, value),
            AST::ImportType(types, from) => self.write_import_type(writer, types, from),
            AST::ExportTypeEquals(name, value) => {
                self.write_export_type_equals(writer, name, value)
            }
            AST::FragmentReference(fragments) => self.write_fragment_references(writer, fragments),

            // In Typescript, we don't export & import fragments. We just use the generic FragmentRefs type instead.
            AST::ExportFragmentList(_) => Ok(()),
            AST::DeclareExportFragment(_, _) => Ok(()),
            AST::ImportFragmentType(_, _) => Ok(()),
        }
    }
}

impl TypeScriptPrinter {
    pub fn new(config: &TypegenConfig) -> Self {
        Self {
            indentation: 0,
            use_import_type_syntax: config.use_import_type_syntax,
        }
    }

    fn write_indentation(&mut self, writer: &mut dyn Write) -> Result {
        writer.write_str(&"  ".repeat(self.indentation))
    }

    fn write_string_literal(&mut self, writer: &mut dyn Write, literal: StringKey) -> Result {
        write!(writer, "\"{}\"", literal)
    }

    fn write_other_string(&mut self, writer: &mut dyn Write) -> Result {
        write!(writer, r#""%other""#)
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
            if let AST::OtherTypename = prop.value {
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
            write!(
                writer,
                "{}",
                if prop.key == *KEY_FRAGMENT_REFS {
                    format!("\" {}\"", *KEY_FRAGMENT_REFS).intern()
                } else if prop.key == *KEY_REF_TYPE {
                    format!("\" {}\"", *KEY_REF_TYPE).intern()
                } else if prop.key == *KEY_DATA {
                    format!("\" {}\"", *KEY_DATA).intern()
                } else {
                    prop.key
                }
            )?;
            if prop.optional {
                write!(writer, "?")?;
            }
            write!(writer, ": ")?;
            self.write(writer, &prop.value)?;
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

    fn write_fragment_references(
        &mut self,
        writer: &mut dyn Write,
        fragments: &[StringKey],
    ) -> Result {
        write!(writer, "FragmentRefs<")?;
        self.write(
            writer,
            &AST::Union(
                fragments
                    .iter()
                    .map(|key| AST::StringLiteral(*key))
                    .collect(),
            ),
        )?;
        write!(writer, ">")
    }

    fn write_import_type(
        &mut self,
        writer: &mut dyn Write,
        types: &[StringKey],
        from: &StringKey,
    ) -> Result {
        writeln!(
            writer,
            "import {}{{ {} }} from \"{}\";",
            if self.use_import_type_syntax {
                "type "
            } else {
                ""
            },
            types
                .iter()
                .map(|t| format!("{}", t))
                .collect::<Vec<_>>()
                .join(", "),
            from
        )
    }

    fn write_type_definition(
        &mut self,
        writer: &mut dyn Write,
        name: &StringKey,
        value: &AST,
    ) -> Result {
        write!(writer, "type {} = ", name)?;
        self.write(writer, value)?;
        writeln!(writer, ";")
    }

    fn write_export_type_equals(
        &mut self,
        writer: &mut dyn Write,
        name: &StringKey,
        value: &AST,
    ) -> Result {
        write!(writer, "export type {} = ", name)?;
        self.write(writer, value)?;
        writeln!(writer, ";")
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use interner::Intern;

    fn print_type(ast: &AST) -> String {
        print_type_with_config(ast, &Default::default())
    }

    fn print_type_with_config(ast: &AST, config: &TypegenConfig) -> String {
        let mut result = String::new();
        TypeScriptPrinter::new(config)
            .write(&mut result, ast)
            .unwrap();
        result
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
                value: AST::OtherTypename,
            },])),
            r#"{
  // This will never be '%other', but we need some
  // value in case none of the concrete values match.
  with_comment: "%other"
}"#
            .to_string()
        );
    }

    #[test]
    fn import_type() {
        assert_eq!(
            print_type(&AST::ImportType(
                vec!["A".intern(), "B".intern()],
                "module".intern()
            )),
            "import { A, B } from \"module\";\n"
        );

        assert_eq!(
            print_type_with_config(
                &AST::ImportType(vec!["C".intern()], "./foo".intern()),
                &TypegenConfig {
                    use_import_type_syntax: true,
                    ..Default::default()
                }
            ),
            "import type { C } from \"./foo\";\n"
        );
    }
}
