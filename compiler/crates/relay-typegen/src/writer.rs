/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::cmp::Ordering;
use std::fmt::Result as FmtResult;
use std::fmt::Write;
use std::ops::Deref;

use intern::Lookup;
use intern::string_key::StringKey;
use relay_config::TypegenConfig;
use relay_config::TypegenLanguage;

use crate::FUTURE_ENUM_VALUE;
use crate::KEY_FRAGMENT_SPREADS;
use crate::KEY_FRAGMENT_TYPE;
use crate::KEY_TYPENAME;
use crate::flow::FlowPrinter;
use crate::javascript::JavaScriptPrinter;
use crate::typescript::TypeScriptPrinter;

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord)]
#[allow(clippy::upper_case_acronyms)]
pub enum AST {
    Union(SortedASTList),
    ReadOnlyArray(Box<AST>),
    Nullable(Box<AST>),
    NonNullable(Box<AST>),
    Identifier(StringKey),
    /// Printed as is, should be valid Flow code.
    RawType(StringKey),
    String,
    StringLiteral(StringLiteral),
    /// Prints as `"%other" with a comment explaining open enums.
    OtherTypename,
    Local3DPayload(StringKey, Box<AST>),
    ExactObject(ExactObject),
    InexactObject(InexactObject),
    Number,
    Boolean,
    Callable(Box<AST>),
    Any,
    Mixed,
    FragmentReference(SortedStringKeyList),
    FragmentReferenceType(StringKey),
    ReturnTypeOfFunctionWithName(StringKey),
    ReturnTypeOfMethodCall(Box<AST>, StringKey),
    ActorChangePoint(Box<AST>),
    AssertFunctionType(FunctionTypeAssertion),
    GenericType {
        outer: StringKey,
        inner: Vec<AST>,
    },
    PropertyType {
        type_: Box<AST>,
        property_name: StringKey,
    },
}

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord)]
pub struct FunctionTypeAssertion {
    pub function_name: StringKey,
    pub arguments: Vec<KeyValuePairProp>,
    pub return_type: Box<AST>,
}

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord)]
pub struct SortedASTList(Vec<AST>);

