/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

mod interface;

use std::collections::HashMap;
use std::fmt;
use std::hash::Hash;
use std::slice::Iter;

use common::ArgumentName;
use common::DirectiveName;
use common::EnumName;
use common::InputObjectName;
use common::InterfaceName;
use common::Named;
use common::NamedItem;
use common::ObjectName;
use common::ScalarName;
use common::WithLocation;
use graphql_syntax::ConstantValue;
use graphql_syntax::DirectiveLocation;
pub use interface::*;
use intern::string_key::Intern;
use intern::string_key::StringKey;
use lazy_static::lazy_static;

lazy_static! {
    static ref DIRECTIVE_DEPRECATED: DirectiveName = DirectiveName("deprecated".intern());
    static ref ARGUMENT_REASON: ArgumentName = ArgumentName("reason".intern());
}

pub(crate) type TypeMap = HashMap<StringKey, Type>;

macro_rules! type_id {
    ($name:ident, $type:ident) => {
        #[derive(Copy, Clone, Eq, PartialEq, Ord, PartialOrd, Hash)]
        pub struct $name(pub $type);
        impl $name {
            pub(crate) fn as_usize(&self) -> usize {
                self.0 as usize
            }
        }

        impl fmt::Debug for $name {
            fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
                write!(f, "{}({})", stringify!($name), self.0)
            }
        }

        impl fmt::Display for $name {
            fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
                write!(f, "{}", self.0)
            }
        }
    };
}

type_id!(EnumID, u32);
type_id!(InputObjectID, u32);
type_id!(InterfaceID, u32);
type_id!(ObjectID, u32);
type_id!(ScalarID, u32);
type_id!(UnionID, u32);
type_id!(FieldID, u32);

#[derive(Copy, Clone, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub enum Type {
    Enum(EnumID),
    InputObject(InputObjectID),
    Interface(InterfaceID),
    Object(ObjectID),
    Scalar(ScalarID),
    Union(UnionID),
}

impl Type {
    pub fn is_scalar(self) -> bool {
        matches!(self, Type::Scalar(_))
    }

    pub fn is_enum(self) -> bool {
        matches!(self, Type::Enum(_))
    }

    pub fn is_input_type(self) -> bool {
        matches!(self, Type::Scalar(_) | Type::Enum(_) | Type::InputObject(_))
    }

    pub fn is_abstract_type(self) -> bool {
        matches!(self, Type::Union(_) | Type::Interface(_))
    }

    pub fn is_composite_type(self) -> bool {
        matches!(self, Type::Object(_) | Type::Interface(_) | Type::Union(_))
    }

    pub fn is_object(self) -> bool {
        matches!(self, Type::Object(_))
    }

    pub fn is_input_object(self) -> bool {
        matches!(self, Type::InputObject(_))
    }

    pub fn is_interface(self) -> bool {
        matches!(self, Type::Interface(_))
    }

    pub fn is_object_or_interface(self) -> bool {
        matches!(self, Type::Object(_) | Type::Interface(_))
    }

    pub fn is_union(self) -> bool {
        matches!(self, Type::Union(_))
    }

    pub fn get_enum_id(self) -> Option<EnumID> {
        match self {
            Type::Enum(id) => Some(id),
            _ => None,
        }
    }

    pub fn get_input_object_id(self) -> Option<InputObjectID> {
        match self {
            Type::InputObject(id) => Some(id),
            _ => None,
        }
    }

    pub fn get_interface_id(self) -> Option<InterfaceID> {
        match self {
            Type::Interface(id) => Some(id),
            _ => None,
        }
    }

    pub fn get_object_id(self) -> Option<ObjectID> {
        match self {
            Type::Object(id) => Some(id),
            _ => None,
        }
    }

    pub fn get_scalar_id(self) -> Option<ScalarID> {
        match self {
            Type::Scalar(id) => Some(id),
            _ => None,
        }
    }

    pub fn get_union_id(self) -> Option<UnionID> {
        match self {
            Type::Union(id) => Some(id),
            _ => None,
        }
    }
}

impl fmt::Debug for Type {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Type::Enum(id) => f.write_fmt(format_args!("Enum({:?})", id.0)),
            Type::InputObject(id) => f.write_fmt(format_args!("InputObject({:?})", id.0)),
            Type::Interface(id) => f.write_fmt(format_args!("Interface({:?})", id.0)),
            Type::Object(id) => f.write_fmt(format_args!("Object({:?})", id.0)),
            Type::Scalar(id) => f.write_fmt(format_args!("Scalar({:?})", id.0)),
            Type::Union(id) => f.write_fmt(format_args!("Union({:?})", id.0)),
        }
    }
}

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub enum TypeReference<T> {
    Named(T),
    NonNull(Box<TypeReference<T>>),
    List(Box<TypeReference<T>>),
}

impl<T: Copy> TypeReference<T> {
    pub fn inner(&self) -> T {
        match self {
            TypeReference::Named(type_) => *type_,
            TypeReference::List(of) => of.inner(),
            TypeReference::NonNull(of) => of.inner(),
        }
    }

