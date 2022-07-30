/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::Location;
use common::Named;
use common::WithLocation;
use graphql_syntax::FloatValue;
use graphql_syntax::OperationKind;
use intern::string_key::StringKey;
use schema::FieldID;
use schema::SDLSchema;
use schema::Schema;
use schema::Type;
use schema::TypeReference;
use std::fmt;
use std::hash::Hash;
use std::sync::Arc;

use crate::AssociatedData;
// Definitions

#[derive(Clone, Debug, Eq, PartialEq)]
pub enum ExecutableDefinition {
    Operation(OperationDefinition),
    Fragment(FragmentDefinition),
}

impl ExecutableDefinition {
    pub fn has_directive(&self, directive_name: StringKey) -> bool {
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
            ExecutableDefinition::Operation(node) => node.name,
            ExecutableDefinition::Fragment(node) => node.name,
        }
    }
}

/// A fully-typed mutation, query, or subscription definition
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct OperationDefinition {
    pub kind: OperationKind,
    pub name: WithLocation<StringKey>,
    pub type_: Type,
    pub variable_definitions: Vec<VariableDefinition>,
    pub directives: Vec<Directive>,
    pub selections: Vec<Selection>,
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
}

/// A fully-typed fragment definition
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct FragmentDefinition {
    pub name: WithLocation<StringKey>,
    pub variable_definitions: Vec<VariableDefinition>,
    pub used_global_variables: Vec<VariableDefinition>,
    pub type_condition: Type,
    pub directives: Vec<Directive>,
    pub selections: Vec<Selection>,
}

/// A variable definition of an operation or fragment
#[derive(Clone, Debug, Eq, PartialEq, Hash)]
pub struct VariableDefinition {
    pub name: WithLocation<StringKey>,
    pub type_: TypeReference,
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
    fn name(&self) -> StringKey {
        self.name.item
    }
}

// Selections

/// A selection within an operation or fragment
#[derive(Clone, Eq, PartialEq)]
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
            Selection::FragmentSpread(node) => f.write_fmt(format_args!("{:#?}", node)),
            Selection::InlineFragment(node) => f.write_fmt(format_args!("{:#?}", node)),
            Selection::LinkedField(node) => f.write_fmt(format_args!("{:#?}", node)),
            Selection::ScalarField(node) => f.write_fmt(format_args!("{:#?}", node)),
            Selection::Condition(node) => f.write_fmt(format_args!("{:#?}", node)),
        }
    }
}

/// ... Name
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct FragmentSpread {
    pub fragment: WithLocation<StringKey>,
    pub arguments: Vec<Argument>,
    pub directives: Vec<Directive>,
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
#[derive(Clone, Debug, Eq, PartialEq)]
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

/// https://spec.graphql.org/June2018/#sec--skip
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Condition {
    pub selections: Vec<Selection>,
    pub value: ConditionValue,
    pub passing_value: bool,
    pub location: Location,
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
    pub name: WithLocation<StringKey>,
    pub arguments: Vec<Argument>,
    /// Optional typed data that has no textual representation. This can be used
    /// to attach arbitrary data on compiler-internal directives, such as to
    /// pass instructions to code generation.
    pub data: Option<Box<dyn AssociatedData>>,
}
impl Named for Directive {
    fn name(&self) -> StringKey {
        self.name.item
    }
}

/// Name : Value
#[derive(Clone, Debug, Eq, PartialEq, Hash)]
pub struct Argument {
    pub name: WithLocation<StringKey>,
    pub value: WithLocation<Value>,
}
impl Named for Argument {
    fn name(&self) -> StringKey {
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
            panic!("expected a constant, got {:?}", self);
        })
    }

    /// Return the constant string literal of this value.
    /// Panics if the value is not a constant string literal.
    pub fn expect_string_literal(&self) -> StringKey {
        self.get_string_literal().unwrap_or_else(|| {
            panic!("expected a string literal, got {:?}", self);
        })
    }
}

#[derive(Clone, Debug, Eq, PartialEq, Hash)]
pub struct Variable {
    pub name: WithLocation<StringKey>,
    pub type_: TypeReference,
}

/// Name : Value[Const]
#[derive(Clone, Debug, Eq, PartialEq, Hash)]
pub struct ConstantArgument {
    pub name: WithLocation<StringKey>,
    pub value: WithLocation<ConstantValue>,
}
impl Named for ConstantArgument {
    fn name(&self) -> StringKey {
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

#[derive(Clone, Debug, Eq, PartialEq)]
pub enum ConditionValue {
    Constant(bool),
    Variable(Variable),
}
