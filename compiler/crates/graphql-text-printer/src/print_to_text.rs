/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::{Named, WithLocation};
use graphql_ir::{
    Argument, Condition, ConditionValue, ConstantValue, Directive, ExecutableDefinition,
    FragmentDefinition, FragmentSpread, InlineFragment, LinkedField, OperationDefinition,
    ScalarField, Selection, Value, VariableDefinition,
};
use graphql_syntax::OperationKind;
use intern::string_key::StringKey;
use schema::{SDLSchema, Schema};
use std::fmt::{Result, Write};

pub fn print_ir(schema: &SDLSchema, definitions: &[ExecutableDefinition]) -> Vec<String> {
    definitions
        .iter()
        .map(|def| print_definition(schema, def))
        .collect()
}

pub fn print_definition(schema: &SDLSchema, definition: &ExecutableDefinition) -> String {
    let mut result = String::new();
    write_definition(schema, definition, &mut result).unwrap();
    result
}

pub fn print_operation(
    schema: &SDLSchema,
    operation: &OperationDefinition,
    options: PrinterOptions,
) -> String {
    let mut result = String::new();
    write_operation(schema, operation, options, &mut result).unwrap();
    result
}

pub fn print_fragment(
    schema: &SDLSchema,
    fragment: &FragmentDefinition,
    options: PrinterOptions,
) -> String {
    let mut result = String::new();
    write_fragment(schema, fragment, options, &mut result).unwrap();
    result
}

pub fn print_selections(schema: &SDLSchema, selections: &[Selection]) -> String {
    let mut result = String::new();
    write_selections(schema, selections, &mut result).unwrap();
    result
}

pub fn print_arguments(
    schema: &SDLSchema,
    arguments: &[Argument],
    options: PrinterOptions,
) -> String {
    let mut result = String::new();
    write_arguments(schema, arguments, options, &mut result).unwrap();
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
    let printer = Printer::new(schema, &mut result, PrinterOptions::default());
    printer.print_definition(definition)
}

pub fn write_operation(
    schema: &SDLSchema,
    operation: &OperationDefinition,
    options: PrinterOptions,
    mut result: &mut impl Write,
) -> Result {
    let printer = Printer::new(schema, &mut result, options);
    printer.print_operation(operation)
}

pub fn write_fragment(
    schema: &SDLSchema,
    fragment: &FragmentDefinition,
    options: PrinterOptions,
    mut result: &mut impl Write,
) -> Result {
    let printer = Printer::new(schema, &mut result, options);
    printer.print_fragment(fragment)
}

pub fn write_selections(
    schema: &SDLSchema,
    selections: &[Selection],
    mut result: &mut impl Write,
) -> Result {
    let mut printer = Printer::new(schema, &mut result, PrinterOptions::default());
    printer.print_selections(selections)
}

pub fn write_arguments(
    schema: &SDLSchema,
    arguments: &[Argument],
    options: PrinterOptions,
    mut result: &mut impl Write,
) -> Result {
    let mut printer = Printer::new(schema, &mut result, options);
    printer.print_arguments(arguments)
}

pub fn write_directives(
    schema: &SDLSchema,
    directives: &[Directive],
    mut result: &mut impl Write,
) -> Result {
    let mut printer = Printer::new(schema, &mut result, PrinterOptions::default());
    printer.print_directives(directives, None, None)
}

pub fn write_value(schema: &SDLSchema, value: &Value, mut result: &mut impl Write) -> Result {
    let mut printer = Printer::new(schema, &mut result, PrinterOptions::default());
    printer.print_value(value)
}

#[derive(Clone, Default)]
pub struct PrinterOptions {
    pub compact: bool,
    pub sort_keys: bool,
    /// Print `data` from Directive nodes
    pub debug_directive_data: bool,
}

struct Printer<'schema, 'writer, W: Write> {
    schema: &'schema SDLSchema,
    writer: &'writer mut W,
    options: PrinterOptions,
    indentation: usize,
}

