/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::WithLocation;

use crate::ir::*;
use crate::program::Program;

pub trait Transformer<'a> {
    const NAME: &'static str;
    const VISIT_ARGUMENTS: bool;
    const VISIT_DIRECTIVES: bool;
    const RETAIN_EMPTY_SELECTION_SETS: bool = false;

    fn transform_program(&mut self, program: &'a Program) -> TransformedValue<Program> {
        self.default_transform_program(program)
    }

    fn default_transform_program(&mut self, program: &'a Program) -> TransformedValue<Program> {
        let mut next_program = Program::new(Arc::clone(&program.schema));
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
        fragment: &'a FragmentDefinition,
    ) -> Transformed<FragmentDefinition> {
        self.default_transform_fragment(fragment)
    }

    fn default_transform_fragment(
        &mut self,
        fragment: &'a FragmentDefinition,
    ) -> Transformed<FragmentDefinition> {
        let selections = self.transform_selections(&fragment.selections);
        let directives = self.transform_directives(&fragment.directives);
        let variable_definitions =
            self.transform_variable_definitions(&fragment.variable_definitions);

        // Special-case for empty selections
        if let TransformedValue::Replace(selections) = &selections
            && !Self::RETAIN_EMPTY_SELECTION_SETS
            && selections.is_empty()
        {
            return Transformed::Delete;
        }

        if selections.should_keep()
            && directives.should_keep()
            && variable_definitions.should_keep()
        {
            return Transformed::Keep;
        }

        Transformed::Replace(FragmentDefinition {
            variable_definitions: variable_definitions
                .replace_or_else(|| fragment.variable_definitions.clone()),
            directives: directives.replace_or_else(|| fragment.directives.clone()),
            selections: selections.replace_or_else(|| fragment.selections.clone()),
            ..fragment.clone()
        })
    }

    // Operation Definition
    fn transform_operation(
        &mut self,
        operation: &'a OperationDefinition,
    ) -> Transformed<OperationDefinition> {
        self.default_transform_operation(operation)
    }

    fn default_transform_operation(
        &mut self,
        operation: &'a OperationDefinition,
    ) -> Transformed<OperationDefinition> {
        let selections = self.transform_selections(&operation.selections);
        let directives = self.transform_directives(&operation.directives);
        let variable_definitions =
            self.transform_variable_definitions(&operation.variable_definitions);

        // Special-case for empty selections
        if let TransformedValue::Replace(selections) = &selections
            && !Self::RETAIN_EMPTY_SELECTION_SETS
            && selections.is_empty()
        {
            return Transformed::Delete;
        }

        if variable_definitions.should_keep()
            && directives.should_keep()
            && selections.should_keep()
        {
            return Transformed::Keep;
        }

        Transformed::Replace(OperationDefinition {
            variable_definitions: variable_definitions
                .replace_or_else(|| operation.variable_definitions.clone()),
            directives: directives.replace_or_else(|| operation.directives.clone()),
            selections: selections.replace_or_else(|| operation.selections.clone()),
            ..operation.clone()
        })
    }

    fn transform_variable_definitions(
        &mut self,
        variable_definitions: &[VariableDefinition],
    ) -> TransformedValue<Vec<VariableDefinition>> {
        self.default_transform_variable_definitions(variable_definitions)
    }

    fn default_transform_variable_definitions(
        &mut self,
        variable_definitions: &[VariableDefinition],
    ) -> TransformedValue<Vec<VariableDefinition>> {
        transform_list(variable_definitions, |variable_definition| {
            self.default_transform_variable_definition(variable_definition)
        })
    }

    fn transform_variable_definition(
        &mut self,
        variable_definition: &VariableDefinition,
    ) -> TransformedValue<VariableDefinition> {
        self.default_transform_variable_definition(variable_definition)
    }

    fn default_transform_variable_definition(
        &mut self,
        variable_definition: &VariableDefinition,
    ) -> TransformedValue<VariableDefinition> {
        let directives = self.transform_directives(&variable_definition.directives);
        if directives.should_keep() {
            return TransformedValue::Keep;
        }
        TransformedValue::Replace(VariableDefinition {
            directives: directives.replace_or_else(|| variable_definition.directives.clone()),
            ..variable_definition.clone()
        })
    }

    // Selection
    fn transform_selections(
        &mut self,
        selections: &'a [Selection],
    ) -> TransformedValue<Vec<Selection>> {
        transform_list(selections, |selection| self.transform_selection(selection))
    }

    fn transform_selection(&mut self, selection: &'a Selection) -> Transformed<Selection> {
        self.default_transform_selection(selection)
    }

    fn default_transform_selection(&mut self, selection: &'a Selection) -> Transformed<Selection> {
        match selection {
            Selection::FragmentSpread(selection) => self.transform_fragment_spread(selection),
            Selection::InlineFragment(selection) => self.transform_inline_fragment(selection),
            Selection::LinkedField(selection) => self.transform_linked_field(selection),
            Selection::ScalarField(selection) => self.transform_scalar_field(selection),
            Selection::Condition(selection) => self.transform_condition(selection),
        }
    }

    // Selection Kinds
    fn transform_scalar_field(&mut self, field: &ScalarField) -> Transformed<Selection> {
        self.default_transform_scalar_field(field)
    }

    fn default_transform_scalar_field(&mut self, field: &ScalarField) -> Transformed<Selection> {
        let arguments = self.transform_arguments(&field.arguments);
        let directives = self.transform_directives(&field.directives);
        if arguments.should_keep() && directives.should_keep() {
            return Transformed::Keep;
        }
        Transformed::Replace(Selection::ScalarField(Arc::new(ScalarField {
            arguments: arguments.replace_or_else(|| field.arguments.clone()),
            directives: directives.replace_or_else(|| field.directives.clone()),
            ..field.clone()
        })))
    }

    fn transform_linked_field(&mut self, field: &'a LinkedField) -> Transformed<Selection> {
        self.default_transform_linked_field(field)
    }

    fn default_transform_linked_field(&mut self, field: &'a LinkedField) -> Transformed<Selection> {
        // Special-case for empty selections
        let selections = self.transform_selections(&field.selections);
        if let TransformedValue::Replace(selections) = &selections
            && !Self::RETAIN_EMPTY_SELECTION_SETS
            && selections.is_empty()
        {
            return Transformed::Delete;
        }
        let arguments = self.transform_arguments(&field.arguments);
        let directives = self.transform_directives(&field.directives);
        if selections.should_keep() && arguments.should_keep() && directives.should_keep() {
            return Transformed::Keep;
        }
        Transformed::Replace(Selection::LinkedField(Arc::new(LinkedField {
            arguments: arguments.replace_or_else(|| field.arguments.clone()),
            directives: directives.replace_or_else(|| field.directives.clone()),
            selections: selections.replace_or_else(|| field.selections.clone()),
            ..field.clone()
        })))
    }

    fn transform_inline_fragment(
        &mut self,
        fragment: &'a InlineFragment,
    ) -> Transformed<Selection> {
        self.default_transform_inline_fragment(fragment)
    }

    fn default_transform_inline_fragment(
        &mut self,
        fragment: &'a InlineFragment,
    ) -> Transformed<Selection> {
        // Special-case for empty selections
        let selections = self.transform_selections(&fragment.selections);
        if let TransformedValue::Replace(selections) = &selections
            && !Self::RETAIN_EMPTY_SELECTION_SETS
            && selections.is_empty()
        {
            return Transformed::Delete;
        }
        let directives = self.transform_directives(&fragment.directives);
        if selections.should_keep() && directives.should_keep() {
            return Transformed::Keep;
        }
        Transformed::Replace(Selection::InlineFragment(Arc::new(InlineFragment {
            directives: directives.replace_or_else(|| fragment.directives.clone()),
            selections: selections.replace_or_else(|| fragment.selections.clone()),
            ..fragment.clone()
        })))
    }

    fn transform_fragment_spread(&mut self, spread: &FragmentSpread) -> Transformed<Selection> {
        self.default_transform_fragment_spread(spread)
    }
    fn default_transform_fragment_spread(
        &mut self,
        spread: &FragmentSpread,
    ) -> Transformed<Selection> {
        let arguments = self.transform_arguments(&spread.arguments);
        let directives = self.transform_directives(&spread.directives);
        if arguments.should_keep() && directives.should_keep() {
            return Transformed::Keep;
        }
        Transformed::Replace(Selection::FragmentSpread(Arc::new(FragmentSpread {
            arguments: arguments.replace_or_else(|| spread.arguments.clone()),
            directives: directives.replace_or_else(|| spread.directives.clone()),
            ..spread.clone()
        })))
    }

    // Conditions
    fn transform_condition(&mut self, condition: &'a Condition) -> Transformed<Selection> {
        self.default_transform_condition(condition)
    }

    fn default_transform_condition(&mut self, condition: &'a Condition) -> Transformed<Selection> {
        // Special-case for empty selections
        let selections = self.transform_selections(&condition.selections);
        if let TransformedValue::Replace(selections) = &selections
            && !Self::RETAIN_EMPTY_SELECTION_SETS
            && selections.is_empty()
        {
            return Transformed::Delete;
        }
        let condition_value = self.transform_condition_value(&condition.value);
        if selections.should_keep() && condition_value.should_keep() {
            Transformed::Keep
        } else {
            Transformed::Replace(Selection::Condition(Arc::new(Condition {
                value: condition_value.replace_or_else(|| condition.value.clone()),
                selections: selections.replace_or_else(|| condition.selections.clone()),
                ..condition.clone()
            })))
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
            transform_list(directives, |directive| self.transform_directive(directive))
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
            transform_list(arguments, |argument| self.transform_argument(argument))
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
            Value::List(items) => {
                transform_list(items, |item| self.transform_value(item)).map(Value::List)
            }
            Value::Object(arguments) => self.transform_arguments(arguments).map(Value::Object),
        }
    }

    fn transform_variable(&mut self, _variable: &Variable) -> TransformedValue<Variable> {
        TransformedValue::Keep
    }
}

