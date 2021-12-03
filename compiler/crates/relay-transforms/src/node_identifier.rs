/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::{util::CustomMetadataDirectives, ModuleMetadata};
use common::WithLocation;
use graphql_ir::Field;
use graphql_ir::*;
use intern::string_key::StringKey;
use schema::SDLSchema;
use std::{
    hash::{Hash, Hasher},
    sync::Arc,
};

/// An identifier that is unique to a given selection: the alias for
/// fields, the type for inline fragments, and a summary of the condition
/// variable and passing value for conditions.
#[derive(Eq, Clone, Debug)]
pub enum NodeIdentifier {
    LinkedField(LinkedFieldIdentifier),
    ScalarField(ScalarFieldIdentifier),
    FragmentSpread(Arc<FragmentSpread>),
    InlineFragment(Arc<InlineFragment>),
    Condition(Arc<Condition>),
}

impl NodeIdentifier {
    pub fn from_selection(schema: &SDLSchema, selection: &Selection) -> Self {
        match selection {
            Selection::LinkedField(node) => NodeIdentifier::LinkedField(LinkedFieldIdentifier {
                alias_or_name: node.alias_or_name(schema),
                node: Arc::clone(node),
            }),
            Selection::ScalarField(node) => NodeIdentifier::ScalarField(ScalarFieldIdentifier {
                alias_or_name: node.alias_or_name(schema),
                node: Arc::clone(node),
            }),
            Selection::InlineFragment(node) => NodeIdentifier::InlineFragment(Arc::clone(node)),
            Selection::FragmentSpread(node) => NodeIdentifier::FragmentSpread(Arc::clone(node)),
            Selection::Condition(node) => NodeIdentifier::Condition(Arc::clone(node)),
        }
    }

    pub fn are_equal(schema: &SDLSchema, a: &Selection, b: &Selection) -> bool {
        match (a, b) {
            (Selection::FragmentSpread(a), Selection::FragmentSpread(b)) => {
                a.fragment.item == b.fragment.item && a.arguments.location_agnostic_eq(&b.arguments)
            }
            (Selection::InlineFragment(a), Selection::InlineFragment(b)) => {
                a.type_condition == b.type_condition
                    && a.directives.location_agnostic_eq(&b.directives)
            }
            (Selection::LinkedField(a), Selection::LinkedField(b)) => {
                a.alias_or_name(schema) == b.alias_or_name(schema)
                    && a.directives.location_agnostic_eq(&b.directives)
            }
            (Selection::ScalarField(a), Selection::ScalarField(b)) => {
                a.alias_or_name(schema) == b.alias_or_name(schema)
                    && a.directives.location_agnostic_eq(&b.directives)
            }
            (Selection::Condition(a), Selection::Condition(b)) => {
                a.passing_value == b.passing_value && a.value.location_agnostic_eq(&b.value)
            }

            (Selection::FragmentSpread(_), _) => false,
            (Selection::InlineFragment(_), _) => false,
            (Selection::LinkedField(_), _) => false,
            (Selection::ScalarField(_), _) => false,
            (Selection::Condition(_), _) => false,
        }
    }
}

impl PartialEq for NodeIdentifier {
    fn eq(&self, other: &Self) -> bool {
        match (self, other) {
            (NodeIdentifier::LinkedField(l), NodeIdentifier::LinkedField(r)) => l.eq(r),
            (NodeIdentifier::ScalarField(l), NodeIdentifier::ScalarField(r)) => l.eq(r),
            (NodeIdentifier::FragmentSpread(l), NodeIdentifier::FragmentSpread(r)) => {
                l.fragment.item == r.fragment.item && l.arguments.location_agnostic_eq(&r.arguments)
            }
            (NodeIdentifier::InlineFragment(l), NodeIdentifier::InlineFragment(r)) => {
                l.type_condition == r.type_condition
                    && l.directives.location_agnostic_eq(&r.directives)
            }
            (NodeIdentifier::Condition(l), NodeIdentifier::Condition(r)) => {
                l.passing_value == r.passing_value && l.value.location_agnostic_eq(&r.value)
            }
            (NodeIdentifier::LinkedField(_), _) => false,
            (NodeIdentifier::ScalarField(_), _) => false,
            (NodeIdentifier::FragmentSpread(_), _) => false,
            (NodeIdentifier::InlineFragment(_), _) => false,
            (NodeIdentifier::Condition(_), _) => false,
        }
    }
}

