/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::fmt::Result as FmtResult;
use std::fmt::Write;

use ::intern::string_key::StringKey;
use itertools::Itertools;

use crate::writer::FunctionTypeAssertion;
use crate::writer::KeyValuePairProp;
use crate::writer::Prop;
use crate::writer::Writer;
use crate::writer::AST;

pub struct FlowPrinter {
    result: String,
    indentation: usize,
}

impl Write for FlowPrinter {
    fn write_str(&mut self, s: &str) -> FmtResult {
        self.result.write_str(s)
    }
}

impl Writer for FlowPrinter {
    fn into_string(self: Box<Self>) -> String {
        self.result
    }

    fn write(&mut self, ast: &AST) -> FmtResult {
        match ast {
            AST::Any => write!(&mut self.result, "any"),
            AST::Mixed => write!(&mut self.result, "mixed"),
            AST::String => write!(&mut self.result, "string"),
            AST::StringLiteral(literal) => self.write_string_literal(**literal),
            AST::OtherTypename => self.write_other_string(),
            AST::Number => write!(&mut self.result, "number"),
            AST::Boolean => write!(&mut self.result, "boolean"),
            AST::Callable(return_type) => self.write_callable(return_type),
            AST::Identifier(identifier) => write!(&mut self.result, "{}", identifier),
            AST::RawType(raw) => write!(&mut self.result, "{}", raw),
            AST::Union(members) => self.write_union(members),
            AST::ReadOnlyArray(of_type) => self.write_read_only_array(of_type),
            AST::Nullable(of_type) => self.write_nullable(of_type),
            AST::NonNullable(of_type) => self.write_non_nullable(of_type),
            AST::ExactObject(props) => self.write_object(props, true),
            AST::InexactObject(props) => self.write_object(props, false),
            AST::Local3DPayload(document_name, selections) => {
                self.write_local_3d_payload(*document_name, selections)
            }
            AST::FragmentReference(fragments) => self.write_fragment_references(fragments),
            AST::FragmentReferenceType(fragment) => {
                write!(&mut self.result, "{}$fragmentType", fragment)
            }
            AST::ReturnTypeOfFunctionWithName(function_name) => {
                self.write_return_type_of_function_with_name(*function_name)
            }
            AST::ReturnTypeOfMethodCall(object, method_name) => {
                self.write_return_type_of_method_call(object, *method_name)
            }
            AST::ActorChangePoint(selections) => self.write_actor_change_point(selections),
            AST::AssertFunctionType(FunctionTypeAssertion {
                function_name,
                arguments,
                return_type,
            }) => self.write_assert_function_type(*function_name, arguments, return_type),
            AST::GenericType { outer, inner } => self.write_generic_type(*outer, inner),
            AST::PropertyType {
                type_,
                property_name,
            } => {
                self.write(type_)?;
                write!(&mut self.result, "['{}']", property_name)
            }
        }
    }