    pub fn non_null(&self) -> TypeReference<T> {
        match self {
            TypeReference::Named(_) => TypeReference::NonNull(Box::new(self.clone())),
            TypeReference::List(_) => TypeReference::NonNull(Box::new(self.clone())),
            TypeReference::NonNull(_) => self.clone(),
        }
    }

    // If the type is Named or NonNull<Named> return the inner named.
    // If the type is a List or NonNull<List> returns a matching list with nullable items.
    pub fn with_nullable_item_type(&self) -> TypeReference<T> {
        match self {
            TypeReference::Named(_) => self.clone(),
            TypeReference::List(of) => TypeReference::List(Box::new(of.nullable_type().clone())),
            TypeReference::NonNull(of) => {
                let inner: &TypeReference<T> = of;
                match inner {
                    TypeReference::List(_) => {
                        TypeReference::NonNull(Box::new(of.with_nullable_item_type()))
                    }
                    TypeReference::Named(_) => inner.clone(),
                    TypeReference::NonNull(_) => {
                        unreachable!("Invalid nested TypeReference::NonNull")
                    }
                }
            }
        }
    }

    // Return None if the type is a List, otherwise return the inner type
    pub fn non_list_type(&self) -> Option<T> {
        match self {
            TypeReference::List(_) => None,
            TypeReference::Named(type_) => Some(*type_),
            TypeReference::NonNull(of) => of.non_list_type(),
        }
    }
}

impl<T> TypeReference<T> {
    pub fn map<U>(self, transform: impl FnOnce(T) -> U) -> TypeReference<U> {
        match self {
            TypeReference::Named(inner) => TypeReference::Named(transform(inner)),
            TypeReference::NonNull(inner) => TypeReference::NonNull(Box::new(inner.map(transform))),
            TypeReference::List(inner) => TypeReference::List(Box::new(inner.map(transform))),
        }
    }

    pub fn as_ref(&self) -> TypeReference<&T> {
        match self {
            TypeReference::Named(inner) => TypeReference::Named(inner),
            TypeReference::NonNull(inner) => {
                TypeReference::NonNull(Box::new(Box::as_ref(inner).as_ref()))
            }
            TypeReference::List(inner) => {
                TypeReference::List(Box::new(Box::as_ref(inner).as_ref()))
            }
        }
    }

    pub fn nullable_type(&self) -> &TypeReference<T> {
        match self {
            TypeReference::Named(_) => self,
            TypeReference::List(_) => self,
            TypeReference::NonNull(of) => of,
        }
    }

    pub fn is_non_null(&self) -> bool {
        matches!(self, TypeReference::NonNull(_))
    }

    pub fn is_list(&self) -> bool {
        matches!(self.nullable_type(), TypeReference::List(_))
    }