impl Hash for NodeIdentifier {
    fn hash<H: Hasher>(&self, state: &mut H) {
        match self {
            NodeIdentifier::LinkedField(v) => v.hash(state),
            NodeIdentifier::ScalarField(v) => v.hash(state),
            NodeIdentifier::FragmentSpread(v) => {
                v.fragment.item.hash(state);
                v.arguments.location_agnostic_hash(state);
            }
            NodeIdentifier::InlineFragment(v) => {
                v.type_condition.hash(state);
                v.directives.location_agnostic_hash(state);
            }
            NodeIdentifier::Condition(v) => {
                v.passing_value.hash(state);
                v.value.location_agnostic_hash(state);
            }
        }
    }
}

// Implement ScalarFieldIdentifier and LinkedFieldIdentifier separately for computing alias name
#[derive(Eq, Clone, Debug)]
pub struct ScalarFieldIdentifier {
    alias_or_name: StringKey,
    node: Arc<ScalarField>,
}
impl PartialEq for ScalarFieldIdentifier {
    fn eq(&self, other: &Self) -> bool {
        self.alias_or_name == other.alias_or_name
            && self
                .node
                .directives
                .location_agnostic_eq(&other.node.directives)
    }
}
impl Hash for ScalarFieldIdentifier {
    fn hash<H: Hasher>(&self, state: &mut H) {
        self.alias_or_name.hash(state);
        self.node.directives.location_agnostic_hash(state);
    }
}

#[derive(Eq, Clone, Debug)]
pub struct LinkedFieldIdentifier {
    alias_or_name: StringKey,
    node: Arc<LinkedField>,
}
impl PartialEq for LinkedFieldIdentifier {
    fn eq(&self, other: &Self) -> bool {
        self.alias_or_name == other.alias_or_name
            && self
                .node
                .directives
                .location_agnostic_eq(&other.node.directives)
    }
}
impl Hash for LinkedFieldIdentifier {
    fn hash<H: Hasher>(&self, state: &mut H) {
        self.alias_or_name.hash(state);
        self.node.directives.location_agnostic_hash(state);
    }
}

/// Below are the implmentations of LocationAgnosticPartialEq and LocationAgnosticHash
/// for `Directive` and `Argument`, so that we can check equality and hash node identities
/// ignoring the location.
pub trait LocationAgnosticPartialEq {
    fn location_agnostic_eq(&self, other: &Self) -> bool;
}

pub trait LocationAgnosticHash {
    fn location_agnostic_hash<H: Hasher>(&self, _state: &mut H);
}

impl<T: LocationAgnosticHash> LocationAgnosticHash for WithLocation<T> {
    fn location_agnostic_hash<H: (Hasher)>(&self, state: &mut H) {
        self.item.location_agnostic_hash(state);
    }
}

impl<T: LocationAgnosticPartialEq> LocationAgnosticPartialEq for WithLocation<T> {
    fn location_agnostic_eq(&self, other: &Self) -> bool {
        self.item.location_agnostic_eq(&other.item)
    }
}

impl<T: LocationAgnosticPartialEq> LocationAgnosticPartialEq for Option<&T> {
    fn location_agnostic_eq(&self, other: &Self) -> bool {
        match (self, other) {
            (Some(l), Some(r)) => l.location_agnostic_eq(r),
            (None, None) => true,
            _ => false,
        }
    }
}

impl LocationAgnosticPartialEq for StringKey {
    fn location_agnostic_eq(&self, other: &Self) -> bool {
        self == other
    }
}

impl LocationAgnosticHash for StringKey {
    fn location_agnostic_hash<H: Hasher>(&self, state: &mut H) {
        self.hash(state);
    }
}

