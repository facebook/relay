/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::constant_directive::ConstantDirective;
use super::constant_value::{ConstantValue, StringNode};
use super::primitive::*;
use super::type_annotation::TypeAnnotation;
use common::Span;
use intern::string_key::StringKey;
use std::fmt;

#[derive(Clone, Eq, PartialEq, Ord, PartialOrd, Debug)]
pub enum TypeSystemDefinition {
    SchemaDefinition(SchemaDefinition),
    SchemaExtension(SchemaExtension),
    EnumTypeDefinition(EnumTypeDefinition),
    EnumTypeExtension(EnumTypeExtension),
    InterfaceTypeDefinition(InterfaceTypeDefinition),
    InterfaceTypeExtension(InterfaceTypeExtension),
    ObjectTypeDefinition(ObjectTypeDefinition),
    ObjectTypeExtension(ObjectTypeExtension),
    UnionTypeDefinition(UnionTypeDefinition),
    UnionTypeExtension(UnionTypeExtension),
    InputObjectTypeDefinition(InputObjectTypeDefinition),
    InputObjectTypeExtension(InputObjectTypeExtension),
    ScalarTypeDefinition(ScalarTypeDefinition),
    ScalarTypeExtension(ScalarTypeExtension),
    DirectiveDefinition(DirectiveDefinition),
}

impl TypeSystemDefinition {
    pub fn location(&self) -> Span {
        match self {
            TypeSystemDefinition::SchemaDefinition(_extension) => Span::empty(), // Not implemented
            TypeSystemDefinition::SchemaExtension(_extension) => Span::empty(),  // Not implemented
            TypeSystemDefinition::ObjectTypeExtension(extension) => extension.name.span,
            TypeSystemDefinition::ObjectTypeDefinition(extension) => extension.name.span,
            TypeSystemDefinition::InterfaceTypeDefinition(extension) => extension.name.span,
            TypeSystemDefinition::InterfaceTypeExtension(extension) => extension.name.span,
            TypeSystemDefinition::UnionTypeDefinition(extension) => extension.name.span,
            TypeSystemDefinition::UnionTypeExtension(extension) => extension.name.span,
            TypeSystemDefinition::DirectiveDefinition(extension) => extension.name.span,
            TypeSystemDefinition::InputObjectTypeDefinition(extension) => extension.name.span,
            TypeSystemDefinition::InputObjectTypeExtension(extension) => extension.name.span,
            TypeSystemDefinition::EnumTypeDefinition(extension) => extension.name.span,
            TypeSystemDefinition::EnumTypeExtension(extension) => extension.name.span,
            TypeSystemDefinition::ScalarTypeDefinition(extension) => extension.name.span,
            TypeSystemDefinition::ScalarTypeExtension(extension) => extension.name.span,
        }
    }
}

