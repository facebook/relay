/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::{
    client_extensions::CLIENT_EXTENSION_DIRECTIVE_NAME,
    connections::ConnectionMetadataDirective,
    handle_fields::HANDLE_FIELD_DIRECTIVE_NAME,
    inline_data_fragment::InlineDirectiveMetadata,
    react_flight::REACT_FLIGHT_SCALAR_FLIGHT_FIELD_METADATA_KEY,
    refetchable_fragment::RefetchableMetadata,
    relay_actor_change::RELAY_ACTOR_CHANGE_DIRECTIVE_FOR_CODEGEN,
    required_directive::{CHILDREN_CAN_BUBBLE_METADATA_KEY, REQUIRED_DIRECTIVE_NAME},
    ModuleMetadata, ReactFlightLocalComponentsMetadata, RefetchableDerivedFromMetadata,
    RelayClientComponentMetadata, RelayResolverSpreadMetadata, RequiredMetadataDirective,
    CLIENT_EDGE_GENERATED_FRAGMENT_KEY, CLIENT_EDGE_METADATA_KEY, CLIENT_EDGE_QUERY_METADATA_KEY,
    DIRECTIVE_SPLIT_OPERATION, INTERNAL_METADATA_DIRECTIVE,
};

use graphql_ir::{
    Argument, Directive, ProvidedVariableMetadata, Value, ARGUMENT_DEFINITION,
    UNUSED_LOCAL_VARIABLE_DEPRECATED,
};
use intern::string_key::{Intern, StringKey};
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
    static ref CUSTOM_METADATA_DIRECTIVES: [StringKey; 22] = [
        *CLIENT_EXTENSION_DIRECTIVE_NAME,
        ConnectionMetadataDirective::directive_name(),
        *HANDLE_FIELD_DIRECTIVE_NAME,
        ModuleMetadata::directive_name(),
        *DIRECTIVE_SPLIT_OPERATION,
        RefetchableMetadata::directive_name(),
        RefetchableDerivedFromMetadata::directive_name(),
        *INTERNAL_METADATA_DIRECTIVE,
        *ARGUMENT_DEFINITION,
        *REACT_FLIGHT_SCALAR_FLIGHT_FIELD_METADATA_KEY,
        ReactFlightLocalComponentsMetadata::directive_name(),
        *REQUIRED_DIRECTIVE_NAME,
        RequiredMetadataDirective::directive_name(),
        *CLIENT_EDGE_METADATA_KEY,
        *CLIENT_EDGE_QUERY_METADATA_KEY,
        *CLIENT_EDGE_GENERATED_FRAGMENT_KEY,
        *CHILDREN_CAN_BUBBLE_METADATA_KEY,
        RelayResolverSpreadMetadata::directive_name(),
        RelayClientComponentMetadata::directive_name(),
        *UNUSED_LOCAL_VARIABLE_DEPRECATED,
        *RELAY_ACTOR_CHANGE_DIRECTIVE_FOR_CODEGEN,
        ProvidedVariableMetadata::directive_name(),
    ];
    static ref DIRECTIVES_SKIPPED_IN_NODE_IDENTIFIER: [StringKey; 12] = [
        *CLIENT_EXTENSION_DIRECTIVE_NAME,
        ConnectionMetadataDirective::directive_name(),
        *HANDLE_FIELD_DIRECTIVE_NAME,
        RefetchableMetadata::directive_name(),
        RefetchableDerivedFromMetadata::directive_name(),
        *INTERNAL_METADATA_DIRECTIVE,
        *ARGUMENT_DEFINITION,
        *REACT_FLIGHT_SCALAR_FLIGHT_FIELD_METADATA_KEY,
        ReactFlightLocalComponentsMetadata::directive_name(),
        *REQUIRED_DIRECTIVE_NAME,
        RelayResolverSpreadMetadata::directive_name(),
        RelayClientComponentMetadata::directive_name(),
    ];
    static ref RELAY_CUSTOM_INLINE_FRAGMENT_DIRECTIVES: [StringKey; 6] = [
        *CLIENT_EXTENSION_DIRECTIVE_NAME,
        ModuleMetadata::directive_name(),
        InlineDirectiveMetadata::directive_name(),
        *RELAY_ACTOR_CHANGE_DIRECTIVE_FOR_CODEGEN,
        *CLIENT_EDGE_METADATA_KEY,
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

pub fn format_provided_variable_name(fragment_name: StringKey, arg_name: StringKey) -> StringKey {
    // __ prefix indicates Relay internal variable
    format!("__{}__{}", fragment_name, arg_name).intern()
}
