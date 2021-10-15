/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::DiagnosticsResult;
use errors::{validate, validate_map};

use crate::ir::*;
use crate::program::Program;

pub trait Validator {
    const NAME: &'static str;
    const VALIDATE_ARGUMENTS: bool;
    const VALIDATE_DIRECTIVES: bool;

    fn validate_program(&mut self, program: &Program) -> DiagnosticsResult<()> {
        self.default_validate_program(program)
    }

    fn default_validate_program(&mut self, program: &Program) -> DiagnosticsResult<()> {
        validate!(
            validate_map(program.operations(), |operation| {
                self.validate_operation(operation)
            }),
            validate_map(program.fragments(), |fragment| {
                self.validate_fragment(fragment)
            })
        )
    }

    // Fragment Definition
    fn validate_fragment(&mut self, fragment: &FragmentDefinition) -> DiagnosticsResult<()> {
        self.default_validate_fragment(fragment)
    }

    fn default_validate_fragment(
        &mut self,
        fragment: &FragmentDefinition,
    ) -> DiagnosticsResult<()> {
        validate!(
            self.validate_selections(&fragment.selections),
            self.validate_directives(&fragment.directives)
        )
    }

    // Operation Definition
    fn validate_operation(&mut self, operation: &OperationDefinition) -> DiagnosticsResult<()> {
        self.default_validate_operation(operation)
    }

    fn default_validate_operation(
        &mut self,
        operation: &OperationDefinition,
    ) -> DiagnosticsResult<()> {
        validate!(
            self.validate_directives(&operation.directives),
            self.validate_selections(&operation.selections)
        )
    }

    // Selection
    fn validate_selections(&mut self, selections: &[Selection]) -> DiagnosticsResult<()> {
        self.validate_list(selections, Self::validate_selection)
    }

    fn validate_selection(&mut self, selection: &Selection) -> DiagnosticsResult<()> {
        self.default_validate_selection(selection)
    }

    fn default_validate_selection(&mut self, selection: &Selection) -> DiagnosticsResult<()> {
        match selection {
            Selection::FragmentSpread(selection) => self.validate_fragment_spread(selection),
            Selection::InlineFragment(selection) => self.validate_inline_fragment(selection),
            Selection::LinkedField(selection) => self.validate_linked_field(selection),
            Selection::ScalarField(selection) => self.validate_scalar_field(selection),
            Selection::Condition(selection) => self.validate_condition(selection),
        }
    }

    // Selection Kinds
    fn validate_scalar_field(&mut self, field: &ScalarField) -> DiagnosticsResult<()> {
        self.default_validate_scalar_field(field)
    }

    fn default_validate_scalar_field(&mut self, field: &ScalarField) -> DiagnosticsResult<()> {
        validate!(
            self.validate_arguments(&field.arguments),
            self.validate_directives(&field.directives)
        )
    }

    fn validate_linked_field(&mut self, field: &LinkedField) -> DiagnosticsResult<()> {
        self.default_validate_linked_field(field)
    }

    fn default_validate_linked_field(&mut self, field: &LinkedField) -> DiagnosticsResult<()> {
        validate!(
            self.validate_selections(&field.selections),
            self.validate_arguments(&field.arguments),
            self.validate_directives(&field.directives)
        )
    }

    fn validate_inline_fragment(&mut self, fragment: &InlineFragment) -> DiagnosticsResult<()> {
        self.default_validate_inline_fragment(fragment)
    }

    fn default_validate_inline_fragment(
        &mut self,
        fragment: &InlineFragment,
    ) -> DiagnosticsResult<()> {
        validate!(
            self.validate_selections(&fragment.selections),
            self.validate_directives(&fragment.directives)
        )
    }

    fn validate_fragment_spread(&mut self, spread: &FragmentSpread) -> DiagnosticsResult<()> {
        self.default_validate_fragment_spread(spread)
    }

    fn default_validate_fragment_spread(
        &mut self,
        spread: &FragmentSpread,
    ) -> DiagnosticsResult<()> {
        validate!(
            self.validate_arguments(&spread.arguments),
            self.validate_directives(&spread.directives)
        )
    }

    fn validate_condition(&mut self, condition: &Condition) -> DiagnosticsResult<()> {
        self.default_validate_condition(condition)
    }

    fn default_validate_condition(&mut self, condition: &Condition) -> DiagnosticsResult<()> {
        validate!(
            self.validate_condition_value(&condition.value),
            self.validate_selections(&condition.selections)
        )
    }

    fn validate_condition_value(
        &mut self,
        condition_value: &ConditionValue,
    ) -> DiagnosticsResult<()> {
        self.default_validate_condition_value(condition_value)
    }

    fn default_validate_condition_value(
        &mut self,
        condition_value: &ConditionValue,
    ) -> DiagnosticsResult<()> {
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
    fn validate_directives(&mut self, directives: &[Directive]) -> DiagnosticsResult<()> {
        if Self::VALIDATE_DIRECTIVES {
            self.validate_list(directives, Self::validate_directive)
        } else {
            Ok(())
        }
    }

    fn validate_directive(&mut self, directive: &Directive) -> DiagnosticsResult<()> {
        self.default_validate_directive(directive)
    }

    fn default_validate_directive(&mut self, directive: &Directive) -> DiagnosticsResult<()> {
        self.validate_arguments(&directive.arguments)
    }

    // Arguments
    fn validate_arguments(&mut self, arguments: &[Argument]) -> DiagnosticsResult<()> {
        if Self::VALIDATE_ARGUMENTS {
            self.validate_list(arguments, Self::validate_argument)?;
        }
        Ok(())
    }

    fn validate_argument(&mut self, argument: &Argument) -> DiagnosticsResult<()> {
        self.default_validate_argument(argument)
    }

    fn default_validate_argument(&mut self, argument: &Argument) -> DiagnosticsResult<()> {
        self.validate_value(&argument.value.item)
    }

    // Values
    fn validate_value(&mut self, value: &Value) -> DiagnosticsResult<()> {
        self.default_validate_value(value)
    }

    fn default_validate_value(&mut self, value: &Value) -> DiagnosticsResult<()> {
        match value {
            Value::Variable(variable) => self.validate_variable(variable),
            Value::Constant(_) => Ok(()),
            Value::List(items) => self.validate_list(items, Self::validate_value),
            Value::Object(arguments) => self.validate_arguments(arguments),
        }
    }

    fn validate_variable(&mut self, value: &Variable) -> DiagnosticsResult<()> {
        let _ = value;
        Ok(())
    }

    // Helpers
    fn validate_list<F, T>(&mut self, list: &[T], f: F) -> DiagnosticsResult<()>
    where
        F: Fn(&mut Self, &T) -> DiagnosticsResult<()>,
    {
        validate_map(list, |item| f(self, item))
    }
}