impl fmt::Display for TypeSystemDefinition {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            TypeSystemDefinition::SchemaDefinition(SchemaDefinition {
                directives,
                operation_types,
            }) => write_schema_definition_helper(f, directives, &operation_types.items),
            TypeSystemDefinition::SchemaExtension(SchemaExtension {
                directives,
                operation_types,
            }) => write_schema_extension_helper(f, directives, operation_types),
            TypeSystemDefinition::ObjectTypeDefinition(ObjectTypeDefinition {
                name,
                interfaces,
                fields,
                directives,
            }) => write_object_helper(f, &name.value, interfaces, fields, directives, false),
            TypeSystemDefinition::ObjectTypeExtension(ObjectTypeExtension {
                name,
                interfaces,
                fields,
                directives,
            }) => write_object_helper(f, &name.value, interfaces, fields, directives, true),
            TypeSystemDefinition::InterfaceTypeDefinition(InterfaceTypeDefinition {
                name,
                fields,
                directives,
                ..
            }) => write_interface_helper(f, &name.value, fields, directives, false),
            TypeSystemDefinition::InterfaceTypeExtension(InterfaceTypeExtension {
                name,
                interfaces: _,
                fields,
                directives,
            }) => write_interface_helper(f, &name.value, fields, directives, true),
            TypeSystemDefinition::UnionTypeDefinition(UnionTypeDefinition {
                name,
                directives,
                members,
            }) => write_union_type_definition_helper(f, &name.value, directives, members, false),
            TypeSystemDefinition::UnionTypeExtension(UnionTypeExtension {
                name,
                directives,
                members,
            }) => write_union_type_definition_helper(f, &name.value, directives, members, true),
            TypeSystemDefinition::DirectiveDefinition(DirectiveDefinition {
                name,
                arguments,
                repeatable,
                locations,
                description,
            }) => write_directive_definition_helper(
                f,
                &name.value,
                arguments,
                repeatable,
                locations,
                description,
            ),
            TypeSystemDefinition::InputObjectTypeDefinition(InputObjectTypeDefinition {
                name,
                directives,
                fields,
            }) => {
                write_input_object_type_definition_helper(f, &name.value, directives, fields, false)
            }
            TypeSystemDefinition::InputObjectTypeExtension(InputObjectTypeExtension {
                name,
                directives,
                fields,
            }) => {
                write_input_object_type_definition_helper(f, &name.value, directives, fields, true)
            }
            TypeSystemDefinition::EnumTypeDefinition(EnumTypeDefinition {
                name,
                directives,
                values,
            }) => write_enum_type_definition_helper(f, &name.value, directives, values, false),
            TypeSystemDefinition::EnumTypeExtension(EnumTypeExtension {
                name,
                directives,
                values,
            }) => write_enum_type_definition_helper(f, &name.value, directives, values, true),
            TypeSystemDefinition::ScalarTypeDefinition(ScalarTypeDefinition {
                name,
                directives,
            }) => write_scalar_type_definition_helper(f, &name.value, directives, false),
            TypeSystemDefinition::ScalarTypeExtension(ScalarTypeExtension { name, directives }) => {
                write_scalar_type_definition_helper(f, &name.value, directives, true)
            }
        }
    }
}

#[derive(Clone, Eq, PartialEq, Ord, PartialOrd, Debug)]
pub struct SchemaDefinition {
    pub directives: Vec<ConstantDirective>,
    pub operation_types: List<OperationTypeDefinition>,
}

#[derive(Clone, Eq, PartialEq, Ord, PartialOrd, Debug)]
pub struct SchemaExtension {
    pub directives: Vec<ConstantDirective>,
    pub operation_types: Option<List<OperationTypeDefinition>>,
}

#[derive(Clone, Eq, PartialEq, Ord, PartialOrd, Debug)]
pub struct OperationTypeDefinition {
    pub operation: OperationType,
    pub type_: Identifier,
}

impl fmt::Display for OperationTypeDefinition {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}: {}", self.operation, self.type_)
    }
}

#[derive(Eq, PartialEq, Ord, PartialOrd, Debug, Copy, Clone)]
pub enum OperationType {
    Query,
    Mutation,
    Subscription,
}

impl fmt::Display for OperationType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            OperationType::Query => write!(f, "query"),
            OperationType::Mutation => write!(f, "mutation"),
            OperationType::Subscription => write!(f, "subscription"),
        }
    }
}

#[derive(Clone, Eq, PartialEq, Ord, PartialOrd, Debug)]
pub struct ObjectTypeDefinition {
    pub name: Identifier,
    pub interfaces: Vec<Identifier>,
    pub directives: Vec<ConstantDirective>,
    pub fields: Option<List<FieldDefinition>>,
}

#[derive(Clone, Eq, PartialEq, Ord, PartialOrd, Debug)]
pub struct ObjectTypeExtension {
    pub name: Identifier,
    pub interfaces: Vec<Identifier>,
    pub directives: Vec<ConstantDirective>,
    pub fields: Option<List<FieldDefinition>>,
}

#[derive(Clone, Eq, PartialEq, Ord, PartialOrd, Debug)]
pub struct InterfaceTypeDefinition {
    pub name: Identifier,
    pub interfaces: Vec<Identifier>,
    pub directives: Vec<ConstantDirective>,
    pub fields: Option<List<FieldDefinition>>,
}

