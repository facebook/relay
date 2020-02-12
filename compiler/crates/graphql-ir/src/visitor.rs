/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::ir::*;

pub trait Visitor {
    const NAME: &'static str;
    const VISIT_ARGUMENTS: bool;
    const VISIT_DIRECTIVES: bool;

    // Fragment Definition
    fn visit_fragment(&mut self, fragment: &FragmentDefinition) {
        self.super_fragment(fragment)
    }

    fn super_fragment(&mut self, fragment: &FragmentDefinition) {
        self.visit_selections(&fragment.selections);
        self.visit_directives(&fragment.directives);
    }

    // Operation Definition
    fn visit_operation(&mut self, operation: &OperationDefinition) {
        self.super_operation(operation)
    }

    fn super_operation(&mut self, operation: &OperationDefinition) {
        self.visit_directives(&operation.directives);
        self.visit_selections(&operation.selections);
    }

    // Selection
    fn visit_selections(&mut self, selections: &[Selection]) {
        self.visit_list(selections, Self::visit_selection)
    }

    fn visit_selection(&mut self, selection: &Selection) {
        self.super_selection(selection)
    }

    fn super_selection(&mut self, selection: &Selection) {
        match selection {
            Selection::FragmentSpread(selection) => self.visit_fragment_spread(selection),
            Selection::InlineFragment(selection) => self.visit_inline_fragment(selection),
            Selection::LinkedField(selection) => self.visit_linked_field(selection),
            Selection::ScalarField(selection) => self.visit_scalar_field(selection),
        }
    }

    // Selection Kinds
    fn visit_scalar_field(&mut self, field: &ScalarField) {
        self.super_scalar_field(field)
    }

    fn super_scalar_field(&mut self, field: &ScalarField) {
        self.visit_arguments(&field.arguments);
        self.visit_directives(&field.directives);
    }

    fn visit_linked_field(&mut self, field: &LinkedField) {
        self.super_linked_field(field)
    }

    fn super_linked_field(&mut self, field: &LinkedField) {
        self.visit_selections(&field.selections);
        self.visit_arguments(&field.arguments);
        self.visit_directives(&field.directives);
    }

    fn visit_inline_fragment(&mut self, fragment: &InlineFragment) {
        self.super_inline_fragment(fragment)
    }

    fn super_inline_fragment(&mut self, fragment: &InlineFragment) {
        self.visit_selections(&fragment.selections);
        self.visit_directives(&fragment.directives);
    }

    fn visit_fragment_spread(&mut self, spread: &FragmentSpread) {
        self.super_fragment_spread(spread)
    }
    fn super_fragment_spread(&mut self, spread: &FragmentSpread) {
        self.visit_arguments(&spread.arguments);
        self.visit_directives(&spread.directives);
    }

    // Directives
    fn visit_directives(&mut self, directives: &[Directive]) {
        if Self::VISIT_DIRECTIVES {
            self.visit_list(directives, Self::visit_directive)
        }
    }

    fn visit_directive(&mut self, directive: &Directive) {
        self.super_directive(directive)
    }

    fn super_directive(&mut self, directive: &Directive) {
        self.visit_arguments(&directive.arguments)
    }

    // Arguments
    fn visit_arguments(&mut self, arguments: &[Argument]) {
        if Self::VISIT_ARGUMENTS {
            self.visit_list(arguments, Self::visit_argument)
        }
    }

    fn visit_argument(&mut self, argument: &Argument) {
        self.super_argument(argument)
    }

    fn super_argument(&mut self, argument: &Argument) {
        self.visit_value(&argument.value.item)
    }

    // Values
    fn visit_value(&mut self, value: &Value) {
        self.super_value(value)
    }

    fn super_value(&mut self, value: &Value) {
        match value {
            Value::Variable(variable) => self.visit_variable(variable),
            Value::Constant(_) => (),
            Value::List(items) => self.visit_list(items, Self::visit_value),
            Value::Object(arguments) => self.visit_arguments(arguments),
        }
    }

    fn visit_variable(&mut self, value: &Variable) {
        let _ = value;
    }

    // Helpers
    fn visit_list<F, T>(&mut self, list: &[T], f: F)
    where
        F: Fn(&mut Self, &T) -> (),
        T: Clone,
    {
        for prev_item in list {
            f(self, prev_item)
        }
    }
}
