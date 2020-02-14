/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::syntax_error::SyntaxError;
use crate::token_kind::TokenKind;
use common::{Location, Span, Spanned};
use interner::StringKey;
use std::fmt;

pub type SyntaxResult<T> = Result<T, Vec<SyntaxError>>;
pub type ParseResult<T> = Result<T, SyntaxError>;

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct Document {
    pub span: Span,
    pub definitions: Vec<ExecutableDefinition>,
}

#[derive(Clone, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub enum ExecutableDefinition {
    Operation(OperationDefinition),
    Fragment(FragmentDefinition),
}

impl ExecutableDefinition {
    pub fn location(&self) -> Location {
        match self {
            ExecutableDefinition::Operation(node) => node.location.clone(),
            ExecutableDefinition::Fragment(node) => node.location.clone(),
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
    // pub variable_definitions: Option<List<VariableDefinition>>,
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

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct Directive {
    pub span: Span,
    pub at: Token,
    pub name: Identifier,
    pub arguments: Option<List<Argument>>,
}

// Primitive Types

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct List<T> {
    pub span: Span,
    pub start: Token,
    pub items: Vec<T>,
    pub end: Token,
}

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct Argument {
    pub span: Span,
    pub name: Identifier,
    pub colon: Token,
    pub value: Value,
}

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct Alias {
    pub span: Span,
    pub alias: Identifier,
    pub colon: Token,
}

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct TypeCondition {
    pub span: Span,
    pub on: Token,
    pub type_: Identifier,
}

#[derive(Clone, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct Token {
    pub span: Span,
    pub inner_span: Span,
    pub kind: TokenKind,
}

impl fmt::Debug for Token {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let mut s = f.debug_struct("Token");
        s.field(
            "span",
            // TODO: switch to span's default
            &format!("{}:{}", self.span.start, self.span.start + self.span.length),
        );
        s.field("kind", &self.kind);
        s.finish()
    }
}

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct VariableIdentifier {
    pub span: Span,
    pub token: Token,
    pub name: StringKey,
}

impl VariableIdentifier {
    pub fn spanned_name(&self) -> Spanned<StringKey> {
        Spanned::new(self.span, self.name)
    }
}

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct Identifier {
    pub span: Span,
    pub token: Token,
    pub value: StringKey,
}

impl Identifier {
    pub fn spanned_name(&self) -> Spanned<StringKey> {
        Spanned::new(self.span, self.value)
    }
}

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct DefaultValue {
    pub span: Span,
    pub equals: Token,
    pub value: ConstantValue,
}

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub enum ConstantValue {
    Int(IntNode),
    Float(FloatNode),
    String(StringNode),
    Boolean(BooleanNode),
    Null(Token),
    Enum(EnumNode),
    List(List<ConstantValue>),
    Object(List<ConstantArgument>),
}

impl ConstantValue {
    pub fn span(&self) -> Span {
        match self {
            ConstantValue::Int(value) => value.token.span,
            ConstantValue::Float(value) => value.token.span,
            ConstantValue::String(value) => value.token.span,
            ConstantValue::Boolean(value) => value.token.span,
            ConstantValue::Null(value) => value.span,
            ConstantValue::Enum(value) => value.token.span,
            ConstantValue::List(value) => value.span,
            ConstantValue::Object(value) => value.span,
        }
    }
}

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct ConstantArgument {
    pub span: Span,
    pub name: Identifier,
    pub colon: Token,
    pub value: ConstantValue,
}

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct IntNode {
    pub token: Token,
    pub value: i64,
}

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct FloatNode {
    pub token: Token,
    pub value: FloatValue,
}

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct StringNode {
    pub token: Token,
    pub value: StringKey,
}

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct EnumNode {
    pub token: Token,
    pub value: StringKey,
}

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct BooleanNode {
    pub token: Token,
    pub value: bool,
}

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub enum Value {
    Constant(ConstantValue),
    Variable(VariableIdentifier),
    List(List<Value>),
    Object(List<Argument>),
}

impl Value {
    pub fn is_constant(&self) -> bool {
        match self {
            Value::Constant(..) => true,
            _ => false,
        }
    }

    pub fn span(&self) -> Span {
        match self {
            Value::Constant(value) => value.span(),
            Value::Variable(value) => value.span,
            Value::List(value) => value.span,
            Value::Object(value) => value.span,
        }
    }
}

#[derive(Copy, Clone, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct FloatValue(u64);

impl FloatValue {
    pub fn new(v: f64) -> Self {
        Self(v.to_bits())
    }

    pub fn as_float(self) -> f64 {
        f64::from_bits(self.0)
    }
}

impl fmt::Debug for FloatValue {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_fmt(format_args!("{}", self.as_float()))
    }
}

impl fmt::Display for FloatValue {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_fmt(format_args!("{}", self.as_float()))
    }
}

impl std::convert::From<i64> for FloatValue {
    fn from(value: i64) -> Self {
        FloatValue::new(value as f64)
    }
}

// Types

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub enum TypeAnnotation {
    Named(Identifier),
    List(Box<ListTypeAnnotation>),
    NonNull(Box<NonNullTypeAnnotation>),
}

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct ListTypeAnnotation {
    pub span: Span,
    pub open: Token,
    pub type_: TypeAnnotation,
    pub close: Token,
}

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct NonNullTypeAnnotation {
    pub span: Span,
    pub type_: TypeAnnotation,
    pub exclamation: Token,
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