impl Deref for SortedASTList {
    type Target = Vec<AST>;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl SortedASTList {
    pub fn new(mut members: Vec<AST>) -> Self {
        members.sort();
        Self(members)
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ExactObject(Vec<Prop>);

impl Deref for ExactObject {
    type Target = Vec<Prop>;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl ExactObject {
    pub fn new(mut props: Vec<Prop>) -> Self {
        props.sort();
        Self(props)
    }

    /// Return the object's literal typename, if it is found. Typenames cannot be
    /// modified at runtime, so they will never be stored in getter/setters.
    pub fn typename_literal(&self) -> Option<StringLiteral> {
        self.0.iter().find_map(|p| match p {
            Prop::KeyValuePair(kvp) => {
                if kvp.key == *KEY_TYPENAME {
                    match kvp.value {
                        AST::StringLiteral(s) => Some(s),
                        _ => None,
                    }
                } else {
                    None
                }
            }
            _ => None,
        })
    }
}

impl From<ExactObject> for AST {
    fn from(other: ExactObject) -> AST {
        AST::ExactObject(other)
    }
}

impl PartialOrd for ExactObject {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

/// Sort as follows:
/// - An object containing a typename field that is a string literal comes
///   before an object without a typename field that is a string literal
/// - If both objects contain string literal typenames, compare those first
///   and only compare objects if the items are tied
/// - If neither object contains a string literal typename, default to the
///   default order for the inner object
impl Ord for ExactObject {
    fn cmp(&self, other: &Self) -> Ordering {
        match (self.typename_literal(), other.typename_literal()) {
            (None, None) => self.0.cmp(&other.0),
            (None, Some(_)) => Ordering::Greater,
            (Some(_), None) => Ordering::Less,
            (Some(s1), Some(s2)) => match s1.cmp(&s2) {
                Ordering::Less => Ordering::Less,
                Ordering::Equal => self.0.cmp(&other.0),
                Ordering::Greater => Ordering::Greater,
            },
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct InexactObject(Vec<Prop>);

impl Deref for InexactObject {
    type Target = Vec<Prop>;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl InexactObject {
    pub fn new(mut props: Vec<Prop>) -> Self {
        props.sort();
        Self(props)
    }

    /// Return the object's literal typename, if it is found. Typenames cannot be
    /// modified at runtime, so they will never be stored in getter/setters.
    pub fn typename_literal(&self) -> Option<StringLiteral> {
        self.0.iter().find_map(|p| match p {
            Prop::KeyValuePair(kvp) => {
                if kvp.key == *KEY_TYPENAME {
                    match kvp.value {
                        AST::StringLiteral(s) => Some(s),
                        _ => None,
                    }
                } else {
                    None
                }
            }
            _ => None,
        })
    }
}

/// Sort as follows:
/// - An object containing a typename field that is a string literal comes
///   before an object without a typename field that is a string literal
/// - If both objects contain string literal typenames, compare those first
///   and only compare objects if the items are tied
/// - If neither object contains a string literal typename, default to the
///   default order.
impl Ord for InexactObject {
    fn cmp(&self, other: &Self) -> Ordering {
        match (self.typename_literal(), other.typename_literal()) {
            (None, None) => self.cmp(other),
            (None, Some(_)) => Ordering::Greater,
            (Some(_), None) => Ordering::Less,
            (Some(s1), Some(s2)) => match s1.cmp(&s2) {
                Ordering::Less => Ordering::Less,
                Ordering::Equal => self.cmp(other),
                Ordering::Greater => Ordering::Greater,
            },
        }
    }
}

impl PartialOrd for InexactObject {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord)]
pub struct SortedStringKeyList(Vec<StringKey>);

impl Deref for SortedStringKeyList {
    type Target = Vec<StringKey>;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl SortedStringKeyList {
    pub fn new(mut props: Vec<StringKey>) -> Self {
        // We can sort unstably, because we don't care that StringKey's are re-ordered.
        // Unlike sorting stably, sorting unstably doesn't allocated extra memory.
        props.sort_unstable();
        Self(props)
    }
}

#[derive(Debug, Clone, Eq, PartialEq)]
pub enum Prop {
    KeyValuePair(KeyValuePairProp),
    Spread(SpreadProp),
    GetterSetterPair(GetterSetterPairProp),
}

impl From<KeyValuePairProp> for Prop {
    fn from(other: KeyValuePairProp) -> Self {
        Prop::KeyValuePair(other)
    }
}

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord)]
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

/// A newtype wrapper around StringKey that sorts StringKey's in
/// the following fashion:
/// - '%future added value' goes last
/// - Otherwise, alphabetically according to the string value
///
/// StringKey, by default, will sort alphabetically.
///
/// This exception is to preserve the "natural" order of enums, which
/// are Union's containing StringLiteral's, i.e. we want
/// "%future added value" to follow the variants.
#[derive(Debug, Clone, Copy, Eq, PartialEq)]
pub struct StringLiteral(pub StringKey);

impl Deref for StringLiteral {
    type Target = StringKey;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl Ord for StringLiteral {
    fn cmp(&self, other: &Self) -> Ordering {
        match (self.0 == *FUTURE_ENUM_VALUE, other.0 == *FUTURE_ENUM_VALUE) {
            (true, true) => Ordering::Equal,
            (true, false) => Ordering::Greater,
            (false, true) => Ordering::Less,
            (false, false) => self.lookup().cmp(other.lookup()),
        }
    }
}

impl PartialOrd for StringLiteral {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

pub trait Writer: Write {
    fn into_string(self: Box<Self>) -> String;

    fn get_runtime_fragment_import(&self) -> &'static str;

    fn write(&mut self, ast: &AST) -> FmtResult;

    fn write_type_assertion(&mut self, name: &str, ast: &AST) -> FmtResult;

    fn write_export_type(&mut self, name: &str, ast: &AST) -> FmtResult;

    fn write_import_module_default(&mut self, name: &str, from: &str) -> FmtResult;

    fn write_import_module_named(
        &mut self,
        name: &str,
        import_as: Option<&str>,
        from: &str,
    ) -> FmtResult;

    fn write_import_type(&mut self, types: &[&str], from: &str) -> FmtResult;

    fn write_import_fragment_type(&mut self, types: &[&str], from: &str) -> FmtResult;

    fn write_export_fragment_type(&mut self, name: &str) -> FmtResult;

    #[allow(dead_code)]
    fn write_export_fragment_types(
        &mut self,
        fragment_type_name_1: &str,
        fragment_type_name_2: &str,
    ) -> FmtResult;

    fn write_any_type_definition(&mut self, name: &str) -> FmtResult;
}

pub(crate) fn new_writer_from_config(config: &TypegenConfig) -> Box<dyn Writer> {
    match config.language {
        TypegenLanguage::JavaScript => Box::<JavaScriptPrinter>::default(),
        TypegenLanguage::Flow => Box::new(FlowPrinter::new()),
        TypegenLanguage::TypeScript => Box::new(TypeScriptPrinter::new(config)),
    }
}

#[cfg(test)]
mod tests {
    use graphql_ir::reexport::Intern;
    use intern::Lookup;

    use super::StringLiteral;
    use crate::FUTURE_ENUM_VALUE;

    #[test]
    fn ast_string_key_sort() {
        let mut keys = vec![
            StringLiteral(*FUTURE_ENUM_VALUE),
            StringLiteral("B".intern()),
            StringLiteral("A".intern()),
        ];
        keys.sort();
        assert_eq!(
            keys,
            vec![
                StringLiteral("A".intern()),
                StringLiteral("B".intern()),
                StringLiteral(*FUTURE_ENUM_VALUE),
            ]
        )
    }

    #[test]
    fn ast_string_key_sort_duplicated_intern() {
        let future_enum_value = FUTURE_ENUM_VALUE.lookup().intern();
        let mut keys = vec![
            StringLiteral("B".intern()),
            StringLiteral(future_enum_value),
            StringLiteral("A".intern()),
        ];
        keys.sort();
        assert_eq!(
            keys,
            vec![
                StringLiteral("A".intern()),
                StringLiteral("B".intern()),
                StringLiteral(*FUTURE_ENUM_VALUE),
            ]
        )
    }
}