    pub fn list_item_type(&self) -> Option<&TypeReference<T>> {
        match self.nullable_type() {
            TypeReference::List(of) => Some(of),
            _ => None,
        }
    }
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Directive {
    pub name: DirectiveName,
    pub arguments: ArgumentDefinitions,
    pub locations: Vec<DirectiveLocation>,
    pub repeatable: bool,
    pub is_extension: bool,
    pub description: Option<StringKey>,
}

impl Named for Directive {
    type Name = DirectiveName;
    fn name(&self) -> DirectiveName {
        self.name
    }
}

#[derive(Clone, Debug)]
pub struct Scalar {
    pub name: WithLocation<ScalarName>,
    pub is_extension: bool,
    pub directives: Vec<DirectiveValue>,
    pub description: Option<StringKey>,
}

#[derive(Clone, Debug, Eq, PartialEq, Hash)]
pub struct Object {
    pub name: WithLocation<ObjectName>,
    pub is_extension: bool,
    pub fields: Vec<FieldID>,
    pub interfaces: Vec<InterfaceID>,
    pub directives: Vec<DirectiveValue>,
    pub description: Option<StringKey>,
}

#[derive(Clone, Debug, Eq, PartialEq, Hash)]
pub struct InputObject {
    pub name: WithLocation<InputObjectName>,
    pub fields: ArgumentDefinitions,
    pub directives: Vec<DirectiveValue>,
    pub description: Option<StringKey>,
}

#[derive(Clone, Debug, Eq, PartialEq, Hash)]
pub struct Enum {
    pub name: WithLocation<EnumName>,
    pub is_extension: bool,
    pub values: Vec<EnumValue>,
    pub directives: Vec<DirectiveValue>,
    pub description: Option<StringKey>,
}

#[derive(Clone, Debug, Eq, PartialEq, Hash)]
pub struct Union {
    pub name: WithLocation<StringKey>,
    pub is_extension: bool,
    pub members: Vec<ObjectID>,
    pub directives: Vec<DirectiveValue>,
    pub description: Option<StringKey>,
}

#[derive(Clone, Debug, Eq, PartialEq, Hash)]
pub struct Field {
    pub name: WithLocation<StringKey>,
    pub is_extension: bool,
    pub arguments: ArgumentDefinitions,
    pub type_: TypeReference<Type>,
    pub directives: Vec<DirectiveValue>,
    /// The type on which this field was defined. This field is (should)
    /// always be set, except for special fields such as __typename and
    /// __id, which are queryable on all types and therefore don't have
    /// a single parent type.
    pub parent_type: Option<Type>,
    pub description: Option<StringKey>,
}

pub struct Deprecation {
    pub reason: Option<StringKey>,
}

impl Field {
    pub fn deprecated(&self) -> Option<Deprecation> {
        self.directives
            .named(*DIRECTIVE_DEPRECATED)
            .map(|directive| Deprecation {
                reason: directive
                    .arguments
                    .named(*ARGUMENT_REASON)
                    .and_then(|reason| reason.value.get_string_literal()),
            })
    }
}

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct Argument {
    pub name: ArgumentName,
    pub type_: TypeReference<Type>,
    pub default_value: Option<ConstantValue>,
    pub description: Option<StringKey>,
    pub directives: Vec<DirectiveValue>,
}

impl Named for Argument {
    type Name = ArgumentName;
    fn name(&self) -> ArgumentName {
        self.name
    }
}

#[derive(Clone, Debug, Eq, PartialEq, Hash, Ord, PartialOrd)]
pub struct ArgumentValue {
    pub name: ArgumentName,
    pub value: ConstantValue,
}

impl ArgumentValue {
    /// If the value is a constant string literal, return the value, otherwise None.
    pub fn get_string_literal(&self) -> Option<StringKey> {
        if let ConstantValue::String(string_node) = &self.value {
            Some(string_node.value)
        } else {
            None
        }
    }
    /// Return the constant string literal of this value.
    /// Panics if the value is not a constant string literal.
    pub fn expect_string_literal(&self) -> StringKey {
        self.get_string_literal().unwrap_or_else(|| {
            panic!("expected a string literal, got {:?}", self);
        })
    }
}

#[derive(Clone, Debug, Eq, PartialEq, Hash, Ord, PartialOrd)]
pub struct DirectiveValue {
    pub name: DirectiveName,
    pub arguments: Vec<ArgumentValue>,
}

#[derive(Clone, Debug, Eq, PartialEq, Hash)]
pub struct EnumValue {
    pub value: StringKey,
    pub directives: Vec<DirectiveValue>,
}

#[derive(Clone, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct ArgumentDefinitions(pub(crate) Vec<Argument>);

impl ArgumentDefinitions {
    pub fn new(arguments: Vec<Argument>) -> Self {
        Self(arguments)
    }

    pub fn named(&self, name: ArgumentName) -> Option<&Argument> {
        self.0.named(name)
    }

    pub fn contains(&self, name: StringKey) -> bool {
        self.0.iter().any(|x| x.name == ArgumentName(name))
    }

    pub fn iter(&self) -> Iter<'_, Argument> {
        self.0.iter()
    }

    pub fn is_empty(&self) -> bool {
        self.0.is_empty()
    }
}

impl fmt::Debug for ArgumentDefinitions {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_fmt(format_args!("{:#?}", self.0))
    }
}

impl IntoIterator for ArgumentDefinitions {
    type Item = Argument;
    type IntoIter = std::vec::IntoIter<Self::Item>;

    fn into_iter(self) -> Self::IntoIter {
        self.0.into_iter()
    }
}

pub trait TypeWithFields {
    fn fields(&self) -> &Vec<FieldID>;
    fn interfaces(&self) -> &Vec<InterfaceID>;
}

impl TypeWithFields for Interface {
    fn fields(&self) -> &Vec<FieldID> {
        &self.fields
    }

    fn interfaces(&self) -> &Vec<InterfaceID> {
        &self.interfaces
    }
}

impl TypeWithFields for Object {
    fn fields(&self) -> &Vec<FieldID> {
        &self.fields
    }

    fn interfaces(&self) -> &Vec<InterfaceID> {
        &self.interfaces
    }
}

#[allow(unused_macros)]
macro_rules! impl_named {
    ($type_name:ident) => {
        impl Named for $type_name {
            type Name = StringKey;
            fn name(&self) -> StringKey {
                self.name
            }
        }
    };
}

macro_rules! impl_named_for_with_location {
    ($type_name:ident, $name_type:ident) => {
        impl Named for $type_name {
            type Name = $name_type;
            fn name(&self) -> $name_type {
                self.name.item
            }
        }
    };
}

impl_named_for_with_location!(Object, ObjectName);
impl_named_for_with_location!(Field, StringKey);
impl_named_for_with_location!(InputObject, InputObjectName);
impl_named_for_with_location!(Interface, InterfaceName);
impl_named_for_with_location!(Union, StringKey);
impl_named_for_with_location!(Scalar, ScalarName);
impl_named_for_with_location!(Enum, EnumName);

impl Named for DirectiveValue {
    type Name = DirectiveName;
    fn name(&self) -> DirectiveName {
        self.name
    }
}

impl Named for ArgumentValue {
    type Name = ArgumentName;
    fn name(&self) -> ArgumentName {
        self.name
    }
}
