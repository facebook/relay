/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::WithLocation;
use graphql_ir::{
    Argument, Condition, ConditionValue, ConstantValue, Directive, ExecutableDefinition,
    FragmentDefinition, FragmentSpread, InlineFragment, LinkedField, OperationDefinition,
    ScalarField, Selection, Value, VariableDefinition,
};
use graphql_syntax::OperationKind;
use interner::StringKey;
use schema::{SDLSchema, Schema};
use std::fmt::{Result, Write};

const TAB_SIZE: usize = 2;

pub fn print_ir(schema: &SDLSchema, definitions: &[ExecutableDefinition]) -> Vec<String> {
    definitions
        .iter()
        .map(|def| print_definition(&schema, &def))
        .collect()
}

pub fn print_definition(schema: &SDLSchema, definition: &ExecutableDefinition) -> String {
    let mut result = String::new();
    write_definition(schema, definition, &mut result).unwrap();
    result
}

pub fn print_operation(schema: &SDLSchema, operation: &OperationDefinition) -> String {
    let mut result = String::new();
    write_operation(schema, operation, &mut result).unwrap();
    result
}

pub fn print_fragment(schema: &SDLSchema, fragment: &FragmentDefinition) -> String {
    let mut result = String::new();
    write_fragment(schema, fragment, &mut result).unwrap();
    result
}

pub fn print_selections(schema: &SDLSchema, selections: &[Selection]) -> String {
    let mut result = String::new();
    write_selections(schema, selections, &mut result).unwrap();
    result
}

pub fn print_arguments(schema: &SDLSchema, arguments: &[Argument]) -> String {
    let mut result = String::new();
    write_arguments(schema, arguments, &mut result).unwrap();
    result
}

pub fn print_directives(schema: &SDLSchema, directives: &[Directive]) -> String {
    let mut result = String::new();
    write_directives(schema, directives, &mut result).unwrap();
    result
}

pub fn print_value(schema: &SDLSchema, value: &Value) -> String {
    let mut result = String::new();
    write_value(schema, value, &mut result).unwrap();
    result
}

pub fn write_definition(
    schema: &SDLSchema,
    definition: &ExecutableDefinition,
    mut result: &mut impl Write,
) -> Result {
    let printer = Printer::new(&schema, &mut result);
    printer.print_definition(definition)
}

pub fn write_operation(
    schema: &SDLSchema,
    operation: &OperationDefinition,
    mut result: &mut impl Write,
) -> Result {
    let printer = Printer::new(&schema, &mut result);
    printer.print_operation(operation)
}

pub fn write_fragment(
    schema: &SDLSchema,
    fragment: &FragmentDefinition,
    mut result: &mut impl Write,
) -> Result {
    let printer = Printer::new(&schema, &mut result);
    printer.print_fragment(fragment)
}

pub fn write_selections(
    schema: &SDLSchema,
    selections: &[Selection],
    mut result: &mut impl Write,
) -> Result {
    let mut printer = Printer::new(&schema, &mut result);
    printer.print_selections(selections, 0)
}

pub fn write_arguments(
    schema: &SDLSchema,
    arguments: &[Argument],
    mut result: &mut impl Write,
) -> Result {
    let mut printer = Printer::new(&schema, &mut result);
    printer.print_arguments(arguments)
}

pub fn write_directives(
    schema: &SDLSchema,
    directives: &[Directive],
    mut result: &mut impl Write,
) -> Result {
    let mut printer = Printer::new(&schema, &mut result);
    printer.print_directives(directives, None, None)
}

pub fn write_value(schema: &SDLSchema, value: &Value, mut result: &mut impl Write) -> Result {
    let mut printer = Printer::new(&schema, &mut result);
    printer.print_value(value)
}

struct Printer<'schema, 'writer, W: Write> {
    schema: &'schema SDLSchema,
    writer: &'writer mut W,
}

impl<'schema, 'writer, W: Write> Printer<'schema, 'writer, W> {
    fn new(schema: &'schema SDLSchema, writer: &'writer mut W) -> Self {
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
        self.print_directives(&operation.directives, None, None)?;
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
        self.print_directives(
            &fragment.directives,
            None,
            Some(&fragment.variable_definitions),
        )?;
        self.print_selections(&fragment.selections, 0)
    }

    fn print_selections(&mut self, selections: &[Selection], indent_count: usize) -> Result {
        let len = selections.len();
        if len > 0 {
            let next_indent_count = indent_count + TAB_SIZE;
            writeln!(self.writer, " {{")?;
            self.print_indentation(next_indent_count)?;

            for (i, selection) in selections.iter().enumerate() {
                self.print_selection(selection, None, next_indent_count)?;
                if i != len - 1 {
                    writeln!(self.writer)?;
                    self.print_indentation(next_indent_count)?;
                }
            }

            writeln!(self.writer)?;
            self.print_indentation(indent_count)?;
            write!(self.writer, "}}")?;
        } else {
            panic!(
                "Cannot print empty selections. Please, check transforms that may produce invalid selections."
            );
        }
        Ok(())
    }

