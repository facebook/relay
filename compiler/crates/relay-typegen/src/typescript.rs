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
    result: String,
    use_import_type_syntax: bool,
    indentation: usize,
}

impl Writer for TypeScriptPrinter {
    fn into_string(self: Box<Self>) -> String {
        self.result
    }

    fn get_runtime_fragment_import(&self) -> StringKey {
        "FragmentRefs".intern()
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
            AST::ExactObject(props) => self.write_object(props),
            AST::InexactObject(props) => self.write_object(props),
            AST::Local3DPayload(document_name, selections) => {
                self.write_local_3d_payload(*document_name, selections)
            }
            AST::FragmentReference(fragments) => self.write_fragment_references(fragments),
            AST::FragmentReferenceType(fragment) => self.write_fragment_references_type(*fragment),
            AST::FunctionReturnType(function_name) => {
                self.write_function_return_type(*function_name)
            }
            AST::ActorChangePoint(_) => panic!("Not supported yet"),
        }
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

    // In TypeScript, we don't need to import "any" fragment types, these are unused.
    fn write_any_type_definition(&mut self, _name: StringKey) -> Result {
        Ok(())
    }

    // In TypeScript, we don't export & import fragments. We just use the generic FragmentRefs type instead.
    fn write_import_fragment_type(&mut self, _types: &[StringKey], _from: StringKey) -> Result {
        Ok(())
    }

    fn write_export_fragment_type(&mut self, _old_name: StringKey, _new_name: StringKey) -> Result {
        Ok(())
    }

    fn write_export_fragment_types(
        &mut self,
        _old_fragment_type_name: StringKey,
        _new_fragment_type_name: StringKey,
    ) -> Result {
        Ok(())
    }
}

impl TypeScriptPrinter {
    pub fn new(config: &TypegenConfig) -> Self {
        Self {
            result: String::new(),
            indentation: 0,
            use_import_type_syntax: config.use_import_type_syntax,
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

    fn write_read_only_array(&mut self, of_type: &AST) -> Result {
        write!(&mut self.result, "ReadonlyArray<")?;
        self.write(of_type)?;
        write!(&mut self.result, ">")
    }

    fn write_nullable(&mut self, of_type: &AST) -> Result {
        let null_type = AST::RawType("null".intern());
        if let AST::Union(members) = of_type {
            let mut new_members = Vec::with_capacity(members.len() + 1);
            new_members.extend_from_slice(members);
            new_members.push(null_type);
            self.write_union(&*new_members)?;
        } else {
            self.write_union(&*vec![of_type.clone(), null_type])?;
        }
        Ok(())
    }

    fn write_object(&mut self, props: &[Prop]) -> Result {
        if props.is_empty() {
            write!(&mut self.result, "{{}}")?;
            return Ok(());
        }

        // Replication of babel printer oddity: objects only containing a spread
        // are missing a newline.
        if props.len() == 1 && props[0].key == *SPREAD_KEY {
            write!(&mut self.result, "{{}}")?;
            return Ok(());
        }

        writeln!(&mut self.result, "{{")?;
        self.indentation += 1;

        for prop in props {
            if prop.key == *SPREAD_KEY {
                continue;
            }

            self.write_indentation()?;
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
                write!(&mut self.result, "readonly ")?;
            }
            write!(
                &mut self.result,
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
                write!(&mut self.result, "?")?;
            }
            write!(&mut self.result, ": ")?;
            self.write(&prop.value)?;
            writeln!(&mut self.result, ";")?;
        }
        self.indentation -= 1;
        self.write_indentation()?;
        write!(&mut self.result, "}}")?;
        Ok(())
    }

    fn write_local_3d_payload(&mut self, document_name: StringKey, selections: &AST) -> Result {
        write!(&mut self.result, "Local3DPayload<\"{}\", ", document_name)?;
        self.write(selections)?;
        write!(&mut self.result, ">")?;
        Ok(())
    }

    fn write_fragment_references(&mut self, fragments: &[StringKey]) -> Result {
        write!(&mut self.result, "FragmentRefs<")?;
        self.write(&AST::Union(
            fragments
                .iter()
                .map(|key| AST::StringLiteral(*key))
                .collect(),
        ))?;
        write!(&mut self.result, ">")
    }

    fn write_fragment_references_type(&mut self, fragment: StringKey) -> Result {
        self.write(&AST::StringLiteral(fragment))
    }

    fn write_function_return_type(&mut self, function_name: StringKey) -> Result {
        write!(&mut self.result, "ReturnType<typeof {}>", function_name)
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
        let mut printer = Box::new(TypeScriptPrinter::new(config));
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
  single: string;
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
  foo?: string;
  readonly bar: number;
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
    nested_foo?: string;
    readonly nested_foo2: number;
  };
  readonly bar: number;
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
  single: string;
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
  foo: string;
  readonly bar?: number;
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
  with_comment: "%other";
}"#
            .to_string()
        );
    }

    #[test]
    fn import_type() {
        let mut printer = Box::new(TypeScriptPrinter::new(&TypegenConfig::default()));
        printer
            .write_import_type(&["A".intern(), "B".intern()], "module".intern())
            .unwrap();
        assert_eq!(printer.into_string(), "import { A, B } from \"module\";\n");

        let mut printer = Box::new(TypeScriptPrinter::new(&TypegenConfig {
            use_import_type_syntax: true,
            ..Default::default()
        }));
        printer
            .write_import_type(&["C".intern()], "./foo".intern())
            .unwrap();
        assert_eq!(printer.into_string(), "import type { C } from \"./foo\";\n");
    }

    #[test]
    fn import_module() {
        let mut printer = Box::new(TypeScriptPrinter::new(&TypegenConfig::default()));
        printer
            .write_import_module_default("A".intern(), "module".intern())
            .unwrap();
        assert_eq!(printer.into_string(), "import A from \"module\";\n");
    }

    #[test]
    fn function_return_type() {
        assert_eq!(
            print_type(&AST::FunctionReturnType("someFunc".intern(),)),
            "ReturnType<typeof someFunc>".to_string()
        );
    }
}
