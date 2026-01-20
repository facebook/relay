/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::Argument;
use crate::ConstantDirective;
use crate::ConstantValue;
use crate::Directive;
use crate::DirectiveDefinition;
use crate::DirectiveLocation;
use crate::EnumTypeDefinition;
use crate::EnumTypeExtension;
use crate::EnumValueDefinition;
use crate::ExecutableDefinition;
use crate::FieldDefinition;
use crate::FragmentDefinition;
use crate::FragmentSpread;
use crate::InlineFragment;
use crate::InputObjectTypeDefinition;
use crate::InputObjectTypeExtension;
use crate::InputValueDefinition;
use crate::InterfaceTypeDefinition;
use crate::InterfaceTypeExtension;
use crate::LinkedField;
use crate::ObjectTypeDefinition;
use crate::ObjectTypeExtension;
use crate::OperationDefinition;
use crate::OperationKind;
use crate::OperationTypeDefinition;
use crate::ScalarField;
use crate::ScalarTypeDefinition;
use crate::ScalarTypeExtension;
use crate::SchemaDefinition;
use crate::SchemaExtension;
use crate::Selection;
use crate::TypeAnnotation;
use crate::TypeSystemDefinition;
use crate::UnionTypeDefinition;
use crate::UnionTypeExtension;
use crate::Value;
use crate::VariableDefinition;
use crate::VariableIdentifier;

pub trait SyntaxVisitor {
    const NAME: &'static str;

    // ExecutableDefinition Visitors

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

    // TypeSystemDefinition Visitors

    fn visit_type_system_definition(&mut self, definition: &TypeSystemDefinition) {
        self.default_visit_type_system_definition(definition)
    }

    fn default_visit_type_system_definition(&mut self, definition: &TypeSystemDefinition) {
        match definition {
            TypeSystemDefinition::SchemaDefinition(def) => self.visit_schema_definition(def),
            TypeSystemDefinition::SchemaExtension(ext) => self.visit_schema_extension(ext),
            TypeSystemDefinition::ObjectTypeDefinition(def) => {
                self.visit_object_type_definition(def)
            }
            TypeSystemDefinition::ObjectTypeExtension(ext) => self.visit_object_type_extension(ext),
            TypeSystemDefinition::InterfaceTypeDefinition(def) => {
                self.visit_interface_type_definition(def)
            }
            TypeSystemDefinition::InterfaceTypeExtension(ext) => {
                self.visit_interface_type_extension(ext)
            }
            TypeSystemDefinition::UnionTypeDefinition(def) => self.visit_union_type_definition(def),
            TypeSystemDefinition::UnionTypeExtension(ext) => self.visit_union_type_extension(ext),
            TypeSystemDefinition::ScalarTypeDefinition(def) => {
                self.visit_scalar_type_definition(def)
            }
            TypeSystemDefinition::ScalarTypeExtension(ext) => self.visit_scalar_type_extension(ext),
            TypeSystemDefinition::EnumTypeDefinition(def) => self.visit_enum_type_definition(def),
            TypeSystemDefinition::EnumTypeExtension(ext) => self.visit_enum_type_extension(ext),
            TypeSystemDefinition::InputObjectTypeDefinition(def) => {
                self.visit_input_object_type_definition(def)
            }
            TypeSystemDefinition::InputObjectTypeExtension(ext) => {
                self.visit_input_object_type_extension(ext)
            }
            TypeSystemDefinition::DirectiveDefinition(def) => self.visit_directive_definition(def),
        }
    }

    // Schema Definition
    fn visit_schema_definition(&mut self, schema: &SchemaDefinition) {
        self.default_visit_schema_definition(schema)
    }

    fn default_visit_schema_definition(&mut self, schema: &SchemaDefinition) {
        self.visit_constant_directives(&schema.directives);
        self.visit_operation_type_definitions(&schema.operation_types.items);
    }

    fn visit_schema_extension(&mut self, schema: &SchemaExtension) {
        self.default_visit_schema_extension(schema)
    }

