/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use intern::string_key::StringKey;
use std::{
    fmt::{Result as FmtResult, Write},
    ops::{Deref, DerefMut},
};

#[derive(Debug, Clone, Hash, PartialEq, Eq, PartialOrd, Ord)]
pub enum AST {
    Union(AstList),
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
    ActorChangePoint(Box<AST>),
}

impl AST {
    pub fn contains_other_typename(&self) -> bool {
        match self {
            AST::Union(members) => members
                .iter()
                .any(|member| member.contains_other_typename()),
            AST::Nullable(inner) => inner.contains_other_typename(),
            AST::OtherTypename => true,
            _ => false,
        }
    }

    pub fn merge_with(&mut self, other: Self, should_sort_typegen_items: bool) {
        if *self == other {
            return;
        }

        match self {
            AST::Union(a) => {
                if let AST::Union(mut b) = other {
                    a.append(&mut b);
                } else {
                    a.push(other);
                }
            }
            AST::ReadOnlyArray(a) => {
                if let AST::ReadOnlyArray(b) = other {
                    a.merge_with(*b, should_sort_typegen_items);
                } else {
                    *self = AST::Union(AstList::new(
                        vec![self.clone(), other],
                        should_sort_typegen_items,
                    ));
                }
            }
            AST::Nullable(a) => {
                if let AST::Nullable(b) = other {
                    a.merge_with(*b, should_sort_typegen_items);
                } else {
                    *self = AST::Union(AstList::new(
                        vec![self.clone(), other],
                        should_sort_typegen_items,
                    ));
                }
            }
            AST::ExactObject(a) => {
                if let AST::ExactObject(b) = other {
                    for prop in b.0 {
                        if !a.contains(&prop) {
                            a.push(prop);
                        }
                    }
                } else {
                    *self = AST::Union(AstList::new(
                        vec![self.clone(), other],
                        should_sort_typegen_items,
                    ));
                }
            }
            AST::InexactObject(a) => {
                if let AST::InexactObject(b) = other {
                    for prop in b.0 {
                        if !a.contains(&prop) {
                            a.push(prop);
                        }
                    }
                } else {
                    *self = AST::Union(AstList::new(
                        vec![self.clone(), other],
                        should_sort_typegen_items,
                    ));
                }
            }
            AST::FragmentReference(a) => {
                if let AST::FragmentReference(b) = other {
                    for key in b {
                        if !a.contains(&key) {
                            a.push(key);
                        }
                    }
                } else {
                    *self = AST::Union(AstList::new(
                        vec![self.clone(), other],
                        should_sort_typegen_items,
                    ));
                }
            }

            // Everything else should just be a union, since we don't have a way to
            // structurally merge them.
            _ => {
                *self = AST::Union(AstList::new(
                    vec![self.clone(), other],
                    should_sort_typegen_items,
                ));
            }
        }
    }
}

#[derive(Debug, Clone, Eq, Hash, Ord, PartialEq, PartialOrd)]
pub struct AstList(Vec<AST>);

impl Deref for AstList {
    type Target = Vec<AST>;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl DerefMut for AstList {
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.0
    }
}

impl AstList {
    pub fn new(mut members: Vec<AST>, should_sort: bool) -> Self {
        if should_sort {
            members.sort();
        }

        Self(members)
    }

    #[cfg(test)]
    pub fn sorted(members: Vec<AST>) -> Self {
        Self::new(members, true)
    }
}

#[derive(Debug, Clone, Hash, PartialEq, Eq, PartialOrd, Ord)]
pub struct ExactObject(Vec<Prop>);

impl Deref for ExactObject {
    type Target = Vec<Prop>;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl DerefMut for ExactObject {
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.0
    }
}

impl ExactObject {
    pub fn new(mut props: Vec<Prop>, should_sort_props: bool) -> Self {
        if should_sort_props {
            sort_props(&mut props);
        }
        Self(props)
    }
}

#[derive(Debug, Clone, Hash, PartialEq, Eq, PartialOrd, Ord)]
pub struct InexactObject(Vec<Prop>);

impl Deref for InexactObject {
    type Target = Vec<Prop>;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl DerefMut for InexactObject {
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.0
    }
}

impl InexactObject {
    pub fn new(mut props: Vec<Prop>, should_sort_props: bool) -> Self {
        if should_sort_props {
            sort_props(&mut props);
        }
        Self(props)
    }
}

fn sort_props(props: &mut Vec<Prop>) {
    // Put regular key-value props first, followed by getter/setter pairs,
    // followed by spreads, with $fragmentSpreads and $fragmentType props last.
    props.sort_by_cached_key(|prop| match prop {
        Prop::KeyValuePair(kvp) => (
            if kvp.key == *crate::KEY_FRAGMENT_SPREADS || kvp.key == *crate::KEY_FRAGMENT_TYPE {
                PropSortOrder::FragmentSpread
            } else {
                PropSortOrder::KeyValuePair
            },
            kvp.key,
        ),
        Prop::GetterSetterPair(pair) => (PropSortOrder::GetterSetterPair, pair.key),
        Prop::Spread(spread) => (PropSortOrder::ObjectSpread, spread.value),
    });
}

#[derive(Debug, Clone, Hash, PartialEq, Eq, PartialOrd, Ord)]
pub enum Prop {
    KeyValuePair(KeyValuePairProp),
    Spread(SpreadProp),
    GetterSetterPair(GetterSetterPairProp),
}

impl Prop {
    pub(crate) fn get_key(&self) -> Option<StringKey> {
        match self {
            Prop::KeyValuePair(kvp) => Some(kvp.key),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, Hash, PartialEq, Eq, PartialOrd, Ord)]
pub struct KeyValuePairProp {
    pub key: StringKey,
    pub value: AST,
    pub read_only: bool,
    pub optional: bool,
}

#[derive(Debug, Clone, Hash, PartialEq, Eq, PartialOrd, Ord)]
pub struct SpreadProp {
    pub value: StringKey,
}

#[derive(Debug, Clone, Hash, PartialEq, Eq, PartialOrd, Ord)]
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

#[derive(PartialEq, Eq, PartialOrd, Ord)]
enum PropSortOrder {
    KeyValuePair = 0,
    GetterSetterPair = 1,
    ObjectSpread = 2,
    FragmentSpread = 3,
}
