/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::constant_value::*;
use super::primitive::*;
use common::{Named, SourceLocationKey, Span, WithLocation};
use core::fmt;
use intern::string_key::StringKey;

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct VariableIdentifier {
    pub span: Span,
    pub token: Token,
    pub name: StringKey,
}

impl fmt::Display for VariableIdentifier {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_fmt(format_args!("${}", self.name))
    }
}

impl VariableIdentifier {
    pub fn name_with_location(&self, file: SourceLocationKey) -> WithLocation<StringKey> {
        WithLocation::from_span(file, self.span, self.name)
    }
}

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub enum Value {
    Constant(ConstantValue),
    Variable(VariableIdentifier),
    List(List<Value>),
    Object(List<Argument>),
}

impl fmt::Display for Value {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Value::Constant(value) => f.write_fmt(format_args!("{}", value)),
            Value::Variable(value) => f.write_fmt(format_args!("{}", value)),
            Value::List(value) => f.write_fmt(format_args!(
                "[{}]",
                value
                    .items
                    .iter()
                    .map(|item| item.to_string())
                    .collect::<Vec<String>>()
                    .join(", ")
            )),
            Value::Object(value) => f.write_fmt(format_args!(
                "{{{}}}",
                value
                    .items
                    .iter()
                    .map(|item| item.to_string())
                    .collect::<Vec<String>>()
                    .join(", ")
            )),
        }
    }
}

impl Value {
    pub fn is_constant(&self) -> bool {
        matches!(self, Value::Constant(..))
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

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct Argument {
    pub span: Span,
    pub name: Identifier,
    pub colon: Token,
    pub value: Value,
}

impl fmt::Display for Argument {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_fmt(format_args!("{}: {}", self.name, self.value))
    }
}

impl Named for Argument {
    fn name(&self) -> StringKey {
        self.name.value
    }
}
