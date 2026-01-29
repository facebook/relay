/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::collections::HashMap;
use std::collections::HashSet;
use std::fmt;
use std::fmt::Display;
use std::fmt::Formatter;
use std::hash::Hash;
use std::hash::Hasher;
use std::str::FromStr;
use std::sync::Arc;

use ::intern::BuildIdHasher;
use ::intern::Lookup;
use ::intern::impl_lookup;
use ::intern::intern;
use ::intern::string_key::Intern;
use ::intern::string_key::StringKey;
use common::ArgumentName;
use common::Diagnostic;
use common::DiagnosticsResult;
use common::DirectiveName;
use common::Location;
use common::Named;
use common::NamedItem;
use common::WithLocation;
use graphql_syntax::FloatValue;
use graphql_syntax::OperationKind;
use schema::FieldID;
use schema::SDLSchema;
use schema::Schema;
use schema::Type;
use schema::TypeReference;
use serde::Deserialize;
use serde::Serialize;

use crate::AssociatedData;
use crate::ValidationMessage;
use crate::signatures::FragmentSignature;
// Definitions

#[derive(Clone, Debug, Eq, PartialEq)]
pub enum ExecutableDefinition {
    Operation(OperationDefinition),
    Fragment(FragmentDefinition),
}

impl ExecutableDefinition {
    pub fn directives(&self) -> &[Directive] {
        match self {
            ExecutableDefinition::Operation(node) => &node.directives,
            ExecutableDefinition::Fragment(node) => &node.directives,
        }
    }

    pub fn has_directive(&self, directive_name: DirectiveName) -> bool {
        match self {
            ExecutableDefinition::Operation(node) => node
                .directives
                .iter()
                .any(|d| d.name.item == directive_name),
            ExecutableDefinition::Fragment(node) => node
                .directives
                .iter()
                .any(|d| d.name.item == directive_name),
        }
    }

    pub fn name_with_location(&self) -> WithLocation<StringKey> {
        match self {
            ExecutableDefinition::Operation(node) => node.name.map(|x| x.0),
            ExecutableDefinition::Fragment(node) => node.name.map(|x| x.0),
        }
    }
}
#[derive(
    Copy,
    Clone,
    Debug,
    Eq,
    PartialEq,
    Ord,
    PartialOrd,
    Hash,
    Serialize,
    Deserialize
)]
pub struct OperationDefinitionName(pub StringKey);

impl Display for OperationDefinitionName {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}
impl_lookup!(OperationDefinitionName);
/// A fully-typed mutation, query, or subscription definition
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct OperationDefinition {
    pub kind: OperationKind,
    pub name: WithLocation<OperationDefinitionName>,
    pub type_: Type,
    pub variable_definitions: Vec<VariableDefinition>,
    pub directives: Vec<Directive>,
    pub selections: Vec<Selection>,
}

impl Named for OperationDefinition {
    type Name = OperationDefinitionName;
    fn name(&self) -> OperationDefinitionName {
        self.name.item
    }
}

impl OperationDefinition {
    pub fn is_query(&self) -> bool {
        self.kind == OperationKind::Query
    }
    pub fn is_mutation(&self) -> bool {
        self.kind == OperationKind::Mutation
    }
    pub fn is_subscription(&self) -> bool {
        self.kind == OperationKind::Subscription
    }

    // Get the alias of this operation definition from the optional `@alias` directive.
    // If the `as` argument is not specified, the fragment name is used as the fallback.
    pub fn alias(&self) -> DiagnosticsResult<Option<WithLocation<StringKey>>> {
        if let Some(directive) = self.directives.named(DirectiveName(intern!("alias"))) {
            Ok(alias_arg_as(directive)?
                .or_else(|| Some(WithLocation::new(directive.name.location, self.name.item.0))))
        } else {
            Ok(None)
        }
    }
}

/// A newtype wrapper around StringKey to represent a FragmentDefinition's name
#[derive(
    Copy,
    Clone,
    Debug,
    Eq,
    PartialEq,
    Hash,
    Ord,
    PartialOrd,
    Serialize,
    Deserialize
)]
pub struct FragmentDefinitionName(pub StringKey);

