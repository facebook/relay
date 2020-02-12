/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::Spanned;
use graphql_ir::{
    Argument, ConstantValue, Directive, ExecutableDefinition, FragmentDefinition, FragmentSpread,
    InlineFragment, LinkedField, OperationDefinition, ScalarField, Selection, Value,
    VariableDefinition,
};
use graphql_syntax::OperationKind;
use interner::StringKey;
use schema::Schema;
use std::fmt::{Result, Write};

const TAB_SIZE: usize = 2;

pub fn print_ir(schema: &Schema, definitions: &[ExecutableDefinition]) -> Vec<String> {
    definitions
        .iter()
        .map(|def| print_definition(&schema, &def))
        .collect()
}

pub fn print_definition(schema: &Schema, definition: &ExecutableDefinition) -> String {
    let mut result = String::new();
    let printer = Printer::new(&schema, &mut result);
    printer.print_definition(definition).unwrap();
    result
}

pub fn print_operation(schema: &Schema, operation: &OperationDefinition) -> String {
    let mut result = String::new();
    let printer = Printer::new(&schema, &mut result);
    printer.print_operation(operation).unwrap();
    result
}

pub fn print_fragment(schema: &Schema, fragment: &FragmentDefinition) -> String {
    let mut result = String::new();
    let printer = Printer::new(&schema, &mut result);
    printer.print_fragment(fragment).unwrap();
    result
}

pub fn print_arguments(schema: &Schema, arguments: &[Argument]) -> String {
    let mut result = String::new();
    let mut printer = Printer::new(&schema, &mut result);
    printer.print_arguments(arguments).unwrap();
    result
}

pub fn print_directives(schema: &Schema, directives: &[Directive]) -> String {
    let mut result = String::new();
    let mut printer = Printer::new(&schema, &mut result);
    printer.print_directives(directives).unwrap();
    result
}

struct Printer<'schema, 'writer, W: Write> {
    schema: &'schema Schema,
    writer: &'writer mut W,
}

impl<'schema, 'writer, W: Write> Printer<'schema, 'writer, W> {
    fn new(schema: &'schema Schema, writer: &'writer mut W) -> Self {
        Self { schema, writer }
    }

    fn print_definition(self, definition: &ExecutableDefinition) -> Result {
        match definition {
            ExecutableDefinition::Operation(operation) => self.print_operation(&operation),
            ExecutableDefinition::Fragment(fragment) => self.print_fragment(&fragment),
        }
    }

    fn print_operation(mut self, operation: &OperationDefinition) -> Result {
        let operation_kind = match operation.kind {
            OperationKind::Query => "query",
            OperationKind::Mutation => "mutation",
            OperationKind::Subscription => "subscription",
        };
        let operation_name = operation.name.item;
        write!(self.writer, "{} {}", operation_kind, operation_name)?;
        self.print_variable_definitions(&operation.variable_definitions)?;
        self.print_directives(&operation.directives)?;
        self.print_selections(&operation.selections, 0)
    }

    fn print_fragment(mut self, fragment: &FragmentDefinition) -> Result {
        let fragment_name = fragment.name.item;
        let type_condition_name = self.schema.get_type_name(fragment.type_condition);
        write!(
            self.writer,
            "fragment {} on {}",
            fragment_name, type_condition_name
        )
        .unwrap();
        self.print_argument_definitions(&fragment.variable_definitions)?;
        self.print_directives(&fragment.directives)?;
        self.print_selections(&fragment.selections, 0)
    }

    fn print_selections(&mut self, selections: &[Selection], indent_count: usize) -> Result {
        let len = selections.len();
        if len > 0 {
            let next_indent_count = indent_count + TAB_SIZE;
            writeln!(self.writer, " {{")?;
            self.print_indentation(next_indent_count)?;

            for (i, selection) in selections.iter().enumerate() {
                match selection {
                    Selection::ScalarField(field) => {
                        self.print_scalar_field(field)?;
                    }
                    Selection::LinkedField(field) => {
                        self.print_linked_field(field, next_indent_count)?;
                    }
                    Selection::FragmentSpread(field) => {
                        self.print_fragment_spread(field)?;
                    }
                    Selection::InlineFragment(field) => {
                        self.print_inline_fragment(field, next_indent_count)?;
                    }
                }
                if i != len - 1 {
                    writeln!(self.writer)?;
                    self.print_indentation(next_indent_count)?;
                }
            }

            writeln!(self.writer)?;
            self.print_indentation(indent_count)?;
            write!(self.writer, "}}")?;
        }
        Ok(())
    }

    fn print_scalar_field(&mut self, field: &ScalarField) -> Result {
        self.print_alias(&field.alias)?;
        let schema_field = self.schema.field(field.definition.item);
        write!(self.writer, "{}", schema_field.name)?;

        self.print_arguments(&field.arguments)?;
        self.print_directives(&field.directives)
    }

    fn print_linked_field(&mut self, field: &LinkedField, indent_count: usize) -> Result {
        self.print_alias(&field.alias)?;
        let schema_field = self.schema.field(field.definition.item);
        write!(self.writer, "{}", schema_field.name)?;
        self.print_arguments(&field.arguments)?;
        self.print_directives(&field.directives)?;
        self.print_selections(&field.selections, indent_count)?;
        Ok(())
    }

    fn print_fragment_spread(&mut self, field: &FragmentSpread) -> Result {
        let fragment_name = field.fragment.item;
        write!(self.writer, "...{}", fragment_name)?;
        self.print_directives(&field.directives)
    }

