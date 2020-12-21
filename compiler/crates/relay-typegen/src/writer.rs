/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use interner::{Intern, StringKey};
use lazy_static::lazy_static;
use std::fmt::{Result, Write};

#[derive(Debug, Clone)]
pub enum AST {
    Union(Vec<AST>),
    ReadOnlyArray(Box<AST>),
    Nullable(Box<AST>),
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
    Any,
    DefineType(StringKey, Box<AST>),
    FragmentReference(Vec<StringKey>),
    ImportType(Vec<StringKey>, StringKey),
    ImportFragmentType(Vec<StringKey>, StringKey),
    DeclareExportFragment(StringKey, Option<StringKey>),
    ExportFragmentList(Vec<StringKey>),
    ExportTypeEquals(StringKey, Box<AST>),
}

#[derive(Debug, Clone)]
pub struct Prop {
    pub key: StringKey,
    pub value: AST,
    pub read_only: bool,
    pub optional: bool,
}

lazy_static! {
    /// Special key for `Prop` that turns into an object spread: ...value
    pub static ref SPREAD_KEY: StringKey = "\0SPREAD".intern();
}

pub trait Writer {
    fn get_runtime_fragment_import(&self) -> StringKey {
        "FragmentReference".intern()
    }

    fn write(&mut self, writer: &mut dyn Write, ast: &AST) -> Result;
}