// Limit the generic to enable a different implementation for Vec<Directive> and Vec<Argument>
pub trait DirectlyComparableIR {}
impl DirectlyComparableIR for Value {}
impl DirectlyComparableIR for ConstantArgument {}
impl DirectlyComparableIR for ConstantValue {}

impl<T: LocationAgnosticPartialEq + DirectlyComparableIR> LocationAgnosticPartialEq for Vec<T> {
    fn location_agnostic_eq(&self, other: &Self) -> bool {
        self.len() == other.len()
            && self
                .iter()
                .zip(other.iter())
                .all(|(left, right)| left.location_agnostic_eq(right))
    }
}

impl<T: LocationAgnosticHash> LocationAgnosticHash for Vec<T> {
    fn location_agnostic_hash<H: Hasher>(&self, state: &mut H) {
        for v in self {
            v.location_agnostic_hash(state);
        }
    }
}

fn filtered_location_agnostic_eq<
    T: LocationAgnosticPartialEq,
    F: Copy + for<'r> FnMut(&'r &T) -> bool,
>(
    left: &[T],
    right: &[T],
    filter: F,
) -> bool {
    let mut left = left.iter().filter(filter);
    let mut right = right.iter().filter(filter);
    loop {
        let x = match left.next() {
            None => return right.next().is_none(),
            Some(val) => val,
        };

        let y = match right.next() {
            None => return false,
            Some(val) => val,
        };

        if !x.location_agnostic_eq(y) {
            return false;
        }
    }
}

impl LocationAgnosticPartialEq for Vec<Directive> {
    fn location_agnostic_eq(&self, other: &Self) -> bool {
        filtered_location_agnostic_eq(self, other, |d| {
            !CustomMetadataDirectives::should_skip_in_node_identifier(d.name.item)
        })
    }
}

impl LocationAgnosticHash for Directive {
    fn location_agnostic_hash<H: Hasher>(&self, state: &mut H) {
        if self.name.item == ModuleMetadata::directive_name() {
            (ModuleMetadata::directive_name()).hash(state);
        } else if !CustomMetadataDirectives::should_skip_in_node_identifier(self.name.item) {
            self.name.location_agnostic_hash(state);
            self.arguments.location_agnostic_hash(state);
            self.data.hash(state);
        }
    }
}

impl LocationAgnosticPartialEq for Directive {
    fn location_agnostic_eq(&self, other: &Self) -> bool {
        if !self.name.location_agnostic_eq(&other.name) {
            return false;
        }
        if self.name.item == ModuleMetadata::directive_name() {
            return true;
        }
        self.arguments.location_agnostic_eq(&other.arguments) && self.data == other.data
    }
}

impl LocationAgnosticPartialEq for Vec<Argument> {
    fn location_agnostic_eq(&self, other: &Self) -> bool {
        filtered_location_agnostic_eq(self, other, |a| {
            !matches!(a.value.item, Value::Constant(ConstantValue::Null()))
        })
    }
}

impl LocationAgnosticHash for Argument {
    fn location_agnostic_hash<H: Hasher>(&self, state: &mut H) {
        if !matches!(self.value.item, Value::Constant(ConstantValue::Null())) {
            self.name.location_agnostic_hash(state);
            self.value.location_agnostic_hash(state);
        }
    }
}

impl LocationAgnosticPartialEq for Argument {
    fn location_agnostic_eq(&self, other: &Self) -> bool {
        self.name.location_agnostic_eq(&other.name) && self.value.location_agnostic_eq(&other.value)
    }
}

impl LocationAgnosticHash for Value {
    fn location_agnostic_hash<H: Hasher>(&self, state: &mut H) {
        match self {
            Value::Constant(v) => v.location_agnostic_hash(state),
            Value::Variable(v) => v.location_agnostic_hash(state),
            Value::List(v) => v.location_agnostic_hash(state),
            Value::Object(v) => v.location_agnostic_hash(state),
        }
    }
}

