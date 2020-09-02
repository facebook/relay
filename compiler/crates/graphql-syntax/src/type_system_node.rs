/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use interner::StringKey;
use std::fmt;

#[derive(PartialEq, Debug, Ord, PartialOrd, Eq, Clone)]
pub enum Type {
    Named(StringKey),
    List(Box<Type>),
    NonNull(Box<Type>),
}

impl Type {
    pub fn inner(&self) -> Type {
        match self {
            Type::Named(t) => Type::Named(*t),
            Type::List(of) => of.inner(),
            Type::NonNull(of) => of.inner(),
        }
    }
}

impl fmt::Display for Type {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Type::Named(value) => write!(f, "{}", value),
            Type::List(value) => write!(f, "[{}]", value),
            Type::NonNull(value) => write!(f, "{}!", value),
        }
    }
}

#[derive(PartialEq, Debug)]
pub enum TypeSystemDefinition {
    SchemaDefinition {
        directives: Vec<Directive>,
        operation_types: Vec<OperationTypeDefinition>,
    },
    ObjectTypeExtension {
        name: StringKey,
        interfaces: Vec<StringKey>,
        fields: Vec<FieldDefinition>,
        directives: Vec<Directive>,
    },
    ObjectTypeDefinition {
        name: StringKey,
        interfaces: Vec<StringKey>,
        fields: Vec<FieldDefinition>,
        directives: Vec<Directive>,
    },
    InterfaceTypeDefinition {
        name: StringKey,
        interfaces: Vec<StringKey>,
        fields: Vec<FieldDefinition>,
        directives: Vec<Directive>,
    },
    InterfaceTypeExtension {
        name: StringKey,
        fields: Vec<FieldDefinition>,
        directives: Vec<Directive>,
    },
    UnionTypeDefinition {
        name: StringKey,
        directives: Vec<Directive>,
        members: Vec<StringKey>,
    },
    DirectiveDefinition {
        name: StringKey,
        arguments: Vec<InputValueDefinition>,
        repeatable: bool,
        locations: Vec<DirectiveLocation>,
    },
    InputObjectTypeDefinition {
        name: StringKey,
        directives: Vec<Directive>,
        fields: Vec<InputValueDefinition>,
    },
    EnumTypeDefinition {
        name: StringKey,
        directives: Vec<Directive>,
        values: Vec<EnumValueDefinition>,
    },
    ScalarTypeDefinition {
        name: StringKey,
        directives: Vec<Directive>,
    },
}

impl fmt::Display for TypeSystemDefinition {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            TypeSystemDefinition::SchemaDefinition {
                directives,
                operation_types,
            } => write_schema_definition_helper(f, directives, operation_types),
            TypeSystemDefinition::ObjectTypeExtension {
                name,
                interfaces,
                fields,
                directives,
            } => write_object_helper(f, name, interfaces, fields, directives, true),
            TypeSystemDefinition::ObjectTypeDefinition {
                name,
                interfaces,
                fields,
                directives,
            } => write_object_helper(f, name, interfaces, fields, directives, false),
            TypeSystemDefinition::InterfaceTypeDefinition {
                name,
                fields,
                directives,
                ..
            } => write_interface_helper(f, name, fields, directives, false),
            TypeSystemDefinition::InterfaceTypeExtension {
                name,
                fields,
                directives,
            } => write_interface_helper(f, name, fields, directives, true),
            TypeSystemDefinition::UnionTypeDefinition {
                name,
                directives,
                members,
            } => write_union_type_definition_helper(f, name, directives, members),
            TypeSystemDefinition::DirectiveDefinition {
                name,
                arguments,
                repeatable,
                locations,
            } => write_directive_definition_helper(f, name, arguments, repeatable, locations),
            TypeSystemDefinition::InputObjectTypeDefinition {
                name,
                directives,
                fields,
            } => write_input_object_type_definition_helper(f, name, directives, fields),
            TypeSystemDefinition::EnumTypeDefinition {
                name,
                directives,
                values,
            } => write_enum_type_definition_helper(f, name, directives, values),
            TypeSystemDefinition::ScalarTypeDefinition { name, directives } => {
                write_scalar_type_definition_helper(f, name, directives)
            }
        }
    }
}

#[derive(PartialEq, Debug)]
pub struct OperationTypeDefinition {
    pub operation: OperationType,
    pub type_: StringKey,
}

impl fmt::Display for OperationTypeDefinition {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}: {}", self.operation, self.type_)
    }
}

#[derive(PartialEq, Debug)]
pub struct EnumValueDefinition {
    pub name: StringKey,
    pub directives: Vec<Directive>,
}

impl fmt::Display for EnumValueDefinition {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.name)?;
        write_directives(f, &self.directives)
    }
}

#[derive(PartialEq, Eq, Hash, Debug, Clone, Copy)]
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
        match self {
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

#[derive(PartialEq, Debug, Copy, Clone)]
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

#[derive(PartialEq, Debug, Clone)]
pub struct InputValueDefinition {
    pub name: StringKey,
    pub type_: Type,
    pub default_value: Option<Value>,
    pub directives: Vec<Directive>,
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

#[derive(PartialEq, Debug, Clone)]
pub struct FieldDefinition {
    pub name: StringKey,
    pub type_: Type,
    pub arguments: Vec<InputValueDefinition>,
    pub directives: Vec<Directive>,
}

impl fmt::Display for FieldDefinition {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.name)?;
        write_arguments(f, &self.arguments)?;
        write!(f, ": {}", self.type_)?;
        write_directives(f, &self.directives)
    }
}

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub enum Value {
    Null,
    String(String),
    Boolean(bool),
    Enum(StringKey),
    Int(String),
    Float(String),
    List(ListValue),
    Object(ObjectValue),
}

