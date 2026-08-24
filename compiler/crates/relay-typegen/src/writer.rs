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

use fnv::FnvHashMap;
use fnv::FnvHashSet;
use intern::Lookup;
use intern::string_key::Intern;
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

#[derive(Debug, Clone, Hash, PartialEq, Eq, PartialOrd, Ord)]
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
    /// aka. `never` in Typescript. `!` in Rust. `Never` in Swift. The bottom type.
    Empty,
    FragmentReference(SortedStringKeyList),
    FragmentReferenceType(StringKey),
    ReturnTypeOfFunctionWithName(StringKey),
    ReturnTypeOfMethodCall(Box<AST>, StringKey),
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

#[derive(Debug, Clone, Hash, PartialEq, Eq, PartialOrd, Ord)]
pub struct FunctionTypeAssertion {
    pub function_name: StringKey,
    pub arguments: Vec<KeyValuePairProp>,
    pub return_type: Box<AST>,
}

#[derive(Debug, Clone, Hash, PartialEq, Eq, PartialOrd, Ord)]
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

#[derive(Debug, Clone, Hash, PartialEq, Eq)]
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

#[derive(Debug, Clone, Hash, PartialEq, Eq)]
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

impl PartialOrd for InexactObject {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

#[derive(Debug, Clone, Hash, PartialEq, Eq, PartialOrd, Ord)]
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

#[derive(Debug, Clone, Hash, Eq, PartialEq)]
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

#[derive(Debug, Clone, Hash, PartialEq, Eq, PartialOrd, Ord)]
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

#[derive(Debug, Clone, Hash, PartialEq, Eq)]
pub struct SpreadProp {
    pub value: StringKey,
}

#[derive(Debug, Clone, Hash, PartialEq, Eq)]
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
#[derive(Debug, Clone, Copy, Hash, Eq, PartialEq)]
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

pub(crate) struct DeduplicatedType {
    pub(crate) type_: AST,
    pub(crate) aliases: Vec<(StringKey, AST)>,
}

pub(crate) struct DeduplicatedTypes {
    pub(crate) types: Vec<AST>,
    pub(crate) aliases: Vec<(StringKey, AST)>,
}

pub(crate) fn deduplicate_raw_response_types(
    raw_response_types: &[&AST],
    operation_name: StringKey,
) -> DeduplicatedTypes {
    let mut visited = FnvHashSet::default();
    let mut duplicates = FnvHashSet::default();
    raw_response_types.iter().for_each(|raw_response_type| {
        collect_composite_duplicates(raw_response_type, &mut visited, &mut duplicates)
    });

    let mut deduplicator = TypeDeduplicator {
        operation_name,
        duplicates,
        aliases_by_type: Default::default(),
        aliases: Vec::new(),
    };
    let types = raw_response_types
        .iter()
        .map(|raw_response_type| deduplicator.transform(raw_response_type))
        .collect();

    DeduplicatedTypes {
        types,
        aliases: deduplicator.aliases,
    }
}

fn collect_composite_duplicates<'a>(
    ast: &'a AST,
    visited: &mut FnvHashSet<&'a AST>,
    duplicates: &mut FnvHashSet<&'a AST>,
) {
    if is_nonempty_composite(ast) && !visited.insert(ast) {
        duplicates.insert(ast);
        return;
    }

    visit_ast_children(ast, |child| {
        collect_composite_duplicates(child, visited, duplicates)
    });
}

fn is_nonempty_composite(ast: &AST) -> bool {
    match ast {
        AST::Union(members) => members.len() > 1,
        AST::Local3DPayload(_, _) => true,
        AST::ExactObject(props) => !props.is_empty(),
        AST::InexactObject(props) => !props.is_empty(),
        _ => false,
    }
}