    fn print_selection(
        &mut self,
        selection: &Selection,
        conditions: Option<Vec<&Condition>>,
        indent_count: usize,
    ) -> Result {
        match selection {
            Selection::ScalarField(field) => {
                self.print_scalar_field(field, conditions)?;
            }
            Selection::LinkedField(field) => {
                self.print_linked_field(field, conditions, indent_count)?;
            }
            Selection::FragmentSpread(field) => {
                self.print_fragment_spread(field, conditions)?;
            }
            Selection::InlineFragment(field) => {
                self.print_inline_fragment(field, conditions, indent_count)?;
            }
            Selection::Condition(field) => {
                self.print_condition(field, indent_count)?;
            }
        }
        Ok(())
    }

    fn print_scalar_field(
        &mut self,
        field: &ScalarField,
        conditions: Option<Vec<&Condition>>,
    ) -> Result {
        let schema_field = self.schema.field(field.definition.item);
        self.print_alias_and_name(&field.alias, schema_field.name)?;
        self.print_arguments(&field.arguments)?;
        self.print_directives(&field.directives, conditions, None)
    }

    fn print_linked_field(
        &mut self,
        field: &LinkedField,
        conditions: Option<Vec<&Condition>>,
        indent_count: usize,
    ) -> Result {
        let schema_field = self.schema.field(field.definition.item);
        self.print_alias_and_name(&field.alias, schema_field.name)?;
        self.print_arguments(&field.arguments)?;
        self.print_directives(&field.directives, conditions, None)?;
        self.print_selections(&field.selections, indent_count)?;
        Ok(())
    }

    fn print_fragment_spread(
        &mut self,
        field: &FragmentSpread,
        conditions: Option<Vec<&Condition>>,
    ) -> Result {
        let fragment_name = field.fragment.item;
        write!(self.writer, "...{}", fragment_name)?;
        self.print_directives(&field.directives, conditions, None)?;
        if !field.arguments.is_empty() {
            write!(self.writer, " @arguments")?;
            self.print_arguments(&field.arguments)
        } else {
            Ok(())
        }
    }

    fn print_inline_fragment(
        &mut self,
        field: &InlineFragment,
        conditions: Option<Vec<&Condition>>,
        indent_count: usize,
    ) -> Result {
        write!(self.writer, "...")?;
        if let Some(type_condition) = field.type_condition {
            write!(
                self.writer,
                " on {}",
                self.schema.get_type_name(type_condition).lookup(),
            )?;
        };
        self.print_directives(&field.directives, conditions, None)?;
        self.print_selections(&field.selections, indent_count)
    }

    fn print_condition(&mut self, condition: &Condition, indent_count: usize) -> Result {
        let mut maybe_current_condition = Some(condition);
        let mut accum_conditions: Vec<Condition> = vec![];
        let mut is_first_selection = true;
        while let Some(current_condition) = maybe_current_condition {
            accum_conditions.push(current_condition.clone());

            for selection in current_condition.selections.iter() {
                if let Selection::Condition(nested_cond) = selection {
                    maybe_current_condition = Some(&nested_cond);
                } else {
                    if is_first_selection {
                        is_first_selection = false;
                    } else {
                        writeln!(self.writer)?;
                        self.print_indentation(indent_count)?;
                    }
                    self.print_selection(
                        &selection,
                        Some(accum_conditions.iter().rev().collect()),
                        indent_count,
                    )?;
                    maybe_current_condition = None;
                }
            }
        }
        Ok(())
    }

    fn print_directives(
        &mut self,
        directives: &[Directive],
        conditions: Option<Vec<&Condition>>,
        fragment_argument_definitions: Option<&[VariableDefinition]>,
    ) -> Result {
        if let Some(conditions) = conditions {
            self.print_condition_directives(conditions)?;
        }
        for directive in directives {
            if directive.name.item.lookup() == "argumentDefinitions" {
                self.print_argument_definitions(fragment_argument_definitions.unwrap())?;
            } else {
                self.print_directive(directive)?;
            }
        }
        Ok(())
    }

    fn print_directive(&mut self, directive: &Directive) -> Result {
        write!(self.writer, " @{}", directive.name.item)?;
        self.print_arguments(&directive.arguments)?;

        Ok(())
    }

