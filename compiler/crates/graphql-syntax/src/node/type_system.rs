/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::constant_directive::ConstantDirective;
use super::constant_value::ConstantValue;
use super::primitive::*;
use super::type_annotation::TypeAnnotation;
use common::Span;
use std::fmt;

/// A document only consisting of executable definitions (fragments and operations).
/// This excludes schema definitions and schema extensions.
#[derive(Debug)]
pub struct SchemaDocument {
    pub span: Span,
    pub definitions: Vec<TypeSystemDefinition>,
}

#[derive(PartialEq, Debug)]
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

#[derive(PartialEq, Debug)]
pub struct SchemaDefinition {
    pub directives: Vec<ConstantDirective>,
    pub operation_types: List<OperationTypeDefinition>,
}

#[derive(PartialEq, Debug)]
pub struct SchemaExtension {
    pub directives: Vec<ConstantDirective>,
    pub operation_types: Option<List<OperationTypeDefinition>>,
}

#[derive(PartialEq, Debug)]
pub struct OperationTypeDefinition {
    pub operation: OperationType,
    pub type_: Identifier,
}

#[derive(PartialEq, Debug, Copy, Clone)]
pub enum OperationType {
    Query,
    Mutation,
    Subscription,
}

#[derive(PartialEq, Debug)]
pub struct ObjectTypeDefinition {
    pub name: Identifier,
    pub interfaces: Vec<Identifier>,
    pub directives: Vec<ConstantDirective>,
    pub fields: Option<List<FieldDefinition>>,
}

#[derive(PartialEq, Debug)]
pub struct ObjectTypeExtension {
    pub name: Identifier,
    pub interfaces: Vec<Identifier>,
    pub directives: Vec<ConstantDirective>,
    pub fields: Option<List<FieldDefinition>>,
}

#[derive(PartialEq, Debug)]
pub struct InterfaceTypeDefinition {
    pub name: Identifier,
    pub interfaces: Vec<Identifier>,
    pub directives: Vec<ConstantDirective>,
    pub fields: Option<List<FieldDefinition>>,
}

#[derive(PartialEq, Debug)]
pub struct InterfaceTypeExtension {
    pub name: Identifier,
    pub interfaces: Vec<Identifier>,
    pub directives: Vec<ConstantDirective>,
    pub fields: Option<List<FieldDefinition>>,
}

#[derive(PartialEq, Debug)]
pub struct UnionTypeDefinition {
    pub name: Identifier,
    pub directives: Vec<ConstantDirective>,
    pub members: Vec<Identifier>,
}

#[derive(PartialEq, Debug)]
pub struct UnionTypeExtension {
    pub name: Identifier,
    pub directives: Vec<ConstantDirective>,
    pub members: Vec<Identifier>,
}

#[derive(PartialEq, Debug)]
pub struct ScalarTypeDefinition {
    pub name: Identifier,
    pub directives: Vec<ConstantDirective>,
}

#[derive(PartialEq, Debug)]
pub struct ScalarTypeExtension {
    pub name: Identifier,
    pub directives: Vec<ConstantDirective>,
}

#[derive(PartialEq, Debug)]
pub struct EnumTypeDefinition {
    pub name: Identifier,
    pub directives: Vec<ConstantDirective>,
    pub values: Option<List<EnumValueDefinition>>,
}

#[derive(PartialEq, Debug)]
pub struct EnumTypeExtension {
    pub name: Identifier,
    pub directives: Vec<ConstantDirective>,
    pub values: Option<List<EnumValueDefinition>>,
}

#[derive(PartialEq, Debug)]
pub struct InputObjectTypeDefinition {
    pub name: Identifier,
    pub directives: Vec<ConstantDirective>,
    pub fields: Option<List<InputValueDefinition>>,
}

#[derive(PartialEq, Debug)]
pub struct InputObjectTypeExtension {
    pub name: Identifier,
    pub directives: Vec<ConstantDirective>,
    pub fields: Option<List<InputValueDefinition>>,
}

#[derive(PartialEq, Debug)]
pub struct EnumValueDefinition {
    pub name: Identifier,
    pub directives: Vec<ConstantDirective>,
}

#[derive(PartialEq, Debug)]
pub struct DirectiveDefinition {
    pub name: Identifier,
    pub arguments: Option<List<InputValueDefinition>>,
    pub repeatable: bool,
    pub locations: Vec<DirectiveLocation>,
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

#[derive(PartialEq, Debug)]
pub struct InputValueDefinition {
    pub name: Identifier,
    pub type_: TypeAnnotation,
    pub default_value: Option<ConstantValue>,
    pub directives: Vec<ConstantDirective>,
}

#[derive(PartialEq, Debug)]
pub struct FieldDefinition {
    pub name: Identifier,
    pub type_: TypeAnnotation,
    pub arguments: Option<List<InputValueDefinition>>,
    pub directives: Vec<ConstantDirective>,
}
