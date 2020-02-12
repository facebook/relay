/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::Spanned;
use graphql_syntax::{FloatValue, OperationKind};
use interner::StringKey;
use schema::{FieldID, Type, TypeReference};
use std::fmt;
use std::sync::Arc;

// Definitions

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub enum ExecutableDefinition {
    Operation(OperationDefinition),
    Fragment(FragmentDefinition),
}

/// A fully-typed mutation, query, or subscription definition
#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct OperationDefinition {
    pub kind: OperationKind,
    pub name: Spanned<StringKey>,
    pub type_: Type,
    pub variable_definitions: Vec<VariableDefinition>,
    pub directives: Vec<Directive>,
    pub selections: Vec<Selection>,
}

/// A fully-typed fragment definition
#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct FragmentDefinition {
    pub name: Spanned<StringKey>,
    pub variable_definitions: Vec<VariableDefinition>,
    pub used_global_variables: Vec<VariableDefinition>,
    pub type_condition: Type,
    pub directives: Vec<Directive>,
    pub selections: Vec<Selection>,
}

/// A variable definition of an operation or fragment
#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct VariableDefinition {
    pub name: Spanned<StringKey>,
    pub type_: TypeReference,
    pub default_value: Option<ConstantValue>,
    pub directives: Vec<Directive>,
}

impl VariableDefinition {
    pub fn has_non_null_default_value(&self) -> bool {
        match &self.default_value {
            Some(value) => value.is_non_null(),
            _ => false,
        }
    }
}

// Selections

/// A selection within an operation or fragment
#[derive(Clone, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub enum Selection {
    FragmentSpread(Arc<FragmentSpread>),
    InlineFragment(Arc<InlineFragment>),
    LinkedField(Arc<LinkedField>),
    ScalarField(Arc<ScalarField>),
}

impl fmt::Debug for Selection {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Selection::FragmentSpread(node) => f.write_fmt(format_args!("{:#?}", node)),
            Selection::InlineFragment(node) => f.write_fmt(format_args!("{:#?}", node)),
            Selection::LinkedField(node) => f.write_fmt(format_args!("{:#?}", node)),
            Selection::ScalarField(node) => f.write_fmt(format_args!("{:#?}", node)),
        }
    }
}

/// ... Name
#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct FragmentSpread {
    pub fragment: Spanned<StringKey>,
    pub arguments: Vec<Argument>,
    pub directives: Vec<Directive>,
}

/// ... SelectionSet
/// ... on Type SelectionSet
#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct InlineFragment {
    pub type_condition: Option<Type>,
    pub directives: Vec<Directive>,
    pub selections: Vec<Selection>,
}

/// Name Arguments? SelectionSet
#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct LinkedField {
    pub alias: Option<Spanned<StringKey>>,
    pub definition: Spanned<FieldID>,
    pub arguments: Vec<Argument>,
    pub directives: Vec<Directive>,
    pub selections: Vec<Selection>,
}

/// Name Arguments?
#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct ScalarField {
    pub alias: Option<Spanned<StringKey>>,
    pub definition: Spanned<FieldID>,
    pub arguments: Vec<Argument>,
    pub directives: Vec<Directive>,
}

// Associated Types

/// @ Name Arguments?
#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct Directive {
    pub name: Spanned<StringKey>,
    pub arguments: Vec<Argument>,
}

/// Name : Value
#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct Argument {
    pub name: Spanned<StringKey>,
    pub value: Spanned<Value>,
}

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub enum Value {
    Constant(ConstantValue),
    Variable(Variable),
    List(Vec<Value>),
    Object(Vec<Argument>),
}

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct Variable {
    pub name: Spanned<StringKey>,
    pub type_: TypeReference,
}

/// Name : Value[Const]
#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct ConstantArgument {
    pub name: Spanned<StringKey>,
    pub value: Spanned<ConstantValue>,
}

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub enum ConstantValue {
    Int(i64),
    Float(FloatValue),
    String(StringKey),
    Boolean(bool),
    Null(),
    Enum(StringKey),
    List(Vec<ConstantValue>),
    Object(Vec<ConstantArgument>),
}

impl ConstantValue {
    pub fn is_null(&self) -> bool {
        match self {
            ConstantValue::Null() => true,
            _ => false,
        }
    }

    pub fn is_non_null(&self) -> bool {
        !self.is_null()
    }
}
