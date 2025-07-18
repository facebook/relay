/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use core::fmt;

use common::Named;
use common::Span;
use intern::string_key::StringKey;

use super::primitive::*;

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

macro_rules! generate_unwrap_fn {
    ($fn_name:ident,$self:ident,$t:ty,$cv:pat => $result:expr_2021) => {
        pub fn $fn_name(&$self) -> $t {
            match $self {
                $cv => $result,
                other => panic!("expected constant {} but got {:#?}", stringify!($cv), other),
            }
        }
    }
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
    pub fn get_string_literal(&self) -> Option<StringKey> {
        match self {
            ConstantValue::String(StringNode { value, .. }) => Some(*value),
            _ => None,
        }
    }

    pub fn get_bool_literal(&self) -> Option<bool> {
        match self {
            ConstantValue::Boolean(BooleanNode { value, .. }) => Some(*value),
            _ => None,
        }
    }

    pub fn get_list_literal(&self) -> Option<&List<ConstantValue>> {
        match self {
            ConstantValue::List(list) => Some(list),
            _ => None,
        }
    }

    generate_unwrap_fn!(unwrap_int, self, i64, ConstantValue::Int(i) => i.value);
    generate_unwrap_fn!(unwrap_float, self, FloatValue, ConstantValue::Float(f) => f.value);
    generate_unwrap_fn!(unwrap_boolean, self, bool, ConstantValue::Boolean(b) => b.value);
    generate_unwrap_fn!(unwrap_string, self, StringKey, ConstantValue::String(s) => s.value);
    generate_unwrap_fn!(unwrap_enum, self, StringKey, ConstantValue::Enum(e) => e.value);
    generate_unwrap_fn!(unwrap_list, self, &List<ConstantValue>, ConstantValue::List(l) => l);
}

impl fmt::Display for ConstantValue {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ConstantValue::Int(value) => f.write_fmt(format_args!("{value}")),
            ConstantValue::Float(value) => f.write_fmt(format_args!("{value}",)),
            ConstantValue::String(value) => f.write_fmt(format_args!("\"{value}\"")),
            ConstantValue::Boolean(value) => f.write_fmt(format_args!("{value}")),
            ConstantValue::Null(_) => f.write_str("null"),
            ConstantValue::Enum(value) => f.write_fmt(format_args!("{value}")),
            ConstantValue::List(value) => f.write_fmt(format_args!(
                "[{}]",
                value
                    .items
                    .iter()
                    .map(|item| item.to_string())
                    .collect::<Vec<String>>()
                    .join(", ")
            )),
            ConstantValue::Object(value) => f.write_fmt(format_args!(
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

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct ConstantArgument {
    pub span: Span,
    pub name: Identifier,
    pub colon: Token,
    pub value: ConstantValue,
}

impl fmt::Display for ConstantArgument {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_fmt(format_args!("{}: {}", self.name, self.value))
    }
}

impl Named for ConstantArgument {
    type Name = StringKey;
    fn name(&self) -> StringKey {
        self.name.value
    }
}

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct IntNode {
    pub token: Token,
    pub value: i64,
}

impl fmt::Display for IntNode {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_fmt(format_args!("{}", self.value))
    }
}

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct FloatNode {
    pub token: Token,
    /// NOTE: we can't just store an f64 here because it doesn't implement Hash, Eq, Ord
    pub value: FloatValue,
    /// Preserve a value, as it was represented in the source
    /// NOTE: this is needed for pretty-printing the AST to ensure we don't change what was in the source
    pub source_value: StringKey,
}

impl fmt::Display for FloatNode {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_fmt(format_args!("{}", self.source_value))
    }
}

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct StringNode {
    pub token: Token,
    pub value: StringKey,
}

impl fmt::Display for StringNode {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_fmt(format_args!("{}", self.value))
    }
}

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct EnumNode {
    pub token: Token,
    pub value: StringKey,
}

impl fmt::Display for EnumNode {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_fmt(format_args!("{}", self.value))
    }
}

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct BooleanNode {
    pub token: Token,
    pub value: bool,
}

impl fmt::Display for BooleanNode {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_fmt(format_args!(
            "{}",
            if self.value { "true" } else { "false" }
        ))
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
