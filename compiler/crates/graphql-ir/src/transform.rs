/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::ir::*;
use crate::program::Program;
use common::WithLocation;
use std::sync::Arc;

pub trait Transformer {
    const NAME: &'static str;
    const VISIT_ARGUMENTS: bool;
    const VISIT_DIRECTIVES: bool;

    fn transform_program<'s>(&mut self, program: &Program<'s>) -> TransformedValue<Program<'s>> {
        self.default_transform_program(program)
    }

    fn default_transform_program<'s>(
        &mut self,
        program: &Program<'s>,
    ) -> TransformedValue<Program<'s>> {
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
            TransformedValue::Replace(next_program)
        } else {
            TransformedValue::Keep
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
        if let TransformedValue::Replace(selections) = &selections {
            if selections.is_empty() {
                return Transformed::Delete;
            }
        }
        let directives = self.transform_directives(&fragment.directives);
        if selections.should_keep() && directives.should_keep() {
            return Transformed::Keep;
        }
        Transformed::Replace(FragmentDefinition {
            directives: directives.replace_or_else(|| fragment.directives.clone()),
            selections: selections.replace_or_else(|| fragment.selections.clone()),
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
        if let TransformedValue::Replace(selections) = &selections {
            if selections.is_empty() {
                return Transformed::Delete;
            }
        }
        let directives = self.transform_directives(&operation.directives);
        if selections.should_keep() && directives.should_keep() {
            return Transformed::Keep;
        }
        Transformed::Replace(OperationDefinition {
            directives: directives.replace_or_else(|| operation.directives.clone()),
            selections: selections.replace_or_else(|| operation.selections.clone()),
            ..operation.clone()
        })
    }

    // Selection
    fn transform_selections(
        &mut self,
        selections: &[Selection],
    ) -> TransformedValue<Vec<Selection>> {
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
        if arguments.should_keep() && directives.should_keep() {
            return Transformed::Keep;
        }
        Transformed::Replace(Arc::new(ScalarField {
            arguments: arguments.replace_or_else(|| field.arguments.clone()),
            directives: directives.replace_or_else(|| field.directives.clone()),
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
        if let TransformedValue::Replace(selections) = &selections {
            if selections.is_empty() {
                return Transformed::Delete;
            }
        }
        let arguments = self.transform_arguments(&field.arguments);
        let directives = self.transform_directives(&field.directives);
        if selections.should_keep() && arguments.should_keep() && directives.should_keep() {
            return Transformed::Keep;
        }
        Transformed::Replace(Arc::new(LinkedField {
            arguments: arguments.replace_or_else(|| field.arguments.clone()),
            directives: directives.replace_or_else(|| field.directives.clone()),
            selections: selections.replace_or_else(|| field.selections.clone()),
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
        if let TransformedValue::Replace(selections) = &selections {
            if selections.is_empty() {
                return Transformed::Delete;
            }
        }
        let directives = self.transform_directives(&fragment.directives);
        if selections.should_keep() && directives.should_keep() {
            return Transformed::Keep;
        }
        Transformed::Replace(Arc::new(InlineFragment {
            directives: directives.replace_or_else(|| fragment.directives.clone()),
            selections: selections.replace_or_else(|| fragment.selections.clone()),
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
        if arguments.should_keep() && directives.should_keep() {
            return Transformed::Keep;
        }
        Transformed::Replace(Arc::new(FragmentSpread {
            arguments: arguments.replace_or_else(|| spread.arguments.clone()),
            directives: directives.replace_or_else(|| spread.directives.clone()),
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
        if let TransformedValue::Replace(selections) = &selections {
            if selections.is_empty() {
                return Transformed::Delete;
            }
        }
        let condition_value = self.transform_condition_value(&condition.value);
        if selections.should_keep() && condition_value.should_keep() {
            Transformed::Keep
        } else {
            Transformed::Replace(Arc::new(Condition {
                value: condition_value.replace_or_else(|| condition.value.clone()),
                selections: selections.replace_or_else(|| condition.selections.clone()),
                ..condition.clone()
            }))
        }
    }

    fn transform_condition_value(
        &mut self,
        condition_value: &ConditionValue,
    ) -> TransformedValue<ConditionValue> {
        if Self::VISIT_ARGUMENTS {
            self.default_transform_condition_value(condition_value)
        } else {
            TransformedValue::Keep
        }
    }

    fn default_transform_condition_value(
        &mut self,
        condition_value: &ConditionValue,
    ) -> TransformedValue<ConditionValue> {
        match condition_value {
            ConditionValue::Variable(variable) => self
                .transform_variable(variable)
                .map(ConditionValue::Variable),
            ConditionValue::Constant(_) => TransformedValue::Keep,
        }
    }

    // Directives
    fn transform_directives(
        &mut self,
        directives: &[Directive],
    ) -> TransformedValue<Vec<Directive>> {
        if Self::VISIT_DIRECTIVES {
            self.transform_list(directives, Self::transform_directive)
        } else {
            TransformedValue::Keep
        }
    }

    fn transform_directive(&mut self, directive: &Directive) -> Transformed<Directive> {
        self.default_transform_directive(directive)
    }

    fn default_transform_directive(&mut self, directive: &Directive) -> Transformed<Directive> {
        let arguments = self.transform_arguments(&directive.arguments);
        match arguments {
            TransformedValue::Keep => Transformed::Keep,
            TransformedValue::Replace(replacement) => Transformed::Replace(Directive {
                arguments: replacement,
                ..directive.clone()
            }),
        }
    }

    // Arguments
    fn transform_arguments(&mut self, arguments: &[Argument]) -> TransformedValue<Vec<Argument>> {
        if Self::VISIT_ARGUMENTS {
            self.transform_list(arguments, Self::transform_argument)
        } else {
            TransformedValue::Keep
        }
    }

    fn transform_argument(&mut self, argument: &Argument) -> Transformed<Argument> {
        self.default_transform_argument(argument)
    }

    fn default_transform_argument(&mut self, argument: &Argument) -> Transformed<Argument> {
        match self.transform_value(&argument.value.item) {
            TransformedValue::Keep => Transformed::Keep,
            TransformedValue::Replace(replacement) => Transformed::Replace(Argument {
                value: WithLocation::new(argument.value.location, replacement),
                ..argument.clone()
            }),
        }
    }

    // Values
    fn transform_value(&mut self, value: &Value) -> TransformedValue<Value> {
        self.default_transform_value(value)
    }

    fn default_transform_value(&mut self, value: &Value) -> TransformedValue<Value> {
        match value {
            Value::Variable(variable) => self.transform_variable(variable).map(Value::Variable),
            Value::Constant(_) => TransformedValue::Keep,
            Value::List(items) => self
                .transform_list(items, Self::transform_value)
                .map(Value::List),
            Value::Object(arguments) => self.transform_arguments(arguments).map(Value::Object),
        }
    }

    fn transform_variable(&mut self, _variable: &Variable) -> TransformedValue<Variable> {
        TransformedValue::Keep
    }

    // Helpers
    fn transform_list<T, F, R>(&mut self, list: &[T], f: F) -> TransformedValue<Vec<T>>
    where
        T: Clone,
        F: Fn(&mut Self, &T) -> R,
        R: Into<Transformed<T>>,
    {
        let mut result = Vec::new();
        let mut has_changes = false;
        for (index, prev_item) in list.iter().enumerate() {
            let next_item: Transformed<_> = f(self, prev_item).into();
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
            TransformedValue::Replace(result)
        } else {
            TransformedValue::Keep
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

#[derive(Clone, Debug)]
pub enum TransformedValue<T> {
    Keep,
    Replace(T),
}

impl<T> TransformedValue<T> {
    pub fn should_keep(&self) -> bool {
        match self {
            TransformedValue::Keep => true,
            TransformedValue::Replace(_) => false,
        }
    }

    pub fn replace_or_else<F>(self, f: F) -> T
    where
        F: FnOnce() -> T,
    {
        match self {
            TransformedValue::Keep => f(),
            TransformedValue::Replace(next_value) => next_value,
        }
    }

    pub fn map<F, U>(self, f: F) -> TransformedValue<U>
    where
        F: FnOnce(T) -> U,
    {
        match self {
            TransformedValue::Keep => TransformedValue::Keep,
            TransformedValue::Replace(replacement) => TransformedValue::Replace(f(replacement)),
        }
    }
}

impl<T> Into<Transformed<T>> for TransformedValue<T> {
    fn into(self) -> Transformed<T> {
        match self {
            TransformedValue::Keep => Transformed::Keep,
            TransformedValue::Replace(replacement) => Transformed::Replace(replacement),
        }
    }
}
