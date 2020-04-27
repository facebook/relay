/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::WithLocation;
use graphql_syntax::{FloatValue, OperationKind};
use interner::StringKey;
use schema::Schema;
use schema::{FieldID, Type, TypeReference};
use std::fmt;
use std::sync::Arc;
// Definitions

/// Represents a node that has a name such as an `Argument` or `Directive`.
pub trait Named {
    fn name(&self) -> StringKey;
}

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub enum ExecutableDefinition {
    Operation(OperationDefinition),
    Fragment(FragmentDefinition),
}

/// A fully-typed mutation, query, or subscription definition
#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct OperationDefinition {
    pub kind: OperationKind,
    pub name: WithLocation<StringKey>,
    pub type_: Type,
    pub variable_definitions: Vec<VariableDefinition>,
    pub directives: Vec<Directive>,
    pub selections: Vec<Selection>,
}

/// A fully-typed fragment definition
#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct FragmentDefinition {
    pub name: WithLocation<StringKey>,
    pub variable_definitions: Vec<VariableDefinition>,
    pub used_global_variables: Vec<VariableDefinition>,
    pub type_condition: Type,
    pub directives: Vec<Directive>,
    pub selections: Vec<Selection>,
}

/// A variable definition of an operation or fragment
#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct VariableDefinition {
    pub name: WithLocation<StringKey>,
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

impl Named for VariableDefinition {
    fn name(&self) -> StringKey {
        self.name.item
    }
}

// Selections

/// A selection within an operation or fragment
#[derive(Clone, Eq, PartialEq, PartialOrd, Ord, Hash)]
pub enum Selection {
    FragmentSpread(Arc<FragmentSpread>),
    InlineFragment(Arc<InlineFragment>),
    LinkedField(Arc<LinkedField>),
    ScalarField(Arc<ScalarField>),
    Condition(Arc<Condition>),
}

impl Selection {
    /// Get selection directives
    /// This method will panic if called on the Selection::Condition
    pub fn directives(&self) -> &[Directive] {
        match self {
            Selection::FragmentSpread(node) => &node.directives,
            Selection::InlineFragment(node) => &node.directives,
            Selection::ScalarField(node) => &node.directives,
            Selection::LinkedField(node) => &node.directives,
            Selection::Condition(_) => unreachable!("Unexpected `Condition` selection."),
        }
    }

    /// Update Selection directives
    /// This method will panic if called on the Selection::Condition
    pub fn set_directives(&mut self, directives: Vec<Directive>) {
        match self {
            Selection::FragmentSpread(node) => {
                Arc::make_mut(node).directives = directives;
            }
            Selection::InlineFragment(node) => {
                Arc::make_mut(node).directives = directives;
            }
            Selection::ScalarField(node) => {
                Arc::make_mut(node).directives = directives;
            }
            Selection::LinkedField(node) => {
                Arc::make_mut(node).directives = directives;
            }
            Selection::Condition(_) => unreachable!("Unexpected `Condition` selection."),
        };
    }
}

impl fmt::Debug for Selection {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Selection::FragmentSpread(node) => f.write_fmt(format_args!("{:#?}", node)),
            Selection::InlineFragment(node) => f.write_fmt(format_args!("{:#?}", node)),
            Selection::LinkedField(node) => f.write_fmt(format_args!("{:#?}", node)),
            Selection::ScalarField(node) => f.write_fmt(format_args!("{:#?}", node)),
            Selection::Condition(node) => f.write_fmt(format_args!("{:#?}", node)),
        }
    }
}

/// ... Name
#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct FragmentSpread {
    pub fragment: WithLocation<StringKey>,
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
    pub alias: Option<WithLocation<StringKey>>,
    pub definition: WithLocation<FieldID>,
    pub arguments: Vec<Argument>,
    pub directives: Vec<Directive>,
    pub selections: Vec<Selection>,
}

impl LinkedField {
    pub fn alias_or_name(&self, schema: &Schema) -> StringKey {
        if let Some(name) = self.alias {
            name.item
        } else {
            schema.field(self.definition.item).name
        }
    }
}

/// Name Arguments?
#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct ScalarField {
    pub alias: Option<WithLocation<StringKey>>,
    pub definition: WithLocation<FieldID>,
    pub arguments: Vec<Argument>,
    pub directives: Vec<Directive>,
}

impl ScalarField {
    pub fn alias_or_name(&self, schema: &Schema) -> StringKey {
        if let Some(name) = self.alias {
            name.item
        } else {
            schema.field(self.definition.item).name
        }
    }
}

/// https://spec.graphql.org/June2018/#sec--skip
#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct Condition {
    pub selections: Vec<Selection>,
    pub value: ConditionValue,
    pub passing_value: bool,
}

// Associated Types

/// @ Name Arguments?
#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct Directive {
    pub name: WithLocation<StringKey>,
    pub arguments: Vec<Argument>,
}
impl Named for Directive {
    fn name(&self) -> StringKey {
        self.name.item
    }
}

/// Name : Value
#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct Argument {
    pub name: WithLocation<StringKey>,
    pub value: WithLocation<Value>,
}
impl Named for Argument {
    fn name(&self) -> StringKey {
        self.name.item
    }
}

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub enum Value {
    Constant(ConstantValue),
    Variable(Variable),
    List(Vec<Value>),
    Object(Vec<Argument>),
}
impl Value {
    pub fn get_string_literal(&self) -> Option<StringKey> {
        if let Value::Constant(ConstantValue::String(val)) = self {
            Some(*val)
        } else {
            None
        }
    }
}

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct Variable {
    pub name: WithLocation<StringKey>,
    pub type_: TypeReference,
}

/// Name : Value[Const]
#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct ConstantArgument {
    pub name: WithLocation<StringKey>,
    pub value: WithLocation<ConstantValue>,
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

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub enum ConditionValue {
    Constant(bool),
    Variable(Variable),
}
