/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::fmt;
use std::hash::Hash;
use std::hash::Hasher;
use std::marker::PhantomData;
use std::sync::Arc;

use common::ArgumentName;
use common::DirectiveName;
use common::WithLocation;
use graphql_syntax::OperationKind;
use intern::string_key::StringKey;
use schema::FieldID;
use schema::SDLSchema;
use schema::Type;
use schema::TypeReference;

use crate::*;

#[derive(Clone, Debug)]
enum NodeIdentifierInner<TBehavior: LocationAgnosticBehavior> {
    LinkedField(LinkedFieldIdentifier<TBehavior>),
    ScalarField(ScalarFieldIdentifier<TBehavior>),
    FragmentSpread(Arc<FragmentSpread>),
    InlineFragment(Arc<InlineFragment>),
    Condition(Arc<Condition>),
}

/// An identifier that is unique to a given selection: the alias for
/// fields, the type for inline fragments, and a summary of the condition
/// variable and passing value for conditions.
#[derive(Clone)]
pub struct NodeIdentifier<TBehavior: LocationAgnosticBehavior> {
    inner: NodeIdentifierInner<TBehavior>,
    _behavior: PhantomData<TBehavior>,
}

impl<TBehavior: LocationAgnosticBehavior> NodeIdentifier<TBehavior> {
    pub fn from_selection(schema: &SDLSchema, selection: &Selection, _: TBehavior) -> Self {
        let inner = match selection {
            Selection::LinkedField(node) => {
                NodeIdentifierInner::LinkedField(LinkedFieldIdentifier {
                    alias_or_name: node.alias_or_name(schema),
                    node: Arc::clone(node),
                    _behavior: PhantomData::<TBehavior>,
                })
            }
            Selection::ScalarField(node) => {
                NodeIdentifierInner::ScalarField(ScalarFieldIdentifier {
                    alias_or_name: node.alias_or_name(schema),
                    node: Arc::clone(node),
                    _behavior: PhantomData::<TBehavior>,
                })
            }
            Selection::InlineFragment(node) => {
                NodeIdentifierInner::InlineFragment(Arc::clone(node))
            }
            Selection::FragmentSpread(node) => {
                NodeIdentifierInner::FragmentSpread(Arc::clone(node))
            }
            Selection::Condition(node) => NodeIdentifierInner::Condition(Arc::clone(node)),
        };

        Self {
            inner,
            _behavior: PhantomData::<TBehavior>,
        }
    }

    pub fn are_equal(schema: &SDLSchema, a: &Selection, b: &Selection) -> bool {
        match (a, b) {
            (Selection::FragmentSpread(a), Selection::FragmentSpread(b)) => {
                a.fragment
                    .item
                    .location_agnostic_eq::<TBehavior>(&b.fragment.item)
                    && a.arguments.location_agnostic_eq::<TBehavior>(&b.arguments)
                    && a.directives
                        .location_agnostic_eq::<TBehavior>(&b.directives)
            }
            (Selection::InlineFragment(a), Selection::InlineFragment(b)) => {
                a.type_condition
                    .location_agnostic_eq::<TBehavior>(&b.type_condition)
                    && a.directives
                        .location_agnostic_eq::<TBehavior>(&b.directives)
            }
            (Selection::LinkedField(a), Selection::LinkedField(b)) => {
                a.alias_or_name(schema)
                    .location_agnostic_eq::<TBehavior>(&b.alias_or_name(schema))
                    && a.directives
                        .location_agnostic_eq::<TBehavior>(&b.directives)
            }
            (Selection::ScalarField(a), Selection::ScalarField(b)) => {
                a.alias_or_name(schema)
                    .location_agnostic_eq::<TBehavior>(&b.alias_or_name(schema))
                    && a.directives
                        .location_agnostic_eq::<TBehavior>(&b.directives)
            }
            (Selection::Condition(a), Selection::Condition(b)) => {
                a.passing_value
                    .location_agnostic_eq::<TBehavior>(&b.passing_value)
                    && a.value.location_agnostic_eq::<TBehavior>(&b.value)
            }

            (Selection::FragmentSpread(_), _) => false,
            (Selection::InlineFragment(_), _) => false,
            (Selection::LinkedField(_), _) => false,
            (Selection::ScalarField(_), _) => false,
            (Selection::Condition(_), _) => false,
        }
    }
}

