/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::ir::*;
use crate::program::Program;
use common::Spanned;
use std::sync::Arc;

pub trait Transformer {
    const NAME: &'static str;
    const VISIT_ARGUMENTS: bool;
    const VISIT_DIRECTIVES: bool;

    fn transform_program<'s>(&mut self, program: &Program<'s>) -> Option<Program<'s>> {
        self.default_transform_program(program)
    }

    fn default_transform_program<'s>(&mut self, program: &Program<'s>) -> Option<Program<'s>> {
        let mut next_program = Program::new(program.schema());
        let mut has_changes = false;
        for operation in program.operations() {
            match self.transform_operation(operation) {
                Transformed::Delete => has_changes = true,
                Transformed::Keep => next_program.insert_operation(Arc::clone(operation)),
                Transformed::Replace(replacement) => {
                    has_changes = true;
                    next_program.insert_operation(Arc::new(replacement))
                }
            }
        }
        for fragment in program.fragments() {
            match self.transform_fragment(fragment) {
                Transformed::Delete => has_changes = true,
                Transformed::Keep => next_program.insert_fragment(Arc::clone(fragment)),
                Transformed::Replace(replacement) => {
                    has_changes = true;
                    next_program.insert_fragment(Arc::new(replacement))
                }
            }
        }
        if has_changes {
            Some(next_program)
        } else {
            None
        }
    }

    // Fragment Definition
    fn transform_fragment(
        &mut self,
        fragment: &FragmentDefinition,
    ) -> Transformed<FragmentDefinition> {
        self.default_transform_fragment(fragment)
    }

    fn default_transform_fragment(
        &mut self,
        fragment: &FragmentDefinition,
    ) -> Transformed<FragmentDefinition> {
        // Special-case for empty selections
        let selections = self.transform_selections(&fragment.selections);
        if let Some(selections) = &selections {
            if selections.is_empty() {
                return Transformed::Delete;
            }
        }
        let directives = self.transform_directives(&fragment.directives);
        if selections.is_none() && directives.is_none() {
            return Transformed::Keep;
        }
        Transformed::Replace(FragmentDefinition {
            directives: directives.unwrap_or_else(|| fragment.directives.clone()),
            selections: selections.unwrap_or_else(|| fragment.selections.clone()),
            ..fragment.clone()
        })
    }

    // Operation Definition
    fn transform_operation(
        &mut self,
        operation: &OperationDefinition,
    ) -> Transformed<OperationDefinition> {
        self.default_transform_operation(operation)
    }

    fn default_transform_operation(
        &mut self,
        operation: &OperationDefinition,
    ) -> Transformed<OperationDefinition> {
        let selections = self.transform_selections(&operation.selections);
        // Special-case for empty selections
        if let Some(selections) = &selections {
            if selections.is_empty() {
                return Transformed::Delete;
            }
        }
        let directives = self.transform_directives(&operation.directives);
        if selections.is_none() && directives.is_none() {
            return Transformed::Keep;
        }
        Transformed::Replace(OperationDefinition {
            directives: directives.unwrap_or_else(|| operation.directives.clone()),
            selections: selections.unwrap_or_else(|| operation.selections.clone()),
            ..operation.clone()
        })
    }

    // Selection
    fn transform_selections(&mut self, selections: &[Selection]) -> Option<Vec<Selection>> {
        self.transform_list(selections, Self::transform_selection)
    }

    fn transform_selection(&mut self, selection: &Selection) -> Transformed<Selection> {
        self.default_transform_selection(selection)
    }

    fn default_transform_selection(&mut self, selection: &Selection) -> Transformed<Selection> {
        match selection {
            Selection::FragmentSpread(selection) => self
                .transform_fragment_spread(selection)
                .map(Selection::FragmentSpread),
            Selection::InlineFragment(selection) => self
                .transform_inline_fragment(selection)
                .map(Selection::InlineFragment),
            Selection::LinkedField(selection) => self
                .transform_linked_field(selection)
                .map(Selection::LinkedField),
            Selection::ScalarField(selection) => self
                .transform_scalar_field(selection)
                .map(Selection::ScalarField),
            Selection::Condition(selection) => self
                .transform_condition(selection)
                .map(Selection::Condition),
        }
    }

    // Selection Kinds
    fn transform_scalar_field(&mut self, field: &ScalarField) -> Transformed<Arc<ScalarField>> {
        self.default_transform_scalar_field(field)
    }

    fn default_transform_scalar_field(
        &mut self,
        field: &ScalarField,
    ) -> Transformed<Arc<ScalarField>> {
        let arguments = self.transform_arguments(&field.arguments);
        let directives = self.transform_directives(&field.directives);
        if arguments.is_none() && directives.is_none() {
            return Transformed::Keep;
        }
        Transformed::Replace(Arc::new(ScalarField {
            arguments: arguments.unwrap_or_else(|| field.arguments.clone()),
            directives: directives.unwrap_or_else(|| field.directives.clone()),
            ..field.clone()
        }))
    }

    fn transform_linked_field(&mut self, field: &LinkedField) -> Transformed<Arc<LinkedField>> {
        self.default_transform_linked_field(field)
    }

    fn default_transform_linked_field(
        &mut self,
        field: &LinkedField,
    ) -> Transformed<Arc<LinkedField>> {
        // Special-case for empty selections
        let selections = self.transform_selections(&field.selections);
        if let Some(selections) = &selections {
            if selections.is_empty() {
                return Transformed::Delete;
            }
        }
        let arguments = self.transform_arguments(&field.arguments);
        let directives = self.transform_directives(&field.directives);
        if selections.is_none() && arguments.is_none() && directives.is_none() {
            return Transformed::Keep;
        }
        Transformed::Replace(Arc::new(LinkedField {
            arguments: arguments.unwrap_or_else(|| field.arguments.clone()),
            directives: directives.unwrap_or_else(|| field.directives.clone()),
            selections: selections.unwrap_or_else(|| field.selections.clone()),
            ..field.clone()
        }))
    }

    fn transform_inline_fragment(
        &mut self,
        fragment: &InlineFragment,
    ) -> Transformed<Arc<InlineFragment>> {
        self.default_transform_inline_fragment(fragment)
    }

    fn default_transform_inline_fragment(
        &mut self,
        fragment: &InlineFragment,
    ) -> Transformed<Arc<InlineFragment>> {
        // Special-case for empty selections
        let selections = self.transform_selections(&fragment.selections);
        if let Some(selections) = &selections {
            if selections.is_empty() {
                return Transformed::Delete;
            }
        }
        let directives = self.transform_directives(&fragment.directives);
        if selections.is_none() && directives.is_none() {
            return Transformed::Keep;
        }
        Transformed::Replace(Arc::new(InlineFragment {
            directives: directives.unwrap_or_else(|| fragment.directives.clone()),
            selections: selections.unwrap_or_else(|| fragment.selections.clone()),
            ..fragment.clone()
        }))
    }

    fn transform_fragment_spread(
        &mut self,
        spread: &FragmentSpread,
    ) -> Transformed<Arc<FragmentSpread>> {
        self.default_transform_fragment_spread(spread)
    }
    fn default_transform_fragment_spread(
        &mut self,
        spread: &FragmentSpread,
    ) -> Transformed<Arc<FragmentSpread>> {
        let arguments = self.transform_arguments(&spread.arguments);
        let directives = self.transform_directives(&spread.directives);
        if arguments.is_none() && directives.is_none() {
            return Transformed::Keep;
        }
        Transformed::Replace(Arc::new(FragmentSpread {
            arguments: arguments.unwrap_or_else(|| spread.arguments.clone()),
            directives: directives.unwrap_or_else(|| spread.directives.clone()),
            ..spread.clone()
        }))
    }

    // Conditions
    fn transform_condition(&mut self, condition: &Condition) -> Transformed<Arc<Condition>> {
        self.default_transform_condition(condition)
    }

    fn default_transform_condition(
        &mut self,
        condition: &Condition,
    ) -> Transformed<Arc<Condition>> {
        // Special-case for empty selections
        let selections = self.transform_selections(&condition.selections);
        if let Some(selections) = &selections {
            if selections.is_empty() {
                return Transformed::Delete;
            }
        }
        let condition_value = self.transform_condition_value(&condition.value);
        if selections.is_none() && condition_value.is_none() {
            Transformed::Keep
        } else {
            Transformed::Replace(Arc::new(Condition {
                value: condition_value.unwrap_or_else(|| condition.value.clone()),
                selections: selections.unwrap_or_else(|| condition.selections.clone()),
                ..condition.clone()
            }))
        }
    }

    fn transform_condition_value(
        &mut self,
        condition_value: &ConditionValue,
    ) -> Option<ConditionValue> {
        if Self::VISIT_ARGUMENTS {
            match self.default_transform_condition_value(condition_value) {
                Transformed::Delete => None,
                Transformed::Keep => Some(condition_value.clone()),
                Transformed::Replace(next_condition_value) => Some(next_condition_value),
            }
        } else {
            None
        }
    }

    fn default_transform_condition_value(
        &mut self,
        condition_value: &ConditionValue,
    ) -> Transformed<ConditionValue> {
        match condition_value {
            ConditionValue::Variable(variable) => self
                .transform_variable(variable)
                .map(ConditionValue::Variable),
            ConditionValue::Constant(_) => Transformed::Keep,
        }
    }

    // Directives
    fn transform_directives(&mut self, directives: &[Directive]) -> Option<Vec<Directive>> {
        if Self::VISIT_DIRECTIVES {
            self.transform_list(directives, Self::transform_directive)
        } else {
            None
        }
    }

    fn transform_directive(&mut self, directive: &Directive) -> Transformed<Directive> {
        self.default_transform_directive(directive)
    }

    fn default_transform_directive(&mut self, directive: &Directive) -> Transformed<Directive> {
        let arguments = self.transform_arguments(&directive.arguments);
        match arguments {
            None => Transformed::Keep,
            Some(replacement) => Transformed::Replace(Directive {
                arguments: replacement,
                ..directive.clone()
            }),
        }
    }

    // Arguments
    fn transform_arguments(&mut self, arguments: &[Argument]) -> Option<Vec<Argument>> {
        if Self::VISIT_ARGUMENTS {
            self.transform_list(arguments, Self::transform_argument)
        } else {
            None
        }
    }

    fn transform_argument(&mut self, argument: &Argument) -> Transformed<Argument> {
        self.default_transform_argument(argument)
    }

    fn default_transform_argument(&mut self, argument: &Argument) -> Transformed<Argument> {
        match self.transform_value(&argument.value.item) {
            Transformed::Delete => Transformed::Delete,
            Transformed::Keep => Transformed::Keep,
            Transformed::Replace(replacement) => Transformed::Replace(Argument {
                value: Spanned::new(argument.value.span, replacement),
                ..argument.clone()
            }),
        }
    }

    // Values
    fn transform_value(&mut self, value: &Value) -> Transformed<Value> {
        self.default_transform_value(value)
    }

    fn default_transform_value(&mut self, value: &Value) -> Transformed<Value> {
        match value {
            Value::Variable(variable) => self.transform_variable(variable).map(Value::Variable),
            Value::Constant(_) => Transformed::Keep,
            Value::List(items) => match self.transform_list(items, Self::transform_value) {
                None => Transformed::Keep,
                Some(replacement) => Transformed::Replace(Value::List(replacement)),
            },
            Value::Object(arguments) => match self.transform_arguments(arguments) {
                None => Transformed::Keep,
                Some(replacement) => Transformed::Replace(Value::Object(replacement)),
            },
        }
    }

    fn transform_variable(&mut self, value: &Variable) -> Transformed<Variable> {
        let _ = value;
        Transformed::Keep
    }

    // Helpers
    fn transform_list<F, T>(&mut self, list: &[T], f: F) -> Option<Vec<T>>
    where
        F: Fn(&mut Self, &T) -> Transformed<T>,
        T: Clone,
    {
        if list.is_empty() {
            return None;
        }
        let mut result = Vec::new();
        let mut has_changes = false;
        for (index, prev_item) in list.iter().enumerate() {
            let next_item = f(self, prev_item);
            match next_item {
                Transformed::Keep => {
                    if has_changes {
                        result.push(prev_item.clone());
                    }
                }
                Transformed::Delete => {
                    if !has_changes {
                        debug_assert!(result.capacity() == 0);
                        // assume most items won't be skipped and allocate space for all items
                        result.reserve(list.len());
                        result.extend(list.iter().take(index).cloned());
                    }
                    has_changes = true;
                }
                Transformed::Replace(next_item) => {
                    if !has_changes {
                        debug_assert!(result.capacity() == 0);
                        // assume most items won't be skipped and allocate space for all items
                        result.reserve(list.len());
                        result.extend(list.iter().take(index).cloned());
                    }
                    result.push(next_item);
                    has_changes = true;
                }
            }
        }
        if has_changes {
            // Note that result can be empty if the input was empty and all items were skipped
            Some(result)
        } else {
            None
        }
    }
}

#[derive(Clone)]
pub enum Transformed<T> {
    Delete,
    Keep,
    Replace(T),
}

impl<T> Transformed<T> {
    pub fn map<F, U>(self, f: F) -> Transformed<U>
    where
        F: FnOnce(T) -> U,
    {
        match self {
            Transformed::Delete => Transformed::Delete,
            Transformed::Keep => Transformed::Keep,
            Transformed::Replace(replacement) => Transformed::Replace(f(replacement)),
        }
    }
}