    fn default_visit_schema_extension(&mut self, schema: &SchemaExtension) {
        self.visit_constant_directives(&schema.directives);
        if let Some(operation_types) = &schema.operation_types {
            self.visit_operation_type_definitions(&operation_types.items);
        }
    }

    // Object Type Definition
    fn visit_object_type_definition(&mut self, object: &ObjectTypeDefinition) {
        self.default_visit_object_type_definition(object)
    }

    fn default_visit_object_type_definition(&mut self, object: &ObjectTypeDefinition) {
        self.visit_constant_directives(&object.directives);
        if let Some(fields) = &object.fields {
            self.visit_field_definitions(&fields.items);
        }
    }

    fn visit_object_type_extension(&mut self, object: &ObjectTypeExtension) {
        self.default_visit_object_type_extension(object)
    }

    fn default_visit_object_type_extension(&mut self, object: &ObjectTypeExtension) {
        self.visit_constant_directives(&object.directives);
        if let Some(fields) = &object.fields {
            self.visit_field_definitions(&fields.items);
        }
    }

    // Interface Type Definition
    fn visit_interface_type_definition(&mut self, interface: &InterfaceTypeDefinition) {
        self.default_visit_interface_type_definition(interface)
    }

    fn default_visit_interface_type_definition(&mut self, interface: &InterfaceTypeDefinition) {
        self.visit_constant_directives(&interface.directives);
        if let Some(fields) = &interface.fields {
            self.visit_field_definitions(&fields.items);
        }
    }

    fn visit_interface_type_extension(&mut self, interface: &InterfaceTypeExtension) {
        self.default_visit_interface_type_extension(interface)
    }

    fn default_visit_interface_type_extension(&mut self, interface: &InterfaceTypeExtension) {
        self.visit_constant_directives(&interface.directives);
        if let Some(fields) = &interface.fields {
            self.visit_field_definitions(&fields.items);
        }
    }

    // Union Type Definition
    fn visit_union_type_definition(&mut self, union: &UnionTypeDefinition) {
        self.default_visit_union_type_definition(union)
    }

    fn default_visit_union_type_definition(&mut self, union: &UnionTypeDefinition) {
        self.visit_constant_directives(&union.directives);
    }

    fn visit_union_type_extension(&mut self, union: &UnionTypeExtension) {
        self.default_visit_union_type_extension(union)
    }

    fn default_visit_union_type_extension(&mut self, union: &UnionTypeExtension) {
        self.visit_constant_directives(&union.directives);
    }

    // Scalar Type Definition
    fn visit_scalar_type_definition(&mut self, scalar: &ScalarTypeDefinition) {
        self.default_visit_scalar_type_definition(scalar)
    }

    fn default_visit_scalar_type_definition(&mut self, scalar: &ScalarTypeDefinition) {
        self.visit_constant_directives(&scalar.directives);
    }

    fn visit_scalar_type_extension(&mut self, scalar: &ScalarTypeExtension) {
        self.default_visit_scalar_type_extension(scalar)
    }

    fn default_visit_scalar_type_extension(&mut self, scalar: &ScalarTypeExtension) {
        self.visit_constant_directives(&scalar.directives);
    }

    // Enum Type Definition
    fn visit_enum_type_definition(&mut self, enum_: &EnumTypeDefinition) {
        self.default_visit_enum_type_definition(enum_)
    }

    fn default_visit_enum_type_definition(&mut self, enum_: &EnumTypeDefinition) {
        self.visit_constant_directives(&enum_.directives);
        if let Some(values) = &enum_.values {
            self.visit_enum_value_definitions(&values.items);
        }
    }

    fn visit_enum_type_extension(&mut self, enum_: &EnumTypeExtension) {
        self.default_visit_enum_type_extension(enum_)
    }

    fn default_visit_enum_type_extension(&mut self, enum_: &EnumTypeExtension) {
        self.visit_constant_directives(&enum_.directives);
        if let Some(values) = &enum_.values {
            self.visit_enum_value_definitions(&values.items);
        }
    }