impl<TBehavior: LocationAgnosticBehavior> PartialEq for NodeIdentifier<TBehavior> {
    fn eq(&self, other: &Self) -> bool {
        match (&self.inner, &other.inner) {
            (NodeIdentifierInner::LinkedField(l), NodeIdentifierInner::LinkedField(r)) => l.eq(r),
            (NodeIdentifierInner::ScalarField(l), NodeIdentifierInner::ScalarField(r)) => l.eq(r),
            (NodeIdentifierInner::FragmentSpread(l), NodeIdentifierInner::FragmentSpread(r)) => {
                l.fragment
                    .item
                    .location_agnostic_eq::<TBehavior>(&r.fragment.item)
                    && l.arguments.location_agnostic_eq::<TBehavior>(&r.arguments)
                    && l.directives
                        .location_agnostic_eq::<TBehavior>(&r.directives)
            }
            (NodeIdentifierInner::InlineFragment(l), NodeIdentifierInner::InlineFragment(r)) => {
                l.type_condition
                    .location_agnostic_eq::<TBehavior>(&r.type_condition)
                    && l.directives
                        .location_agnostic_eq::<TBehavior>(&r.directives)
            }
            (NodeIdentifierInner::Condition(l), NodeIdentifierInner::Condition(r)) => {
                l.passing_value
                    .location_agnostic_eq::<TBehavior>(&r.passing_value)
                    && l.value.location_agnostic_eq::<TBehavior>(&r.value)
            }
            (NodeIdentifierInner::LinkedField(_), _) => false,
            (NodeIdentifierInner::ScalarField(_), _) => false,
            (NodeIdentifierInner::FragmentSpread(_), _) => false,
            (NodeIdentifierInner::InlineFragment(_), _) => false,
            (NodeIdentifierInner::Condition(_), _) => false,
        }
    }
}

impl<TBehavior: LocationAgnosticBehavior> Eq for NodeIdentifier<TBehavior> {}

impl<TBehavior: LocationAgnosticBehavior> Hash for NodeIdentifier<TBehavior> {
    fn hash<H: Hasher>(&self, state: &mut H) {
        match &self.inner {
            NodeIdentifierInner::LinkedField(v) => v.hash(state),
            NodeIdentifierInner::ScalarField(v) => v.hash(state),
            NodeIdentifierInner::FragmentSpread(v) => {
                v.fragment.item.hash(state);
                v.arguments.location_agnostic_hash::<_, TBehavior>(state);
                v.directives.location_agnostic_hash::<_, TBehavior>(state);
            }
            NodeIdentifierInner::InlineFragment(v) => {
                v.type_condition.hash(state);
                v.directives.location_agnostic_hash::<_, TBehavior>(state);
            }
            NodeIdentifierInner::Condition(v) => {
                v.passing_value.hash(state);
                v.value.location_agnostic_hash::<_, TBehavior>(state);
            }
        }
    }
}

impl<TBehavior: LocationAgnosticBehavior> fmt::Debug for NodeIdentifier<TBehavior> {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match &self.inner {
            NodeIdentifierInner::LinkedField(v) => {
                write!(f, "NodeIdentifierInner::LinkedField({v:?})")
            }
            NodeIdentifierInner::ScalarField(v) => {
                write!(f, "NodeIdentifierInner::ScalarField({v:?})")
            }
            NodeIdentifierInner::FragmentSpread(v) => {
                write!(f, "NodeIdentifierInner::FragmentSpread({v:?})")
            }
            NodeIdentifierInner::InlineFragment(v) => {
                write!(f, "NodeIdentifierInner::InlineFragment({v:?})")
            }
            NodeIdentifierInner::Condition(v) => {
                write!(f, "NodeIdentifierInner::Condition({v:?})")
            }
        }
    }
}