impl LocationAgnosticPartialEq for Value {
    fn location_agnostic_eq(&self, other: &Self) -> bool {
        match (self, other) {
            (Value::Constant(l), Value::Constant(r)) => l.location_agnostic_eq(r),
            (Value::Variable(l), Value::Variable(r)) => l.location_agnostic_eq(r),
            (Value::List(l), Value::List(r)) => l.location_agnostic_eq(r),
            (Value::Object(l), Value::Object(r)) => l.location_agnostic_eq(r),
            (Value::Constant(_), _) => false,
            (Value::Variable(_), _) => false,
            (Value::List(_), _) => false,
            (Value::Object(_), _) => false,
        }
    }
}

impl LocationAgnosticHash for Variable {
    fn location_agnostic_hash<H: Hasher>(&self, state: &mut H) {
        self.name.location_agnostic_hash(state);
        self.type_.hash(state);
    }
}

impl LocationAgnosticPartialEq for Variable {
    fn location_agnostic_eq(&self, other: &Self) -> bool {
        self.name.location_agnostic_eq(&other.name) && self.type_.eq(&other.type_)
    }
}

impl LocationAgnosticHash for ConstantArgument {
    fn location_agnostic_hash<H: Hasher>(&self, state: &mut H) {
        self.name.location_agnostic_hash(state);
        self.value.location_agnostic_hash(state);
    }
}

impl LocationAgnosticPartialEq for ConstantArgument {
    fn location_agnostic_eq(&self, other: &Self) -> bool {
        self.name.location_agnostic_eq(&other.name) && self.value.location_agnostic_eq(&other.value)
    }
}

impl LocationAgnosticHash for ConstantValue {
    fn location_agnostic_hash<H: Hasher>(&self, state: &mut H) {
        match self {
            ConstantValue::Int(v) => v.hash(state),
            ConstantValue::Float(v) => v.hash(state),
            ConstantValue::String(_) => self.hash(state),
            ConstantValue::Boolean(v) => v.hash(state),
            ConstantValue::Null() => self.hash(state),
            ConstantValue::Enum(_) => self.hash(state),
            ConstantValue::List(v) => v.location_agnostic_hash(state),
            ConstantValue::Object(v) => v.location_agnostic_hash(state),
        }
    }
}

impl LocationAgnosticPartialEq for ConstantValue {
    fn location_agnostic_eq(&self, other: &Self) -> bool {
        match (self, other) {
            (ConstantValue::Int(l), ConstantValue::Int(r)) => l.eq(r),
            (ConstantValue::Float(l), ConstantValue::Float(r)) => l.eq(r),
            (ConstantValue::String(l), ConstantValue::String(r)) => l.eq(r),
            (ConstantValue::Boolean(l), ConstantValue::Boolean(r)) => l.eq(r),
            (ConstantValue::Null(), ConstantValue::Null()) => true,
            (ConstantValue::Enum(l), ConstantValue::Enum(r)) => l.eq(r),
            (ConstantValue::List(l), ConstantValue::List(r)) => l.location_agnostic_eq(r),
            (ConstantValue::Object(l), ConstantValue::Object(r)) => l.location_agnostic_eq(r),
            (ConstantValue::Int(_), _) => false,
            (ConstantValue::Float(_), _) => false,
            (ConstantValue::String(_), _) => false,
            (ConstantValue::Boolean(_), _) => false,
            (ConstantValue::Null(), _) => false,
            (ConstantValue::Enum(_), _) => false,
            (ConstantValue::List(_), _) => false,
            (ConstantValue::Object(_), _) => false,
        }
    }
}

impl LocationAgnosticHash for ConditionValue {
    fn location_agnostic_hash<H: Hasher>(&self, state: &mut H) {
        match self {
            ConditionValue::Constant(constant) => constant.hash(state),
            ConditionValue::Variable(variable) => variable.name.item.hash(state),
        }
    }
}

impl LocationAgnosticPartialEq for ConditionValue {
    fn location_agnostic_eq(&self, other: &Self) -> bool {
        match (self, other) {
            (ConditionValue::Constant(left), ConditionValue::Constant(right)) => left == right,
            (ConditionValue::Variable(left), ConditionValue::Variable(right)) => {
                left.name.item.eq(&right.name.item)
            }
            (ConditionValue::Constant(_), _) => false,
            (ConditionValue::Variable(_), _) => false,
        }
    }
}