impl<'schema, 'writer, W: Write> Printer<'schema, 'writer, W> {
    fn new(schema: &'schema SDLSchema, writer: &'writer mut W, options: PrinterOptions) -> Self {
        Self {
            schema,
            writer,
            options,
            indentation: 0,
        }
    }

    fn print_definition(self, definition: &ExecutableDefinition) -> Result {
        match definition {
            ExecutableDefinition::Operation(operation) => self.print_operation(operation),
            ExecutableDefinition::Fragment(fragment) => self.print_fragment(fragment),
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
        self.print_selections(&operation.selections)
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
        self.print_selections(&fragment.selections)
    }

    fn print_selections(&mut self, selections: &[Selection]) -> Result {
        let len = selections.len();
        if len > 0 {
            write!(self.writer, " {{")?;
            self.indentation += 1;
            self.next_line()?;

            for (i, selection) in selections.iter().enumerate() {
                self.print_selection(selection, None)?;
                if i != len - 1 {
                    self.next_line()?;
                }
            }

            self.indentation -= 1;
            self.next_line()?;
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
    ) -> Result {
        match selection {
            Selection::ScalarField(field) => {
                self.print_scalar_field(field, conditions)?;
            }
            Selection::LinkedField(field) => {
                self.print_linked_field(field, conditions)?;
            }
            Selection::FragmentSpread(field) => {
                self.print_fragment_spread(field, conditions)?;
            }
            Selection::InlineFragment(field) => {
                self.print_inline_fragment(field, conditions)?;
            }
            Selection::Condition(field) => {
                self.print_condition(field)?;
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
        self.print_alias_and_name(&field.alias, schema_field.name.item)?;
        self.print_arguments(&field.arguments)?;
        self.print_directives(&field.directives, conditions, None)
    }

    fn print_linked_field(
        &mut self,
        field: &LinkedField,
        conditions: Option<Vec<&Condition>>,
    ) -> Result {
        let schema_field = self.schema.field(field.definition.item);
        self.print_alias_and_name(&field.alias, schema_field.name.item)?;
        self.print_arguments(&field.arguments)?;
        self.print_directives(&field.directives, conditions, None)?;
        self.print_selections(&field.selections)?;
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
        self.print_selections(&field.selections)
    }

    fn print_condition(&mut self, condition: &Condition) -> Result {
        let mut maybe_current_condition = Some(condition);
        let mut accum_conditions: Vec<Condition> = vec![];
        let mut is_first_selection = true;
        while let Some(current_condition) = maybe_current_condition {
            accum_conditions.push(current_condition.clone());

            for selection in current_condition.selections.iter() {
                if let Selection::Condition(nested_cond) = selection {
                    maybe_current_condition = Some(nested_cond);
                } else {
                    if is_first_selection {
                        is_first_selection = false;
                    } else {
                        self.next_line()?;
                    }
                    self.print_selection(selection, Some(accum_conditions.iter().rev().collect()))?;
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

        if self.options.debug_directive_data {
            if let Some(data) = &directive.data {
                for debug_line in format!("{:#?}", data).lines() {
                    self.next_line()?;
                    write!(self.writer, "# {}", debug_line)?;
                }
                self.next_line()?;
            }
        }

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
            self.indentation += 1;
            for var_def in variable_definitions.iter() {
                self.next_line()?;
                let type_name = self.schema.get_type_string(&var_def.type_);
                write!(self.writer, "${}: {}", var_def.name.item, type_name)?;

                match &var_def.default_value {
                    None => {}
                    Some(default_value) => {
                        write!(self.writer, " = ")?;
                        self.print_constant_value(&default_value.item)?;
                    }
                }

                self.print_directives(&var_def.directives, None, None)?;
            }
            self.indentation -= 1;
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
            self.indentation += 1;
            for arg_def in argument_definitions.iter() {
                self.next_line()?;
                let type_name = self.schema.get_type_string(&arg_def.type_);
                write!(
                    self.writer,
                    "{}: {{type: \"{}\"",
                    arg_def.name.item, type_name
                )?;

                if let Some(default_value) = &arg_def.default_value {
                    write!(self.writer, ", defaultValue: ")?;
                    self.print_constant_value(&default_value.item)?;
                }
                write!(self.writer, "}}")?;
            }
            self.indentation -= 1;
            write!(self.writer, "\n)")?;
        }
        Ok(())
    }

    fn print_arguments(&mut self, arguments: &[Argument]) -> Result {
        if arguments.is_empty() {
            Ok(())
        } else {
            write!(self.writer, "(")?;
            let sorted_arguments = if self.options.sort_keys {
                let mut sorted_arguments = arguments.to_vec();
                sorted_arguments.sort_by_key(|arg| arg.name());
                Some(sorted_arguments)
            } else {
                None
            };
            let maybe_sorted_arguments = sorted_arguments
                .as_ref()
                .map_or(arguments, |v| v.as_slice());
            for (i, argument) in maybe_sorted_arguments.iter().enumerate() {
                write!(self.writer, "{}:", argument.name.item)?;
                if !self.options.compact {
                    write!(self.writer, " ")?;
                }
                self.print_value(&argument.value.item)?;

                if i != arguments.len() - 1 {
                    write!(self.writer, ",")?;
                    if !self.options.compact {
                        write!(self.writer, " ")?;
                    }
                }
            }
            write!(self.writer, ")")?;
            Ok(())
        }
    }

    fn print_value(&mut self, val: &Value) -> Result {
        match val {
            Value::Constant(constant_val) => self.print_constant_value(constant_val),
            Value::Variable(variable_val) => write!(self.writer, "${}", variable_val.name.item),
            Value::Object(object) => {
                write!(self.writer, "{{")?;
                let mut first = true;
                let sorted_object = if self.options.sort_keys {
                    let mut maybe_sorted_object = object.clone();
                    if self.options.sort_keys {
                        maybe_sorted_object.sort_by_key(|arg| arg.name());
                    }
                    Some(maybe_sorted_object)
                } else {
                    None
                };
                let maybe_sorted_object = sorted_object.as_ref().unwrap_or(object);
                for arg in maybe_sorted_object
                    .iter()
                    .filter(|arg| !matches!(arg.value.item, Value::Constant(ConstantValue::Null())))
                {
                    if first {
                        first = false;
                    } else {
                        write!(self.writer, ",")?;
                        if !self.options.compact {
                            write!(self.writer, " ")?;
                        }
                    }
                    write!(self.writer, "{}:", arg.name.item)?;
                    if !self.options.compact {
                        write!(self.writer, " ")?;
                    }
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
                        write!(self.writer, ",")?;
                        if !self.options.compact {
                            write!(self.writer, " ")?;
                        }
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
                let sorted_object = if self.options.sort_keys {
                    let mut maybe_sorted_object = object.clone();
                    if self.options.sort_keys {
                        maybe_sorted_object.sort_by_key(|arg| arg.name());
                    }
                    Some(maybe_sorted_object)
                } else {
                    None
                };
                let maybe_sorted_object = sorted_object.as_ref().unwrap_or(object);
                for arg in maybe_sorted_object {
                    if first {
                        first = false;
                    } else {
                        write!(self.writer, ",")?;
                        if !self.options.compact {
                            write!(self.writer, " ")?;
                        }
                    }
                    write!(self.writer, "{}:", arg.name.item)?;
                    if !self.options.compact {
                        write!(self.writer, " ")?;
                    }
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
                        write!(self.writer, ",")?;
                        if !self.options.compact {
                            write!(self.writer, " ")?;
                        }
                    }
                    self.print_constant_value(value)?;
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

    fn next_line(&mut self) -> Result {
        writeln!(self.writer)?;
        for _ in 0..self.indentation {
            write!(self.writer, "  ")?;
        }
        Ok(())
    }
}