// Implement ScalarFieldIdentifier and LinkedFieldIdentifier separately for computing alias name
#[derive(Clone)]
pub struct ScalarFieldIdentifier<TBehavior: LocationAgnosticBehavior> {
    alias_or_name: StringKey,
    node: Arc<ScalarField>,
    _behavior: PhantomData<TBehavior>,
}
impl<TBehavior: LocationAgnosticBehavior> PartialEq for ScalarFieldIdentifier<TBehavior> {
    fn eq(&self, other: &Self) -> bool {
        self.alias_or_name
            .location_agnostic_eq::<TBehavior>(&other.alias_or_name)
            && self
                .node
                .directives
                .location_agnostic_eq::<TBehavior>(&other.node.directives)
    }
}
impl<TBehavior: LocationAgnosticBehavior> Hash for ScalarFieldIdentifier<TBehavior> {
    fn hash<H: Hasher>(&self, state: &mut H) {
        self.alias_or_name.hash(state);
        self.node
            .directives
            .location_agnostic_hash::<_, TBehavior>(state);
    }
}
impl<TBehavior: LocationAgnosticBehavior> fmt::Debug for ScalarFieldIdentifier<TBehavior> {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("ScalarFieldIdentifier")
            .field("alias_or_name", &self.alias_or_name)
            .field("node", &self.node)
            .finish()
    }
}
impl<TBehavior: LocationAgnosticBehavior> Eq for ScalarFieldIdentifier<TBehavior> {}

#[derive(Clone)]
pub struct LinkedFieldIdentifier<TBehavior: LocationAgnosticBehavior> {
    alias_or_name: StringKey,
    node: Arc<LinkedField>,
    _behavior: PhantomData<TBehavior>,
}
impl<TBehavior: LocationAgnosticBehavior> PartialEq for LinkedFieldIdentifier<TBehavior> {
    fn eq(&self, other: &Self) -> bool {
        self.alias_or_name
            .location_agnostic_eq::<TBehavior>(&other.alias_or_name)
            && self
                .node
                .directives
                .location_agnostic_eq::<TBehavior>(&other.node.directives)
    }
}
impl<TBehavior: LocationAgnosticBehavior> Hash for LinkedFieldIdentifier<TBehavior> {
    fn hash<H: Hasher>(&self, state: &mut H) {
        self.alias_or_name.hash(state);
        self.node
            .directives
            .location_agnostic_hash::<_, TBehavior>(state);
    }
}
impl<TBehavior: LocationAgnosticBehavior> fmt::Debug for LinkedFieldIdentifier<TBehavior> {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("LinkedFieldIdentifier")
            .field("alias_or_name", &self.alias_or_name)
            .field("node", &self.node)
            .finish()
    }
}
impl<TBehavior: LocationAgnosticBehavior> Eq for LinkedFieldIdentifier<TBehavior> {}

/// Below are the implmentations of LocationAgnosticPartialEq and LocationAgnosticHash
/// for `Directive` and `Argument`, so that we can check equality and hash node identities
/// ignoring the location.
pub trait LocationAgnosticPartialEq {
    fn location_agnostic_eq<B: LocationAgnosticBehavior>(&self, other: &Self) -> bool;
}

pub trait LocationAgnosticHash {
    fn location_agnostic_hash<H: Hasher, B: LocationAgnosticBehavior>(&self, _state: &mut H);
}

/// Additional behaviors that appliable to the implementation of `LocationAgnosticPartialEq`
/// and `LocationAgnosticHash`
pub trait LocationAgnosticBehavior {
    fn should_skip_in_node_identifier(name: DirectiveName) -> bool;
    fn hash_for_name_only(name: DirectiveName) -> bool;
}

impl<T: LocationAgnosticHash> LocationAgnosticHash for WithLocation<T> {
    fn location_agnostic_hash<H: (Hasher), B: LocationAgnosticBehavior>(&self, state: &mut H) {
        self.item.location_agnostic_hash::<_, B>(state);
    }
}

impl<T: LocationAgnosticPartialEq> LocationAgnosticPartialEq for WithLocation<T> {
    fn location_agnostic_eq<B: LocationAgnosticBehavior>(&self, other: &Self) -> bool {
        self.item.location_agnostic_eq::<B>(&other.item)
    }
}

