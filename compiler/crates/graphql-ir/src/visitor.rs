/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::ir::*;
use crate::program::Program;

pub trait Visitor {
    const NAME: &'static str;
    const VISIT_ARGUMENTS: bool;
    const VISIT_DIRECTIVES: bool;

    fn visit_program(&mut self, program: &Program) {
        self.default_visit_program(program)
    }

    fn default_visit_program(&mut self, program: &Program) {
        for operation in program.operations() {
            self.visit_operation(operation);
        }
        for fragment in program.fragments() {
            self.visit_fragment(fragment);
        }
    }

    // Fragment Definition
    fn visit_fragment(&mut self, fragment: &FragmentDefinition) {
        self.default_visit_fragment(fragment)
    }

    fn default_visit_fragment(&mut self, fragment: &FragmentDefinition) {
        self.visit_selections(&fragment.selections);
        self.visit_directives(&fragment.directives);
        self.visit_variable_definitions(&fragment.variable_definitions);
        self.visit_variable_definitions(&fragment.used_global_variables);
    }

    // Operation Definition
    fn visit_operation(&mut self, operation: &OperationDefinition) {
        self.default_visit_operation(operation)
    }

    fn default_visit_operation(&mut self, operation: &OperationDefinition) {
        self.visit_directives(&operation.directives);
        self.visit_selections(&operation.selections);
        self.visit_variable_definitions(&operation.variable_definitions);
    }

    // Selection
    fn visit_selections(&mut self, selections: &[Selection]) {
        self.visit_list(selections, Self::visit_selection)
    }

    fn visit_selection(&mut self, selection: &Selection) {
        self.default_visit_selection(selection)
    }

    fn default_visit_selection(&mut self, selection: &Selection) {
        match selection {
            Selection::FragmentSpread(selection) => self.visit_fragment_spread(selection),
            Selection::InlineFragment(selection) => self.visit_inline_fragment(selection),
            Selection::LinkedField(selection) => self.visit_linked_field(selection),
            Selection::ScalarField(selection) => self.visit_scalar_field(selection),
            Selection::Condition(selection) => self.visit_condition(selection),
        }
    }

    // Selection Kinds
    fn visit_scalar_field(&mut self, field: &ScalarField) {
        self.default_visit_scalar_field(field)
    }

    fn default_visit_scalar_field(&mut self, field: &ScalarField) {
        self.visit_arguments(&field.arguments);
        self.visit_directives(&field.directives);
    }

    fn visit_linked_field(&mut self, field: &LinkedField) {
        self.default_visit_linked_field(field)
    }

    fn default_visit_linked_field(&mut self, field: &LinkedField) {
        self.visit_arguments(&field.arguments);
        self.visit_directives(&field.directives);
        self.visit_selections(&field.selections);
    }

    fn visit_inline_fragment(&mut self, fragment: &InlineFragment) {
        self.default_visit_inline_fragment(fragment)
    }

    fn default_visit_inline_fragment(&mut self, fragment: &InlineFragment) {
        self.visit_directives(&fragment.directives);
        self.visit_selections(&fragment.selections);
    }

    fn visit_fragment_spread(&mut self, spread: &FragmentSpread) {
        self.default_visit_fragment_spread(spread)
    }
    fn default_visit_fragment_spread(&mut self, spread: &FragmentSpread) {
        self.visit_arguments(&spread.arguments);
        self.visit_directives(&spread.directives);
    }

    fn visit_condition(&mut self, condition: &Condition) {
        self.default_visit_condition(condition)
    }
    fn default_visit_condition(&mut self, condition: &Condition) {
        self.visit_condition_value(&condition.value);
        self.visit_selections(&condition.selections);
    }

    fn visit_condition_value(&mut self, condition_value: &ConditionValue) {
        self.default_visit_condition_value(condition_value);
    }
    fn default_visit_condition_value(&mut self, condition_value: &ConditionValue) {
        if Self::VISIT_ARGUMENTS {
            match condition_value {
                ConditionValue::Variable(variable) => self.visit_variable(variable),
                ConditionValue::Constant(_) => {}
            }
        }
    }

    // Directives
    fn visit_directives(&mut self, directives: &[Directive]) {
        if Self::VISIT_DIRECTIVES {
            self.visit_list(directives, Self::visit_directive)
        }
    }

    fn visit_directive(&mut self, directive: &Directive) {
        self.default_visit_directive(directive)
    }

    fn default_visit_directive(&mut self, directive: &Directive) {
        self.visit_arguments(&directive.arguments)
    }

    // Arguments
    fn visit_arguments(&mut self, arguments: &[Argument]) {
        if Self::VISIT_ARGUMENTS {
            self.visit_list(arguments, Self::visit_argument)
        }
    }

    fn visit_argument(&mut self, argument: &Argument) {
        self.default_visit_argument(argument)
    }

    fn default_visit_argument(&mut self, argument: &Argument) {
        self.visit_value(&argument.value.item)
    }

    // Values
    fn visit_value(&mut self, value: &Value) {
        self.default_visit_value(value)
    }

    fn default_visit_value(&mut self, value: &Value) {
        match value {
            Value::Variable(variable) => self.visit_variable(variable),
            Value::Constant(_) => {}
            Value::List(items) => self.visit_list(items, Self::visit_value),
            Value::Object(arguments) => self.visit_arguments(arguments),
        }
    }

    fn visit_variable(&mut self, value: &Variable) {
        let _ = value;
    }

    // Variable Definitions
    fn visit_variable_definitions(&mut self, variable_definitions: &[VariableDefinition]) {
        self.visit_list(variable_definitions, Self::visit_variable_definition)
    }

    fn visit_variable_definition(&mut self, variable_definition: &VariableDefinition) {
        self.default_visit_variable_definition(variable_definition)
    }

    fn default_visit_variable_definition(&mut self, variable_definition: &VariableDefinition) {
        self.visit_directives(&variable_definition.directives)
    }

    // Helpers
    fn visit_list<F, T>(&mut self, list: &[T], f: F)
    where
        F: Fn(&mut Self, &T),
        T: Clone,
    {
        for prev_item in list {
            f(self, prev_item)
        }
    }
}
