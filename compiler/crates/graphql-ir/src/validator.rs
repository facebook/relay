/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::errors::ValidationResult;
use errors::{try2, try3, try_map};

use crate::ir::*;
use crate::program::Program;
pub trait Validator {
    const NAME: &'static str;
    const VALIDATE_ARGUMENTS: bool;
    const VALIDATE_DIRECTIVES: bool;

    fn validate_program<'s>(&mut self, program: &Program<'s>) -> ValidationResult<()> {
        self.default_validate_program(program)
    }

    fn default_validate_program<'s>(&mut self, program: &Program<'s>) -> ValidationResult<()> {
        try2(
            try_map(program.operations(), |operation| {
                self.validate_operation(operation)
            }),
            try_map(program.fragments(), |fragment| {
                self.validate_fragment(fragment)
            }),
        )?;
        Ok(())
    }

    // Fragment Definition
    fn validate_fragment(&mut self, fragment: &FragmentDefinition) -> ValidationResult<()> {
        self.default_validate_fragment(fragment)
    }

    fn default_validate_fragment(&mut self, fragment: &FragmentDefinition) -> ValidationResult<()> {
        try2(
            self.validate_selections(&fragment.selections),
            self.validate_directives(&fragment.directives),
        )?;
        Ok(())
    }

    // Operation Definition
    fn validate_operation(&mut self, operation: &OperationDefinition) -> ValidationResult<()> {
        self.default_validate_operation(operation)
    }

    fn default_validate_operation(
        &mut self,
        operation: &OperationDefinition,
    ) -> ValidationResult<()> {
        try2(
            self.validate_directives(&operation.directives),
            self.validate_selections(&operation.selections),
        )?;
        Ok(())
    }

    // Selection
    fn validate_selections(&mut self, selections: &[Selection]) -> ValidationResult<()> {
        self.validate_list(selections, Self::validate_selection)
    }

    fn validate_selection(&mut self, selection: &Selection) -> ValidationResult<()> {
        self.default_validate_selection(selection)
    }

    fn default_validate_selection(&mut self, selection: &Selection) -> ValidationResult<()> {
        match selection {
            Selection::FragmentSpread(selection) => self.validate_fragment_spread(selection),
            Selection::InlineFragment(selection) => self.validate_inline_fragment(selection),
            Selection::LinkedField(selection) => self.validate_linked_field(selection),
            Selection::ScalarField(selection) => self.validate_scalar_field(selection),
            Selection::Condition(selection) => self.validate_condition(selection),
        }
    }

    // Selection Kinds
    fn validate_scalar_field(&mut self, field: &ScalarField) -> ValidationResult<()> {
        self.default_validate_scalar_field(field)
    }

    fn default_validate_scalar_field(&mut self, field: &ScalarField) -> ValidationResult<()> {
        try2(
            self.validate_arguments(&field.arguments),
            self.validate_directives(&field.directives),
        )?;
        Ok(())
    }

    fn validate_linked_field(&mut self, field: &LinkedField) -> ValidationResult<()> {
        self.default_validate_linked_field(field)
    }

    fn default_validate_linked_field(&mut self, field: &LinkedField) -> ValidationResult<()> {
        try3(
            self.validate_selections(&field.selections),
            self.validate_arguments(&field.arguments),
            self.validate_directives(&field.directives),
        )?;
        Ok(())
    }

    fn validate_inline_fragment(&mut self, fragment: &InlineFragment) -> ValidationResult<()> {
        self.default_validate_inline_fragment(fragment)
    }

    fn default_validate_inline_fragment(
        &mut self,
        fragment: &InlineFragment,
    ) -> ValidationResult<()> {
        try2(
            self.validate_selections(&fragment.selections),
            self.validate_directives(&fragment.directives),
        )?;
        Ok(())
    }

    fn validate_fragment_spread(&mut self, spread: &FragmentSpread) -> ValidationResult<()> {
        self.default_validate_fragment_spread(spread)
    }

    fn default_validate_fragment_spread(
        &mut self,
        spread: &FragmentSpread,
    ) -> ValidationResult<()> {
        try2(
            self.validate_arguments(&spread.arguments),
            self.validate_directives(&spread.directives),
        )?;
        Ok(())
    }

    fn validate_condition(&mut self, condition: &Condition) -> ValidationResult<()> {
        self.default_validate_condition(condition)
    }

    fn default_validate_condition(&mut self, condition: &Condition) -> ValidationResult<()> {
        try2(
            self.validate_condition_value(&condition.value),
            self.validate_selections(&condition.selections),
        )?;
        Ok(())
    }

    fn validate_condition_value(
        &mut self,
        condition_value: &ConditionValue,
    ) -> ValidationResult<()> {
        self.default_validate_condition_value(condition_value)
    }

    fn default_validate_condition_value(
        &mut self,
        condition_value: &ConditionValue,
    ) -> ValidationResult<()> {
        if Self::VALIDATE_ARGUMENTS {
            match condition_value {
                ConditionValue::Variable(variable) => self.validate_variable(variable),
                ConditionValue::Constant(_) => Ok(()),
            }
        } else {
            Ok(())
        }
    }

    // Directives
    fn validate_directives(&mut self, directives: &[Directive]) -> ValidationResult<()> {
        if Self::VALIDATE_DIRECTIVES {
            self.validate_list(directives, Self::validate_directive)
        } else {
            Ok(())
        }
    }

    fn validate_directive(&mut self, directive: &Directive) -> ValidationResult<()> {
        self.default_validate_directive(directive)
    }

    fn default_validate_directive(&mut self, directive: &Directive) -> ValidationResult<()> {
        self.validate_arguments(&directive.arguments)
    }

    // Arguments
    fn validate_arguments(&mut self, arguments: &[Argument]) -> ValidationResult<()> {
        if Self::VALIDATE_ARGUMENTS {
            self.validate_list(arguments, Self::validate_argument)?;
        }
        Ok(())
    }

    fn validate_argument(&mut self, argument: &Argument) -> ValidationResult<()> {
        self.default_validate_argument(argument)
    }

    fn default_validate_argument(&mut self, argument: &Argument) -> ValidationResult<()> {
        self.validate_value(&argument.value.item)
    }

    // Values
    fn validate_value(&mut self, value: &Value) -> ValidationResult<()> {
        self.default_validate_value(value)
    }

    fn default_validate_value(&mut self, value: &Value) -> ValidationResult<()> {
        match value {
            Value::Variable(variable) => self.validate_variable(variable),
            Value::Constant(_) => Ok(()),
            Value::List(items) => self.validate_list(items, Self::validate_value),
            Value::Object(arguments) => self.validate_arguments(arguments),
        }
    }

    fn validate_variable(&mut self, value: &Variable) -> ValidationResult<()> {
        let _ = value;
        Ok(())
    }

    // Helpers
    fn validate_list<F, T>(&mut self, list: &[T], f: F) -> ValidationResult<()>
    where
        F: Fn(&mut Self, &T) -> ValidationResult<()>,
        T: Clone,
    {
        try_map(list, |item| f(self, item))?;
        Ok(())
    }
}