    // Input Object Type Definition
    fn visit_input_object_type_definition(&mut self, input_object: &InputObjectTypeDefinition) {
        self.default_visit_input_object_type_definition(input_object)
    }

    fn default_visit_input_object_type_definition(
        &mut self,
        input_object: &InputObjectTypeDefinition,
    ) {
        self.visit_constant_directives(&input_object.directives);
        if let Some(fields) = &input_object.fields {
            self.visit_input_value_definitions(&fields.items);
        }
    }

    fn visit_input_object_type_extension(&mut self, input_object: &InputObjectTypeExtension) {
        self.default_visit_input_object_type_extension(input_object)
    }

    fn default_visit_input_object_type_extension(
        &mut self,
        input_object: &InputObjectTypeExtension,
    ) {
        self.visit_constant_directives(&input_object.directives);
        if let Some(fields) = &input_object.fields {
            self.visit_input_value_definitions(&fields.items);
        }
    }

    // Directive Definition
    fn visit_directive_definition(&mut self, directive: &DirectiveDefinition) {
        self.default_visit_directive_definition(directive)
    }

    fn default_visit_directive_definition(&mut self, directive: &DirectiveDefinition) {
        if let Some(arguments) = &directive.arguments {
            self.visit_input_value_definitions(&arguments.items);
        }
    }

    // Constant Directives
    fn visit_constant_directives(&mut self, directives: &[ConstantDirective]) {
        self.visit_list(directives, Self::visit_constant_directive)
    }

    fn visit_constant_directive(&mut self, directive: &ConstantDirective) {
        self.default_visit_constant_directive(directive)
    }

    fn default_visit_constant_directive(&mut self, directive: &ConstantDirective) {
        if let Some(arguments) = &directive.arguments {
            self.visit_list(&arguments.items, Self::visit_constant_argument);
        }
    }

    // Field Definitions
    fn visit_field_definitions(&mut self, fields: &[FieldDefinition]) {
        self.visit_list(fields, Self::visit_field_definition)
    }

    fn visit_field_definition(&mut self, field: &FieldDefinition) {
        self.default_visit_field_definition(field)
    }

    fn default_visit_field_definition(&mut self, field: &FieldDefinition) {
        self.visit_type_annotation(&field.type_);
        if let Some(arguments) = &field.arguments {
            self.visit_input_value_definitions(&arguments.items);
        }
        self.visit_constant_directives(&field.directives);
    }

    // Input Value Definitions
    fn visit_input_value_definitions(&mut self, input_values: &[InputValueDefinition]) {
        self.visit_list(input_values, Self::visit_input_value_definition)
    }

    fn visit_input_value_definition(&mut self, input_value: &InputValueDefinition) {
        self.default_visit_input_value_definition(input_value)
    }

    fn default_visit_input_value_definition(&mut self, input_value: &InputValueDefinition) {
        self.visit_type_annotation(&input_value.type_);
        if let Some(default_value) = &input_value.default_value {
            self.visit_constant_value(&default_value.value);
        }
        self.visit_constant_directives(&input_value.directives);
    }

    // Enum Value Definitions
    fn visit_enum_value_definitions(&mut self, enum_values: &[EnumValueDefinition]) {
        self.visit_list(enum_values, Self::visit_enum_value_definition)
    }

    fn visit_enum_value_definition(&mut self, enum_value: &EnumValueDefinition) {
        self.default_visit_enum_value_definition(enum_value)
    }

    fn default_visit_enum_value_definition(&mut self, enum_value: &EnumValueDefinition) {
        self.visit_constant_directives(&enum_value.directives);
    }

    // Operation Type Definitions
    fn visit_operation_type_definitions(&mut self, operation_types: &[OperationTypeDefinition]) {
        self.visit_list(operation_types, Self::visit_operation_type_definition)
    }

    fn visit_operation_type_definition(&mut self, operation_type: &OperationTypeDefinition) {
        let _ = operation_type;
    }

    // Type Annotation
    fn visit_type_annotation(&mut self, type_annotation: &TypeAnnotation) {
        let _ = type_annotation;
    }
}
