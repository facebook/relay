/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use intern::string_key::StringKey;
use std::{
    cmp::Ordering,
    fmt::{Result as FmtResult, Write},
    ops::Deref,
};

use crate::{KEY_FRAGMENT_SPREADS, KEY_FRAGMENT_TYPE, KEY_TYPENAME};

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord)]
pub enum AST {
    Union(Vec<AST>),
    ReadOnlyArray(Box<AST>),
    Nullable(Box<AST>),
    NonNullable(Box<AST>),
    Identifier(StringKey),
    /// Printed as is, should be valid Flow code.
    RawType(StringKey),
    String,
    StringLiteral(StringKey),
    /// Prints as `"%other" with a comment explaining open enums.
    OtherTypename,
    Local3DPayload(StringKey, Box<AST>),
    ExactObject(ExactObject),
    InexactObject(InexactObject),
    Number,
    Boolean,
    Callable(Box<AST>),
    Any,
    FragmentReference(Vec<StringKey>),
    FragmentReferenceType(StringKey),
    ReturnTypeOfFunctionWithName(StringKey),
    ReturnTypeOfMethodCall(Box<AST>, StringKey),
    ActorChangePoint(Box<AST>),
}

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord)]
pub struct ExactObject(Vec<Prop>);

impl Deref for ExactObject {
    type Target = Vec<Prop>;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl ExactObject {
    pub fn new(mut props: Vec<Prop>, should_sort_props: bool) -> Self {
        if should_sort_props {
            props.sort();
        }
        Self(props)
    }
}

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord)]
pub struct InexactObject(Vec<Prop>);

impl Deref for InexactObject {
    type Target = Vec<Prop>;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl InexactObject {
    pub fn new(mut props: Vec<Prop>, should_sort_props: bool) -> Self {
        if should_sort_props {
            props.sort();
        }
        Self(props)
    }
}

#[derive(Debug, Clone, Eq, PartialEq)]
pub enum Prop {
    KeyValuePair(KeyValuePairProp),
    Spread(SpreadProp),
    GetterSetterPair(GetterSetterPairProp),
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct KeyValuePairProp {
    pub key: StringKey,
    pub value: AST,
    pub read_only: bool,
    pub optional: bool,
}

impl Ord for Prop {
    fn cmp(&self, other: &Self) -> Ordering {
        self.get_sort_order_key().cmp(&other.get_sort_order_key())
    }
}

impl PartialOrd for Prop {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

impl Prop {
    fn get_sort_order_key(&self) -> (PropSortOrder, StringKey) {
        match self {
            Prop::KeyValuePair(kvp) => (
                if kvp.key == *KEY_TYPENAME {
                    PropSortOrder::Typename
                } else if kvp.key == *KEY_FRAGMENT_SPREADS || kvp.key == *KEY_FRAGMENT_TYPE {
                    PropSortOrder::FragmentSpread
                } else {
                    PropSortOrder::KeyValuePair
                },
                kvp.key,
            ),
            Prop::GetterSetterPair(pair) => (PropSortOrder::GetterSetterPair, pair.key),
            Prop::Spread(spread) => (PropSortOrder::ObjectSpread, spread.value),
        }
    }
}

#[derive(PartialEq, Eq, PartialOrd, Ord, Copy, Clone)]
enum PropSortOrder {
    Typename,
    KeyValuePair,
    GetterSetterPair,
    ObjectSpread,
    FragmentSpread,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SpreadProp {
    pub value: StringKey,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct GetterSetterPairProp {
    pub key: StringKey,
    pub getter_return_value: AST,
    pub setter_parameter: AST,
}

pub trait Writer: Write {
    fn into_string(self: Box<Self>) -> String;

    fn get_runtime_fragment_import(&self) -> &'static str;

    fn write(&mut self, ast: &AST) -> FmtResult;

    fn write_local_type(&mut self, name: &str, ast: &AST) -> FmtResult;

    fn write_export_type(&mut self, name: &str, ast: &AST) -> FmtResult;

    fn write_import_module_default(&mut self, name: &str, from: &str) -> FmtResult;

    fn write_import_type(&mut self, types: &[&str], from: &str) -> FmtResult;

    fn write_import_fragment_type(&mut self, types: &[&str], from: &str) -> FmtResult;

    fn write_export_fragment_type(&mut self, old_name: &str, new_name: &str) -> FmtResult;

    fn write_export_fragment_types(
        &mut self,
        fragment_type_name_1: &str,
        fragment_type_name_2: &str,
    ) -> FmtResult;

    fn write_any_type_definition(&mut self, name: &str) -> FmtResult;
}