impl fmt::Display for FragmentDefinitionName {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        self.0.fmt(f)
    }
}

impl_lookup!(FragmentDefinitionName);

pub type FragmentDefinitionNameMap<V> = HashMap<FragmentDefinitionName, V, BuildIdHasher<u32>>;
pub type FragmentDefinitionNameSet = HashSet<FragmentDefinitionName, BuildIdHasher<u32>>;

/// A fully-typed fragment definition
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct FragmentDefinition {
    pub name: WithLocation<FragmentDefinitionName>,
    /// Local variables defined in the fragment using the `@argumentDefinitions` directive.
    pub variable_definitions: Vec<VariableDefinition>,
    /// Global variables that are used but NOT defined within the fragment (they can come from a parent query or fragment).
    pub used_global_variables: Vec<VariableDefinition>,
    pub type_condition: Type,
    pub directives: Vec<Directive>,
    pub selections: Vec<Selection>,
}

impl FragmentDefinition {
    // Get the alias of this fragment definition from the optional `@alias` directive.
    // If the `as` argument is not specified, the fragment name is used as the fallback.
    pub fn alias(&self) -> DiagnosticsResult<Option<WithLocation<StringKey>>> {
        if let Some(directive) = self.directives.named(DirectiveName(intern!("alias"))) {
            Ok(alias_arg_as(directive)?
                .or_else(|| Some(WithLocation::new(directive.name.location, self.name.item.0))))
        } else {
            Ok(None)
        }
    }
}

/// An enum that can contain an operation definition name (e.g. names of queries,
/// subscriptions and mutations) or a fragment name. Note that the graphql spec
/// [defines](https://spec.graphql.org/draft/#ExecutableDefinition) executable
/// definitions as either operations or fragments.
#[derive(
    Copy,
    Clone,
    Debug,
    Eq,
    Hash,
    PartialEq,
    Ord,
    PartialOrd,
    Serialize,
    Deserialize
)]
pub enum ExecutableDefinitionName {
    OperationDefinitionName(OperationDefinitionName),
    FragmentDefinitionName(FragmentDefinitionName),
}

impl fmt::Display for ExecutableDefinitionName {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        match self {
            ExecutableDefinitionName::OperationDefinitionName(name) => name.fmt(f),
            ExecutableDefinitionName::FragmentDefinitionName(name) => name.fmt(f),
        }
    }
}

impl From<OperationDefinitionName> for ExecutableDefinitionName {
    fn from(name: OperationDefinitionName) -> Self {
        ExecutableDefinitionName::OperationDefinitionName(name)
    }
}

impl From<FragmentDefinitionName> for ExecutableDefinitionName {
    fn from(name: FragmentDefinitionName) -> Self {
        ExecutableDefinitionName::FragmentDefinitionName(name)
    }
}

impl From<ExecutableDefinitionName> for StringKey {
    fn from(executable_definition: ExecutableDefinitionName) -> Self {
        match executable_definition {
            ExecutableDefinitionName::OperationDefinitionName(name) => name.0,
            ExecutableDefinitionName::FragmentDefinitionName(name) => name.0,
        }
    }
}

impl From<OperationDefinitionName> for StringKey {
    fn from(operation_definition_name: OperationDefinitionName) -> Self {
        operation_definition_name.0
    }
}

impl From<FragmentDefinitionName> for StringKey {
    fn from(fragment_definition_name: FragmentDefinitionName) -> Self {
        fragment_definition_name.0
    }
}

impl Lookup for ExecutableDefinitionName {
    fn lookup(self) -> &'static str {
        match self {
            ExecutableDefinitionName::OperationDefinitionName(name) => name.lookup(),
            ExecutableDefinitionName::FragmentDefinitionName(name) => name.lookup(),
        }
    }
}

impl ExecutableDefinitionName {
    pub fn unwrap_fragment_definition_name(&self) -> FragmentDefinitionName {
        match self {
            ExecutableDefinitionName::OperationDefinitionName(_) => {
                panic!("Expected FragmentDefinitionName, found {self}")
            }
            ExecutableDefinitionName::FragmentDefinitionName(name) => *name,
        }
    }
}

