/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use fnv::{FnvBuildHasher, FnvHashMap};
use graphql_syntax::FloatValue;
use graphql_syntax::OperationKind;
use indexmap::IndexSet;
use intern::string_key::StringKey;

#[derive(Eq, PartialEq, Hash, Debug)]
pub struct ObjectEntry {
    pub key: StringKey,
    pub value: Primitive,
}

/// An interned codegen AST
#[derive(Eq, PartialEq, Hash, Debug)]
pub enum Ast {
    Object(Vec<ObjectEntry>),
    Array(Vec<Primitive>),
}

impl Ast {
    pub fn assert_object(&self) -> &[ObjectEntry] {
        match self {
            Ast::Object(result) => result,
            Ast::Array(_) => panic!("Expected an object"),
        }
    }

    pub fn assert_array(&self) -> &[Primitive] {
        match self {
            Ast::Object(_) => panic!("Expected an array"),
            Ast::Array(result) => result,
        }
    }
}

#[derive(Eq, PartialEq, Hash, Debug)]
pub enum Primitive {
    Key(AstKey),
    String(StringKey),
    Float(FloatValue),
    Int(i64),
    Bool(bool),
    Null,
    StorageKey(StringKey, AstKey),
    RawString(String),
    GraphQLModuleDependency(StringKey),
    JSModuleDependency(StringKey),
}

impl Primitive {
    pub fn assert_string(&self) -> StringKey {
        if let Primitive::String(key) = self {
            *key
        } else {
            panic!("Expected a string");
        }
    }

    pub fn assert_key(&self) -> AstKey {
        if let Primitive::Key(key) = self {
            *key
        } else {
            panic!("Expected a key");
        }
    }

    pub fn string_or_null(str: Option<StringKey>) -> Primitive {
        match str {
            None => Primitive::Null,
            Some(str) => Primitive::String(str),
        }
    }
}

#[derive(Eq, PartialEq, Hash, Copy, Clone, Debug)]
pub struct AstKey(usize);

impl AstKey {
    pub fn as_usize(self) -> usize {
        self.0
    }
}

#[derive(Default)]
pub struct AstBuilder {
    table: IndexSet<Ast, FnvBuildHasher>,
}

impl AstBuilder {
    pub fn intern(&mut self, ast: Ast) -> AstKey {
        AstKey(self.table.insert_full(ast).0)
    }

    pub fn lookup(&self, key: AstKey) -> &Ast {
        self.table.get_index(key.as_usize()).unwrap()
    }
}

pub enum QueryID {
    Persisted { id: String, text_hash: String },
    External(StringKey),
}

pub struct RequestParameters<'a> {
    pub id: &'a Option<QueryID>,
    pub metadata: FnvHashMap<String, String>,
    pub name: StringKey,
    pub operation_kind: OperationKind,
    pub text: Option<String>,
}