fn visit_ast_children<'a>(ast: &'a AST, mut visit: impl FnMut(&'a AST)) {
    match ast {
        AST::Union(members) => members.iter().for_each(&mut visit),
        AST::ReadOnlyArray(inner)
        | AST::Nullable(inner)
        | AST::NonNullable(inner)
        | AST::Callable(inner) => visit(inner),
        AST::Local3DPayload(_, selections) => visit(selections),
        AST::ExactObject(props) => props.iter().for_each(|prop| visit_prop(prop, &mut visit)),
        AST::InexactObject(props) => props.iter().for_each(|prop| visit_prop(prop, &mut visit)),
        AST::ReturnTypeOfMethodCall(object, _) => visit(object),
        AST::AssertFunctionType(assertion) => {
            assertion
                .arguments
                .iter()
                .for_each(|argument| visit(&argument.value));
            visit(&assertion.return_type);
        }
        AST::GenericType { inner, .. } => inner.iter().for_each(visit),
        AST::PropertyType { type_, .. } => visit(type_),
        AST::Identifier(_)
        | AST::RawType(_)
        | AST::String
        | AST::StringLiteral(_)
        | AST::OtherTypename
        | AST::Number
        | AST::Boolean
        | AST::Any
        | AST::Mixed
        | AST::Empty
        | AST::FragmentReference(_)
        | AST::FragmentReferenceType(_)
        | AST::ReturnTypeOfFunctionWithName(_) => {}
    }
}

fn visit_prop<'a>(prop: &'a Prop, visit: &mut impl FnMut(&'a AST)) {
    match prop {
        Prop::KeyValuePair(key_value_pair) => visit(&key_value_pair.value),
        Prop::GetterSetterPair(pair) => {
            visit(&pair.getter_return_value);
            visit(&pair.setter_parameter);
        }
        Prop::Spread(_) => {}
    }
}

struct TypeDeduplicator<'a> {
    operation_name: StringKey,
    duplicates: FnvHashSet<&'a AST>,
    aliases_by_type: FnvHashMap<&'a AST, StringKey>,
    aliases: Vec<(StringKey, AST)>,
}

impl<'a> TypeDeduplicator<'a> {
    fn transform(&mut self, ast: &'a AST) -> AST {
        if !self.duplicates.contains(ast) {
            return self.transform_children(ast);
        }
        if let Some(alias) = self.aliases_by_type.get(ast) {
            return AST::Identifier(*alias);
        }

        let value = self.transform_children(ast);
        let alias = format!(
            "{}$rawResponse$alias{}",
            self.operation_name,
            self.aliases.len()
        )
        .as_str()
        .intern();
        self.aliases_by_type.insert(ast, alias);
        self.aliases.push((alias, value));
        AST::Identifier(alias)
    }

    fn transform_children(&mut self, ast: &'a AST) -> AST {
        match ast {
            AST::Union(members) => AST::Union(SortedASTList::new(
                members
                    .iter()
                    .map(|member| self.transform(member))
                    .collect(),
            )),
            AST::ReadOnlyArray(inner) => AST::ReadOnlyArray(Box::new(self.transform(inner))),
            AST::Nullable(inner) => AST::Nullable(Box::new(self.transform(inner))),
            AST::NonNullable(inner) => AST::NonNullable(Box::new(self.transform(inner))),
            AST::Callable(inner) => AST::Callable(Box::new(self.transform(inner))),
            AST::Local3DPayload(document_name, selections) => {
                AST::Local3DPayload(*document_name, Box::new(self.transform(selections)))
            }
            AST::ExactObject(props) => AST::ExactObject(ExactObject::new(
                props.iter().map(|prop| self.transform_prop(prop)).collect(),
            )),
            AST::InexactObject(props) => AST::InexactObject(InexactObject::new(
                props.iter().map(|prop| self.transform_prop(prop)).collect(),
            )),
            AST::ReturnTypeOfMethodCall(object, method_name) => {
                AST::ReturnTypeOfMethodCall(Box::new(self.transform(object)), *method_name)
            }
            AST::AssertFunctionType(assertion) => AST::AssertFunctionType(FunctionTypeAssertion {
                function_name: assertion.function_name,
                arguments: assertion
                    .arguments
                    .iter()
                    .map(|argument| self.transform_key_value_pair(argument))
                    .collect(),
                return_type: Box::new(self.transform(&assertion.return_type)),
            }),
            AST::GenericType { outer, inner } => AST::GenericType {
                outer: *outer,
                inner: inner.iter().map(|inner| self.transform(inner)).collect(),
            },
            AST::PropertyType {
                type_,
                property_name,
            } => AST::PropertyType {
                type_: Box::new(self.transform(type_)),
                property_name: *property_name,
            },
            AST::Identifier(_)
            | AST::RawType(_)
            | AST::String
            | AST::StringLiteral(_)
            | AST::OtherTypename
            | AST::Number
            | AST::Boolean
            | AST::Any
            | AST::Mixed
            | AST::Empty
            | AST::FragmentReference(_)
            | AST::FragmentReferenceType(_)
            | AST::ReturnTypeOfFunctionWithName(_) => ast.clone(),
        }
    }