#[derive(
    Clone,
    Copy,
    Debug,
    Eq,
    PartialEq,
    Ord,
    PartialOrd,
    Hash,
    serde::Serialize
)]
pub struct VariableName(pub StringKey);

impl Display for VariableName {
    fn fmt(&self, fmt: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(fmt, "{}", self.0)
    }
}

impl FromStr for VariableName {
    type Err = std::convert::Infallible;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Ok(VariableName(s.intern()))
    }
}

impl_lookup!(VariableName);

/// A variable definition of an operation or fragment
#[derive(Clone, Debug, Eq, PartialEq, Hash)]
pub struct VariableDefinition {
    pub name: WithLocation<VariableName>,
    pub type_: TypeReference<Type>,
    pub default_value: Option<WithLocation<ConstantValue>>,
    pub directives: Vec<Directive>,
}

impl VariableDefinition {
    pub fn has_non_null_default_value(&self) -> bool {
        match &self.default_value {
            Some(value) => value.item.is_non_null(),
            _ => false,
        }
    }
}

impl Named for VariableDefinition {
    type Name = VariableName;
    fn name(&self) -> VariableName {
        self.name.item
    }
}

// Selections

/// A selection within an operation or fragment
#[derive(Clone, Eq, PartialEq, Hash)]
pub enum Selection {
    FragmentSpread(Arc<FragmentSpread>),
    InlineFragment(Arc<InlineFragment>),
    LinkedField(Arc<LinkedField>),
    ScalarField(Arc<ScalarField>),
    Condition(Arc<Condition>),
}

impl Selection {
    /// Get selection directives
    /// This method will panic if called on the Selection::Condition
    pub fn directives(&self) -> &[Directive] {
        match self {
            Selection::FragmentSpread(node) => &node.directives,
            Selection::InlineFragment(node) => &node.directives,
            Selection::ScalarField(node) => &node.directives,
            Selection::LinkedField(node) => &node.directives,
            Selection::Condition(_) => unreachable!("Unexpected `Condition` selection."),
        }
    }

    /// Update Selection directives
    /// This method will panic if called on the Selection::Condition
    pub fn set_directives(&mut self, directives: Vec<Directive>) {
        match self {
            Selection::FragmentSpread(node) => {
                Arc::make_mut(node).directives = directives;
            }
            Selection::InlineFragment(node) => {
                Arc::make_mut(node).directives = directives;
            }
            Selection::ScalarField(node) => {
                Arc::make_mut(node).directives = directives;
            }
            Selection::LinkedField(node) => {
                Arc::make_mut(node).directives = directives;
            }
            Selection::Condition(_) => unreachable!("Unexpected `Condition` selection."),
        };
    }

    /// A quick method to get the location of the selection. This may
    /// be helpful for error reporting. Please note, this implementation
    /// prefers the location of the alias for scalar and linked field selections.
    pub fn location(&self) -> Location {
        match self {
            Selection::Condition(node) => node.location,
            Selection::FragmentSpread(node) => node.fragment.location,
            Selection::InlineFragment(node) => node.spread_location,
            Selection::LinkedField(node) => node.alias_or_name_location(),
            Selection::ScalarField(node) => node.alias_or_name_location(),
        }
    }

    /// Similar to `==`, but only checking for `Arc::ptr_eq` without
    /// doing a deeper structural equality check
    pub fn ptr_eq(&self, other: &Selection) -> bool {
        match (self, other) {
            (Selection::LinkedField(a), Selection::LinkedField(b)) => Arc::ptr_eq(a, b),
            (Selection::ScalarField(a), Selection::ScalarField(b)) => Arc::ptr_eq(a, b),
            (Selection::InlineFragment(a), Selection::InlineFragment(b)) => Arc::ptr_eq(a, b),
            (Selection::FragmentSpread(a), Selection::FragmentSpread(b)) => Arc::ptr_eq(a, b),
            (Selection::Condition(a), Selection::Condition(b)) => Arc::ptr_eq(a, b),
            (Selection::LinkedField(_), _)
            | (Selection::ScalarField(_), _)
            | (Selection::InlineFragment(_), _)
            | (Selection::FragmentSpread(_), _)
            | (Selection::Condition(_), _) => false,
        }
    }

