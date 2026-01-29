/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::fmt::Result as FmtResult;
use std::fmt::Write;

use common::DirectiveName;
use common::Named;
use common::NamedItem;
use common::WithLocation;
use graphql_ir::Argument;
use graphql_ir::Condition;
use graphql_ir::ConditionValue;
use graphql_ir::ConstantArgument;
use graphql_ir::ConstantValue;
use graphql_ir::Directive;
use graphql_ir::ExecutableDefinition;
use graphql_ir::FragmentDefinition;
use graphql_ir::FragmentSpread;
use graphql_ir::InlineFragment;
use graphql_ir::LinkedField;
use graphql_ir::OperationDefinition;
use graphql_ir::ScalarField;
use graphql_ir::Selection;
use graphql_ir::Value;
use graphql_ir::VariableDefinition;
use graphql_ir::VariableName;
use intern::Lookup;
use intern::string_key::Intern;
use intern::string_key::StringKey;
use schema::SDLSchema;
use schema::Schema;
use schema::Type;
use schema::TypeReference;

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

pub fn print_selection(schema: &SDLSchema, selection: &Selection) -> String {
    let mut result = String::new();
    write_selection(schema, selection, &mut result).unwrap();
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

pub fn print_directives(
    schema: &SDLSchema,
    directives: &[Directive],
    options: PrinterOptions,
) -> String {
    let mut result = String::new();
    write_directives(schema, directives, options, &mut result).unwrap();
    result
}

pub fn print_value(schema: &SDLSchema, value: &Value, options: PrinterOptions) -> String {
    let mut result = String::new();
    write_value(schema, value, options, &mut result).unwrap();
    result
}

pub fn write_definition(
    schema: &SDLSchema,
    definition: &ExecutableDefinition,
    mut result: &mut impl Write,
) -> FmtResult {
    let printer = Printer::new(schema, &mut result, PrinterOptions::default());
    printer.print_definition(definition)
}

pub fn write_operation(
    schema: &SDLSchema,
    operation: &OperationDefinition,
    options: PrinterOptions,
    mut result: &mut impl Write,
) -> FmtResult {
    let printer = Printer::new(schema, &mut result, options);
    printer.print_operation(operation)
}

pub fn write_fragment(
    schema: &SDLSchema,
    fragment: &FragmentDefinition,
    options: PrinterOptions,
    mut result: &mut impl Write,
) -> FmtResult {
    let printer = Printer::new(schema, &mut result, options);
    printer.print_fragment(fragment)
}

pub fn write_selections(
    schema: &SDLSchema,
    selections: &[Selection],
    mut result: &mut impl Write,
) -> FmtResult {
    let mut printer = Printer::new(schema, &mut result, PrinterOptions::default());
    printer.print_selections(selections, "unknown".intern())
}

pub fn write_selection(
    schema: &SDLSchema,
    selection: &Selection,
    mut result: &mut impl Write,
) -> FmtResult {
    let mut printer = Printer::new(schema, &mut result, PrinterOptions::default());
    printer.print_selection(selection, None)
}

pub fn write_arguments(
    schema: &SDLSchema,
    arguments: &[Argument],
    options: PrinterOptions,
    mut result: &mut impl Write,
) -> FmtResult {
    let mut printer = Printer::new(schema, &mut result, options);
    printer.print_arguments(arguments)
}

pub fn write_directives(
    schema: &SDLSchema,
    directives: &[Directive],
    options: PrinterOptions,
    mut result: &mut impl Write,
) -> FmtResult {
    let mut printer = Printer::new(schema, &mut result, options);
    printer.print_directives(directives, None, None)
}

pub fn write_value(
    schema: &SDLSchema,
    value: &Value,
    options: PrinterOptions,
    mut result: &mut impl Write,
) -> FmtResult {
    let mut printer = Printer::new(schema, &mut result, options);
    printer.print_value(value)
}

#[derive(Clone, Copy, Default)]
pub struct PrinterOptions {
    pub compact: bool,
    pub sort_keys: bool,
    pub json_format: bool,
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

    fn print_definition(self, definition: &ExecutableDefinition) -> FmtResult {
        match definition {
            ExecutableDefinition::Operation(operation) => self.print_operation(operation),
            ExecutableDefinition::Fragment(fragment) => self.print_fragment(fragment),
        }
    }

    fn print_operation(mut self, operation: &OperationDefinition) -> FmtResult {
        write!(self.writer, "{} {}", operation.kind, operation.name.item)?;
        self.print_variable_definitions(&operation.variable_definitions)?;
        self.print_directives(&operation.directives, None, None)?;
        self.print_selections(&operation.selections, operation.name.item.0)
    }

    fn print_fragment(mut self, fragment: &FragmentDefinition) -> FmtResult {
        let fragment_name = fragment.name.item;
        let type_condition_name = self.schema.get_type_name(fragment.type_condition);
        write!(self.writer, "fragment {fragment_name}")?;
        if fragment
            .directives
            .named(DirectiveName("argumentDefinitions".intern()))
            .is_none()
        {
            self.print_variable_definitions(&fragment.variable_definitions)?;
        }
        write!(self.writer, " on {type_condition_name}")?;

        self.print_directives(
            &fragment.directives,
            None,
            Some(&fragment.variable_definitions),
        )?;
        self.print_selections(&fragment.selections, fragment_name.0)
    }

    fn print_selections(&mut self, selections: &[Selection], name: StringKey) -> FmtResult {
        let len = selections.len();
        if len > 0 {
            self.print_optional_space()?;
            write!(self.writer, "{{")?;
            self.indentation += 1;
            self.print_new_line(true)?;

            for (i, selection) in selections.iter().enumerate() {
                self.print_selection(selection, None)?;
                if i != len - 1 {
                    self.print_item_separator()?;
                }
            }

            self.indentation -= 1;
            self.print_new_line(true)?;
            write!(self.writer, "}}")?;
        } else {
            panic!(
                "Cannot print empty selections for {name}. Please, check transforms that may produce invalid selections."
            );
        }
        Ok(())
    }

    fn print_selection(
        &mut self,
        selection: &Selection,
        conditions: Option<Vec<&Condition>>,
    ) -> FmtResult {
        match selection {
            Selection::ScalarField(field) => self.print_scalar_field(field, conditions),
            Selection::LinkedField(field) => self.print_linked_field(field, conditions),
            Selection::FragmentSpread(field) => self.print_fragment_spread(field, conditions),
            Selection::InlineFragment(field) => self.print_inline_fragment(field, conditions),
            Selection::Condition(field) => self.print_condition(field, conditions),
        }
    }

    fn print_scalar_field(
        &mut self,
        field: &ScalarField,
        conditions: Option<Vec<&Condition>>,
    ) -> FmtResult {
        let schema_field = self.schema.field(field.definition.item);
        self.print_alias_and_name(&field.alias, schema_field.name.item)?;
        self.print_arguments(&field.arguments)?;
        self.print_directives(&field.directives, conditions, None)
    }

    fn print_linked_field(
        &mut self,
        field: &LinkedField,
        conditions: Option<Vec<&Condition>>,
    ) -> FmtResult {
        let schema_field = self.schema.field(field.definition.item);
        self.print_alias_and_name(&field.alias, schema_field.name.item)?;
        self.print_arguments(&field.arguments)?;
        self.print_directives(&field.directives, conditions, None)?;
        self.print_selections(&field.selections, schema_field.name.item)?;
        Ok(())
    }

    fn print_fragment_spread(
        &mut self,
        field: &FragmentSpread,
        conditions: Option<Vec<&Condition>>,
    ) -> FmtResult {
        let fragment_name = field.fragment.item;
        write!(self.writer, "...{fragment_name}")?;
        self.print_directives(&field.directives, conditions, None)?;
        if !field.arguments.is_empty() {
            self.print_optional_space()?;
            write!(self.writer, "@arguments")?;
            self.print_arguments(&field.arguments)
        } else {
            Ok(())
        }
    }

    fn print_inline_fragment(
        &mut self,
        field: &InlineFragment,
        conditions: Option<Vec<&Condition>>,
    ) -> FmtResult {
        write!(self.writer, "...")?;
        if let Some(type_condition) = field.type_condition {
            self.print_optional_space()?;
            write!(
                self.writer,
                "on {}",
                self.schema.get_type_name(type_condition).lookup(),
            )?;
        };
        self.print_directives(&field.directives, conditions, None)?;

        let name = if let Some(type_condition) = field.type_condition {
            format!(
                "... on {}",
                self.schema.get_type_name(type_condition).lookup()
            )
            .intern()
        } else {
            "...".intern()
        };
        self.print_selections(&field.selections, name)
    }

    fn print_condition(
        &mut self,
        condition: &Condition,
        accum_conditions: Option<Vec<&Condition>>,
    ) -> FmtResult {
        let mut accum_conditions: Vec<&Condition> = accum_conditions.unwrap_or_default();
        // GraphQL spec doesn't allow repeated include or skip. See
        // https://spec.graphql.org/October2021/#sec-Directives-Are-Unique-Per-Location
        // To work around it, we extract repeated conditions into an inline fragment.
        let mut has_repeated_condition = false;
        for cond in &accum_conditions {
            if cond.passing_value == condition.passing_value {
                has_repeated_condition = true;
            }
        }
        if has_repeated_condition {
            write!(self.writer, "...")?;
            self.print_directives(&[], Some(accum_conditions), None)?;
            write!(self.writer, " {{")?;
            self.indentation += 1;
            self.print_new_line(false)?;
            accum_conditions = vec![condition];
        } else {
            accum_conditions.push(condition);
        }

        let mut is_first_selection = true;
        for selection in condition.selections.iter() {
            {
                if is_first_selection {
                    is_first_selection = false;
                } else {
                    self.print_new_line(false)?;
                }
                self.print_selection(
                    selection,
                    Some(accum_conditions.iter().rev().cloned().collect()),
                )?;
            }
        }
        if has_repeated_condition {
            self.indentation -= 1;
            self.print_new_line(false)?;
            write!(self.writer, "}}")?;
        }
        Ok(())
    }

    fn print_directives(
        &mut self,
        directives: &[Directive],
        conditions: Option<Vec<&Condition>>,
        fragment_argument_definitions: Option<&[VariableDefinition]>,
    ) -> FmtResult {
        if let Some(conditions) = conditions {
            self.print_condition_directives(conditions)?;
        }
        for directive in directives {
            if directive.name.item.0.lookup() == "argumentDefinitions" {
                self.print_argument_definitions(fragment_argument_definitions.unwrap())?;
            } else {
                self.print_directive(directive)?;
            }
        }
        Ok(())
    }

    fn print_directive(&mut self, directive: &Directive) -> FmtResult {
        self.print_optional_space()?;
        write!(self.writer, "@{}", directive.name.item)?;
        self.print_arguments(&directive.arguments)?;

        if self.options.debug_directive_data
            && let Some(data) = &directive.data
        {
            for debug_line in format!("{data:#?}").lines() {
                self.print_new_line(false)?;
                write!(self.writer, "# {debug_line}")?;
            }
            self.print_new_line(false)?;
        }

        Ok(())
    }

    fn print_condition_directives(&mut self, conditions: Vec<&Condition>) -> FmtResult {
        for condition in conditions {
            self.print_optional_space()?;
            write!(
                self.writer,
                "@{}",
                if condition.passing_value {
                    "include"
                } else {
                    "skip"
                }
            )?;
            write!(self.writer, "(if")?;
            self.print_colon_separator()?;
            match &condition.value {
                ConditionValue::Constant(value) => write!(self.writer, "{value}"),
                ConditionValue::Variable(variable) => self.print_variable(variable.name.item),
            }?;
            write!(self.writer, ")")?;
        }
        Ok(())
    }

    fn print_variable_definitions(
        &mut self,
        variable_definitions: &[VariableDefinition],
    ) -> FmtResult {
        if !variable_definitions.is_empty() {
            write!(self.writer, "(")?;
            self.indentation += 1;
            for (i, var_def) in variable_definitions.iter().enumerate() {
                if i == 0 {
                    self.print_new_line(true)?;
                } else {
                    self.print_item_separator()?;
                }
                self.print_variable_definition(var_def)?;
            }
            self.indentation -= 1;
            self.print_new_line(true)?;
            write!(self.writer, ")")?;
        }
        Ok(())
    }

    fn print_argument_definitions(
        &mut self,
        argument_definitions: &[VariableDefinition],
    ) -> FmtResult {
        if !argument_definitions.is_empty() {
            self.print_optional_space()?;
            write!(self.writer, "@argumentDefinitions(")?;
            self.indentation += 1;
            for (i, arg_def) in argument_definitions.iter().enumerate() {
                if i == 0 {
                    self.print_new_line(true)?;
                } else {
                    self.print_item_separator()?;
                }
                write!(self.writer, "{}", arg_def.name.item)?;
                self.print_colon_separator()?;
                write!(self.writer, "{{type")?;
                self.print_colon_separator()?;
                write!(self.writer, "\"")?;
                self.print_type(&arg_def.type_)?;
                write!(self.writer, "\"")?;
                if let Some(default_value) = &arg_def.default_value {
                    self.print_comma_separator()?;
                    write!(self.writer, "defaultValue")?;
                    self.print_colon_separator()?;
                    self.print_constant_value(&default_value.item)?;
                }
                write!(self.writer, "}}")?;
            }
            self.indentation -= 1;
            self.print_new_line(true)?;
            write!(self.writer, ")")?;
        }
        Ok(())
    }

    fn print_arguments(&mut self, arguments: &[Argument]) -> FmtResult {
        if arguments.is_empty() {
            Ok(())
        } else {
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

            write!(self.writer, "(")?;
            for (i, argument) in maybe_sorted_arguments.iter().enumerate() {
                self.print_argument(argument)?;
                if i != arguments.len() - 1 {
                    self.print_comma_separator()?;
                }
            }
            write!(self.writer, ")")
        }
    }

    fn print_value(&mut self, val: &Value) -> FmtResult {
        match val {
            Value::Constant(constant_val) => self.print_constant_value(constant_val),
            Value::Variable(variable_val) => self.print_variable(variable_val.name.item),
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
                        self.print_comma_separator()?;
                    }
                    if self.options.json_format {
                        write!(self.writer, "\"{}\":", arg.name.item)?;
                    } else {
                        write!(self.writer, "{}:", arg.name.item)?;
                    }
                    self.print_optional_space()?;
                    self.print_value(&arg.value.item)?;
                }
                write!(self.writer, "}}")
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
                        self.print_comma_separator()?;
                    }
                    self.print_value(value)?;
                }
                write!(self.writer, "]")
            }
        }
    }

    fn print_constant_value(&mut self, constant_val: &ConstantValue) -> FmtResult {
        match &constant_val {
            ConstantValue::String(val) => write!(self.writer, "\"{val}\""),
            ConstantValue::Float(val) => write!(self.writer, "{val}"),
            ConstantValue::Int(val) => write!(self.writer, "{val}"),
            ConstantValue::Boolean(val) => write!(self.writer, "{val}"),
            ConstantValue::Null() => write!(self.writer, "null"),
            ConstantValue::Enum(val) => {
                if self.options.json_format {
                    write!(self.writer, "\"{val}\"")
                } else {
                    write!(self.writer, "{val}")
                }
            }
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
                        self.print_comma_separator()?;
                    }
                    self.print_constant_object_field(arg)?;
                }
                write!(self.writer, "}}")
            }
            ConstantValue::List(list) => {
                write!(self.writer, "[")?;
                let mut first = true;
                for value in list {
                    if first {
                        first = false;
                    } else {
                        self.print_comma_separator()?;
                    }
                    self.print_constant_value(value)?;
                }
                write!(self.writer, "]")
            }
        }
    }

    fn print_alias_and_name(
        &mut self,
        alias: &Option<WithLocation<StringKey>>,
        name: StringKey,
    ) -> FmtResult {
        if let Some(alias) = alias
            && alias.item != name
        {
            write!(self.writer, "{}", alias.item)?;
            self.print_colon_separator()?;
        }
        write!(self.writer, "{name}")
    }

    fn print_argument(&mut self, argument: &Argument) -> FmtResult {
        write!(self.writer, "{}", argument.name.item)?;
        self.print_colon_separator()?;
        self.print_value(&argument.value.item)
    }

    fn print_variable_definition(&mut self, var_def: &VariableDefinition) -> FmtResult {
        self.print_variable(var_def.name.item)?;
        self.print_colon_separator()?;
        self.print_type(&var_def.type_)?;

        if let Some(default_value) = &var_def.default_value {
            self.print_default_value(&default_value.item)?;
        }

        self.print_directives(&var_def.directives, None, None)
    }

    fn print_constant_object_field(&mut self, arg: &ConstantArgument) -> FmtResult {
        if self.options.json_format {
            write!(self.writer, "\"{}\"", arg.name.item)?;
        } else {
            write!(self.writer, "{}", arg.name.item)?;
        }
        self.print_colon_separator()?;
        self.print_constant_value(&arg.value.item)
    }

    fn print_variable(&mut self, variable: VariableName) -> FmtResult {
        write!(self.writer, "${variable}")
    }

    fn print_default_value(&mut self, value: &ConstantValue) -> FmtResult {
        self.print_optional_space()?;
        write!(self.writer, "=")?;
        self.print_optional_space()?;
        self.print_constant_value(value)
    }

    fn print_type(&mut self, type_: &TypeReference<Type>) -> FmtResult {
        write!(self.writer, "{}", self.schema.get_type_string(type_))
    }

    fn print_new_line(&mut self, can_skip_from_this_location: bool) -> FmtResult {
        if self.options.compact && can_skip_from_this_location {
            return Ok(());
        }
        writeln!(self.writer)?;
        for _ in 0..self.indentation {
            write!(self.writer, "  ")?;
        }
        Ok(())
    }

    fn print_optional_space(&mut self) -> FmtResult {
        if self.options.compact {
            return Ok(());
        }
        write!(self.writer, " ")
    }

    fn print_comma_separator(&mut self) -> FmtResult {
        write!(self.writer, ",")?;
        self.print_optional_space()
    }

    fn print_colon_separator(&mut self) -> FmtResult {
        write!(self.writer, ":")?;
        self.print_optional_space()
    }

    fn print_item_separator(&mut self) -> FmtResult {
        if self.options.compact {
            write!(self.writer, ",")
        } else {
            self.print_new_line(false)
        }
    }
}