#[derive(Clone, Eq, PartialEq, Ord, PartialOrd, Debug)]
pub struct InterfaceTypeExtension {
    pub name: Identifier,
    pub interfaces: Vec<Identifier>,
    pub directives: Vec<ConstantDirective>,
    pub fields: Option<List<FieldDefinition>>,
}

#[derive(Clone, Eq, PartialEq, Ord, PartialOrd, Debug)]
pub struct UnionTypeDefinition {
    pub name: Identifier,
    pub directives: Vec<ConstantDirective>,
    pub members: Vec<Identifier>,
}

#[derive(Clone, Eq, PartialEq, Ord, PartialOrd, Debug)]
pub struct UnionTypeExtension {
    pub name: Identifier,
    pub directives: Vec<ConstantDirective>,
    pub members: Vec<Identifier>,
}

#[derive(Clone, Eq, PartialEq, Ord, PartialOrd, Debug)]
pub struct ScalarTypeDefinition {
    pub name: Identifier,
    pub directives: Vec<ConstantDirective>,
}

#[derive(Clone, Eq, PartialEq, Ord, PartialOrd, Debug)]
pub struct ScalarTypeExtension {
    pub name: Identifier,
    pub directives: Vec<ConstantDirective>,
}

#[derive(Clone, Eq, PartialEq, Ord, PartialOrd, Debug)]
pub struct EnumTypeDefinition {
    pub name: Identifier,
    pub directives: Vec<ConstantDirective>,
    pub values: Option<List<EnumValueDefinition>>,
}

#[derive(Clone, Eq, PartialEq, Ord, PartialOrd, Debug)]
pub struct EnumTypeExtension {
    pub name: Identifier,
    pub directives: Vec<ConstantDirective>,
    pub values: Option<List<EnumValueDefinition>>,
}

#[derive(Clone, Eq, PartialEq, Ord, PartialOrd, Debug)]
pub struct InputObjectTypeDefinition {
    pub name: Identifier,
    pub directives: Vec<ConstantDirective>,
    pub fields: Option<List<InputValueDefinition>>,
}

#[derive(Clone, Eq, PartialEq, Ord, PartialOrd, Debug)]
pub struct InputObjectTypeExtension {
    pub name: Identifier,
    pub directives: Vec<ConstantDirective>,
    pub fields: Option<List<InputValueDefinition>>,
}

#[derive(Clone, Eq, PartialEq, Ord, PartialOrd, Debug)]
pub struct EnumValueDefinition {
    pub name: Identifier,
    pub directives: Vec<ConstantDirective>,
}

impl fmt::Display for EnumValueDefinition {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.name)?;
        write_directives(f, &self.directives)
    }
}

#[derive(Clone, Eq, PartialEq, Ord, PartialOrd, Debug)]
pub struct DirectiveDefinition {
    pub name: Identifier,
    pub arguments: Option<List<InputValueDefinition>>,
    pub repeatable: bool,
    pub locations: Vec<DirectiveLocation>,
    pub description: Option<StringNode>,
}

#[derive(PartialEq, Eq, Ord, PartialOrd, Hash, Debug, Clone, Copy)]
pub enum DirectiveLocation {
    Query,
    Mutation,
    Subscription,
    Field,
    FragmentDefinition,
    FragmentSpread,
    InlineFragment,
    Schema,
    Scalar,
    Object,
    FieldDefinition,
    ArgumentDefinition,
    Interface,
    Union,
    Enum,
    EnumValue,
    InputObject,
    InputFieldDefinition,
    VariableDefinition,
}