    /// Find all fragment spreads referenced the current Selection.
    /// Result deduplicated and sorted by fragment spread name
    pub fn spreaded_fragments(&self) -> Vec<Arc<FragmentSpread>> {
        let run_for_set =
            |set: &[Selection]| set.iter().flat_map(|s| s.spreaded_fragments()).collect();

        let mut all: Vec<Arc<FragmentSpread>> = match self {
            Selection::FragmentSpread(a) => vec![Arc::clone(a)],
            Selection::InlineFragment(a) => run_for_set(&a.selections),
            Selection::LinkedField(a) => run_for_set(&a.selections),
            Selection::ScalarField(_) => vec![],
            Selection::Condition(a) => run_for_set(&a.selections),
        };

        all.sort_unstable_by_key(|fs| fs.fragment.item);
        all.dedup_by_key(|fs| fs.fragment.item);
        all
    }
}

impl fmt::Debug for Selection {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Selection::FragmentSpread(node) => f.write_fmt(format_args!("{node:#?}")),
            Selection::InlineFragment(node) => f.write_fmt(format_args!("{node:#?}")),
            Selection::LinkedField(node) => f.write_fmt(format_args!("{node:#?}")),
            Selection::ScalarField(node) => f.write_fmt(format_args!("{node:#?}")),
            Selection::Condition(node) => f.write_fmt(format_args!("{node:#?}")),
        }
    }
}

/// ... Name
#[derive(Clone, Debug, Eq, PartialEq, Hash)]
pub struct FragmentSpread {
    pub fragment: WithLocation<FragmentDefinitionName>,
    pub arguments: Vec<Argument>,
    pub signature: Option<FragmentSignature>,
    pub directives: Vec<Directive>,
}

impl FragmentSpread {
    // Get the alias of this fragment spread from the optional `@alias` directive.
    // If the `as` argument is not specified, the fragment name is used as the fallback.
    pub fn alias(&self) -> DiagnosticsResult<Option<WithLocation<StringKey>>> {
        if let Some(directive) = self.directives.named(DirectiveName(intern!("alias"))) {
            Ok(alias_arg_as(directive)?.or_else(|| {
                Some(WithLocation::new(
                    directive.name.location,
                    self.fragment.item.0,
                ))
            }))
        } else {
            Ok(None)
        }
    }
}

/// ... SelectionSet
/// ... on Type SelectionSet
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct InlineFragment {
    pub type_condition: Option<Type>,
    pub directives: Vec<Directive>,
    pub selections: Vec<Selection>,
    /// Points to "..."
    pub spread_location: Location,
}

impl Hash for InlineFragment {
    fn hash<H: Hasher>(&self, state: &mut H) {
        self.type_condition.hash(state);
        self.directives.hash(state);
        self.spread_location.hash(state);
        // Avoid descending into selections, which leads to large recursion
        self.selections.len().hash(state);
    }
}

impl InlineFragment {
    /// Get the alias of this inline fragment from the optional `@alias` directive.
    /// If the `as` argument is not present, the type condition is used as the fallback.
    /// Is is an error to omit the `as` argument if the inline fragment does not
    /// have a type condition.
    pub fn alias(&self, schema: &SDLSchema) -> DiagnosticsResult<Option<WithLocation<StringKey>>> {
        if let Some(directive) = self.directives.named(DirectiveName(intern!("alias"))) {
            if let Some(alias) = alias_arg_as(directive)? {
                Ok(Some(alias))
            } else {
                match self.type_condition {
                    Some(type_condition) => Ok(Some(WithLocation::new(
                        directive.name.location,
                        schema.get_type_name(type_condition),
                    ))),
                    None => Err(vec![Diagnostic::error(
                        ValidationMessage::FragmentAliasDirectiveMissingAs,
                        directive.location,
                    )]),
                }
            }
        } else {
            Ok(None)
        }
    }
}

