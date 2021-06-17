/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use interner::{Intern, StringKey};
use lazy_static::lazy_static;
use std::fmt::Result;

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
    FragmentReference(Vec<StringKey>),
    FragmentReferenceType(StringKey),
    FunctionReturnType(StringKey),
    ActorChangePoint(Box<AST>),
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
    fn into_string(self: Box<Self>) -> String;

    fn get_runtime_fragment_import(&self) -> StringKey;

    fn write(&mut self, ast: &AST) -> Result;

    fn write_export_type(&mut self, name: StringKey, ast: &AST) -> Result;

    fn write_import_module_default(&mut self, name: StringKey, from: StringKey) -> Result;

    fn write_import_type(&mut self, types: &[StringKey], from: StringKey) -> Result;

    fn write_import_fragment_type(&mut self, types: &[StringKey], from: StringKey) -> Result;

    fn write_export_fragment_type(&mut self, old_name: StringKey, new_name: StringKey) -> Result;

    fn write_export_fragment_types(
        &mut self,
        old_fragment_type_name: StringKey,
        new_fragment_type_name: StringKey,
    ) -> Result;

    fn write_any_type_definition(&mut self, name: StringKey) -> Result;
}