impl<T: LocationAgnosticPartialEq> LocationAgnosticPartialEq for Option<T> {
    fn location_agnostic_eq<B: LocationAgnosticBehavior>(&self, other: &Self) -> bool {
        match (self, other) {
            (Some(l), Some(r)) => l.location_agnostic_eq::<B>(r),
            (None, None) => true,
            _ => false,
        }
    }
}

impl<T: LocationAgnosticPartialEq> LocationAgnosticPartialEq for &T {
    fn location_agnostic_eq<B: LocationAgnosticBehavior>(&self, other: &Self) -> bool {
        (*self).location_agnostic_eq::<B>(*other)
    }
}

impl LocationAgnosticHash for StringKey {
    fn location_agnostic_hash<H: Hasher, B: LocationAgnosticBehavior>(&self, state: &mut H) {
        self.hash(state);
    }
}

// Limit the generic to enable a different implementation for Vec<Directive> and Vec<Argument>
pub trait DirectlyComparableIR {}
impl DirectlyComparableIR for Value {}
impl DirectlyComparableIR for ConstantArgument {}
impl DirectlyComparableIR for ConstantValue {}
impl DirectlyComparableIR for Selection {}
impl DirectlyComparableIR for ExecutableDefinition {}
impl DirectlyComparableIR for VariableDefinition {}

impl<T: LocationAgnosticPartialEq + DirectlyComparableIR> LocationAgnosticPartialEq for Vec<T> {
    fn location_agnostic_eq<B: LocationAgnosticBehavior>(&self, other: &Self) -> bool {
        self.len() == other.len()
            && self
                .iter()
                .zip(other.iter())
                .all(|(left, right)| left.location_agnostic_eq::<B>(right))
    }
}

impl<T: LocationAgnosticHash> LocationAgnosticHash for Vec<T> {
    fn location_agnostic_hash<H: Hasher, B: LocationAgnosticBehavior>(&self, state: &mut H) {
        for v in self {
            v.location_agnostic_hash::<_, B>(state);
        }
    }
}

fn filtered_location_agnostic_eq<
    T: LocationAgnosticPartialEq,
    F: Copy + for<'r> FnMut(&'r &T) -> bool,
    B: LocationAgnosticBehavior,
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

        if !x.location_agnostic_eq::<B>(y) {
            return false;
        }
    }
}

impl LocationAgnosticPartialEq for Vec<Directive> {
    fn location_agnostic_eq<B: LocationAgnosticBehavior>(&self, other: &Self) -> bool {
        filtered_location_agnostic_eq::<_, _, B>(self, other, |d| {
            !B::should_skip_in_node_identifier(d.name.item)
        })
    }
}

impl LocationAgnosticHash for Directive {
    fn location_agnostic_hash<H: Hasher, B: LocationAgnosticBehavior>(&self, state: &mut H) {
        if B::hash_for_name_only(self.name.item) {
            self.name.hash(state);
        } else if !B::should_skip_in_node_identifier(self.name.item) {
            self.name.item.0.location_agnostic_hash::<_, B>(state);
            self.arguments.location_agnostic_hash::<_, B>(state);
            self.data.hash(state);
        }
    }
}

impl LocationAgnosticPartialEq for Directive {
    fn location_agnostic_eq<B: LocationAgnosticBehavior>(&self, other: &Self) -> bool {
        if !self.name.item.location_agnostic_eq::<B>(&other.name.item) {
            return false;
        }
        if B::hash_for_name_only(self.name.item) {
            return true;
        }
        self.arguments.location_agnostic_eq::<B>(&other.arguments) && self.data == other.data
    }
}

impl LocationAgnosticPartialEq for Vec<Argument> {
    fn location_agnostic_eq<B: LocationAgnosticBehavior>(&self, other: &Self) -> bool {
        filtered_location_agnostic_eq::<_, _, B>(self, other, |a| {
            !matches!(a.value.item, Value::Constant(ConstantValue::Null()))
        })
    }
}

