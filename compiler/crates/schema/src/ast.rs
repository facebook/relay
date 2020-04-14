/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#![deny(clippy::all)]

use interner::StringKey;
use std::fmt;

#[derive(PartialEq, Debug, Ord, PartialOrd, Eq, Clone)]
pub enum Type {
    Named(StringKey),
    List(Box<Type>),
    NonNull(Box<Type>),
}

#[derive(PartialEq, Debug)]
pub enum Definition {
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
        directives: Vec<Directive>,
        fields: Vec<FieldDefinition>,
    },
    InterfaceTypeExtension {
        name: StringKey,
        directives: Vec<Directive>,
        fields: Vec<FieldDefinition>,
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

#[derive(PartialEq, Debug, Clone, Copy)]
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
            DirectiveLocation::Query => f.write_fmt(format_args!("QUERY")),
            DirectiveLocation::Mutation => f.write_fmt(format_args!("MUTATION")),
            DirectiveLocation::Subscription => f.write_fmt(format_args!("SUBSCRIPTION")),
            DirectiveLocation::Field => f.write_fmt(format_args!("FIELD")),
            DirectiveLocation::FragmentDefinition => {
                f.write_fmt(format_args!("FRAGMENT_DEFINITION"))
            }
            DirectiveLocation::FragmentSpread => f.write_fmt(format_args!("FRAGMENT_SPREAD")),
            DirectiveLocation::InlineFragment => f.write_fmt(format_args!("INLINE_FRAGMENT")),
            DirectiveLocation::Schema => f.write_fmt(format_args!("SCHEMA")),
            DirectiveLocation::Scalar => f.write_fmt(format_args!("SCALAR")),
            DirectiveLocation::Object => f.write_fmt(format_args!("OBJECT")),
            DirectiveLocation::FieldDefinition => f.write_fmt(format_args!("FIELD_DEFINITION")),
            DirectiveLocation::ArgumentDefinition => {
                f.write_fmt(format_args!("ARGUMENT_DEFINITION"))
            }
            DirectiveLocation::Interface => f.write_fmt(format_args!("INTERFACE")),
            DirectiveLocation::Union => f.write_fmt(format_args!("UNION")),
            DirectiveLocation::Enum => f.write_fmt(format_args!("ENUM")),
            DirectiveLocation::EnumValue => f.write_fmt(format_args!("ENUM_VALUE")),
            DirectiveLocation::InputObject => f.write_fmt(format_args!("INPUT_OBJECT")),
            DirectiveLocation::InputFieldDefinition => {
                f.write_fmt(format_args!("INPUT_FIELD_DEFINITION"))
            }
            DirectiveLocation::VariableDefinition => {
                f.write_fmt(format_args!("VARIABLE_DEFINITION"))
            }
        }
    }
}

#[derive(PartialEq, Debug, Copy, Clone)]
pub enum OperationType {
    Query,
    Mutation,
    Subscription,
}

#[derive(PartialEq, Debug)]
pub struct InputValueDefinition {
    pub name: StringKey,
    pub type_: Type,
    pub default_value: Option<Value>,
    pub directives: Vec<Directive>,
}

#[derive(PartialEq, Debug)]
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
        match &*self {
            Value::String(value) | Value::Int(value) | Value::Float(value) => {
                f.write_fmt(format_args!("{:?}", value))
            }
            Value::Enum(value) => f.write_fmt(format_args!("{}", value.lookup())),
            _ => f.write_fmt(format_args!("{}", *self)),
        }
    }
}

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct ListValue {
    pub values: Vec<Value>,
}

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct ObjectValue {
    pub fields: Vec<ObjectField>,
}

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct ObjectField {
    pub name: StringKey,
    pub value: Value,
}

#[derive(PartialEq, Debug)]
pub struct Argument {
    pub name: StringKey,
    pub value: Value,
}

#[derive(PartialEq, Debug)]
pub struct Directive {
    pub name: StringKey,
    pub arguments: Vec<Argument>,
}
