/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::ast::{Ast, AstBuilder, AstKey, ObjectEntry, Primitive, RequestParameters};
use crate::build_ast::{
    build_fragment, build_operation, build_request, build_request_params,
    build_request_params_ast_key,
};
use crate::constants::CODEGEN_CONSTANTS;
use crate::indentation::print_indentation;
use crate::utils::escape;

use graphql_ir::{FragmentDefinition, OperationDefinition};
use schema::Schema;

use fnv::{FnvBuildHasher, FnvHashSet};
use indexmap::IndexMap;
use interner::StringKey;
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
    fn new(builder: &'b AstBuilder, root_key: AstKey) -> Self {
        let mut visited = Default::default();
        let mut duplicates = Default::default();
        Self::collect_value_duplicates(&mut visited, &mut duplicates, builder, root_key);
        Self {
            variable_definitions: Default::default(),
            duplicates,
            builder,
            root_key,
        }
    }

    fn new_without_dedupe(builder: &'b AstBuilder, root_key: AstKey) -> Self {
        Self {
            variable_definitions: Default::default(),
            duplicates: Default::default(),
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
        visited: &mut FnvHashSet<AstKey>,
        duplicates: &mut FnvHashSet<AstKey>,
        builder: &AstBuilder,
        key: AstKey,
    ) {
        match builder.lookup(key) {
            Ast::Array(array) => {
                if array.is_empty() {
                    return;
                }
                if !visited.insert(key) {
                    duplicates.insert(key);
                    return;
                }
                for val in array {
                    if let Primitive::Key(key) = val {
                        Self::collect_value_duplicates(visited, duplicates, builder, *key);
                    }
                }
            }
            Ast::Object(object) => {
                if object.is_empty() {
                    return;
                }
                if !visited.insert(key) {
                    duplicates.insert(key);
                    return;
                }
                for entry in object {
                    if let Primitive::Key(key) = entry.value {
                        Self::collect_value_duplicates(visited, duplicates, builder, key);
                    }
                }
            }
        }
    }

    fn print(mut self) -> String {
        let mut result = String::new();
        self.print_ast(&mut result, self.root_key, 0, false);
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
            write!(&mut with_variables, "return {};\n}})()", result).unwrap();
            with_variables
        }
    }

    fn print_ast(&mut self, f: &mut String, key: AstKey, indent: usize, is_dedupe_var: bool) {
        // Only use variable references at depth beyond the top level.
        if indent > 0 && self.duplicates.contains(&key) {
            let v = if self.variable_definitions.contains_key(&key) {
                self.variable_definitions.get_full(&key).unwrap().0
            } else {
                let mut variable = String::new();
                self.print_ast(&mut variable, key, 0, true);
                let v = self.variable_definitions.len();
                self.variable_definitions.insert(key, variable);
                v
            };
            return write!(f, "(v{}/*: any*/)", v).unwrap();
        }

        let ast = self.builder.lookup(key);
        match ast {
            Ast::Object(object) => {
                if object.is_empty() {
                    f.push_str("{}");
                } else {
                    let next_indent = indent + 1;
                    f.push('{');
                    for ObjectEntry { key, value } in object {
                        f.push('\n');
                        print_indentation(f, next_indent);
                        write!(f, "\"{}\": ", key.lookup()).unwrap();
                        self.print_primitive(f, value, next_indent, is_dedupe_var)
                            .unwrap();
                        f.push(',');
                    }
                    f.pop();
                    f.push('\n');
                    print_indentation(f, indent);
                    f.push('}');
                }
            }
            Ast::Array(array) => {
                if array.is_empty() {
                    if is_dedupe_var {
                        // Empty arrays can only have one inferred flow type and then conflict if
                        // used in different places, this is unsound if we would write to them but
                        // this whole module is based on the idea of a read only JSON tree.
                        f.push_str("([]/*: any*/)");
                    } else {
                        f.push_str("[]");
                    }
                } else {
                    f.push('[');
                    let next_indent = indent + 1;
                    for value in array {
                        f.push('\n');
                        print_indentation(f, next_indent);
                        self.print_primitive(f, value, next_indent, is_dedupe_var)
                            .unwrap();
                        f.push(',');
                    }
                    f.pop();
                    f.push('\n');
                    print_indentation(f, indent);
                    f.push(']');
                }
            }
        }
    }

    fn print_primitive(
        &mut self,
        f: &mut String,
        primitive: &Primitive,
        indent: usize,
        is_dedupe_var: bool,
    ) -> FmtResult {
        match primitive {
            Primitive::Null => write!(f, "null"),
            Primitive::Bool(b) => write!(f, "{}", if *b { "true" } else { "false" }),
            Primitive::RawString(str) => {
                f.push('\"');
                escape(str, f);
                f.push('\"');
                Ok(())
            }
            Primitive::String(key) => write!(f, "\"{}\"", key),
            Primitive::Float(value) => write!(f, "{}", value.as_float()),
            Primitive::Int(value) => write!(f, "{}", value),
            Primitive::Key(key) => {
                self.print_ast(f, *key, indent, is_dedupe_var);
                Ok(())
            }
            Primitive::StorageKey(field_name, key) => {
                write_static_storage_key(f, &self.builder, *field_name, *key)
            }
            Primitive::ModuleDependency(key) => write!(f, "require('{}.graphql')", key),
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

pub fn print_operation(schema: &Schema, operation: &OperationDefinition) -> String {
    let mut builder = AstBuilder::default();
    let key = build_operation(schema, &mut builder, operation);
    let printer = DedupedJSONPrinter::new_without_dedupe(&builder, key);
    printer.print()
}

pub fn print_fragment(schema: &Schema, fragment: &FragmentDefinition) -> String {
    let mut builder = AstBuilder::default();
    let key = build_fragment(schema, &mut builder, fragment);
    let printer = DedupedJSONPrinter::new_without_dedupe(&builder, key);
    printer.print()
}

pub fn print_request(
    schema: &Schema,
    operation: &OperationDefinition,
    fragment: &FragmentDefinition,
    request_parameters: RequestParameters,
) -> String {
    let mut builder = AstBuilder::default();
    let request_parameters =
        build_request_params_ast_key(schema, request_parameters, &mut builder, operation);
    let key = build_request(
        schema,
        &mut builder,
        operation,
        fragment,
        request_parameters,
    );
    let printer = DedupedJSONPrinter::new_without_dedupe(&builder, key);
    printer.print()
}

pub fn print_request_params(
    schema: &Schema,
    operation: &OperationDefinition,
    query_id: Option<String>,
) -> String {
    let mut request_parameters = build_request_params(operation);
    request_parameters.id = query_id;

    let mut builder = AstBuilder::default();
    let request_parameters_ast_key =
        build_request_params_ast_key(schema, request_parameters, &mut builder, operation);
    let printer = DedupedJSONPrinter::new_without_dedupe(&builder, request_parameters_ast_key);

    printer.print()
}

impl Printer {
    pub fn print_request_deduped(
        &mut self,
        schema: &Schema,
        operation: &OperationDefinition,
        fragment: &FragmentDefinition,
        request_parameters: RequestParameters,
    ) -> String {
        let request_parameters =
            build_request_params_ast_key(schema, request_parameters, &mut self.builder, operation);
        let key = build_request(
            schema,
            &mut self.builder,
            operation,
            fragment,
            request_parameters,
        );
        let deduped_printer = DedupedJSONPrinter::new(&self.builder, key);
        deduped_printer.print()
    }

    pub fn print_operation_deduped(
        &mut self,
        schema: &Schema,
        operation: &OperationDefinition,
    ) -> String {
        let key = build_operation(schema, &mut self.builder, operation);
        let deduped_printer = DedupedJSONPrinter::new(&self.builder, key);
        deduped_printer.print()
    }

    pub fn print_fragment_deduped(
        &mut self,
        schema: &Schema,
        fragment: &FragmentDefinition,
    ) -> String {
        let key = build_fragment(schema, &mut self.builder, fragment);
        let deduped_printer = DedupedJSONPrinter::new(&self.builder, key);
        deduped_printer.print()
    }
}

fn write_static_storage_key(
    f: &mut String,
    builder: &AstBuilder,
    field_name: StringKey,
    args_key: AstKey,
) -> FmtResult {
    write!(f, "\"{}(", field_name)?;
    let args = builder.lookup(args_key).assert_array();
    for arg_key in args {
        let arg = builder.lookup(arg_key.assert_key()).assert_object();
        let name = &arg
            .iter()
            .find(|ObjectEntry { key, value: _ }| *key == CODEGEN_CONSTANTS.name)
            .expect("Expected `name` to exist")
            .value;
        let name = name.assert_string();
        write!(f, "{}:", name)?;
        write_argument_value(f, builder, arg)?;
        f.push(',');
    }
    f.pop(); // args won't be empty
    f.push_str(")\"");
    Ok(())
}

fn write_argument_value(f: &mut String, builder: &AstBuilder, arg: &[ObjectEntry]) -> FmtResult {
    let key = &arg
        .iter()
        .find(|entry| entry.key == CODEGEN_CONSTANTS.kind)
        .expect("Expected `kind` to exist")
        .value;
    let key = key.assert_string();
    // match doesn't allow `CODEGEN_CONSTANTS.<>` on the match arm, falling back to if statements
    if key == CODEGEN_CONSTANTS.literal {
        let literal = &arg
            .iter()
            .find(|entry| entry.key == CODEGEN_CONSTANTS.value)
            .expect("Expected `name` to exist")
            .value;
        write_constant_value(f, builder, literal)?;
    } else if key == CODEGEN_CONSTANTS.list_value {
        let items = &arg
            .iter()
            .find(|entry| entry.key == CODEGEN_CONSTANTS.items)
            .expect("Expected `items` to exist")
            .value;
        let array = builder.lookup(items.assert_key()).assert_array();

        f.push('[');
        let mut after_first = false;
        for key_or_null in array {
            match key_or_null {
                Primitive::Null => {}
                Primitive::Key(key) => {
                    if after_first {
                        f.push(',');
                    } else {
                        after_first = true;
                    }
                    let object = builder.lookup(*key).assert_object();
                    write_argument_value(f, builder, object)?;
                }
                _ => panic!("Expected an object key or null"),
            }
        }
        f.push(']');
    } else {
        // We filtered out Variables, here it should only be ObjectValue
        let fields = &arg
            .iter()
            .find(|entry| entry.key == CODEGEN_CONSTANTS.fields)
            .expect("Expected `fields` to exist")
            .value;
        let fields = builder.lookup(fields.assert_key()).assert_array();

        f.push('{');
        for field in fields {
            let field = builder.lookup(field.assert_key()).assert_object();
            let name = &field
                .iter()
                .find(|entry| entry.key == CODEGEN_CONSTANTS.name)
                .expect("Expected `name` to exist")
                .value;
            let name = name.assert_string();
            write!(f, "\\\"{}\\\":", name)?;
            write_argument_value(f, builder, field)?;
            f.push(',');
        }
        if !fields.is_empty() {
            f.pop();
        }
        f.push('}');
    }
    Ok(())
}

fn write_constant_value(f: &mut String, builder: &AstBuilder, value: &Primitive) -> FmtResult {
    match value {
        Primitive::Bool(b) => write!(f, "{}", if *b { "true" } else { "false" }),
        Primitive::String(key) => write!(f, "\\\"{}\\\"", key),
        Primitive::Float(value) => write!(f, "{}", value.as_float()),
        Primitive::Int(value) => write!(f, "{}", value),
        Primitive::Key(key) => {
            let ast = builder.lookup(*key);
            match ast {
                Ast::Array(arr) => {
                    f.push('[');
                    for value in arr {
                        write_constant_value(f, builder, value)?;
                        f.push(',');
                    }
                    if !arr.is_empty() {
                        f.pop();
                    }
                    f.push(']');
                    Ok(())
                }
                Ast::Object(obj) => {
                    f.push('{');
                    for ObjectEntry { key: name, value } in obj {
                        write!(f, "\\\"{}\\\":", name)?;
                        write_constant_value(f, builder, value)?;
                        f.push(',');
                    }
                    if !obj.is_empty() {
                        f.pop();
                    }
                    f.push('}');
                    Ok(())
                }
            }
        }
        Primitive::Null => {
            f.push_str("null");
            Ok(())
        }
        Primitive::StorageKey(_, _) => panic!("Unexpected StorageKey"),
        Primitive::RawString(_) => panic!("Unexpected RawString"),
        Primitive::ModuleDependency(_) => panic!("Unexpected ModuleDependency"),
    }
}