    fn get_runtime_fragment_import(&self) -> &'static str {
        "FragmentType"
    }

    fn write_type_assertion(&mut self, name: &str, value: &AST) -> FmtResult {
        write!(&mut self.result, "({}: ", name)?;
        self.write(value)?;
        writeln!(&mut self.result, ");")
    }

    fn write_export_type(&mut self, name: &str, value: &AST) -> FmtResult {
        write!(&mut self.result, "export type {} = ", name)?;
        self.write(value)?;
        writeln!(&mut self.result, ";")
    }

    fn write_import_module_default(&mut self, name: &str, from: &str) -> FmtResult {
        writeln!(&mut self.result, "import {} from \"{}\";", name, from)
    }

    fn write_import_module_named(
        &mut self,
        name: &str,
        import_as: Option<&str>,
        from: &str,
    ) -> FmtResult {
        let local_name = if let Some(import_as) = import_as {
            format!("{{{} as {}}}", name, import_as)
        } else {
            format!("{{{}}}", name)
        };
        self.write_import_module_default(&local_name, from)
    }

    fn write_import_type(&mut self, types: &[&str], from: &str) -> FmtResult {
        writeln!(
            &mut self.result,
            "import type {{ {} }} from \"{}\";",
            types.iter().format(", "),
            from
        )
    }

    fn write_import_fragment_type(&mut self, types: &[&str], from: &str) -> FmtResult {
        self.write_import_type(types, from)
    }

    fn write_export_fragment_type(&mut self, name: &str) -> FmtResult {
        writeln!(
            &mut self.result,
            "declare export opaque type {name}: FragmentType;",
            name = name
        )
    }

    fn write_export_fragment_types(
        &mut self,
        fragment_type_name_1: &str,
        fragment_type_name_2: &str,
    ) -> FmtResult {
        writeln!(
            &mut self.result,
            "export type {{ {}, {} }};",
            fragment_type_name_1, fragment_type_name_2
        )
    }

    fn write_any_type_definition(&mut self, name: &str) -> FmtResult {
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

    fn write_indentation(&mut self) -> FmtResult {
        self.result.write_str(&"  ".repeat(self.indentation))
    }

    fn write_string_literal(&mut self, literal: StringKey) -> FmtResult {
        write!(&mut self.result, "\"{}\"", literal)
    }

    fn write_other_string(&mut self) -> FmtResult {
        write!(&mut self.result, r#""%other""#)
    }

    fn write_union(&mut self, members: &[AST]) -> FmtResult {
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

    fn write_fragment_references(&mut self, fragments: &[StringKey]) -> FmtResult {
        let mut first = true;
        for fragment in fragments {
            if first {
                first = false;
            } else {
                write!(&mut self.result, " & ")?;
            }
            write!(&mut self.result, "{}$fragmentType", fragment)?;
        }
        Ok(())
    }

    fn write_read_only_array(&mut self, of_type: &AST) -> FmtResult {
        write!(&mut self.result, "$ReadOnlyArray<")?;
        self.write(of_type)?;
        write!(&mut self.result, ">")
    }

    fn write_non_nullable(&mut self, of_type: &AST) -> FmtResult {
        write!(&mut self.result, "$NonMaybeType<")?;
        self.write(of_type)?;
        write!(&mut self.result, ">")
    }

    fn write_nullable(&mut self, of_type: &AST) -> FmtResult {
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

    fn write_object(&mut self, props: &[Prop], exact: bool) -> FmtResult {
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
            match prop {
                Prop::Spread(spread) => {
                    write!(&mut self.result, "...")?;
                    self.write(&AST::Identifier(spread.value))?;
                    writeln!(&mut self.result, ",")?;
                    continue;
                }
                Prop::KeyValuePair(key_value_pair) => {
                    if let AST::OtherTypename = key_value_pair.value {
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
                    if key_value_pair.read_only {
                        write!(&mut self.result, "+")?;
                    }
                    write!(&mut self.result, "{}", key_value_pair.key)?;
                    if key_value_pair.optional {
                        write!(&mut self.result, "?")?;
                    }
                    write!(&mut self.result, ": ")?;
                    self.write(&key_value_pair.value)?;
                    writeln!(&mut self.result, ",")?;
                }
                Prop::GetterSetterPair(getter_setter_pair) => {
                    // Write the getter
                    write!(&mut self.result, "get ")?;
                    self.write(&AST::Identifier(getter_setter_pair.key))?;
                    write!(&mut self.result, "(): ")?;
                    self.write(&getter_setter_pair.getter_return_value)?;
                    writeln!(&mut self.result, ",")?;

                    // Write the setter
                    self.write_indentation()?;
                    write!(&mut self.result, "set ")?;
                    self.write(&AST::Identifier(getter_setter_pair.key))?;
                    write!(&mut self.result, "(value: ")?;
                    self.write(&getter_setter_pair.setter_parameter)?;
                    writeln!(&mut self.result, "): void,")?;
                }
            };
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

    fn write_local_3d_payload(&mut self, document_name: StringKey, selections: &AST) -> FmtResult {
        write!(&mut self.result, "Local3DPayload<\"{}\", ", document_name)?;
        self.write(selections)?;
        write!(&mut self.result, ">")?;
        Ok(())
    }

    fn write_return_type_of_function_with_name(&mut self, function_name: StringKey) -> FmtResult {
        write!(&mut self.result, "ReturnType<typeof {}>", function_name)
    }

    fn write_return_type_of_method_call(
        &mut self,
        object: &AST,
        method_name: StringKey,
    ) -> FmtResult {
        write!(&mut self.result, "ReturnType<")?;
        self.write(object)?;
        write!(&mut self.result, "[\"{}\"]>", method_name)
    }

    fn write_actor_change_point(&mut self, selections: &AST) -> FmtResult {
        write!(&mut self.result, "ActorChangePoint<")?;
        self.write(selections)?;
        write!(&mut self.result, ">")?;
        Ok(())
    }

    fn write_callable(&mut self, return_type: &AST) -> FmtResult {
        write!(&mut self.result, "() => ")?;
        self.write(return_type)
    }

    fn write_assert_function_type(
        &mut self,
        function_name: StringKey,
        arguments: &[KeyValuePairProp],
        return_type: &AST,
    ) -> FmtResult {
        writeln!(
            &mut self.result,
            "// Type assertion validating that `{}` resolver is correctly implemented.",
            function_name
        )?;
        writeln!(
            &mut self.result,
            "// A type error here indicates that the type signature of the resolver module is incorrect."
        )?;
        if arguments.is_empty() {
            write!(&mut self.result, "({}: (", function_name)?;
        } else {
            writeln!(&mut self.result, "({}: (", function_name)?;
            self.indentation += 1;
            for argument in arguments.iter() {
                self.write_indentation()?;
                write!(&mut self.result, "{}: ", argument.key)?;
                self.write(&argument.value)?;
                writeln!(&mut self.result, ",")?;
            }
            self.indentation -= 1;
        }
        write!(&mut self.result, ") => ")?;
        self.write(return_type)?;
        writeln!(&mut self.result, ");")?;

        Ok(())
    }

    fn write_generic_type(&mut self, outer: StringKey, inner: &[AST]) -> FmtResult {
        write!(&mut self.result, "{}<", outer)?;
        for (i, inner_type) in inner.iter().enumerate() {
            if i > 0 {
                write!(&mut self.result, ", ")?;
            }
            self.write(inner_type)?;
        }
        write!(&mut self.result, ">")
    }
}

#[cfg(test)]
mod tests {
    use intern::intern;

    use super::*;
    use crate::writer::ExactObject;
    use crate::writer::InexactObject;
    use crate::writer::KeyValuePairProp;
    use crate::writer::SortedASTList;

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
            print_type(&AST::Union(SortedASTList::new(vec![
                AST::String,
                AST::Number
            ],))),
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
            print_type(&AST::Nullable(Box::new(AST::Union(SortedASTList::new(
                vec![AST::String, AST::Number,],
            ))))),
            "?(string | number)"
        )
    }

    #[test]
    fn exact_object() {
        assert_eq!(
            print_type(&AST::ExactObject(ExactObject::new(Vec::new()))),
            r"{||}".to_string()
        );

        assert_eq!(
            print_type(&AST::ExactObject(ExactObject::new(vec![
                Prop::KeyValuePair(KeyValuePairProp {
                    key: intern!("single"),
                    optional: false,
                    read_only: false,
                    value: AST::String,
                }),
            ],))),
            r"{|
  single: string,
|}"
            .to_string()
        );
        assert_eq!(
            print_type(&AST::ExactObject(ExactObject::new(vec![
                Prop::KeyValuePair(KeyValuePairProp {
                    key: intern!("foo"),
                    optional: true,
                    read_only: false,
                    value: AST::String,
                }),
                Prop::KeyValuePair(KeyValuePairProp {
                    key: intern!("bar"),
                    optional: false,
                    read_only: true,
                    value: AST::Number,
                }),
            ],))),
            r"{|
  +bar: number,
  foo?: string,
|}"
            .to_string()
        );
    }

    #[test]
    fn nested_object() {
        assert_eq!(
            print_type(&AST::ExactObject(ExactObject::new(vec![
                Prop::KeyValuePair(KeyValuePairProp {
                    key: intern!("foo"),
                    optional: true,
                    read_only: false,
                    value: AST::ExactObject(ExactObject::new(vec![
                        Prop::KeyValuePair(KeyValuePairProp {
                            key: intern!("nested_foo"),
                            optional: true,
                            read_only: false,
                            value: AST::String,
                        }),
                        Prop::KeyValuePair(KeyValuePairProp {
                            key: intern!("nested_foo2"),
                            optional: false,
                            read_only: true,
                            value: AST::Number,
                        }),
                    ],)),
                }),
                Prop::KeyValuePair(KeyValuePairProp {
                    key: intern!("bar"),
                    optional: false,
                    read_only: true,
                    value: AST::Number,
                }),
            ],))),
            r"{|
  +bar: number,
  foo?: {|
    nested_foo?: string,
    +nested_foo2: number,
  |},
|}"
            .to_string()
        );
    }

    #[test]
    fn inexact_object() {
        assert_eq!(
            print_type(&AST::InexactObject(InexactObject::new(Vec::new()))),
            r"{
  ...
}"
            .to_string()
        );

        assert_eq!(
            print_type(&AST::InexactObject(InexactObject::new(vec![
                Prop::KeyValuePair(KeyValuePairProp {
                    key: intern!("single"),
                    optional: false,
                    read_only: false,
                    value: AST::String,
                }),
            ]))),
            r"{
  single: string,
  ...
}"
            .to_string()
        );

        assert_eq!(
            print_type(&AST::InexactObject(InexactObject::new(vec![
                Prop::KeyValuePair(KeyValuePairProp {
                    key: intern!("foo"),
                    optional: false,
                    read_only: false,
                    value: AST::String,
                }),
                Prop::KeyValuePair(KeyValuePairProp {
                    key: intern!("bar"),
                    optional: true,
                    read_only: true,
                    value: AST::Number,
                })
            ]))),
            r"{
  +bar?: number,
  foo: string,
  ...
}"
            .to_string()
        );
    }

    #[test]
    fn other_comment() {
        assert_eq!(
            print_type(&AST::ExactObject(ExactObject::new(vec![
                Prop::KeyValuePair(KeyValuePairProp {
                    key: intern!("with_comment"),
                    optional: false,
                    read_only: false,
                    value: AST::OtherTypename,
                })
            ],))),
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
        printer.write_import_type(&["A", "B"], "module").unwrap();
        assert_eq!(
            printer.into_string(),
            "import type { A, B } from \"module\";\n"
        );
    }

    #[test]
    fn import_module() {
        let mut printer = Box::new(FlowPrinter::new());
        printer.write_import_module_default("A", "module").unwrap();
        assert_eq!(printer.into_string(), "import A from \"module\";\n");
    }

    #[test]
    fn function_return_type() {
        assert_eq!(
            print_type(&AST::ReturnTypeOfFunctionWithName(intern!("someFunc"))),
            "ReturnType<typeof someFunc>".to_string()
        );
    }
}