// Helpers
pub fn transform_list<'a, T, F, R>(list: &'a [T], mut transform: F) -> TransformedValue<Vec<T>>
where
    T: Clone,
    F: FnMut(&'a T) -> R,
    R: Into<Transformed<T>>,
{
    let mut result = Vec::new();
    let mut has_changes = false;
    for (index, prev_item) in list.iter().enumerate() {
        let next_item: Transformed<_> = transform(prev_item).into();
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

/// Similar to `transform_list`, but replaces the return value of the item
/// callback with `TransformedMulti<T>` which allows more than one item to
/// be returned and grow the list. This helper is unused by the default
/// implementations and one has to override `transform_selections` or a
/// similar list transform function.
pub fn transform_list_multi<T, F>(list: &[T], mut transform: F) -> TransformedValue<Vec<T>>
where
    T: Clone,
    F: FnMut(&T) -> TransformedMulti<T>,
{
    let mut result = Vec::new();
    let mut has_changes = false;
    for (index, prev_item) in list.iter().enumerate() {
        let next_item = transform(prev_item);
        match next_item {
            TransformedMulti::Keep => {
                if has_changes {
                    result.push(prev_item.clone());
                }
            }
            TransformedMulti::Delete => {
                if !has_changes {
                    debug_assert!(result.capacity() == 0);
                    // assume most items won't be skipped and allocate space for all items
                    result.reserve(list.len());
                    result.extend(list.iter().take(index).cloned());
                }
                has_changes = true;
            }
            TransformedMulti::Replace(next_item) => {
                if !has_changes {
                    debug_assert!(result.capacity() == 0);
                    // assume most items won't be skipped and allocate space for all items
                    result.reserve(list.len());
                    result.extend(list.iter().take(index).cloned());
                }
                result.push(next_item);
                has_changes = true;
            }
            TransformedMulti::ReplaceMultiple(next_items) => {
                if !has_changes {
                    debug_assert!(result.capacity() == 0);
                    // assume most items won't be skipped and allocate space for all items
                    result.reserve(list.len() + next_items.len() - 1);
                    result.extend(list.iter().take(index).cloned());
                }
                result.extend(next_items);
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

#[derive(Debug, Clone)]
pub struct TransformProgramPipe {
    initial: Program,
    transformed_value: TransformedValue<Program>,
}

impl TransformProgramPipe {
    pub fn new(initial: Program) -> Self {
        Self {
            initial,
            transformed_value: TransformedValue::Keep,
        }
    }

    pub fn pipe<T>(self, transformer: T) -> Self
    where
        T: for<'a> Transformer<'a>,
    {
        let mut transformer = transformer;
        let initial = self.initial;
        let transformed_value = match self.transformed_value {
            TransformedValue::Keep => transformer.transform_program(&initial),
            TransformedValue::Replace(replacement) => TransformedValue::Replace(
                transformer
                    .transform_program(&replacement)
                    .replace_or_else(|| replacement),
            ),
        };
        Self {
            initial,
            transformed_value,
        }
    }

    pub fn pipe_option<X, T, F>(self, option: Option<X>, get_transformer: F) -> Self
    where
        T: for<'a> Transformer<'a>,
        F: FnOnce(X) -> T,
    {
        if let Some(x) = option {
            self.pipe(get_transformer(x))
        } else {
            self
        }
    }

    pub fn compose<F>(self, other: F) -> Self
    where
        F: FnOnce(Program) -> Self,
    {
        let initial = self.initial;
        match self.transformed_value {
            TransformedValue::Keep => other(initial),
            TransformedValue::Replace(replacement) => other(replacement),
        }
    }

    pub fn collect(self) -> Program {
        match self.transformed_value {
            TransformedValue::Keep => self.initial,
            TransformedValue::Replace(replacement) => replacement,
        }
    }

    pub fn transformed_value(self) -> TransformedValue<Program> {
        self.transformed_value
    }
}

#[derive(Clone, Debug)]
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

    pub fn unwrap_or_else<F>(self, f: F) -> T
    where
        F: FnOnce() -> T,
    {
        match self {
            Transformed::Replace(replacement) => replacement,
            _ => f(),
        }
    }
}

/// An extension of Transformed that has the additional value `ReplaceMultiple`
/// which allows more then one item to be returned.
#[derive(Clone, Debug)]
pub enum TransformedMulti<T> {
    Delete,
    Keep,
    Replace(T),
    ReplaceMultiple(Vec<T>),
}

impl<T> From<Transformed<T>> for TransformedMulti<T> {
    fn from(other: Transformed<T>) -> TransformedMulti<T> {
        match other {
            Transformed::Delete => TransformedMulti::Delete,
            Transformed::Keep => TransformedMulti::Keep,
            Transformed::Replace(replacement) => TransformedMulti::Replace(replacement),
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

impl<T> From<TransformedValue<T>> for Transformed<T> {
    fn from(other: TransformedValue<T>) -> Transformed<T> {
        match other {
            TransformedValue::Keep => Transformed::Keep,
            TransformedValue::Replace(replacement) => Transformed::Replace(replacement),
        }
    }
}