    fn print_inline_fragment(&mut self, field: &InlineFragment, indent_count: usize) -> Result {
        write!(self.writer, "...")?;
        if let Some(type_condition) = field.type_condition {
            write!(
                self.writer,
                " on {}",
                self.schema.get_type_name(type_condition).lookup(),
            )?;
        };
        self.print_directives(&field.directives)?;
        self.print_selections(&field.selections, indent_count)
    }

    fn print_directives(&mut self, directives: &[Directive]) -> Result {
        let len = directives.len();
        if len > 0 {
            for directive in directives.iter() {
                write!(self.writer, " @{}", directive.name.item)?;
                self.print_arguments(&directive.arguments)?;
            }
        }
        Ok(())
    }

    fn print_variable_definitions(
        &mut self,
        variable_definitions: &[VariableDefinition],
    ) -> Result {
        let len = variable_definitions.len();
        if len > 0 {
            writeln!(self.writer, "(")?;
            for var_def in variable_definitions.iter() {
                let type_name = self.schema.get_type_string(&var_def.type_);
                self.print_indentation(TAB_SIZE)?;
                write!(self.writer, "${}: {}", var_def.name.item, type_name)?;

                if let Some(default_value) = &var_def.default_value {
                    write!(self.writer, " = ")?;
                    self.print_constant_value(&default_value)?;
                }
                writeln!(self.writer)?;
            }
            write!(self.writer, ")")?;
        }
        Ok(())
    }

    fn print_argument_definitions(
        &mut self,
        argument_definitions: &[VariableDefinition],
    ) -> Result {
        let len = argument_definitions.len();
        if len > 0 {
            writeln!(self.writer, " @argumentDefinitions(")?;
            for arg_def in argument_definitions.iter() {
                let type_name = self.schema.get_type_string(&arg_def.type_);
                self.print_indentation(TAB_SIZE)?;
                write!(
                    self.writer,
                    "{}: {{type: \"{}\"",
                    arg_def.name.item, type_name
                )?;

                if let Some(default_value) = &arg_def.default_value {
                    write!(self.writer, ", defaultValue: ")?;
                    self.print_constant_value(&default_value)?;
                }
                writeln!(self.writer, "}}")?;
            }
            write!(self.writer, ")")?;
        }
        Ok(())
    }

    fn print_arguments(&mut self, arguments: &[Argument]) -> Result {
        let len = arguments.len();
        if len > 0 {
            write!(self.writer, "(")?;
            for (i, argument) in arguments.iter().enumerate() {
                write!(self.writer, "{}: ", argument.name.item)?;

                self.print_value(&argument.value.item)?;

                if i != len - 1 {
                    write!(self.writer, ", ")?;
                }
            }
            write!(self.writer, ")")?;
        }
        Ok(())
    }

    fn print_value(&mut self, val: &Value) -> Result {
        match val {
            Value::Constant(constant_val) => self.print_constant_value(&constant_val),
            Value::Variable(variable_val) => write!(self.writer, "${}", variable_val.name.item),

            Value::Object(object) => {
                let len = object.len();
                if len > 0 {
                    write!(self.writer, "{{")?;
                    for (i, arg) in object.iter().enumerate() {
                        write!(self.writer, "{}: ", arg.name.item)?;
                        self.print_value(&arg.value.item)?;

                        if i != len - 1 {
                            write!(self.writer, ", ")?;
                        }
                    }
                    write!(self.writer, "}}")?;
                }
                Ok(())
            }
            Value::List(list) => {
                let len = list.len();
                if len > 0 {
                    write!(self.writer, "[")?;
                    for (i, value) in list.iter().enumerate() {
                        self.print_value(&value)?;

                        if i != len - 1 {
                            write!(self.writer, ", ")?;
                        }
                    }
                    write!(self.writer, "]")?;
                }
                Ok(())
            }
        }
    }

    fn print_constant_value(&mut self, constant_val: &ConstantValue) -> Result {
        match &constant_val {
            ConstantValue::String(val) => write!(self.writer, "\"{}\"", val),
            ConstantValue::Enum(val) => write!(self.writer, "{}", val),
            ConstantValue::Float(val) => write!(self.writer, "{}", val),
            ConstantValue::Int(val) => write!(self.writer, "{}", val),
            ConstantValue::Boolean(val) => write!(self.writer, "{}", val),
            ConstantValue::Null() => write!(self.writer, "null"),
            ConstantValue::Object(object) => {
                let len = object.len();
                if len > 0 {
                    write!(self.writer, "{{")?;
                    for (i, arg) in object.iter().enumerate() {
                        write!(self.writer, "{}: ", arg.name.item)?;
                        self.print_constant_value(&arg.value.item)?;

                        if i != len - 1 {
                            write!(self.writer, ", ")?;
                        }
                    }
                    write!(self.writer, "}}")?;
                };
                Ok(())
            }
            ConstantValue::List(list) => {
                let len = list.len();
                if len > 0 {
                    write!(self.writer, "[")?;
                    for (i, value) in list.iter().enumerate() {
                        self.print_constant_value(&value)?;

                        if i != len - 1 {
                            write!(self.writer, ", ")?;
                        }
                    }
                    write!(self.writer, "]")?;
                };
                Ok(())
            }
        }
    }

    fn print_alias(&mut self, alias: &Option<Spanned<StringKey>>) -> Result {
        match alias {
            Some(value) => write!(self.writer, "{}: ", value.item),
            None => Ok(()),
        }
    }

    fn print_indentation(&mut self, indent_count: usize) -> Result {
        for _ in 0..indent_count {
            write!(self.writer, " ")?;
        }
        Ok(())
    }
}