impl LocationAgnosticHash for Argument {
    fn location_agnostic_hash<H: Hasher, B: LocationAgnosticBehavior>(&self, state: &mut H) {
        if !matches!(self.value.item, Value::Constant(ConstantValue::Null())) {
            self.name.item.0.location_agnostic_hash::<_, B>(state);
            self.value.location_agnostic_hash::<_, B>(state);
        }
    }
}

impl LocationAgnosticPartialEq for Argument {
    fn location_agnostic_eq<B: LocationAgnosticBehavior>(&self, other: &Self) -> bool {
        self.name.item.location_agnostic_eq::<B>(&other.name.item)
            && self.value.location_agnostic_eq::<B>(&other.value)
    }
}

impl LocationAgnosticHash for Value {
    fn location_agnostic_hash<H: Hasher, B: LocationAgnosticBehavior>(&self, state: &mut H) {
        match self {
            Value::Constant(v) => v.location_agnostic_hash::<_, B>(state),
            Value::Variable(v) => v.location_agnostic_hash::<_, B>(state),
            Value::List(v) => v.location_agnostic_hash::<_, B>(state),
            Value::Object(v) => v.location_agnostic_hash::<_, B>(state),
        }
    }
}

impl LocationAgnosticPartialEq for Value {
    fn location_agnostic_eq<B: LocationAgnosticBehavior>(&self, other: &Self) -> bool {
        match (self, other) {
            (Value::Constant(l), Value::Constant(r)) => l.location_agnostic_eq::<B>(r),
            (Value::Variable(l), Value::Variable(r)) => l.location_agnostic_eq::<B>(r),
            (Value::List(l), Value::List(r)) => l.location_agnostic_eq::<B>(r),
            (Value::Object(l), Value::Object(r)) => l.location_agnostic_eq::<B>(r),
            (Value::Constant(_), _) => false,
            (Value::Variable(_), _) => false,
            (Value::List(_), _) => false,
            (Value::Object(_), _) => false,
        }
    }
}

impl LocationAgnosticHash for Variable {
    fn location_agnostic_hash<H: Hasher, B: LocationAgnosticBehavior>(&self, state: &mut H) {
        self.name.item.0.location_agnostic_hash::<_, B>(state);
        self.type_.hash(state);
    }
}

impl LocationAgnosticPartialEq for Variable {
    fn location_agnostic_eq<B: LocationAgnosticBehavior>(&self, other: &Self) -> bool {
        self.name.item.location_agnostic_eq::<B>(&other.name.item) && self.type_.eq(&other.type_)
    }
}

impl LocationAgnosticHash for ConstantArgument {
    fn location_agnostic_hash<H: Hasher, B: LocationAgnosticBehavior>(&self, state: &mut H) {
        self.name.item.0.location_agnostic_hash::<_, B>(state);
        self.value.location_agnostic_hash::<_, B>(state);
    }
}

impl LocationAgnosticPartialEq for ConstantArgument {
    fn location_agnostic_eq<B: LocationAgnosticBehavior>(&self, other: &Self) -> bool {
        self.name.item.location_agnostic_eq::<B>(&other.name.item)
            && self.value.location_agnostic_eq::<B>(&other.value)
    }
}

impl LocationAgnosticHash for ConstantValue {
    fn location_agnostic_hash<H: Hasher, B: LocationAgnosticBehavior>(&self, state: &mut H) {
        match self {
            ConstantValue::Int(v) => v.hash(state),
            ConstantValue::Float(v) => v.hash(state),
            ConstantValue::String(_) => self.hash(state),
            ConstantValue::Boolean(v) => v.hash(state),
            ConstantValue::Null() => self.hash(state),
            ConstantValue::Enum(_) => self.hash(state),
            ConstantValue::List(v) => v.location_agnostic_hash::<_, B>(state),
            ConstantValue::Object(v) => v.location_agnostic_hash::<_, B>(state),
        }
    }
}

