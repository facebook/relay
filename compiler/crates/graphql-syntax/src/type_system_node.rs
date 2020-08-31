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

#[derive(PartialEq, Debug)]
pub struct OperationTypeDefinition {
    pub operation: OperationType,
    pub type_: StringKey,
}

#[derive(PartialEq, Debug)]
pub struct EnumValueDefinition {
    pub name: StringKey,
    pub directives: Vec<Directive>,
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

#[derive(PartialEq, Debug, Clone)]
pub struct InputValueDefinition {
    pub name: StringKey,
    pub type_: Type,
    pub default_value: Option<Value>,
    pub directives: Vec<Directive>,
}

#[derive(PartialEq, Debug, Clone)]
pub struct FieldDefinition {
    pub name: StringKey,
    pub type_: Type,
    pub arguments: Vec<InputValueDefinition>,
    pub directives: Vec<Directive>,
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
        let mut first = true;
        for item in &self.values {
            if first {
                first = false;
            } else {
                write!(f, ", ")?;
            }
            write!(f, "{}", item)?;
        }
        write!(f, "]")
    }
}

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct ObjectValue {
    pub fields: Vec<ObjectField>,
}
impl fmt::Display for ObjectValue {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{{")?;
        let mut first = true;
        for field in &self.fields {
            if first {
                first = false;
            } else {
                write!(f, ", ")?;
            }
            write!(f, "{}: {}", field.name, field.value)?;
        }
        write!(f, "}}")
    }
}

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct ObjectField {
    pub name: StringKey,
    pub value: Value,
}

#[derive(PartialEq, Debug, Clone)]
pub struct Argument {
    pub name: StringKey,
    pub value: Value,
}

#[derive(PartialEq, Debug, Clone)]
pub struct Directive {
    pub name: StringKey,
    pub arguments: Vec<Argument>,
}