pub trait Field {
    fn alias(&self) -> Option<WithLocation<StringKey>>;
    fn definition(&self) -> WithLocation<FieldID>;
    fn arguments(&self) -> &[Argument];
    fn directives(&self) -> &[Directive];
    fn alias_or_name(&self, schema: &SDLSchema) -> StringKey {
        if let Some(name) = self.alias() {
            name.item
        } else {
            schema.field(self.definition().item).name.item
        }
    }
    fn alias_or_name_location(&self) -> Location {
        if let Some(name) = self.alias() {
            name.location
        } else {
            self.definition().location
        }
    }
}

/// Name Arguments? SelectionSet
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct LinkedField {
    pub alias: Option<WithLocation<StringKey>>,
    pub definition: WithLocation<FieldID>,
    pub arguments: Vec<Argument>,
    pub directives: Vec<Directive>,
    pub selections: Vec<Selection>,
}

impl Hash for LinkedField {
    fn hash<H: Hasher>(&self, state: &mut H) {
        self.alias.hash(state);
        self.definition.hash(state);
        self.arguments.hash(state);
        self.directives.hash(state);
        // Avoid descending into selections, which leads to large recursion
        self.selections.len().hash(state);
    }
}

impl Field for LinkedField {
    fn alias(&self) -> Option<WithLocation<StringKey>> {
        self.alias
    }

    fn definition(&self) -> WithLocation<FieldID> {
        self.definition
    }

    fn arguments(&self) -> &[Argument] {
        &self.arguments
    }

    fn directives(&self) -> &[Directive] {
        &self.directives
    }
}

/// Name Arguments?
#[derive(Clone, Debug, Eq, PartialEq, Hash)]
pub struct ScalarField {
    pub alias: Option<WithLocation<StringKey>>,
    pub definition: WithLocation<FieldID>,
    pub arguments: Vec<Argument>,
    pub directives: Vec<Directive>,
}

impl Field for ScalarField {
    fn alias(&self) -> Option<WithLocation<StringKey>> {
        self.alias
    }

    fn definition(&self) -> WithLocation<FieldID> {
        self.definition
    }

    fn arguments(&self) -> &[Argument] {
        &self.arguments
    }

    fn directives(&self) -> &[Directive] {
        &self.directives
    }
}

/// <https://spec.graphql.org/June2018/#sec--skip>
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Condition {
    pub selections: Vec<Selection>,
    pub value: ConditionValue,
    pub passing_value: bool,
    pub location: Location,
}

impl Hash for Condition {
    fn hash<H: Hasher>(&self, state: &mut H) {
        self.value.hash(state);
        self.passing_value.hash(state);
        self.location.hash(state);
        // Avoid descending into selections, which leads to large recursion
        self.selections.len().hash(state);
    }
}

impl Condition {
    pub fn directive_name(&self) -> &'static str {
        if self.passing_value {
            "include"
        } else {
            "skip"
        }
    }
}

// Associated Types

/// @ Name Arguments?
#[derive(Clone, Debug, Eq, PartialEq, Hash)]
pub struct Directive {
    pub name: WithLocation<DirectiveName>,
    pub arguments: Vec<Argument>,
    /// Optional typed data that has no textual representation. This can be used
    /// to attach arbitrary data on compiler-internal directives, such as to
    /// pass instructions to code generation.
    pub data: Option<Box<dyn AssociatedData>>,
    pub location: Location,
}
impl Named for Directive {
    type Name = DirectiveName;
    fn name(&self) -> DirectiveName {
        self.name.item
    }
}

/// Name : Value
#[derive(Clone, Debug, Eq, PartialEq, Hash)]
pub struct Argument {
    pub name: WithLocation<ArgumentName>,
    pub value: WithLocation<Value>,
}
impl Named for Argument {
    type Name = ArgumentName;
    fn name(&self) -> ArgumentName {
        self.name.item
    }
}

#[derive(Clone, Debug, Eq, PartialEq, Hash)]
pub enum Value {
    Constant(ConstantValue),
    Variable(Variable),
    List(Vec<Value>),
    Object(Vec<Argument>),
}
impl Value {
    /// If the value is a constant, return the value, otherwise None.
    pub fn get_constant(&self) -> Option<&ConstantValue> {
        if let Value::Constant(val) = self {
            Some(val)
        } else {
            None
        }
    }

