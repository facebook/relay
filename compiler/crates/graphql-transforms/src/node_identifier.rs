/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::WithLocation;
use graphql_ir::*;
use interner::StringKey;
use schema::Schema;
use std::hash::{Hash, Hasher};
use std::sync::Arc;

/**
 * An identifier that is unique to a given selection: the alias for
 * fields, the type for inline fragments, and a summary of the condition
 * variable and passing value for conditions.
 */
#[derive(Eq, Clone, Debug)]
pub enum NodeIdentifier {
    LinkedField(LinkedFieldIdentifier),
    ScalarField(ScalarFieldIdentifier),
    FragmentSpread(Arc<FragmentSpread>),
    InlineFragment(Arc<InlineFragment>),
    Condition(Arc<Condition>),
}

impl NodeIdentifier {
    pub fn from_selection(schema: &Schema, selection: &Selection) -> Self {
        match selection {
            Selection::LinkedField(node) => NodeIdentifier::LinkedField(LinkedFieldIdentifier(
                Arc::clone(&node),
                node.alias_or_name(schema),
            )),
            Selection::ScalarField(node) => NodeIdentifier::ScalarField(ScalarFieldIdentifier(
                Arc::clone(&node),
                node.alias_or_name(schema),
            )),
            Selection::InlineFragment(node) => NodeIdentifier::InlineFragment(Arc::clone(node)),
            Selection::FragmentSpread(node) => NodeIdentifier::FragmentSpread(Arc::clone(node)),
            Selection::Condition(node) => NodeIdentifier::Condition(Arc::clone(node)),
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
pub struct ScalarFieldIdentifier(Arc<ScalarField>, StringKey);
impl PartialEq for ScalarFieldIdentifier {
    fn eq(&self, other: &Self) -> bool {
        self.1 == other.1 && self.0.directives.location_agnostic_eq(&other.0.directives)
    }
}
impl Hash for ScalarFieldIdentifier {
    fn hash<H: Hasher>(&self, state: &mut H) {
        self.1.hash(state);
        self.0.directives.location_agnostic_hash(state);
    }
}

#[derive(Eq, Clone, Debug)]
pub struct LinkedFieldIdentifier(Arc<LinkedField>, StringKey);
impl PartialEq for LinkedFieldIdentifier {
    fn eq(&self, other: &Self) -> bool {
        self.1 == other.1 && self.0.directives.location_agnostic_eq(&other.0.directives)
    }
}
impl Hash for LinkedFieldIdentifier {
    fn hash<H: Hasher>(&self, state: &mut H) {
        self.1.hash(state);
        self.0.directives.location_agnostic_hash(state);
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

impl<T: LocationAgnosticPartialEq> LocationAgnosticPartialEq for Vec<T> {
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

impl LocationAgnosticHash for Directive {
    fn location_agnostic_hash<H: Hasher>(&self, state: &mut H) {
        self.name.location_agnostic_hash(state);
        self.arguments.location_agnostic_hash(state);
    }
}

impl LocationAgnosticPartialEq for Directive {
    fn location_agnostic_eq(&self, other: &Self) -> bool {
        self.name.location_agnostic_eq(&other.name)
            && self.arguments.location_agnostic_eq(&other.arguments)
    }
}

impl LocationAgnosticHash for Argument {
    fn location_agnostic_hash<H: Hasher>(&self, state: &mut H) {
        self.name.location_agnostic_hash(state);
        self.value.location_agnostic_hash(state);
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
            ConditionValue::Variable(variable) => variable.location_agnostic_hash(state),
        }
    }
}

impl LocationAgnosticPartialEq for ConditionValue {
    fn location_agnostic_eq(&self, other: &Self) -> bool {
        match (self, other) {
            (ConditionValue::Constant(left), ConditionValue::Constant(right)) => left == right,
            (ConditionValue::Variable(left), ConditionValue::Variable(right)) => {
                left.location_agnostic_eq(right)
            }
            (ConditionValue::Constant(_), _) => false,
            (ConditionValue::Variable(_), _) => false,
        }
    }
}