    fn print_condition_directives(&mut self, conditions: Vec<&Condition>) -> Result {
        for condition in conditions {
            write!(
                self.writer,
                " @{}",
                if condition.passing_value {
                    "include"
                } else {
                    "skip"
                }
            )?;
            match &condition.value {
                ConditionValue::Constant(value) => {
                    write!(self.writer, "(if: {})", value)?;
                }
                ConditionValue::Variable(variable) => {
                    write!(self.writer, "(if: ${})", variable.name.item)?;
                }
            }
        }
        Ok(())
    }

    fn print_variable_definitions(
        &mut self,
        variable_definitions: &[VariableDefinition],
    ) -> Result {
        if !variable_definitions.is_empty() {
            write!(self.writer, "(")?;
            for var_def in variable_definitions.iter() {
                writeln!(self.writer)?;
                self.print_indentation(TAB_SIZE)?;
                let type_name = self.schema.get_type_string(&var_def.type_);
                write!(self.writer, "${}: {}", var_def.name.item, type_name)?;

                match &var_def.default_value {
                    None => {}
                    Some(default_value) => {
                        write!(self.writer, " = ")?;
                        self.print_constant_value(&default_value)?;
                    }
                }

                self.print_directives(&var_def.directives, None, None)?;
            }
            write!(self.writer, "\n)")?;
        }
        Ok(())
    }

    fn print_argument_definitions(
        &mut self,
        argument_definitions: &[VariableDefinition],
    ) -> Result {
        if !argument_definitions.is_empty() {
            write!(self.writer, " @argumentDefinitions(")?;
            for arg_def in argument_definitions.iter() {
                writeln!(self.writer)?;
                self.print_indentation(TAB_SIZE)?;
                let type_name = self.schema.get_type_string(&arg_def.type_);
                write!(
                    self.writer,
                    "{}: {{type: \"{}\"",
                    arg_def.name.item, type_name
                )?;

                if let Some(default_value) = &arg_def.default_value {
                    write!(self.writer, ", defaultValue: ")?;
                    self.print_constant_value(&default_value)?;
                }
                write!(self.writer, "}}")?;
            }
            write!(self.writer, "\n)")?;
        }
        Ok(())
    }

    fn print_arguments(&mut self, arguments: &[Argument]) -> Result {
        if arguments.is_empty() {
            Ok(())
        } else {
            let non_null_arguments = arguments
                .iter()
                .filter(|arg| !matches!(arg.value.item, Value::Constant(ConstantValue::Null())))
                .collect::<Vec<_>>();
            self.print_arguments_helper(non_null_arguments.len(), non_null_arguments.into_iter())
        }
    }

    fn print_arguments_helper<'a, Args>(&mut self, len: usize, arguments: Args) -> Result
    where
        Args: Iterator<Item = &'a Argument>,
    {
        if len > 0 {
            write!(self.writer, "(")?;
            for (i, argument) in arguments.enumerate() {
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
                write!(self.writer, "{{")?;
                let mut first = true;
                for arg in object
                    .iter()
                    .filter(|arg| !matches!(arg.value.item, Value::Constant(ConstantValue::Null())))
                {
                    if first {
                        first = false;
                    } else {
                        write!(self.writer, ", ")?;
                    }
                    write!(self.writer, "{}: ", arg.name.item)?;
                    self.print_value(&arg.value.item)?;
                }
                write!(self.writer, "}}")?;
                Ok(())
            }
            Value::List(list) => {
                write!(self.writer, "[")?;
                let mut first = true;
                for value in list
                    .iter()
                    .filter(|value| !matches!(value, Value::Constant(ConstantValue::Null())))
                {
                    if first {
                        first = false;
                    } else {
                        write!(self.writer, ", ")?;
                    }
                    self.print_value(value)?;
                }
                write!(self.writer, "]")?;
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
                write!(self.writer, "{{")?;
                let mut first = true;
                for arg in object {
                    if first {
                        first = false;
                    } else {
                        write!(self.writer, ", ")?;
                    }
                    write!(self.writer, "{}: ", arg.name.item)?;
                    self.print_constant_value(&arg.value.item)?;
                }
                write!(self.writer, "}}")?;
                Ok(())
            }
            ConstantValue::List(list) => {
                write!(self.writer, "[")?;
                let mut first = true;
                for value in list {
                    if first {
                        first = false;
                    } else {
                        write!(self.writer, ", ")?;
                    }
                    self.print_constant_value(&value)?;
                }
                write!(self.writer, "]")?;
                Ok(())
            }
        }
    }

    fn print_alias_and_name(
        &mut self,
        alias: &Option<WithLocation<StringKey>>,
        name: StringKey,
    ) -> Result {
        if let Some(alias) = alias {
            if alias.item != name {
                write!(self.writer, "{}: ", alias.item)?;
            }
        }
        write!(self.writer, "{}", name)
    }

    fn print_indentation(&mut self, indent_count: usize) -> Result {
        for _ in 0..indent_count {
            write!(self.writer, " ")?;
        }
        Ok(())
    }
}
