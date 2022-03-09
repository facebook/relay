/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use intern::string_key::StringKey;
use std::fmt::{Result as FmtResult, Write};

#[derive(Debug, Clone, Eq, PartialEq, Hash)]
pub enum AST {
    Union(Vec<AST>),
    Intersection(Vec<AST>),
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
    ExactObject(Vec<Prop>),
    InexactObject(Vec<Prop>),
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

    pub fn merge_with(&mut self, other: Self) {
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
                    a.merge_with(*b);
                } else {
                    *self = AST::Union(vec![self.clone(), other]);
                }
            }
            AST::Nullable(a) => {
                if let AST::Nullable(b) = other {
                    a.merge_with(*b);
                } else {
                    *self = AST::Union(vec![self.clone(), other]);
                }
            }
            AST::ExactObject(a) => {
                if let AST::ExactObject(b) = other {
                    for prop in b {
                        if !a.contains(&prop) {
                            a.push(prop);
                        }
                    }
                } else {
                    *self = AST::Union(vec![self.clone(), other]);
                }
            }
            AST::InexactObject(a) => {
                if let AST::InexactObject(b) = other {
                    for prop in b {
                        if !a.contains(&prop) {
                            a.push(prop);
                        }
                    }
                } else {
                    *self = AST::Union(vec![self.clone(), other]);
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
                    *self = AST::Union(vec![self.clone(), other]);
                }
            }

            // Everything else should just be a union, since we don't have a way to
            // structurally merge them.
            _ => {
                *self = AST::Union(vec![self.clone(), other]);
            }
        }
    }
}

#[derive(Debug, Clone, Eq, PartialEq, Hash)]
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

#[derive(Debug, Clone, Eq, PartialEq, Hash)]
pub struct KeyValuePairProp {
    pub key: StringKey,
    pub value: AST,
    pub read_only: bool,
    pub optional: bool,
}

#[derive(Debug, Clone, Eq, PartialEq, Hash)]
pub struct SpreadProp {
    pub value: StringKey,
}

#[derive(Debug, Clone, Eq, PartialEq, Hash)]
pub struct GetterSetterPairProp {
    pub key: StringKey,
    pub getter_return_value: AST,
    pub setter_parameter: AST,
}

pub trait Writer: Write {
    fn into_string(self: Box<Self>) -> String;

    fn supports_exact_objects(&self) -> bool {
        true
    }

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
