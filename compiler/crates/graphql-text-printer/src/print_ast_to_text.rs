/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::fmt::Result as FmtResult;
use std::fmt::Write;

use graphql_syntax::Argument;
use graphql_syntax::Directive;
use graphql_syntax::ExecutableDefinition;
use graphql_syntax::FragmentDefinition;
use graphql_syntax::FragmentSpread;
use graphql_syntax::InlineFragment;
use graphql_syntax::LinkedField;
use graphql_syntax::List;
use graphql_syntax::OperationDefinition;
use graphql_syntax::ScalarField;
use graphql_syntax::Selection;
use graphql_syntax::VariableDefinition;

pub fn print_operation_ast(node: &OperationDefinition) -> String {
    let mut printer: Printer = Default::default();
    printer.print_operation(node).unwrap();

    printer.output
}

pub fn print_fragment_ast(node: &FragmentDefinition) -> String {
    let mut printer: Printer = Default::default();
    printer.print_fragment(node).unwrap();

    printer.output
}

pub fn print_executable_definition_ast(node: &ExecutableDefinition) -> String {
    match node {
        ExecutableDefinition::Operation(operation) => print_operation_ast(operation),
        ExecutableDefinition::Fragment(fragment) => print_fragment_ast(fragment),
    }
}

#[derive(Default)]
struct Printer {
    output: String,
}

impl Printer {
    fn print_operation(&mut self, operation: &OperationDefinition) -> FmtResult {
        if let Some((_, operation_kind)) = operation.operation {
            write!(self.output, "{}", operation_kind)?;
        };
        if let Some(name) = &operation.name {
            write!(self.output, " {}", name.value)?;
        }
        if let Some(variable_definitions) = &operation.variable_definitions {
            self.print_variable_definitions(variable_definitions)?;
        }
        self.print_directives(&operation.directives)?;
        writeln!(self.output, " {{")?;
        self.print_selections(&operation.selections, "  ")?;
        write!(self.output, "}}")?;

        Ok(())
    }

    fn print_fragment(&mut self, fragment: &FragmentDefinition) -> FmtResult {
        write!(self.output, "fragment {}", fragment.name)?;
        if let Some(variable_definitions) = &fragment.variable_definitions {
            self.print_variable_definitions(variable_definitions)?;
        }
        write!(self.output, " {}", fragment.type_condition)?;
        self.print_directives(&fragment.directives)?;
        writeln!(self.output, " {{")?;
        self.print_selections(&fragment.selections, "  ")?;
        write!(self.output, "}}")?;

        Ok(())
    }

    fn print_variable_definitions(
        &mut self,
        variable_definitions: &List<VariableDefinition>,
    ) -> FmtResult {
        write!(self.output, "(")?;
        let last = variable_definitions.items.last();
        for variable_definition in &variable_definitions.items {
            self.print_variable_definition(variable_definition)?;
            if let Some(last) = last {
                if last != variable_definition {
                    write!(self.output, ", ")?;
                }
            }
        }
        write!(self.output, ")")?;

        Ok(())
    }

    fn print_variable_definition(&mut self, variable_definition: &VariableDefinition) -> FmtResult {
        write!(
            self.output,
            "{}: {}",
            variable_definition.name, variable_definition.type_
        )?;
        if let Some(default_value) = &variable_definition.default_value {
            write!(self.output, " = {}", default_value)?;
        }
        self.print_directives(&variable_definition.directives)?;

        Ok(())
    }

    fn print_directives(&mut self, directives: &[Directive]) -> FmtResult {
        for directive in directives {
            self.print_directive(directive)?;
        }

        Ok(())
    }

    fn print_directive(&mut self, directive: &Directive) -> FmtResult {
        write!(self.output, " @{}", directive.name)?;

        if let Some(arguments) = &directive.arguments {
            self.print_arguments(arguments)?;
        }

        Ok(())
    }

    fn print_arguments(&mut self, arguments: &List<Argument>) -> FmtResult {
        write!(self.output, "(")?;
        let last_arg = arguments.items.last();
        for argument in &arguments.items {
            write!(self.output, "{}", argument)?;
            if let Some(last_arg) = last_arg {
                if last_arg != argument {
                    write!(self.output, ", ")?;
                }
            }
        }
        write!(self.output, ")")?;
        Ok(())
    }

    fn print_selections(&mut self, selections: &List<Selection>, indent: &str) -> FmtResult {
        for selection in &selections.items {
            self.print_selection(selection, indent)?;
            writeln!(self.output)?;
        }

        Ok(())
    }

    fn print_selection(&mut self, selection: &Selection, indent: &str) -> FmtResult {
        write!(self.output, "{}", indent)?;
        match selection {
            Selection::FragmentSpread(node) => self.print_fragment_spread(node),
            Selection::InlineFragment(node) => self.print_inline_fragment(node, indent),
            Selection::LinkedField(node) => self.print_linked_field(node, indent),
            Selection::ScalarField(node) => self.print_scalar_field(node),
        }
    }

    fn print_fragment_spread(&mut self, node: &FragmentSpread) -> FmtResult {
        write!(self.output, "...{}", node.name)?;
        if let Some(arguments) = &node.arguments {
            self.print_arguments(arguments)?;
        }
        self.print_directives(&node.directives)?;

        Ok(())
    }

    fn print_inline_fragment(&mut self, node: &InlineFragment, indent: &str) -> FmtResult {
        write!(self.output, "...")?;
        if let Some(type_condition) = &node.type_condition {
            write!(self.output, " {}", type_condition)?;
        }
        self.print_directives(&node.directives)?;
        writeln!(self.output, " {{")?;
        self.print_selections(&node.selections, &format!("  {}", indent))?;
        write!(self.output, "{}}}", indent)?;
        Ok(())
    }

    fn print_linked_field(&mut self, node: &LinkedField, indent: &str) -> FmtResult {
        if let Some(alias) = &node.alias {
            write!(self.output, "{}: ", alias)?;
        }

        write!(self.output, "{}", node.name)?;
        if let Some(arguments) = &node.arguments {
            self.print_arguments(arguments)?;
        }
        self.print_directives(&node.directives)?;
        writeln!(self.output, " {{")?;
        self.print_selections(&node.selections, &format!("  {}", indent))?;
        write!(self.output, "{}}}", indent)?;
        Ok(())
    }

    fn print_scalar_field(&mut self, node: &ScalarField) -> FmtResult {
        if let Some(alias) = &node.alias {
            write!(self.output, "{}: ", alias)?;
        }

        write!(self.output, "{}", node.name)?;
        if let Some(arguments) = &node.arguments {
            self.print_arguments(arguments)?;
        }
        self.print_directives(&node.directives)?;

        Ok(())
    }
}
