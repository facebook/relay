/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use graphql_ir::{Argument, Condition, Selection};
use graphql_text_printer::write_arguments;
use graphql_text_printer::write_directives;
use interner::StringKey;
use schema::{Schema, Type};
use std::hash::{Hash, Hasher};
use std::sync::Arc;

// A wrapper type that allows comparing pointer equality of references. Two
// `PointerAddress` values are equal if they point to the same memory location.
//
// This type is _sound_, but misuse can easily lead to logical bugs if the memory
// of one PointerAddress could not have been freed and reused for a subsequent
// PointerAddress.
#[derive(Hash, Eq, PartialEq, Clone, Copy)]
pub struct PointerAddress(usize);

impl PointerAddress {
    pub fn new<T>(ptr: &T) -> Self {
        let ptr_address: usize = unsafe { std::mem::transmute(ptr) };
        Self(ptr_address)
    }
}

#[derive(Eq, Hash, PartialEq)]
pub enum NodeIdentifier {
    InlineFragment {
        type_condition: Option<Type>,
        directives: String,
    },
    LinkedField {
        name: StringKey,
        arguments_and_directives: String,
    },
    ScalarField {
        name: StringKey,
        arguments_and_directives: String,
    },
    FragmentSpread {
        name: StringKey,
        arguments_and_directives: String,
    },
    Condition(ConditionIdentifier),
}
#[derive(Eq)]
pub struct ConditionIdentifier(Arc<Condition>);
impl PartialEq for ConditionIdentifier {
    fn eq(&self, other: &Self) -> bool {
        self.0.passing_value == other.0.passing_value && self.0.value == other.0.value
    }
}
impl Hash for ConditionIdentifier {
    fn hash<H: Hasher>(&self, state: &mut H) {
        self.0.passing_value.hash(state);
        self.0.value.hash(state);
    }
}

pub fn get_identifier_for_selection<'s>(
    schema: &'s Schema,
    selection: &Selection,
) -> NodeIdentifier {
    match selection {
        Selection::InlineFragment(node) => {
            let mut directives = String::new();
            if !node.directives.is_empty() {
                write_directives(schema, &node.directives, &mut directives).unwrap();
            }
            NodeIdentifier::InlineFragment {
                type_condition: node.type_condition,
                directives,
            }
        }
        Selection::LinkedField(node) => {
            let mut arguments_and_directives = String::new();
            if !node.arguments.is_empty() {
                write_arguments(schema, &node.arguments, &mut arguments_and_directives).unwrap();
            }
            if !node.directives.is_empty() {
                write_directives(schema, &node.directives, &mut arguments_and_directives).unwrap();
            }
            NodeIdentifier::LinkedField {
                name: if let Some(name) = node.alias {
                    name.item
                } else {
                    schema.field(node.definition.item).name
                },
                arguments_and_directives,
            }
        }
        Selection::ScalarField(node) => {
            let mut arguments_and_directives = String::new();
            if !node.arguments.is_empty() {
                write_arguments(schema, &node.arguments, &mut arguments_and_directives).unwrap();
            }
            if !node.directives.is_empty() {
                write_directives(schema, &node.directives, &mut arguments_and_directives).unwrap();
            }
            NodeIdentifier::ScalarField {
                name: if let Some(name) = node.alias {
                    name.item
                } else {
                    schema.field(node.definition.item).name
                },
                arguments_and_directives,
            }
        }
        Selection::FragmentSpread(node) => {
            let mut arguments_and_directives = String::new();
            if !node.arguments.is_empty() {
                write_arguments(schema, &node.arguments, &mut arguments_and_directives).unwrap();
            }
            if !node.directives.is_empty() {
                write_directives(schema, &node.directives, &mut arguments_and_directives).unwrap();
            }
            NodeIdentifier::FragmentSpread {
                name: node.fragment.item,
                arguments_and_directives,
            }
        }
        Selection::Condition(node) => {
            NodeIdentifier::Condition(ConditionIdentifier(Arc::clone(node)))
        }
    }
}

pub fn find_argument(arguments: &[Argument], arg_name: StringKey) -> Option<&Argument> {
    arguments.iter().find(|arg| arg.name.item == arg_name)
}
