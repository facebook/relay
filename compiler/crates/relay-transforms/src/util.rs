/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::client_extensions::CLIENT_EXTENSION_DIRECTIVE_NAME;
use crate::connections::CONNECTION_METADATA_DIRECTIVE_NAME;
use crate::handle_fields::HANDLE_FIELD_DIRECTIVE_NAME;
use crate::inline_data_fragment::INLINE_DATA_CONSTANTS;
use crate::match_::MATCH_CONSTANTS;
use crate::react_flight::{
    REACT_FLIGHT_LOCAL_COMPONENTS_METADATA_KEY, REACT_FLIGHT_SCALAR_FLIGHT_FIELD_METADATA_KEY,
};
use crate::refetchable_fragment::CONSTANTS as REFETCHABLE_CONSTANTS;
use crate::relay_actor_change::RELAY_ACTOR_CHANGE_DIRECTIVE_FOR_CODEGEN;
use crate::relay_client_component::RELAY_CLIENT_COMPONENT_METADATA_KEY;
use crate::relay_resolvers::RELAY_RESOLVER_METADATA_DIRECTIVE_NAME;
use crate::required_directive::{
    CHILDREN_CAN_BUBBLE_METADATA_KEY, REQUIRED_DIRECTIVE_NAME, REQUIRED_METADATA_KEY,
};
use crate::{DIRECTIVE_SPLIT_OPERATION, INTERNAL_METADATA_DIRECTIVE};

use graphql_ir::{
    Argument, Directive, Value, ARGUMENT_DEFINITION, UNUSED_LOCAL_VARIABLE_DEPRECATED,
};
use interner::{Intern, StringKey};
use lazy_static::lazy_static;
use schema::{SDLSchema, Schema, Type};

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

/// This function will return a new Vec[...] of directives,
/// where one will be missing. The one with `remove_directive_name` name
pub fn remove_directive(
    directives: &[Directive],
    remove_directive_name: StringKey,
) -> Vec<Directive> {
    let mut next_directives = Vec::with_capacity(directives.len() - 1);
    for directive in directives {
        if directive.name.item != remove_directive_name {
            next_directives.push(directive.clone());
        }
    }
    next_directives
}

/// Function will create a new Vec[...] of directives
/// when one of them will be replaced with the `replacement`. If the name of
/// `replacement` is matched with the item in the list
pub fn replace_directive(directives: &[Directive], replacement: Directive) -> Vec<Directive> {
    directives
        .iter()
        .map(|directive| {
            if directive.name.item == replacement.name.item {
                return replacement.to_owned();
            }
            directive.to_owned()
        })
        .collect()
}

/// The function that will return a variable name for an argument
/// it it uses a variable (and it the argument is available)
pub fn extract_variable_name(argument: Option<&Argument>) -> Option<StringKey> {
    match argument {
        Some(arg) => match &arg.value.item {
            Value::Variable(var) => Some(var.name.item),
            _ => None,
        },
        None => None,
    }
}

lazy_static! {
    static ref CUSTOM_METADATA_DIRECTIVES: [StringKey; 18] = [
        *CLIENT_EXTENSION_DIRECTIVE_NAME,
        *CONNECTION_METADATA_DIRECTIVE_NAME,
        *HANDLE_FIELD_DIRECTIVE_NAME,
        MATCH_CONSTANTS.custom_module_directive_name,
        *DIRECTIVE_SPLIT_OPERATION,
        REFETCHABLE_CONSTANTS.refetchable_metadata_name,
        REFETCHABLE_CONSTANTS.refetchable_operation_metadata_name,
        *INTERNAL_METADATA_DIRECTIVE,
        *ARGUMENT_DEFINITION,
        *REACT_FLIGHT_SCALAR_FLIGHT_FIELD_METADATA_KEY,
        *REACT_FLIGHT_LOCAL_COMPONENTS_METADATA_KEY,
        *REQUIRED_DIRECTIVE_NAME,
        *REQUIRED_METADATA_KEY,
        *CHILDREN_CAN_BUBBLE_METADATA_KEY,
        *RELAY_RESOLVER_METADATA_DIRECTIVE_NAME,
        *RELAY_CLIENT_COMPONENT_METADATA_KEY,
        *UNUSED_LOCAL_VARIABLE_DEPRECATED,
        *RELAY_ACTOR_CHANGE_DIRECTIVE_FOR_CODEGEN,
    ];
    static ref DIRECTIVES_SKIPPED_IN_NODE_IDENTIFIER: [StringKey; 12] = [
        *CLIENT_EXTENSION_DIRECTIVE_NAME,
        *CONNECTION_METADATA_DIRECTIVE_NAME,
        *HANDLE_FIELD_DIRECTIVE_NAME,
        REFETCHABLE_CONSTANTS.refetchable_metadata_name,
        REFETCHABLE_CONSTANTS.refetchable_operation_metadata_name,
        *INTERNAL_METADATA_DIRECTIVE,
        *ARGUMENT_DEFINITION,
        *REACT_FLIGHT_SCALAR_FLIGHT_FIELD_METADATA_KEY,
        *REACT_FLIGHT_LOCAL_COMPONENTS_METADATA_KEY,
        *REQUIRED_DIRECTIVE_NAME,
        *RELAY_RESOLVER_METADATA_DIRECTIVE_NAME,
        *RELAY_CLIENT_COMPONENT_METADATA_KEY,
    ];
    static ref RELAY_CUSTOM_INLINE_FRAGMENT_DIRECTIVES: [StringKey; 5] = [
        *CLIENT_EXTENSION_DIRECTIVE_NAME,
        MATCH_CONSTANTS.custom_module_directive_name,
        INLINE_DATA_CONSTANTS.internal_directive_name,
        *RELAY_ACTOR_CHANGE_DIRECTIVE_FOR_CODEGEN,
        "defer".intern(),
    ];
}

pub struct CustomMetadataDirectives;

impl CustomMetadataDirectives {
    pub fn is_custom_metadata_directive(name: StringKey) -> bool {
        CUSTOM_METADATA_DIRECTIVES.contains(&name)
    }

    pub fn should_skip_in_node_identifier(name: StringKey) -> bool {
        DIRECTIVES_SKIPPED_IN_NODE_IDENTIFIER.contains(&name)
    }

    pub fn is_handle_field_directive(name: StringKey) -> bool {
        name == *HANDLE_FIELD_DIRECTIVE_NAME
    }
}

pub fn is_relay_custom_inline_fragment_directive(directive: &Directive) -> bool {
    RELAY_CUSTOM_INLINE_FRAGMENT_DIRECTIVES.contains(&directive.name.item)
}

pub fn generate_abstract_type_refinement_key(schema: &SDLSchema, type_: Type) -> StringKey {
    format!("__is{}", schema.get_type_name(type_).lookup()).intern()
}

pub fn get_normalization_operation_name(name: StringKey) -> String {
    format!("{}$normalization", name)
}

pub fn get_fragment_filename(fragment_name: StringKey) -> StringKey {
    format!(
        "{}.graphql",
        get_normalization_operation_name(fragment_name)
    )
    .intern()
}