impl fmt::Display for DirectiveLocation {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match *self {
            DirectiveLocation::Query => write!(f, "QUERY"),
            DirectiveLocation::Mutation => write!(f, "MUTATION"),
            DirectiveLocation::Subscription => write!(f, "SUBSCRIPTION"),
            DirectiveLocation::Field => write!(f, "FIELD"),
            DirectiveLocation::FragmentDefinition => write!(f, "FRAGMENT_DEFINITION"),
            DirectiveLocation::FragmentSpread => write!(f, "FRAGMENT_SPREAD"),
            DirectiveLocation::InlineFragment => write!(f, "INLINE_FRAGMENT"),
            DirectiveLocation::Schema => write!(f, "SCHEMA"),
            DirectiveLocation::Scalar => write!(f, "SCALAR"),
            DirectiveLocation::Object => write!(f, "OBJECT"),
            DirectiveLocation::FieldDefinition => write!(f, "FIELD_DEFINITION"),
            DirectiveLocation::ArgumentDefinition => write!(f, "ARGUMENT_DEFINITION"),
            DirectiveLocation::Interface => write!(f, "INTERFACE"),
            DirectiveLocation::Union => write!(f, "UNION"),
            DirectiveLocation::Enum => write!(f, "ENUM"),
            DirectiveLocation::EnumValue => write!(f, "ENUM_VALUE"),
            DirectiveLocation::InputObject => write!(f, "INPUT_OBJECT"),
            DirectiveLocation::InputFieldDefinition => write!(f, "INPUT_FIELD_DEFINITION"),
            DirectiveLocation::VariableDefinition => write!(f, "VARIABLE_DEFINITION"),
        }
    }
}

#[derive(Clone, Eq, PartialEq, Ord, PartialOrd, Debug)]
pub struct InputValueDefinition {
    pub name: Identifier,
    pub type_: TypeAnnotation,
    pub default_value: Option<ConstantValue>,
    pub directives: Vec<ConstantDirective>,
}

impl fmt::Display for InputValueDefinition {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}: {}", self.name, self.type_)?;
        if let Some(v) = &self.default_value {
            write!(f, " = {}", v)?;
        }

        if !self.directives.is_empty() {
            write!(f, " ")?;
            write_list(f, &self.directives, " ")?;
        }

        Ok(())
    }
}

#[derive(Clone, Eq, PartialEq, Ord, PartialOrd, Debug)]
pub struct FieldDefinition {
    pub name: Identifier,
    pub type_: TypeAnnotation,
    pub arguments: Option<List<InputValueDefinition>>,
    pub directives: Vec<ConstantDirective>,
    pub description: Option<StringNode>,
}

impl fmt::Display for FieldDefinition {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.name)?;
        if let Some(arguments) = self.arguments.as_ref() {
            write_arguments(f, &arguments.items)?;
        }
        write!(f, ": {}", self.type_)?;
        write_directives(f, &self.directives)
    }
}

fn write_list(
    f: &mut fmt::Formatter<'_>,
    list: &[impl fmt::Display],
    separator: &str,
) -> fmt::Result {
    let v = list
        .iter()
        .map(|elem| elem.to_string())
        .collect::<Vec<String>>()
        .join(separator);
    write!(f, "{}", v)
}

fn write_arguments(f: &mut fmt::Formatter<'_>, arguments: &[impl fmt::Display]) -> fmt::Result {
    if arguments.is_empty() {
        return Ok(());
    }

    write!(f, "(")?;
    write_list(f, arguments, ", ")?;
    write!(f, ")")
}

fn write_directives(f: &mut fmt::Formatter<'_>, directives: &[ConstantDirective]) -> fmt::Result {
    if directives.is_empty() {
        return Ok(());
    }

    write!(f, " ")?;
    write_list(f, directives, " ")
}

fn write_fields(f: &mut fmt::Formatter<'_>, fields: &[impl fmt::Display]) -> fmt::Result {
    if fields.is_empty() {
        return Ok(());
    }

    write!(f, " {{\n  ")?;
    write_list(f, fields, "\n  ")?;
    write!(f, "\n}}")
}

fn write_schema_definition_helper(
    f: &mut fmt::Formatter<'_>,
    directives: &[ConstantDirective],
    operation_types: &[OperationTypeDefinition],
) -> fmt::Result {
    write!(f, "schema")?;
    write_directives(f, directives)?;
    write_fields(f, operation_types)?;
    writeln!(f)
}

fn write_schema_extension_helper(
    f: &mut fmt::Formatter<'_>,
    directives: &[ConstantDirective],
    operation_types: &Option<List<OperationTypeDefinition>>,
) -> fmt::Result {
    write!(f, "extend schema")?;
    write_directives(f, directives)?;
    if let Some(operation_types) = operation_types.as_ref() {
        write_fields(f, &operation_types.items)?;
    }
    writeln!(f)
}