    fn transform_prop(&mut self, prop: &'a Prop) -> Prop {
        match prop {
            Prop::KeyValuePair(key_value_pair) => {
                Prop::KeyValuePair(self.transform_key_value_pair(key_value_pair))
            }
            Prop::GetterSetterPair(pair) => Prop::GetterSetterPair(GetterSetterPairProp {
                key: pair.key,
                getter_return_value: self.transform(&pair.getter_return_value),
                setter_parameter: self.transform(&pair.setter_parameter),
            }),
            Prop::Spread(spread) => Prop::Spread(spread.clone()),
        }
    }

    fn transform_key_value_pair(
        &mut self,
        key_value_pair: &'a KeyValuePairProp,
    ) -> KeyValuePairProp {
        KeyValuePairProp {
            key: key_value_pair.key,
            value: self.transform(&key_value_pair.value),
            read_only: key_value_pair.read_only,
            optional: key_value_pair.optional,
        }
    }
}

pub trait Writer: Write {
    fn into_string(self: Box<Self>) -> String;

    fn get_runtime_fragment_import(&self) -> &'static str;

    fn write(&mut self, ast: &AST) -> FmtResult;

    fn write_type_assertion(&mut self, name: &str, ast: &AST) -> FmtResult;

    fn write_type_definition(&mut self, name: &str, ast: &AST) -> FmtResult;

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

    use super::*;
    use crate::FUTURE_ENUM_VALUE;

    #[test]
    fn deduplicate_raw_response_type_hoists_repeated_composite_subtree() {
        let repeated_object = AST::ExactObject(ExactObject::new(
            (0..16)
                .map(|index| {
                    Prop::KeyValuePair(KeyValuePairProp {
                        key: format!("nested_field_{index}").as_str().intern(),
                        value: AST::String,
                        read_only: true,
                        optional: false,
                    })
                })
                .collect(),
        ));
        let repeated_type = AST::Nullable(Box::new(repeated_object.clone()));
        let raw_response_type = AST::ExactObject(ExactObject::new(
            (0..10)
                .map(|index| {
                    Prop::KeyValuePair(KeyValuePairProp {
                        key: format!("repeated_field_{index}").as_str().intern(),
                        value: repeated_type.clone(),
                        read_only: true,
                        optional: false,
                    })
                })
                .collect(),
        ));

        let deduplicated =
            deduplicate_raw_response_types(&[&raw_response_type], "TestQuery".intern());

        assert_eq!(deduplicated.aliases.len(), 1);
        assert_eq!(
            deduplicated.aliases[0],
            ("TestQuery$rawResponse$alias0".intern(), repeated_object)
        );
        assert_eq!(
            deduplicated.types[0],
            AST::ExactObject(ExactObject::new(
                (0..10)
                    .map(|index| {
                        Prop::KeyValuePair(KeyValuePairProp {
                            key: format!("repeated_field_{index}").as_str().intern(),
                            value: AST::Nullable(Box::new(AST::Identifier(
                                "TestQuery$rawResponse$alias0".intern(),
                            ))),
                            read_only: true,
                            optional: false,
                        })
                    })
                    .collect(),
            ))
        );
    }

    #[test]
    fn deduplicate_raw_response_types_hoists_subtree_shared_across_roots() {
        let repeated_object = AST::ExactObject(ExactObject::new(vec![Prop::KeyValuePair(
            KeyValuePairProp {
                key: "shared_field".intern(),
                value: AST::String,
                read_only: true,
                optional: false,
            },
        )]));
        let first_root = AST::Nullable(Box::new(repeated_object.clone()));
        let second_root = AST::ReadOnlyArray(Box::new(repeated_object.clone()));

        let deduplicated =
            deduplicate_raw_response_types(&[&first_root, &second_root], "TestQuery".intern());

        assert_eq!(
            deduplicated.aliases,
            vec![("TestQuery$rawResponse$alias0".intern(), repeated_object,)]
        );
        assert_eq!(
            deduplicated.types,
            vec![
                AST::Nullable(Box::new(AST::Identifier(
                    "TestQuery$rawResponse$alias0".intern(),
                ))),
                AST::ReadOnlyArray(Box::new(AST::Identifier(
                    "TestQuery$rawResponse$alias0".intern(),
                ))),
            ]
        );
    }

