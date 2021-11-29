/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::constant_value::*;
use super::directive::Directive;
use super::primitive::*;
use super::type_annotation::*;
use super::value::*;
use common::{Location, Span};
use intern::string_key::StringKey;
use std::fmt;

#[derive(Clone, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub enum ExecutableDefinition {
    Operation(OperationDefinition),
    Fragment(FragmentDefinition),
}

impl ExecutableDefinition {
    pub fn location(&self) -> Location {
        match self {
            ExecutableDefinition::Operation(node) => node.location,
            ExecutableDefinition::Fragment(node) => node.location,
        }
    }

    pub fn name(&self) -> Option<StringKey> {
        match self {
            ExecutableDefinition::Operation(node) => node.name.as_ref().map(|name| name.value),
            ExecutableDefinition::Fragment(node) => Some(node.name.value),
        }
    }

    pub fn has_directive(&self, directive_name: StringKey) -> bool {
        match self {
            ExecutableDefinition::Operation(node) => node
                .directives
                .iter()
                .any(|d| d.name.value == directive_name),
            ExecutableDefinition::Fragment(node) => node
                .directives
                .iter()
                .any(|d| d.name.value == directive_name),
        }
    }
}

impl fmt::Debug for ExecutableDefinition {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ExecutableDefinition::Operation(node) => f.write_fmt(format_args!("{:#?}", node)),
            ExecutableDefinition::Fragment(node) => f.write_fmt(format_args!("{:#?}", node)),
        }
    }
}

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct OperationDefinition {
    pub location: Location,
    pub operation: Option<(Token, OperationKind)>,
    pub name: Option<Identifier>,
    pub variable_definitions: Option<List<VariableDefinition>>,
    pub directives: Vec<Directive>,
    pub selections: List<Selection>,
}

impl OperationDefinition {
    pub fn operation_kind(&self) -> OperationKind {
        // The GraphQL spec defines anonymous operations as queries.
        // https://spec.graphql.org/June2018/#sec-Anonymous-Operation-Definitions
        self.operation
            .as_ref()
            .map(|(_, operation_kind)| *operation_kind)
            .unwrap_or(OperationKind::Query)
    }
}

#[derive(Clone, Copy, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub enum OperationKind {
    Query,
    Mutation,
    Subscription,
}

impl fmt::Display for OperationKind {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            OperationKind::Query => f.write_str("query"),
            OperationKind::Mutation => f.write_str("mutation"),
            OperationKind::Subscription => f.write_str("subscription"),
        }
    }
}

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct FragmentDefinition {
    pub location: Location,
    pub fragment: Token,
    pub name: Identifier,
    pub variable_definitions: Option<List<VariableDefinition>>,
    pub type_condition: TypeCondition,
    pub directives: Vec<Directive>,
    pub selections: List<Selection>,
}

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct VariableDefinition {
    pub span: Span,
    pub name: VariableIdentifier,
    pub colon: Token,
    pub type_: TypeAnnotation,
    pub default_value: Option<DefaultValue>,
    pub directives: Vec<Directive>,
}

// Primitive Types

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct Alias {
    pub span: Span,
    pub alias: Identifier,
    pub colon: Token,
}

impl fmt::Display for Alias {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_fmt(format_args!("{}", self.alias))
    }
}

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct TypeCondition {
    pub span: Span,
    pub on: Token,
    pub type_: Identifier,
}

impl fmt::Display for TypeCondition {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_fmt(format_args!("on {}", self.type_))
    }
}

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct DefaultValue {
    pub span: Span,
    pub equals: Token,
    pub value: ConstantValue,
}

impl fmt::Display for DefaultValue {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_fmt(format_args!("{}", self.value))
    }
}

// Selections

#[derive(Clone, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub enum Selection {
    FragmentSpread(FragmentSpread),
    InlineFragment(InlineFragment),
    LinkedField(LinkedField),
    ScalarField(ScalarField),
}

impl Selection {
    pub fn span(&self) -> Span {
        match self {
            Selection::FragmentSpread(node) => node.span,
            Selection::InlineFragment(node) => node.span,
            Selection::LinkedField(node) => node.span,
            Selection::ScalarField(node) => node.span,
        }
    }

    pub fn directives(&self) -> &[Directive] {
        match self {
            Selection::FragmentSpread(node) => &node.directives,
            Selection::InlineFragment(node) => &node.directives,
            Selection::LinkedField(node) => &node.directives,
            Selection::ScalarField(node) => &node.directives,
        }
    }
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

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct FragmentSpread {
    pub span: Span,
    pub spread: Token,
    pub name: Identifier,
    pub directives: Vec<Directive>,
}

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct InlineFragment {
    pub span: Span,
    pub spread: Token,
    pub type_condition: Option<TypeCondition>,
    pub directives: Vec<Directive>,
    pub selections: List<Selection>,
}

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct LinkedField {
    pub span: Span,
    pub alias: Option<Alias>,
    pub name: Identifier,
    pub arguments: Option<List<Argument>>,
    pub directives: Vec<Directive>,
    pub selections: List<Selection>,
}

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct ScalarField {
    pub span: Span,
    pub alias: Option<Alias>,
    pub name: Identifier,
    pub arguments: Option<List<Argument>>,
    pub directives: Vec<Directive>,
}