impl LocationAgnosticPartialEq for ConstantValue {
    fn location_agnostic_eq<B: LocationAgnosticBehavior>(&self, other: &Self) -> bool {
        match (self, other) {
            (ConstantValue::Int(l), ConstantValue::Int(r)) => l.eq(r),
            (ConstantValue::Float(l), ConstantValue::Float(r)) => l.eq(r),
            (ConstantValue::String(l), ConstantValue::String(r)) => l.eq(r),
            (ConstantValue::Boolean(l), ConstantValue::Boolean(r)) => l.eq(r),
            (ConstantValue::Null(), ConstantValue::Null()) => true,
            (ConstantValue::Enum(l), ConstantValue::Enum(r)) => l.eq(r),
            (ConstantValue::List(l), ConstantValue::List(r)) => l.location_agnostic_eq::<B>(r),
            (ConstantValue::Object(l), ConstantValue::Object(r)) => l.location_agnostic_eq::<B>(r),
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
    fn location_agnostic_hash<H: Hasher, B: LocationAgnosticBehavior>(&self, state: &mut H) {
        match self {
            ConditionValue::Constant(constant) => constant.hash(state),
            ConditionValue::Variable(variable) => variable.name.item.hash(state),
        }
    }
}

impl LocationAgnosticPartialEq for ConditionValue {
    fn location_agnostic_eq<B: LocationAgnosticBehavior>(&self, other: &Self) -> bool {
        match (self, other) {
            (ConditionValue::Constant(left), ConditionValue::Constant(right)) => {
                left.location_agnostic_eq::<B>(right)
            }
            (ConditionValue::Variable(left), ConditionValue::Variable(right)) => {
                left.location_agnostic_eq::<B>(right)
            }
            (ConditionValue::Constant(_), _) => false,
            (ConditionValue::Variable(_), _) => false,
        }
    }
}

impl LocationAgnosticPartialEq for ExecutableDefinition {
    fn location_agnostic_eq<B: LocationAgnosticBehavior>(&self, other: &Self) -> bool {
        match (self, other) {
            (ExecutableDefinition::Operation(left), ExecutableDefinition::Operation(right)) => {
                left.location_agnostic_eq::<B>(right)
            }
            (ExecutableDefinition::Fragment(left), ExecutableDefinition::Fragment(right)) => {
                left.location_agnostic_eq::<B>(right)
            }
            _ => false,
        }
    }
}

impl LocationAgnosticPartialEq for VariableDefinition {
    fn location_agnostic_eq<B: LocationAgnosticBehavior>(&self, other: &Self) -> bool {
        self.name.location_agnostic_eq::<B>(&other.name)
            && self.type_.location_agnostic_eq::<B>(&other.type_)
            && self
                .default_value
                .location_agnostic_eq::<B>(&other.default_value)
            && self.directives.location_agnostic_eq::<B>(&other.directives)
    }
}

impl LocationAgnosticPartialEq for OperationDefinition {
    fn location_agnostic_eq<B: LocationAgnosticBehavior>(&self, other: &Self) -> bool {
        self.kind.location_agnostic_eq::<B>(&other.kind)
            && self.name.location_agnostic_eq::<B>(&other.name)
            && self.type_.location_agnostic_eq::<B>(&other.type_)
            && self
                .variable_definitions
                .location_agnostic_eq::<B>(&other.variable_definitions)
            && self.directives.location_agnostic_eq::<B>(&other.directives)
            && self.selections.location_agnostic_eq::<B>(&other.selections)
    }
}

macro_rules! impl_location_agnostic_partial_eq_using_eq {
    ($type:ident) => {
        impl LocationAgnosticPartialEq for $type {
            fn location_agnostic_eq<B: LocationAgnosticBehavior>(&self, other: &Self) -> bool {
                self == other
            }
        }
    };
}
impl_location_agnostic_partial_eq_using_eq!(Type);
impl_location_agnostic_partial_eq_using_eq!(OperationKind);
impl_location_agnostic_partial_eq_using_eq!(FieldID);
impl_location_agnostic_partial_eq_using_eq!(OperationDefinitionName);
impl_location_agnostic_partial_eq_using_eq!(FragmentDefinitionName);
impl_location_agnostic_partial_eq_using_eq!(VariableName);
impl_location_agnostic_partial_eq_using_eq!(DirectiveName);
impl_location_agnostic_partial_eq_using_eq!(ArgumentName);
impl_location_agnostic_partial_eq_using_eq!(bool);
impl_location_agnostic_partial_eq_using_eq!(StringKey);

impl<T: PartialEq> LocationAgnosticPartialEq for TypeReference<T> {
    fn location_agnostic_eq<B: LocationAgnosticBehavior>(&self, other: &Self) -> bool {
        *self == *other
    }
}

impl LocationAgnosticPartialEq for Selection {
    fn location_agnostic_eq<B: LocationAgnosticBehavior>(&self, other: &Self) -> bool {
        match (self, other) {
            (Selection::FragmentSpread(l), Selection::FragmentSpread(r)) => {
                l.location_agnostic_eq::<B>(r)
            }
            (Selection::InlineFragment(l), Selection::InlineFragment(r)) => {
                l.location_agnostic_eq::<B>(r)
            }
            (Selection::LinkedField(l), Selection::LinkedField(r)) => {
                l.location_agnostic_eq::<B>(r)
            }
            (Selection::ScalarField(l), Selection::ScalarField(r)) => {
                l.location_agnostic_eq::<B>(r)
            }
            (Selection::Condition(l), Selection::Condition(r)) => l.location_agnostic_eq::<B>(r),
            _ => false,
        }
    }
}

impl LocationAgnosticPartialEq for FragmentSpread {
    fn location_agnostic_eq<B: LocationAgnosticBehavior>(&self, other: &Self) -> bool {
        self.fragment.location_agnostic_eq::<B>(&other.fragment)
            && self.arguments.location_agnostic_eq::<B>(&other.arguments)
            && self.directives.location_agnostic_eq::<B>(&other.directives)
    }
}

impl LocationAgnosticPartialEq for InlineFragment {
    fn location_agnostic_eq<B: LocationAgnosticBehavior>(&self, other: &Self) -> bool {
        self.type_condition
            .location_agnostic_eq::<B>(&other.type_condition)
            && self.directives.location_agnostic_eq::<B>(&other.directives)
            && self.selections.location_agnostic_eq::<B>(&other.selections)
    }
}

impl LocationAgnosticPartialEq for LinkedField {
    fn location_agnostic_eq<B: LocationAgnosticBehavior>(&self, other: &Self) -> bool {
        self.alias.location_agnostic_eq::<B>(&other.alias)
            && self.definition.location_agnostic_eq::<B>(&other.definition)
            && self.arguments.location_agnostic_eq::<B>(&other.arguments)
            && self.directives.location_agnostic_eq::<B>(&other.directives)
            && self.selections.location_agnostic_eq::<B>(&other.selections)
    }
}

impl LocationAgnosticPartialEq for ScalarField {
    fn location_agnostic_eq<B: LocationAgnosticBehavior>(&self, other: &Self) -> bool {
        self.alias.location_agnostic_eq::<B>(&other.alias)
            && self.definition.location_agnostic_eq::<B>(&other.definition)
            && self.arguments.location_agnostic_eq::<B>(&other.arguments)
            && self.directives.location_agnostic_eq::<B>(&other.directives)
    }
}

impl LocationAgnosticPartialEq for Condition {
    fn location_agnostic_eq<B: LocationAgnosticBehavior>(&self, other: &Self) -> bool {
        self.selections.location_agnostic_eq::<B>(&other.selections)
            && self.value.location_agnostic_eq::<B>(&other.value)
            && self
                .passing_value
                .location_agnostic_eq::<B>(&other.passing_value)
    }
}

impl LocationAgnosticPartialEq for FragmentDefinition {
    fn location_agnostic_eq<B: LocationAgnosticBehavior>(&self, other: &Self) -> bool {
        self.name.location_agnostic_eq::<B>(&other.name)
            && self
                .variable_definitions
                .location_agnostic_eq::<B>(&other.variable_definitions)
            && self
                .used_global_variables
                .location_agnostic_eq::<B>(&other.used_global_variables)
            && self
                .type_condition
                .location_agnostic_eq::<B>(&other.type_condition)
            && self.directives.location_agnostic_eq::<B>(&other.directives)
            && self.selections.location_agnostic_eq::<B>(&other.selections)
    }
}