    /// If the value is a constant string literal, return the value, otherwise None.
    pub fn get_string_literal(&self) -> Option<StringKey> {
        if let Value::Constant(ConstantValue::String(val)) = self {
            Some(*val)
        } else {
            None
        }
    }

    /// Return the constant of this value.
    /// Panics if the value is not a constant.
    pub fn expect_constant(&self) -> &ConstantValue {
        self.get_constant().unwrap_or_else(|| {
            panic!("expected a constant, got {self:?}");
        })
    }

    /// Return the constant string literal of this value.
    /// Panics if the value is not a constant string literal.
    pub fn expect_string_literal(&self) -> StringKey {
        self.get_string_literal().unwrap_or_else(|| {
            panic!("expected a string literal, got {self:?}");
        })
    }
}

#[derive(Clone, Debug, Eq, PartialEq, Hash)]
pub struct Variable {
    pub name: WithLocation<VariableName>,
    pub type_: TypeReference<Type>,
}

/// Name : Value\[Const\]
#[derive(Clone, Debug, Eq, PartialEq, Hash)]
pub struct ConstantArgument {
    pub name: WithLocation<ArgumentName>,
    pub value: WithLocation<ConstantValue>,
}
impl Named for ConstantArgument {
    type Name = ArgumentName;
    fn name(&self) -> ArgumentName {
        self.name.item
    }
}

macro_rules! generate_unwrap_fn {
    ($fn_name:ident,$self:ident,$t:ty,$cv:pat => $result:expr) => {
        pub fn $fn_name(&$self) -> $t {
            match $self {
                $cv => $result,
                other => panic!("expected constant {} but got {:#?}", stringify!($cv), other),
            }
        }
    }
}

#[derive(Clone, Debug, Eq, PartialEq, Hash)]
pub enum ConstantValue {
    Int(i64),
    Float(FloatValue),
    String(StringKey),
    Boolean(bool),
    Null(),
    Enum(StringKey),
    List(Vec<ConstantValue>),
    Object(Vec<ConstantArgument>),
}

impl ConstantValue {
    pub fn is_null(&self) -> bool {
        matches!(self, ConstantValue::Null())
    }

    pub fn is_non_null(&self) -> bool {
        !self.is_null()
    }

    pub fn get_string_literal(&self) -> Option<StringKey> {
        match self {
            ConstantValue::String(value) => Some(*value),
            _ => None,
        }
    }

    generate_unwrap_fn!(unwrap_int, self, i64, ConstantValue::Int(i) => *i);
    generate_unwrap_fn!(unwrap_float, self, FloatValue, ConstantValue::Float(f) => *f);
    generate_unwrap_fn!(unwrap_boolean, self, bool, ConstantValue::Boolean(b) => *b);
    generate_unwrap_fn!(unwrap_string, self, StringKey, ConstantValue::String(s) => *s);
    generate_unwrap_fn!(unwrap_enum, self, StringKey, ConstantValue::Enum(e) => *e);
    generate_unwrap_fn!(unwrap_list, self, &Vec<ConstantValue>, ConstantValue::List(l) => l);
    generate_unwrap_fn!(unwrap_object, self, &Vec<ConstantArgument>, ConstantValue::Object(o) => o);
}

#[derive(Clone, Debug, Eq, PartialEq, Hash)]
pub enum ConditionValue {
    Constant(bool),
    Variable(Variable),
}

/// Extract the `as` argument from the `@alias` directive
pub fn alias_arg_as(
    alias_directive: &Directive,
) -> DiagnosticsResult<Option<WithLocation<StringKey>>> {
    match alias_directive.arguments.named(ArgumentName(intern!("as"))) {
        Some(arg) => match arg.value.item {
            Value::Constant(ConstantValue::String(alias)) => {
                if alias == intern!("") {
                    Err(vec![Diagnostic::error(
                        ValidationMessage::FragmentAliasIsEmptyString,
                        arg.value.location,
                    )])
                } else {
                    Ok(Some(WithLocation::new(arg.value.location, alias)))
                }
            }
            _ => Err(vec![Diagnostic::error(
                ValidationMessage::FragmentAliasDirectiveDynamicNameArg,
                alias_directive.location,
            )]),
        },
        None => Ok(None),
    }
}
