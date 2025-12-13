/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::Argument;
use crate::ConstantValue;
use crate::Directive;
use crate::DirectiveLocation;
use crate::ExecutableDefinition;
use crate::FragmentDefinition;
use crate::FragmentSpread;
use crate::InlineFragment;
use crate::LinkedField;
use crate::OperationDefinition;
use crate::OperationKind;
use crate::ScalarField;
use crate::Selection;
use crate::Value;
use crate::VariableDefinition;
use crate::VariableIdentifier;

pub trait SchemaSetSyntaxVisitor {
    const NAME: &'static str;

    fn visit_executable_definition(&mut self, definition: &ExecutableDefinition) {
        self.default_visit_executable_definition(definition);
    }

    fn default_visit_executable_definition(&mut self, definition: &ExecutableDefinition) {
        match definition {
            ExecutableDefinition::Operation(operation) => self.visit_operation(operation),
            ExecutableDefinition::Fragment(fragment) => self.visit_fragment(fragment),
        }
    }

    // Fragment Definition
    fn visit_fragment(&mut self, fragment: &FragmentDefinition) {
        self.default_visit_fragment(fragment)
    }

    fn default_visit_fragment(&mut self, fragment: &FragmentDefinition) {
        self.visit_selections(&fragment.selections.items);
        self.visit_directives(&fragment.directives, DirectiveLocation::FragmentDefinition);
        if let Some(variable_definitions) = &fragment.variable_definitions {
            self.visit_variable_definitions(&variable_definitions.items);
        }
    }

    // Operation Definition
    fn visit_operation(&mut self, operation: &OperationDefinition) {
        self.default_visit_operation(operation)
    }

    fn default_visit_operation(&mut self, operation: &OperationDefinition) {
        // Extract operation kind from the Option<(Token, OperationKind)>
        // If operation is None, it defaults to Query
        let operation_kind = operation
            .operation
            .as_ref()
            .map(|(_, kind)| *kind)
            .unwrap_or(OperationKind::Query);
        let directive_location = DirectiveLocation::from(operation_kind);

        self.visit_directives(&operation.directives, directive_location);
        self.visit_selections(&operation.selections.items);
        if let Some(variable_definitions) = &operation.variable_definitions {
            self.visit_variable_definitions(&variable_definitions.items);
        }
    }

    // Selections
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
        }
    }

    // Selection Kinds
    fn visit_scalar_field(&mut self, field: &ScalarField) {
        self.default_visit_scalar_field(field)
    }

    fn default_visit_scalar_field(&mut self, field: &ScalarField) {
        if let Some(arguments) = &field.arguments {
            self.visit_arguments(&arguments.items);
        }
        self.visit_directives(&field.directives, DirectiveLocation::Field);
    }

    fn visit_linked_field(&mut self, field: &LinkedField) {
        self.default_visit_linked_field(field)
    }

    fn default_visit_linked_field(&mut self, field: &LinkedField) {
        if let Some(arguments) = &field.arguments {
            self.visit_arguments(&arguments.items);
        }
        self.visit_directives(&field.directives, DirectiveLocation::Field);
        self.visit_selections(&field.selections.items);
    }

    fn visit_inline_fragment(&mut self, fragment: &InlineFragment) {
        self.default_visit_inline_fragment(fragment)
    }

    fn default_visit_inline_fragment(&mut self, fragment: &InlineFragment) {
        self.visit_directives(&fragment.directives, DirectiveLocation::InlineFragment);
        self.visit_selections(&fragment.selections.items);
    }

    fn visit_fragment_spread(&mut self, spread: &FragmentSpread) {
        self.default_visit_fragment_spread(spread)
    }

    fn default_visit_fragment_spread(&mut self, spread: &FragmentSpread) {
        if let Some(arguments) = &spread.arguments {
            self.visit_arguments(&arguments.items);
        }
        self.visit_directives(&spread.directives, DirectiveLocation::FragmentSpread);
    }

    // Directives
    fn visit_directives(&mut self, directives: &[Directive], location: DirectiveLocation) {
        for directive in directives {
            self.visit_directive(directive, location);
        }
    }

    fn visit_directive(&mut self, directive: &Directive, location: DirectiveLocation) {
        self.default_visit_directive(directive, location)
    }

    fn default_visit_directive(&mut self, directive: &Directive, _location: DirectiveLocation) {
        if let Some(arguments) = &directive.arguments {
            self.visit_arguments(&arguments.items);
        }
    }

    // Arguments
    fn visit_arguments(&mut self, arguments: &[Argument]) {
        self.visit_list(arguments, Self::visit_argument)
    }

    fn visit_argument(&mut self, argument: &Argument) {
        self.default_visit_argument(argument)
    }

    fn default_visit_argument(&mut self, argument: &Argument) {
        self.visit_value(&argument.value)
    }

    // Values
    fn visit_value(&mut self, value: &Value) {
        self.default_visit_value(value)
    }

    fn default_visit_value(&mut self, value: &Value) {
        match value {
            Value::Variable(variable) => self.visit_variable(variable),
            Value::Constant(constant) => self.visit_constant_value(constant),
            Value::List(items) => self.visit_list(&items.items, Self::visit_value),
            Value::Object(object) => self.visit_arguments(&object.items),
        }
    }

    fn visit_variable(&mut self, value: &VariableIdentifier) {
        let _ = value;
    }

    fn visit_constant_value(&mut self, value: &ConstantValue) {
        self.default_visit_constant_value(value)
    }

    fn default_visit_constant_value(&mut self, value: &ConstantValue) {
        match value {
            ConstantValue::Int(_)
            | ConstantValue::Float(_)
            | ConstantValue::String(_)
            | ConstantValue::Boolean(_)
            | ConstantValue::Null(_)
            | ConstantValue::Enum(_) => {
                // Primitive values, no further traversal needed
            }
            ConstantValue::List(list) => {
                for item in &list.items {
                    self.visit_constant_value(item);
                }
            }
            ConstantValue::Object(object) => {
                for arg in &object.items {
                    self.visit_constant_argument(arg);
                }
            }
        }
    }

    fn visit_constant_argument(&mut self, argument: &crate::ConstantArgument) {
        self.default_visit_constant_argument(argument)
    }

    fn default_visit_constant_argument(&mut self, argument: &crate::ConstantArgument) {
        self.visit_constant_value(&argument.value)
    }

    // Variable Definitions
    fn visit_variable_definitions(&mut self, variable_definitions: &[VariableDefinition]) {
        self.visit_list(variable_definitions, Self::visit_variable_definition)
    }

    fn visit_variable_definition(&mut self, variable_definition: &VariableDefinition) {
        self.default_visit_variable_definition(variable_definition)
    }

    fn default_visit_variable_definition(&mut self, variable_definition: &VariableDefinition) {
        // Visit default value if present
        if let Some(default_value) = &variable_definition.default_value {
            self.visit_constant_value(&default_value.value);
        }

        // Visit directives on variable definition
        self.visit_directives(
            &variable_definition.directives,
            DirectiveLocation::VariableDefinition,
        );
    }

    // Helpers
    fn visit_list<F, T>(&mut self, list: &[T], f: F)
    where
        F: Fn(&mut Self, &T),
    {
        for item in list {
            f(self, item)
        }
    }
}