fn write_object_helper(
    f: &mut fmt::Formatter<'_>,
    name: &StringKey,
    interfaces: &[Identifier],
    fields: &Option<List<FieldDefinition>>,
    directives: &[ConstantDirective],
    is_extension: bool,
) -> fmt::Result {
    if is_extension {
        write!(f, "extend ")?;
    }

    write!(f, "type {}", name)?;
    if !interfaces.is_empty() {
        write!(f, " implements ")?;
        write_list(f, interfaces, " & ")?;
    }
    write_directives(f, directives)?;
    if let Some(fields) = fields.as_ref() {
        write_fields(f, &fields.items)?;
    }
    writeln!(f)
}

fn write_interface_helper(
    f: &mut fmt::Formatter<'_>,
    name: &StringKey,
    fields: &Option<List<FieldDefinition>>,
    directives: &[ConstantDirective],
    is_extension: bool,
) -> fmt::Result {
    if is_extension {
        write!(f, "extend ")?;
    }

    write!(f, "interface {}", name)?;
    write_directives(f, directives)?;
    if let Some(fields) = fields.as_ref() {
        write_fields(f, &fields.items)?;
    }
    writeln!(f)
}

fn write_union_type_definition_helper(
    f: &mut fmt::Formatter<'_>,
    name: &StringKey,
    directives: &[ConstantDirective],
    members: &[Identifier],
    is_extension: bool,
) -> fmt::Result {
    if is_extension {
        write!(f, "extend ")?;
    }

    write!(f, "union {}", name)?;
    write_directives(f, directives)?;
    if !members.is_empty() {
        write!(f, " = ")?;
        write_list(f, members, " | ")?;
    }
    writeln!(f)
}

fn write_directive_definition_helper(
    f: &mut fmt::Formatter<'_>,
    name: &StringKey,
    arguments: &Option<List<InputValueDefinition>>,
    _repeatable: &bool,
    locations: &[DirectiveLocation],
    _description: &Option<StringNode>,
) -> fmt::Result {
    write!(f, "directive @{}", name)?;
    if let Some(arguments) = arguments.as_ref() {
        write_arguments(f, &arguments.items)?;
    }
    write!(f, " on ")?;
    write_list(f, locations, " | ")?;
    writeln!(f)
}

fn write_input_object_type_definition_helper(
    f: &mut fmt::Formatter<'_>,
    name: &StringKey,
    directives: &[ConstantDirective],
    fields: &Option<List<InputValueDefinition>>,
    is_extension: bool,
) -> fmt::Result {
    if is_extension {
        write!(f, "extend ")?;
    }

    write!(f, "input {}", name)?;
    write_directives(f, directives)?;
    if let Some(fields) = fields.as_ref() {
        write_fields(f, &fields.items)?;
    }
    writeln!(f)
}

fn write_enum_type_definition_helper(
    f: &mut fmt::Formatter<'_>,
    name: &StringKey,
    directives: &[ConstantDirective],
    values: &Option<List<EnumValueDefinition>>,
    is_extension: bool,
) -> fmt::Result {
    if is_extension {
        write!(f, "extend ")?;
    }

    write!(f, "enum {}", name)?;
    write_directives(f, directives)?;
    if let Some(values) = values.as_ref() {
        write_fields(f, &values.items)?;
    }

    writeln!(f)
}

fn write_scalar_type_definition_helper(
    f: &mut fmt::Formatter<'_>,
    name: &StringKey,
    directives: &[ConstantDirective],
    is_extension: bool,
) -> fmt::Result {
    if is_extension {
        write!(f, "extend ")?;
    }

    write!(f, "scalar {}", name)?;
    write_directives(f, directives)?;
    writeln!(f)
}

impl fmt::Display for ConstantDirective {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "@{}", self.name)?;
        if let Some(arguments) = self.arguments.as_ref() {
            write_arguments(f, &arguments.items)?;
        }
        Ok(())
    }
}