    #[test]
    fn deduplicate_raw_response_types_hoists_identical_roots() {
        let repeated_root = AST::ExactObject(ExactObject::new(vec![Prop::KeyValuePair(
            KeyValuePairProp {
                key: "shared_field".intern(),
                value: AST::String,
                read_only: true,
                optional: false,
            },
        )]));

        let deduplicated =
            deduplicate_raw_response_types(&[&repeated_root, &repeated_root], "TestQuery".intern());

        assert_eq!(
            deduplicated.aliases,
            vec![("TestQuery$rawResponse$alias0".intern(), repeated_root,)]
        );
        assert_eq!(
            deduplicated.types,
            vec![
                AST::Identifier("TestQuery$rawResponse$alias0".intern()),
                AST::Identifier("TestQuery$rawResponse$alias0".intern()),
            ]
        );
    }

    #[test]
    fn deduplicate_raw_response_types_hoists_root_repeated_in_another_root() {
        let repeated_root = AST::ExactObject(ExactObject::new(vec![Prop::KeyValuePair(
            KeyValuePairProp {
                key: "shared_field".intern(),
                value: AST::String,
                read_only: true,
                optional: false,
            },
        )]));
        let containing_root = AST::Nullable(Box::new(repeated_root.clone()));

        let deduplicated = deduplicate_raw_response_types(
            &[&repeated_root, &containing_root],
            "TestQuery".intern(),
        );

        assert_eq!(
            deduplicated.aliases,
            vec![("TestQuery$rawResponse$alias0".intern(), repeated_root,)]
        );
        assert_eq!(
            deduplicated.types,
            vec![
                AST::Identifier("TestQuery$rawResponse$alias0".intern()),
                AST::Nullable(Box::new(AST::Identifier(
                    "TestQuery$rawResponse$alias0".intern(),
                ))),
            ]
        );
    }

    /// Regression test: InexactObject::cmp previously called self.cmp(other)
    /// instead of self.0.cmp(&other.0), causing infinite recursion (stack overflow)
    /// when comparing two InexactObjects with no typename literal.
    #[test]
    fn inexact_object_cmp_no_typename_does_not_recurse() {
        let obj_a = InexactObject::new(vec![Prop::KeyValuePair(KeyValuePairProp {
            key: "a".intern(),
            optional: false,
            read_only: true,
            value: AST::String,
        })]);
        let obj_b = InexactObject::new(vec![Prop::KeyValuePair(KeyValuePairProp {
            key: "b".intern(),
            optional: false,
            read_only: true,
            value: AST::String,
        })]);
        // This would stack overflow before the fix
        assert_eq!(obj_a.cmp(&obj_b), std::cmp::Ordering::Less);
        assert_eq!(obj_a.cmp(&obj_a), std::cmp::Ordering::Equal);
    }

    /// Regression test: InexactObject::cmp with matching typename literals also
    /// previously caused infinite recursion.
    #[test]
    fn inexact_object_cmp_same_typename_does_not_recurse() {
        let obj_a = InexactObject::new(vec![
            Prop::KeyValuePair(KeyValuePairProp {
                key: *KEY_TYPENAME,
                optional: false,
                read_only: true,
                value: AST::StringLiteral(StringLiteral("User".intern())),
            }),
            Prop::KeyValuePair(KeyValuePairProp {
                key: "a".intern(),
                optional: false,
                read_only: true,
                value: AST::String,
            }),
        ]);
        let obj_b = InexactObject::new(vec![
            Prop::KeyValuePair(KeyValuePairProp {
                key: *KEY_TYPENAME,
                optional: false,
                read_only: true,
                value: AST::StringLiteral(StringLiteral("User".intern())),
            }),
            Prop::KeyValuePair(KeyValuePairProp {
                key: "b".intern(),
                optional: false,
                read_only: true,
                value: AST::String,
            }),
        ]);
        // This would stack overflow before the fix
        let _ = obj_a.cmp(&obj_b);
        assert_eq!(obj_a.cmp(&obj_a), std::cmp::Ordering::Equal);
    }

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
