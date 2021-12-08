/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

pub use graphql_syntax::TypeAnnotation;
use intern::string_key::StringKey;
use std::fmt;

#[derive(Eq, PartialEq, PartialOrd, Ord)]
pub enum DefinitionChange {
    EnumAdded(StringKey),
    EnumChanged {
        name: StringKey,
        added: Vec<StringKey>,
        removed: Vec<StringKey>,
    },
    EnumRemoved(StringKey),
    UnionAdded(StringKey),
    UnionChanged {
        name: StringKey,
        added: Vec<StringKey>,
        removed: Vec<StringKey>,
    },
    UnionRemoved(StringKey),
    ScalarAdded(StringKey),
    ScalarRemoved(StringKey),
    InputObjectAdded(StringKey),
    InputObjectChanged {
        name: StringKey,
        added: Vec<TypeChange>,
        removed: Vec<TypeChange>,
    },
    InputObjectRemoved(StringKey),
    InterfaceAdded(StringKey),
    InterfaceChanged {
        name: StringKey,
        added: Vec<TypeChange>,
        removed: Vec<TypeChange>,
        changed: Vec<ArgumentChange>,
    },
    InterfaceRemoved(StringKey),
    ObjectAdded(StringKey),
    ObjectChanged {
        name: StringKey,
        added: Vec<TypeChange>,
        removed: Vec<TypeChange>,
        changed: Vec<ArgumentChange>,
        interfaces_added: Vec<StringKey>,
        interfaces_removed: Vec<StringKey>,
    },
    ObjectRemoved(StringKey),
}

impl fmt::Debug for DefinitionChange {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            DefinitionChange::EnumChanged {
                added,
                removed,
                name,
            } => write!(
                f,
                "EnumChanged {:?}: added:{:?} removed:{:?}",
                name, added, removed,
            ),
            DefinitionChange::UnionChanged {
                added,
                removed,
                name,
            } => write!(
                f,
                "UnionChanged {:?}: added:{:?} removed:{:?}",
                name, added, removed,
            ),
            DefinitionChange::InputObjectChanged {
                added,
                removed,
                name,
            } => write!(
                f,
                "InputObjectChanged {:?}: added:{:?} removed:{:?}",
                name, added, removed
            ),
            DefinitionChange::InterfaceChanged {
                added,
                removed,
                name,
                ..
            } => write!(
                f,
                "InterfaceChanged {:?}: added:{:?} removed:{:?}",
                name, added, removed,
            ),
            DefinitionChange::ObjectChanged {
                name,
                added,
                removed,
                changed,
                interfaces_added,
                interfaces_removed,
            } => write!(
                f,
                "ObjectChanged {:?}: added:{:?} removed:{:?} changed: {:?}; interface: added:{:?} removed:{:?}",
                name, added, removed, changed, interfaces_added, interfaces_removed
            ),
            DefinitionChange::EnumAdded(name) => write!(f, "EnumAdded {:?}", name),
            DefinitionChange::EnumRemoved(name) => write!(f, "EnumRemoved {:?}", name),
            DefinitionChange::UnionAdded(name) => write!(f, "UnionAdded {:?}", name),
            DefinitionChange::UnionRemoved(name) => write!(f, "UnionRemoved {:?}", name),
            DefinitionChange::ScalarAdded(name) => write!(f, "ScalarAdded {:?}", name),
            DefinitionChange::ScalarRemoved(name) => write!(f, "ScalarRemoved {:?}", name),
            DefinitionChange::InputObjectAdded(name) => write!(f, "InputObjectAdded {:?}", name),
            DefinitionChange::InputObjectRemoved(name) => {
                write!(f, "InputObjectRemoved {:?}", name)
            }
            DefinitionChange::InterfaceAdded(name) => write!(f, "InterfaceAdded {:?}", name),
            DefinitionChange::InterfaceRemoved(name) => write!(f, "InterfaceRemoved {:?}", name),
            DefinitionChange::ObjectAdded(name) => write!(f, "ObjectAdded {:?}", name),
            DefinitionChange::ObjectRemoved(name) => write!(f, "ObjectRemoved {:?}", name),
        }
    }
}

#[derive(Eq, PartialEq, PartialOrd, Ord)]
pub struct ArgumentChange {
    pub name: StringKey,
    pub added: Vec<TypeChange>,
    pub removed: Vec<TypeChange>,
}

impl fmt::Debug for ArgumentChange {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "{:?}: added:{:?} removed:{:?} ",
            self.name, self.added, self.removed
        )
    }
}

#[derive(Debug, Eq, PartialEq, PartialOrd, Ord)]
pub enum Type {
    Named(StringKey),
    List(Box<Type>),
    NonNull(Box<Type>),
}

impl From<TypeAnnotation> for Type {
    fn from(type_: TypeAnnotation) -> Self {
        match type_ {
            TypeAnnotation::Named(named_type) => Type::Named(named_type.name.value),
            TypeAnnotation::List(annotation) => Type::List(Box::new(Type::from(annotation.type_))),
            TypeAnnotation::NonNull(annotation) => {
                Type::NonNull(Box::new(Type::from(annotation.type_)))
            }
        }
    }
}

#[derive(Eq, PartialEq, PartialOrd, Ord)]
pub struct TypeChange {
    pub name: StringKey,
    pub type_: Type,
}

impl fmt::Debug for TypeChange {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{:?}: {:?} ", self.name, self.type_)
    }
}

#[derive(PartialEq, PartialOrd)]
pub enum SchemaChange {
    None,
    GenericChange,
    InvalidSchema,
    DefinitionChanges(Vec<DefinitionChange>),
}

impl fmt::Debug for SchemaChange {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            SchemaChange::None => write!(f, "None"),
            SchemaChange::GenericChange => write!(f, "GenericChange"),
            SchemaChange::InvalidSchema => write!(f, "InvalidSchema"),
            SchemaChange::DefinitionChanges(changes) => write!(f, "{:?}", changes),
        }
    }
}