impl fmt::Display for Value {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Value::String(value) => write!(f, "\"{}\"", value),
            Value::Int(value) | Value::Float(value) => write!(f, "{}", value),
            Value::Boolean(value) => write!(f, "{}", value),
            Value::Enum(value) => write!(f, "{}", value),
            Value::List(value) => write!(f, "{}", value),
            Value::Object(value) => write!(f, "{}", value),
            _null => write!(f, "UNKNOWN"),
        }
    }
}

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct ListValue {
    pub values: Vec<Value>,
}

impl fmt::Display for ListValue {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "[")?;
        write_list(f, &self.values, ", ")?;
        write!(f, "]")
    }
}

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct ObjectValue {
    pub fields: Vec<ObjectField>,
}

impl fmt::Display for ObjectValue {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write_fields_inline(f, &self.fields)
    }
}

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct ObjectField {
    pub name: StringKey,
    pub value: Value,
}

impl fmt::Display for ObjectField {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}: {}", self.name, self.value)
    }
}

#[derive(PartialEq, Debug, Clone)]
pub struct Argument {
    pub name: StringKey,
    pub value: Value,
}

impl fmt::Display for Argument {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}: {}", self.name, self.value)
    }
}

#[derive(PartialEq, Debug, Clone)]
pub struct Directive {
    pub name: StringKey,
    pub arguments: Vec<Argument>,
}

impl fmt::Display for Directive {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "@{}", self.name)?;
        write_arguments(f, &self.arguments)
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

fn write_directives(f: &mut fmt::Formatter<'_>, directives: &[Directive]) -> fmt::Result {
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

fn write_fields_inline(f: &mut fmt::Formatter<'_>, fields: &[impl fmt::Display]) -> fmt::Result {
    if fields.is_empty() {
        return Ok(());
    }

    write!(f, "{{")?;
    write_list(f, fields, ", ")?;
    write!(f, "}}")
}

fn write_schema_definition_helper(
    f: &mut fmt::Formatter<'_>,
    directives: &[Directive],
    operation_types: &[OperationTypeDefinition],
) -> fmt::Result {
    write!(f, "schema")?;
    write_directives(f, directives)?;
    write_fields(f, operation_types)?;
    write!(f, "\n")
}

fn write_object_helper(
    f: &mut fmt::Formatter<'_>,
    name: &StringKey,
    interfaces: &[StringKey],
    fields: &[FieldDefinition],
    directives: &[Directive],
    is_extension: bool,
) -> fmt::Result {
    if is_extension {
        write!(f, "extend ")?;
    }

    write!(f, "type {}", name)?;
    if !interfaces.is_empty() {
        write!(f, " implements ")?;
        write_list(f, &interfaces, " & ")?;
    }
    write_directives(f, directives)?;
    write_fields(f, fields)?;
    write!(f, "\n")
}

fn write_interface_helper(
    f: &mut fmt::Formatter<'_>,
    name: &StringKey,
    fields: &[FieldDefinition],
    directives: &[Directive],
    is_extension: bool,
) -> fmt::Result {
    if is_extension {
        write!(f, "extend ")?;
    }

    write!(f, "interface {}", name)?;
    write_directives(f, directives)?;
    write_fields(f, fields)?;
    write!(f, "\n")
}

fn write_union_type_definition_helper(
    f: &mut fmt::Formatter<'_>,
    name: &StringKey,
    directives: &[Directive],
    members: &[StringKey],
) -> fmt::Result {
    write!(f, "union {}", name)?;
    write_directives(f, directives)?;
    write!(f, " = ")?;
    write_list(f, members, " | ")?;
    write!(f, "\n")
}

fn write_directive_definition_helper(
    f: &mut fmt::Formatter<'_>,
    name: &StringKey,
    arguments: &[InputValueDefinition],
    _repeatable: &bool,
    locations: &[DirectiveLocation],
) -> fmt::Result {
    write!(f, "directive @{}", name)?;
    write_arguments(f, arguments)?;
    write!(f, " on ")?;
    write_list(f, locations, " | ")?;
    write!(f, "\n")
}

fn write_input_object_type_definition_helper(
    f: &mut fmt::Formatter<'_>,
    name: &StringKey,
    directives: &[Directive],
    fields: &[InputValueDefinition],
) -> fmt::Result {
    write!(f, "input {}", name)?;
    write_directives(f, directives)?;
    write_fields(f, fields)?;
    write!(f, "\n")
}

fn write_enum_type_definition_helper(
    f: &mut fmt::Formatter<'_>,
    name: &StringKey,
    directives: &[Directive],
    values: &[EnumValueDefinition],
) -> fmt::Result {
    write!(f, "enum {}", name)?;
    write_directives(f, directives)?;
    if !values.is_empty() {
        write_fields(f, values)?;
    }

    write!(f, "\n")
}

fn write_scalar_type_definition_helper(
    f: &mut fmt::Formatter<'_>,
    name: &StringKey,
    directives: &[Directive],
) -> fmt::Result {
    write!(f, "scalar {}", name)?;
    write_directives(f, directives)?;
    write!(f, "\n")
}
